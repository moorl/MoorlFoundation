import template from './index.html.twig';
import './index.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const {Component} = Shopware;

Component.register('moorl-location', {
    template,

    props: {
        locations: {
            type: Array,
            required: false,
            default: []
        },
        tileLayer: {
            type: String,
            required: false,
            default: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        },
        attribution: {
            type: String,
            required: false,
            default: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
        },
        options: {
            type: Array,
            required: false,
            default: [
                'scrollWheelZoom',
                'dragging',
                'tap',
            ]
        },
        showOrder: {type: Boolean, required: false, default: true},
        label: {type: String, required: false, default: null},
        name: {type: String, required: false, default: null},
    },

    watch: {
        value: function () {
            this.$emit('input', this.value);
            this._focusItem();
        }
    },

    data() {
        return {
            _mapInstance: null,
            _mapElement: null
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
        this.initMap();
    },

    methods: {
        initMap() {
            if (!this.$refs['moorlLocation']) {
                return;
            }

            const mapOptions = {};
            if (this.options) {
                mapOptions.scrollWheelZoom = this.options.includes('scrollWheelZoom');
                mapOptions.dragging = this.options.includes('dragging');
                mapOptions.tap = this.options.includes('tap');
            }

            this._mapInstance.layerGroup = L.layerGroup([]);
            this._mapInstance.map = L.map(this.$refs['moorlLocation'], mapOptions);

            L.tileLayer(this.options.tileLayer, {
                attribution: this.options.attribution
            }).addTo(this._mapInstance.map);
        },

        initLocations(locations) {
            const featureMarker = [];

            for (let location of locations) {
                const markerOptions = {};

                if (location.entityId) {
                    markerOptions.entityId = location.entityId;
                }

                if (location.icon) {
                    markerOptions.icon = L.icon(location.icon);
                }

                const marker = L.marker(location.latlng, markerOptions);

                if (location.popup) {
                    marker
                        .bindPopup(location.popup, {autoPan: false, autoClose: true})
                        .on('click', () => {
                            this.focusItem(location.entityId);
                        })
                        .on('popupclose', () => {
                            this.fitBounds();
                        });
                }

                featureMarker.push(marker);
            }

            if (this._mapInstance.layerGroup) {
                this._mapInstance.layerGroup.clearLayers();
            }
            this._mapInstance.layerGroup = L.featureGroup(featureMarker).addTo(this._mapInstance.map);

            this.fitBounds();
        },

        fitBounds() {
            this._mapInstance.map.fitBounds(this._mapInstance.layerGroup.getBounds(), {
                padding: [5, 5]
            });
        },

        focusItem(entityId) {
            this._mapInstance.layerGroup.eachLayer((layer) => {
                if (layer.options.entityId === entityId) {
                    if (!layer.getPopup().isOpen()) {
                        layer.openPopup();
                    }

                    this._mapInstance.map.flyTo(layer.getLatLng(), 16, {animate: true, duration: 1});
                }
            });
        }
    }
});
