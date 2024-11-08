import template from './sw-cms-section-config.html.twig';

const {Component} = Shopware;

Component.override('sw-cms-section-config', {
    template,

    computed: {
        moorlIsUnlocked() {
            return Shopware.State.get('moorlFoundationState').unlocked;
        }
    }
});
