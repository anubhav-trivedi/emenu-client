angular.module('mk.Directives')
    .directive('mkHeader', function($rootElement) {

        // we maintain a stack of replacements
        // onDestroy order is unpredicatble
        var stack = [];

        return {
            restrict: 'AE',
            link: function(scope, element) {
                var $fakeHeader = $(element),
                    $header = $('header'),
                    $hiddenContainer = $("<div style='display: none'>").appendTo($rootElement),
                    selectors = ["left", "middle", "right"];

                stack.push(_.compact(_.map(selectors, function(selector) {
                    return replace($header, $header.children(selector), $fakeHeader.children(selector), $hiddenContainer);
                })));

                scope.$on('$destroy', function() {
                    angular.forEach(stack.pop(), function(replacement) {
                        replace($header, replacement.$new, replacement.$old);
                    });
                });

                $fakeHeader.remove();
            }
        };

        function replace($header, $old, $new, $store) {
            if (!$new.length) {
                return null;
            } else if ($old.length) {
                $old.after($new);

                if ($store) {
                    $old.appendTo($store);
                } else {
                    $old.remove();
                }
            } else {
                $header.append($new);
            }
            return {$new: $new, $old: $old};
        }

    });