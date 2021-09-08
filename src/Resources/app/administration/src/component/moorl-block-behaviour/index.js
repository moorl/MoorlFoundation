const {Component} = Shopware;

import template from './index.html.twig';
import './index.scss';

Component.register('moorl-block-behaviour', {
    template,

    props: {
        value: {
            type: Object,
            required: false,
            default() {
                return {};
            }
        },
    },

    data() {
        return {
            currentValue: null,
            snippetPrefix: 'moorl-block-behaviour.'
        };
    },

    computed: {
        defaultBehaviour() {
            return [
                {
                    'icon': 'default-device-mobile',
                    'breakpoint': 'xs'
                },
                {
                    'icon': 'default-device-mobile',
                    'breakpoint': 'sm'
                },
                {
                    'icon': 'default-device-tablet',
                    'breakpoint': 'md'
                },
                {
                    'icon': 'default-device-tablet',
                    'breakpoint': 'lg'
                },
                {
                    'icon': 'default-device-desktop',
                    'breakpoint': 'xl'
                },
            ];
        },

        defaultValue() {
            return {
                'xs': {
                    'inherit': true,
                    'show': true,
                    'width': 12,
                    'order': 0
                },
                'sm': {
                    'inherit': true,
                    'show': true,
                    'width': 12,
                    'order': 0
                },
                'md': {
                    'inherit': true,
                    'show': true,
                    'width': 12,
                    'order': 0
                },
                'lg': {
                    'inherit': true,
                    'show': true,
                    'width': 12,
                    'order': 0
                },
                'xl': {
                    'inherit': true,
                    'show': true,
                    'width': 12,
                    'order': 0
                },
            };
        },
    },

    watch: {
        value(value) {
            console.log(this.value);
            console.log(value);
            this.$emit('change', this.value);
        }
    },

    created() {
        this.value = Object.assign(this.defaultValue, this.value);

        console.log(this.value);
    }
});
