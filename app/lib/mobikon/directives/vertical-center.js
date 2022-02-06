angular.module('mk.Directives')
    .directive('mkVerticalCenter', function() {
        return {
            restrict: 'A',
            transclude: true,
            replace: false,
            template: "<div class='center-container'><div class='center' ng-transclude></div></div>"
        }
    });