angular.module('mk.Directives')
    .directive('mkCloak', function(doLast) {
        return function(scope, element, attr) {
            doLast(function() {
                attr.$set('mkCloak', undefined);
            }, scope);
        };
    });