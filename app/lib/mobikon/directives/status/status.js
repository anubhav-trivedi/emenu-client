angular.module('mk.Directives')
    .directive('mkStatus', function(mkOnlineStatus, mkJobQueue) {

        return {
            restrict: 'E',
            templateUrl: 'lib/mobikon/directives/status/status.html',
            controller: function($scope) {
                $scope.online = mkOnlineStatus;
                $scope.queue = mkJobQueue;
            }
        }
    });
