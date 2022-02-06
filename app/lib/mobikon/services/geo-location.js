angular.module('mk.Services')
    .factory('mkGeoLocation', function($timeout) {

        var self = {
            init: function() {
                navigator.geolocation.watchPosition(function success(result) {
                    $timeout(function() {
                        self.location = result.coords;
                    });
                }, function fail() {
                    $timeout(function() {
                        self.location = null;
                    });
                });
                return self;
            }
        };
        return self;

    });