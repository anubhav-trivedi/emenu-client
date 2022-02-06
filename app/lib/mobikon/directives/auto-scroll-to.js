angular.module('mk.Directives')
    .directive('mkAutoScrollTo', function($timeout, $parse) {

        /**
         * Auto scrolls the element to the child element with the n-th index given
         * as the attribute expression.
         *
         * Child elements must be marked with [scroll-target]
         *
         * Currently only supports vertical scrolling.
         */
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var $ele = $(element),
                    selector = '[scroll-target]',
                    offsets = _.extend({top: 0, left: 0, bottom: 0, right: 0},
                        attrs.scrollOffset && $parse(attrs.scrollOffset)(scope));

                scope.$watch(attrs.mkAutoScrollTo, function(index) {
                    $timeout(function() { // give a chance for child elements to render
                        var $focus = index != null && $ele.find(selector).eq(index);
                        if (!$focus || !$focus.length) return;

                        var scrollLeft = $ele.scrollLeft(),
                            eleWidth = $ele.width() - offsets.right,
                            offsetLeft = $focus[0].offsetLeft - scrollLeft,
                            offsetRight = offsetLeft + $focus.width();

                        if (offsetRight > eleWidth) { // to the right
                            var newScrollLeft = scrollLeft + offsetRight - eleWidth;
                            $ele.animate({scrollLeft: newScrollLeft}, 'fast');
                        } else if (offsetLeft < 0) {
                            $ele.animate({scrollLeft: offsetLeft}, 'fast');
                        }
                    })


                });
            }
        }

    });