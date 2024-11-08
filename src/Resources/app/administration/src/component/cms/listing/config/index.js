const {Entity, Component, Mixin} = Shopware;
const {Criteria, EntityCollection} = Shopware.Data;

import template from './index.html.twig';
import './index.scss';

Component.register('sw-cms-el-config-moorl-foundation-listing', {
    template,

    mixins: [
        Mixin.getByName('cms-element')
    ],

    inject: [
        'repositoryFactory',
        'cmsService'
    ],

    data() {
        return {
            entity: null,
            criteria: new Criteria(1, 12),
            entityCollection: [],
            elementName: null,
            configWhitelist: null,
            contentRoute: null
        };
    },

    computed: {
        moorlFoundation() {
            return MoorlFoundation;
        },

        sortingCriteria() {
            const criteria = new Criteria
            criteria.addFilter(Criteria.equals('entity', this.entity));
            criteria.addFilter(Criteria.equals('active', 1));
            return criteria;
        },

        elementOptions() {
            const options = {
                listingSource: [
                    {value: 'static', label: 'sw-cms.elements.moorl-foundation-listing.listingSource.static'},
                    {value: 'select', label: 'sw-cms.elements.moorl-foundation-listing.listingSource.select'},
                    {value: 'auto', label: 'sw-cms.elements.moorl-foundation-listing.listingSource.auto'},
                ],
                listingLayout: [
                    {value: 'grid', label: 'sw-cms.elements.moorl-foundation-listing.listingLayout.grid'},
                    {value: 'list', label: 'sw-cms.elements.moorl-foundation-listing.listingLayout.list'},
                    {value: 'standard', label: 'sw-cms.elements.moorl-foundation-listing.listingLayout.standard'},
                    {value: 'slider', label: 'sw-cms.elements.moorl-foundation-listing.listingLayout.slider'}
                ],
                listingJustifyContent: [
                    {value: 'normal', label: 'sw-cms.elements.moorl-foundation-listing.listingJustifyContent.normal'},
                    {value: 'flex-start', label: 'sw-cms.elements.moorl-foundation-listing.listingJustifyContent.flex-start'},
                    {value: 'flex-end', label: 'sw-cms.elements.moorl-foundation-listing.listingJustifyContent.flex-end'},
                    {value: 'center', label: 'sw-cms.elements.moorl-foundation-listing.listingJustifyContent.center'},
                    {value: 'space-between', label: 'sw-cms.elements.moorl-foundation-listing.listingJustifyContent.space-between'},
                    {value: 'space-around', label: 'sw-cms.elements.moorl-foundation-listing.listingJustifyContent.space-around'},
                ],
                itemLayout: [
                    {value: 'overlay', label: 'sw-cms.elements.moorl-foundation-listing.itemLayout.overlay'},
                    {value: 'image-or-title', label: 'sw-cms.elements.moorl-foundation-listing.itemLayout.image-or-title'},
                    {value: 'image-content', label: 'sw-cms.elements.moorl-foundation-listing.itemLayout.image-content'},
                    {value: 'content-image', label: 'sw-cms.elements.moorl-foundation-listing.itemLayout.content-image'},
                    {value: 'avatar', label: 'sw-cms.elements.moorl-foundation-listing.itemLayout.avatar'},
                    {value: 'standard', label: 'sw-cms.elements.moorl-foundation-listing.itemLayout.standard'},
                    {value: 'custom', label: 'sw-cms.elements.moorl-foundation-listing.itemLayout.custom'}
                ],
                displayMode: [
                    {value: 'cover', label: 'sw-cms.elements.moorl-foundation-listing.displayMode.cover'},
                    {value: 'contain', label: 'sw-cms.elements.moorl-foundation-listing.displayMode.contain'},
                    {value: 'standard', label: 'sw-cms.elements.moorl-foundation-listing.displayMode.standard'}
                ],
                textAlign: [
                    {value: 'left', label: 'sw-cms.elements.moorl-foundation-listing.textAlign.left'},
                    {value: 'center', label: 'sw-cms.elements.moorl-foundation-listing.textAlign.center'},
                    {value: 'right', label: 'sw-cms.elements.moorl-foundation-listing.textAlign.right'}
                ],
                mode: [
                    {value: 'carousel', label: 'sw-cms.elements.moorl-foundation-listing.mode.carousel'},
                    {value: 'gallery', label: 'sw-cms.elements.moorl-foundation-listing.mode.gallery'}
                ],
                navigationArrows: [
                    {value: null, label: 'sw-cms.elements.moorl-foundation-listing.none'},
                    {value: 'outside', label: 'sw-cms.elements.moorl-foundation-listing.navigationArrows.outside'},
                    {value: 'inside', label: 'sw-cms.elements.moorl-foundation-listing.navigationArrows.inside'}
                ],
                navigationDots: [
                    {value: null, label: 'sw-cms.elements.moorl-foundation-listing.none'},
                    {value: 'outside', label: 'sw-cms.elements.moorl-foundation-listing.navigationDots.outside'},
                    {value: 'inside', label: 'sw-cms.elements.moorl-foundation-listing.navigationDots.inside'},
                    {value: 'thumbnails', label: 'sw-cms.elements.moorl-foundation-listing.navigationDots.thumbnails'}
                ],
                foreignKey: [
                    {value: null, label: this.$tc('sw-cms.elements.moorl-foundation-listing.none')}
                ]
            };

            if (this.entityForeignKeys) {
                for (let value of this.entityForeignKeys.string) {
                    if (value.match(/\./g).length > 1) {
                        continue;
                    }
                    if (value.lastIndexOf("Id") === -1) {
                        continue;
                    }
                    options.foreignKey.push({
                        value: value,
                        label: value
                    });
                }

                Object.values(this.entityForeignKeys.entity).forEach(entity => {
                    for (let value of entity) {
                        if (value.match(/\./g).length > 1) {
                            continue;
                        }
                        options.foreignKey.push({
                            value: value + '.id',
                            label: value + '.id'
                        });
                    }
                });
            }

            if (this.configWhitelist) {
                for (const [key, whitelist] of Object.entries(this.configWhitelist)) {
                    options[key] = options[key].filter(
                        option => whitelist.includes(option.value)
                    );
                }

                return options;
            }

            return options;
        },

        repository() {
            return this.repositoryFactory.create(this.entity);
        },

        defaultCriteria() {
            this.criteria.setLimit(this.element.config.limit.value);
            if (this.element.config.limit.value > 23) {
                this.criteria.setLimit(24);
            }
            this.criteria.setIds([]);
            if (this.element.config.listingSource.value === 'select') {
                this.criteria.setIds(this.element.config.listingItemIds.value);
            }

            return this.criteria;
        },

        entityForeignKeys() {
            return this.cmsService.getEntityMappingTypes(this.entity);
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            if (this.elementName) {
                this.initElementConfig(this.elementName);
                this.initElementData(this.elementName);
            }
            this.initElementConfig('moorl-foundation-listing');
            this.initEntityCollection();
        },

        initEntityCollection() {
            this.entityCollection = new EntityCollection(
                '/' + this.entity.replace(/_/g,'-'),
                this.entity,
                Shopware.Context.api
            );

            if (this.element.config.listingSource.value !== 'select') {
                return;
            }

            if (this.element.config.listingItemIds.value.length <= 0) {
                return;
            }

            this.repository
                .search(this.defaultCriteria, Shopware.Context.api)
                .then((result) => {
                    this.entityCollection = result;
                });
        },

        getList() {
            this.repository
                .search(this.defaultCriteria, Shopware.Context.api)
                .then((result) => {
                    this.$set(this.element.data, 'listingItems', result);
                });
        },

        onSelectionChange() {
            this.element.config.listingItemIds.value = this.entityCollection.getIds();
            this.getList();
        },
    }
});
