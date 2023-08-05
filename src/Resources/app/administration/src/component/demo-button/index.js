import template from './index.html.twig';
import './index.scss';

const {Component, Mixin} = Shopware;

Component.register('moorl-demo-button', {
    template,

    props: {
        pluginName: {
            type: String,
            required: true,
            default: "MoorlFoundation"
        },
        name: {
            type: String,
            required: true,
            default: "cms-tools"
        },
    },

    inject: [
        'acl',
        'foundationApiService'
    ],

    mixins: [
        Mixin.getByName('notification'),
    ],

    data() {
        return {
            open: false,
            isLoading: true,
            processSuccess: false
        };
    },

    computed: {},

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            if (!this.acl.can('system.system_config')) {
                return;
            }
        },

        openModal() {
            if (!this.acl.can('system.system_config')) {
                return;
            }

            this.open = true;
        },

        closeModal() {
            this.open = false;
        },

        install() {
            this.isLoading = true;

            this.foundationApiService.post(`/moorl-foundation/settings/demo-data/install`, {
                pluginName: this.pluginName,
                name: this.name
            }).then(response => {
                this.createNotificationSuccess({
                    message: this.$tc('moorl-foundation-settings-demo-data.installed')
                });

                this.isLoading = false;

                this.open = false;
            }).catch((exception) => {
                this.createNotificationError({
                    title: this.$tc('global.default.error'),
                    message: exception,
                });

                this.isLoading = false;
            });
        },
    },
});
