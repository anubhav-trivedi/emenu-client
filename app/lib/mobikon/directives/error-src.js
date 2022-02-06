angular.module('mk.Directives')
    .directive('mkErrorSrc', function() {
        return {
            link: function(scope, element, attrs) {
                element.bind('error', function() {
                    element.attr('src', attrs.mkErrorSrc);
                });
                element.attr('src', attrs.mkErrorSrc);
            }
        }
    });