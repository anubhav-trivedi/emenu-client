'use strict';

angular.module('mk.Directives')
    .directive('mkRequiresLogin', function($interpolate) {

        return {
            restrict: 'A',
            templateUrl: 'lib/mobikon/directives/requires-login/requires-login.html',
            transclude: true,
            replace: false,
            link: function(scope, element, attrs) {

                attrs.$observe('requiredMessage', function(requiredMessage) {
                    scope.requiredMessage = $interpolate(requiredMessage)(scope);
                });

                scope.loginCallback = function(state) {
                    scope.loginState = state;
                }
            }
        }

    });