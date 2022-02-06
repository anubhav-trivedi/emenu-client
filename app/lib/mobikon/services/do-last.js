angular.module('mk.Services')
    .factory('doLast', function($rootScope) {
        var queue;

        return function(expr, scope) {
            scope = scope || $rootScope;
            if (queue) {
                queue.push(expr);
            } else {
                scope.$evalAsync(checkEval);
                queue = [expr];
            }

            function checkEval() {
                if (scope.$$asyncQueue.length) {
                    scope.$evalAsync(checkEval);
                } else {
                    angular.forEach(queue, function(expr) {
                        scope.$eval(expr);
                    });
                    queue = null;
                }
            }
        };
    });