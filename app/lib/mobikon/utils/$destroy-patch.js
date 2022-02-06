/**
 * Replaces the angularjs html, empty and remove patches that fire the destroy event on all child elements
 * with a jquery.removeEvent patch that only triggers the event on listening elements
 */
(function($) {
    unPatch('remove');
    unPatch('empty');
    unPatch('html');

    var orgRemove = $.removeEvent;
    patch.$original = orgRemove
    $.removeEvent = patch;

    function patch(elem, type, handle) {
        if (type == '$destroy') {
            $(elem).triggerHandler('$destroy');
        }
        return orgRemove(elem, type, handle)
    }

    function unPatch(name) {
        $.fn[name] = $.fn[name].$original;
    }
})(jQuery);