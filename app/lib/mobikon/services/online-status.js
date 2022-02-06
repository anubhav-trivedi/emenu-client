angular.module('mk.Services')
    .factory('mkOnlineStatus', function($http, $q, $rootScope, $timeout, $window, config) {

        var waitTimer,
            waitAmount = 1000,
            refreshing,
            waiting;

        function startWait(self) {
            if (!waitTimer) {
                waitTimer = $timeout(function() {
                    waitTimer = null;
                    self.refresh();
                }, waitAmount);
            }
        }

        return {
            loaded: false,
            status: 'refreshing',

            init: function(httpTimeout) {
                this.httpTimeout = httpTimeout || 10000;
                this.refresh();

                var $win = angular.element($window);
                $win.bind('online',  this.refresh.bind(this));
                $win.bind('offline', this.refresh.bind(this));

                return this;
            },

            waitForOnline: function() {
                if (this.status == 'online') return $q.when(this.status);
                if (!waiting) waiting = $q.defer();
                return waiting.promise;
            },

            waitForStatus: function() {
                return refreshing || $q.when(this.status);
            },

            refresh: function(httpTimeout) {
                var self = this;

                if (!refreshing) {
                    self.status = 'refreshing';
                    refreshing = $http({
                        method: 'GET',
                        url: config.data.host + '/service-status',
                        timeout: httpTimeout || self.httpTimeout
                    }).then(function() {
                        self.loaded = true;
                        self.status = 'online';
                        if (waiting) {
                            waiting.resolve(self.status);
                            waiting = null;
                        }
                        refreshing = null;
                        return self.status;
                    }, function() {
                        self.loaded = true;
                        self.status = 'offline';
                        startWait(self);
                        refreshing = null;
                        return self.status;
                    });
                }

                return refreshing
            }
        }

    });