/* jQuery extensions */
$.fn.isInViewport = function () {
    if ($(this).length == 0) {
        return;
    }
    let elementTop = $(this).offset().top;
    let elementBottom = elementTop + $(this).outerHeight();
    let viewportTop = $(window).scrollTop();
    let viewportBottom = viewportTop + $(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
};

$.fn.isOverBottom = function () {
    if ($(this).length == 0) {
        return;
    }
    let elementTop = $(this).offset().top;
    let viewportTop = $(window).scrollTop();
    let viewportBottom = viewportTop + $(window).height();
    return elementTop < viewportBottom;
};

import MoorlFoundation from './moorl-foundation/moorl-foundation';

const PluginManager = window.PluginManager;
PluginManager.register('MoorlFoundation', MoorlFoundation);

if (module.hot) {
    module.hot.accept();
}
