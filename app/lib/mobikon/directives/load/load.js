'use strict';

/**
 * A directive that handles the loading state of data, showing a loading
 * icon while loading, an offline icon when offline, and retrying when coming back online
 *
 * If a child view sets mk-load to the same function as a parent. Then the child view will not execute
 * the function again, and instead inherit the state of the parent.
 *
 * Usage:
 * mk-load='loader'
 *
 * Where loader is a:
 * function that returns a promise - mk-load will call the method and then wait for the promise. If the promise fails and
 * the app is offline, then when coming back online mk-load will call the function for a new promise and try again
 *
 * promise - mk-load will show a loading icon and hide the content until the promise completes
 *
 * a non-promise or a function that returns a non-promise - mk-load acts like the data loaded immediately
 */
angular.module('mk.Directives')
    .directive('mkLoad', function(mkOnlineStatus, $interpolate) {

        var ids = 1;

        return {
            restrict: 'A',
            templateUrl: 'lib/mobikon/directives/load/load.html',
            replace: false,
            transclude: true,
            link: function(scope, element, attrs) {
                var mkLoad,
                    // we need to seperate the messages (and other settings?) from the
                    // the state, as the state can be inherited
                    mkLoadMessages = scope.mkLoadMessages = {};

                attrs.$observe('loadingMessage', function(loadMessage) {
                    mkLoadMessages.loadingMessage = loadMessage && $interpolate(loadMessage)(scope);
                });

                scope.$watch(attrs.mkLoad, function(loader) {
                    if (!loader) {
                        mkLoad = scope.mkLoad = {};
                        load(loader);
                    } else if (loader._mkLoadId && scope['mkLoadStatus_' + loader._mkLoadId]) {
                        // the function has already been handled by another mkLoad, we just inherit the state
                        mkLoad = scope.mkLoad = scope['mkLoadStatus_' + loader._mkLoadId]
                    } else {
                        loader._mkLoadId = ids++;
                        mkLoad = scope.mkLoad = scope['mkLoadStatus_' + loader._mkLoadId] = {};
                        load(loader);
                    }
                });

                function load(loader) {
                    // normalise the loader to a promise
                    var promise;
                    if (!loader) promise = null;
                    else if (loader.promise) promise = loader.promise;
                    else if (_.isFunction(loader)) promise = loader();
                    else if (_.isFunction(loader.then)) promise = loader;

                    // if we have a promise and its a real promise then wait
                    if (promise && _.isFunction(promise.then)) {
                        waitForPromise(promise, loader);
                    } else {
                        loaded();
                    }
                }

                // wait for the promise and set the states accordingly
                // retry if failure is due to offline
                function waitForPromise(promise, loader) {
                    loading();
                    promise.then(function() {
                        loaded();
                    }, function() {
                        if (mkOnlineStatus.status != 'online') {
                            offline();
                            if (loader) {
                                mkOnlineStatus.waitForOnline().then(function() {
                                    load(loader);
                                });
                            }
                        } else {
                            error();
                        }
                    })
                }

                // state helper methods
                function loaded() {
                    mkLoad.status = 'loaded';
                }

                function loading() {
                    mkLoad.status = 'loading';
                }

                function offline() {
                    mkLoad.status = 'offline';
                }

                function error() {
                    mkLoad.status = 'error';
                }
            }
        }
    });