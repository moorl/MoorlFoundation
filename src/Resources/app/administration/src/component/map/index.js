import template from './index.html.twig';
import './index.scss';
import 'leaflet/dist/leaflet.css';

const {Component} = Shopware;
import L from 'leaflet';

const urlTemplate = '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';

Component.register('moorl-map', {
    template,

    props: [
        'value',
        'item'
    ],

    watch: {
        value: function () {
            this.$emit('input', this.value);
            this._focusItem();
        }
    },

    data() {
        return {
            id: null,
            interval: 5000,
            isFocusing: false,
            leaflet: {
                markers: []
            }
        };
    },

    computed: {
        mainLocation() {
            return [
                this.item.locationLat ? this.item.locationLat : 52.5173,
                this.item.locationLon ? this.item.locationLon : 13.4020
            ];
        }
    },

    mounted() {
        const that = this;

        setTimeout(function () {
            that.drawMap();
        }, 1500);
    },

    created() {
    },

    methods: {
        drawMap() {
            const that = this;

            this.leaflet.map = L.map(this.$refs['moorlMap'], {
                center: this.mainLocation,
                zoom: 16
            });

            L.tileLayer(urlTemplate, {
                attribution: attribution
            }).addTo(this.leaflet.map);

            this.updateMap();

            setInterval(function () {
                that.updateMap();
            }, this.interval);
        },

        updateMap() {
            if (this.value) {
                return;
            }

            this.leaflet.map.invalidateSize();

            const that = this;
            const featureMarker = [];
            const markerOptions = {
                icon: that._getSvgIcon('location', 'location')
            };

            featureMarker.push(L.marker(this.mainLocation, markerOptions));

            if (this.item.deliverers) {
                this.item.deliverers.forEach(function (item) {
                    if (!item.locationLat) {
                        return;
                    }

                    const markerOptions = {
                        data: item,
                        icon: that._getSvgIcon('deliverer', 'deliverer')
                    };

                    featureMarker.push(
                        L.marker([item.locationLat, item.locationLon], markerOptions)
                            .bindPopup(item.name, {
                                autoPan: false,
                                autoClose: true
                            })
                            .on('click', function () {
                                that.value = item.id;
                            })
                            .on('popupclose', function () {
                                that.value = that.isFocusing ? that.value : null;
                            })
                    );
                });
            }

            if (this.item.shopOrders) {
                this.item.shopOrders.forEach(function (item) {
                    if (!item.locationLat) {
                        return;
                    }

                    const markerOptions = {
                        data: item,
                        icon: that._getSvgIcon(item.shippingMethod, item.className)
                    };

                    featureMarker.push(
                        L.marker([item.locationLat, item.locationLon], markerOptions)
                            .bindPopup(item.order.orderNumber, {
                                autoPan: false,
                                autoClose: true
                            })
                            .on('click', function () {
                                that.value = item.id;
                            })
                            .on('popupclose', function () {
                                that.value = that.isFocusing ? that.value : null;
                            })
                    );
                });
            }

            if (this.leaflet.marker) {
                this.leaflet.marker.clearLayers();
            }
            this.leaflet.marker = L.featureGroup(featureMarker).addTo(that.leaflet.map);

            this.leaflet.map.fitBounds(this.leaflet.marker.getBounds());
        },

        _focusItem() {
            if (!this.leaflet || !this.leaflet.map || !this.leaflet.marker) {
                return;
            }

            this.isFocusing = true;

            const that = this;

            this.leaflet.marker.eachLayer(function (layer) {
                if (!layer || !layer.options || !layer.options.data) {
                    return;
                }

                if (layer.options.data.id === that.value) {
                    let position = layer.getLatLng();

                    if (!layer.getPopup().isOpen()) {
                        layer.openPopup();
                    }

                    that.leaflet.map.setView(position, 17);
                    layer.setZIndexOffset(500);
                } else {
                    layer.setZIndexOffset(0);
                }
            });

            this.isFocusing = false;
        },

        _getSvgIcon(type, className) {
            const size = 40;
            const types = {
                location:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M 11 5 C 9.363281 5 8.136719 6.210938 7.3125 7.5625 C 6.488281 8.914063 6 10.515625 6 12 C 6 14.582031 7.78125 16.464844 10 16.90625 L 10 28 L 12 28 L 12 16.90625 C 14.21875 16.464844 16 14.582031 16 12 C 16 10.515625 15.511719 8.914063 14.6875 7.5625 C 13.863281 6.210938 12.636719 5 11 5 Z M 18 5 L 18 12 C 18 13.851563 19.28125 15.398438 21 15.84375 L 21 28 L 23 28 L 23 15.84375 C 24.71875 15.398438 26 13.851563 26 12 L 26 5 L 24 5 L 24 12 C 24 13.117188 23.117188 14 22 14 C 20.882813 14 20 13.117188 20 12 L 20 5 Z M 21 5 L 21 12 C 21 12.550781 21.449219 13 22 13 C 22.550781 13 23 12.550781 23 12 L 23 5 Z M 11 7 C 11.574219 7 12.34375 7.566406 12.96875 8.59375 C 13.59375 9.621094 14 10.996094 14 12 C 14 14.003906 12.75 15 11 15 C 9.25 15 8 14.003906 8 12 C 8 10.996094 8.40625 9.621094 9.03125 8.59375 C 9.65625 7.566406 10.425781 7 11 7 Z"/></svg>',
                collect:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M 16 3 C 13.253906 3 11 5.253906 11 8 L 11 9 L 6.0625 9 L 6 9.9375 L 5 27.9375 L 4.9375 29 L 27.0625 29 L 27 27.9375 L 26 9.9375 L 25.9375 9 L 21 9 L 21 8 C 21 5.253906 18.746094 3 16 3 Z M 16 5 C 17.65625 5 19 6.34375 19 8 L 19 9 L 13 9 L 13 8 C 13 6.34375 14.34375 5 16 5 Z M 7.9375 11 L 11 11 L 11 14 L 13 14 L 13 11 L 19 11 L 19 14 L 21 14 L 21 11 L 24.0625 11 L 24.9375 27 L 7.0625 27 Z"/></svg>',
                delivery:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M 16 3 C 14.894531 3 14 3.894531 14 5 C 14 5.085938 14.019531 5.167969 14.03125 5.25 C 10.574219 6.132813 8 9.273438 8 13 L 8 22 C 8 22.566406 7.566406 23 7 23 L 6 23 L 6 25 L 13.1875 25 C 13.074219 25.316406 13 25.648438 13 26 C 13 27.644531 14.355469 29 16 29 C 17.644531 29 19 27.644531 19 26 C 19 25.648438 18.925781 25.316406 18.8125 25 L 26 25 L 26 23 L 25 23 C 24.433594 23 24 22.566406 24 22 L 24 13.28125 C 24 9.523438 21.488281 6.171875 17.96875 5.25 C 17.980469 5.167969 18 5.085938 18 5 C 18 3.894531 17.105469 3 16 3 Z M 15.5625 7 C 15.707031 6.988281 15.851563 7 16 7 C 16.0625 7 16.125 7 16.1875 7 C 19.453125 7.097656 22 9.960938 22 13.28125 L 22 22 C 22 22.351563 22.074219 22.683594 22.1875 23 L 9.8125 23 C 9.925781 22.683594 10 22.351563 10 22 L 10 13 C 10 9.824219 12.445313 7.226563 15.5625 7 Z M 16 25 C 16.5625 25 17 25.4375 17 26 C 17 26.5625 16.5625 27 16 27 C 15.4375 27 15 26.5625 15 26 C 15 25.4375 15.4375 25 16 25 Z"/></svg>',
                deliverer:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M 9.5 6 C 8.179688 6 7.003906 6.859375 6.625 8.125 L 5.25 12.71875 L 3.3125 12.0625 L 2.6875 13.9375 L 4.65625 14.59375 L 4.03125 16.71875 C 4.007813 16.808594 3.996094 16.90625 4 17 L 4 24 C 4 24.03125 4 24.0625 4 24.09375 L 4 25 C 4 25.550781 4.449219 26 5 26 L 8 26 L 8.34375 25 L 23.65625 25 L 24 26 L 27 26 C 27.550781 26 28 25.550781 28 25 L 28 24.15625 C 28.003906 24.105469 28.003906 24.050781 28 24 L 28 17 C 28.003906 16.90625 27.992188 16.808594 27.96875 16.71875 L 27.34375 14.59375 L 29.3125 13.9375 L 28.6875 12.0625 L 26.75 12.71875 L 25.375 8.125 C 24.996094 6.859375 23.820313 6 22.5 6 Z M 9.5 8 L 22.5 8 C 22.945313 8 23.339844 8.292969 23.46875 8.71875 L 24.75 13 L 7.25 13 L 8.53125 8.71875 C 8.660156 8.289063 9.054688 8 9.5 8 Z M 6.65625 15 L 25.34375 15 L 26 17.1875 L 26 23 L 6 23 L 6 17.1875 Z M 8.5 16 C 7.671875 16 7 16.671875 7 17.5 C 7 18.328125 7.671875 19 8.5 19 C 9.328125 19 10 18.328125 10 17.5 C 10 16.671875 9.328125 16 8.5 16 Z M 23.5 16 C 22.671875 16 22 16.671875 22 17.5 C 22 18.328125 22.671875 19 23.5 19 C 24.328125 19 25 18.328125 25 17.5 C 25 16.671875 24.328125 16 23.5 16 Z M 12 19 L 10.75 22 L 12.90625 22 L 13.34375 21 L 18.65625 21 L 19.09375 22 L 21.25 22 L 20 19 Z"/></svg>',
            };

            const iconOptions = {
                iconSize  : [size, size + size / 2],
                iconAnchor: [size/2, size + size / 2],
                popupAnchor: [0, -size],
                className : className,
                html      : '<div class="marker-pin"></div>' + types[type]
            }

            return L.divIcon(iconOptions);
        },

        markerPreview() {
            let iconOptions = {
                shadowUrl: this.item.markerShadow ? this.item.markerShadow.url : null,
                iconRetinaUrl: this.item.markerRetina ? this.item.markerRetina.url : null,
                iconUrl: this.item.marker ? this.item.marker.url : null,
                iconSize: [
                    this.item.markerSettings.iconSizeX,
                    this.item.markerSettings.iconSizeY
                ],
                shadowSize: [
                    this.item.markerSettings.shadowSizeX,
                    this.item.markerSettings.shadowSizeY
                ],
                iconAnchor: [
                    this.item.markerSettings.iconAnchorX,
                    this.item.markerSettings.iconAnchorY
                ],
                shadowAnchor: [
                    this.item.markerSettings.shadowAnchorX,
                    this.item.markerSettings.shadowAnchorY
                ],
                popupAnchor: [
                    this.item.markerSettings.popupAnchorX,
                    this.item.markerSettings.popupAnchorY
                ]
            };

            console.log(iconOptions);

            const featureMarker = [];

            featureMarker.push(
                L.marker(this.coord, { icon: L.icon(iconOptions) })
                    .bindPopup('<p><b>Lorem Ipsum GmbH</b><br>Musterstraße 1<br>12345 Musterstadt</p>', {
                        autoPan: false,
                        autoClose: true
                    })
                    .on('click', function () {
                        this.markerItems.eachLayer(function (layer) {
                            if (!layer.getPopup().isOpen()) {
                                layer.openPopup();
                            }
                        });
                    })
            );

            if (this.markerItems) {
                this.markerItems.clearLayers();
            }

            this.markerItems = L.layerGroup(featureMarker).addTo(this.mapItem);
        }
    }
});
