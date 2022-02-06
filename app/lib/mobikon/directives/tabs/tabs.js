angular.module('mk.Directives')
    .directive('mkTabs', function() {

        return {
            restrict: 'E',
            templateUrl: 'lib/mobikon/directives/tabs/tabs.html',
            replace: false,
            transclude: true,
            link: {
                pre: function(scope) {
                    scope.mkTabs = {
                        enabled: true,
                        tabs: []
                    };
                },
                post: function(scope) {
                    scope.mkTabs.enabled = scope.mkTabs.tabs[0].id;
                    scope.tabClicked = function(index) {
                        scope.mkTabs.enabled = index;
                    }
                }
            }
        }
    })
    .directive('mkTab', function() {
        var ids = 1;

        return {
            restrict: 'E',
            template: '<div ng-class="{active: mkTabs.enabled == mkTab.id}" ng-if="mkTabs.enabled == mkTab.id" ng-transclude></div>',
            transclude: true,
            scope: true,
            link: function(scope, element, attrs) {
                scope.mkTab = {id: ids++, title: attrs.title};
                scope.mkTabs.tabs.push(scope.mkTab);
            }
        }

    });