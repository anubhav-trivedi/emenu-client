angular.module('mk.Services')
    .factory('mkBridge', function($q, mkData, $timeout) {
        var handlers = {
            "performSync": function() {
                return mkData.refreshDataSet().then(function() {
                    return "done";
                });
            }
        },
        bridgePromise;

        var self = {
            init: function() {
                var defer = $q.defer();
                connectWebViewJavascriptBridge(function (bridge) {

                    bridge.init(function(data) {
                        console.log("recieved data: "  + data);
                    });

                    angular.forEach(handlers, function(fn, name) {
                        bridge.registerHandler(name, wrapHandlerDeferred(fn));
                    });

                    defer.resolve(bridge);
                });

                bridgePromise = defer.promise;
                return bridgePromise.then(function() {
                    return self;
                });
            },

            callNative: function(data) {
                return bridgePromise.then(function(bridge) {
                    var def = $q.defer();
                    bridge.send(data, function() {
                        var args = arguments;
                        $timeout(function() {
                            def.resolve.apply(def, args);
                        });
                    });
                    return def.promise;
                })
            }
        };

        return self;

        function connectWebViewJavascriptBridge(callback) {
            if (window.WebViewJavascriptBridge) {
                callback(WebViewJavascriptBridge)
            } else {
                document.addEventListener('WebViewJavascriptBridgeReady', function () {
                    callback(WebViewJavascriptBridge)
                }, false)
            }
        }

        function wrapHandlerDeferred(handlerFn) {
            return function(data, callback) {
                callback = _.once(callback);
                var result = handlerFn(data, callback);
                if (angular.isFunction(result.then)) {
                    result.then(callback, callback);
                }
                return result;
            }
        }


    });