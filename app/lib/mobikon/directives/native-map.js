angular.module('mk.Directives')
    .directive('mkNativeMap', function($window, $timeout, $state) {

        var mapKit = $window.mapKit;

        return {
            scope: {
                pins: "&",
                center: "&",
                radius: "&",
                callOutTap: "&",
                showCallOuts: "="
            },
            link: function(scope, element) {
                $timeout(function() {
                    var rect = element[0].getBoundingClientRect(),
                        pins = scope.pins(),
                        center = scope.center(),
                        orgOptions = _.clone(mapKit.options),
                        pinMap = {};

                    _.extend(mapKit.options, {
                        height: rect.bottom - rect.top - 1 ,
                        width: rect.right - rect.left,
                        top: rect.top,
                        showCallOuts: scope.showCallOuts !== false
                    });

                    if (center) {
                        mapKit.options.lat = center.latitude;
                        mapKit.options.lon = center.longitude;
                    } else if (pins) {
                        mapKit.options.rect = getRectFromPins(pins);
                    }

                    mapKit.showMap();
                    mapKit.setButtonCallback(function(index) {
                        var cb = scope.callOutTap();
                        if (cb && pinMap[index]) cb(pinMap[index]);
                        scope.$apply();
                    });

                    if (pins) {
                        angular.forEach(pins, function(pin, i) {
                            pin.index = i;
                            pinMap[pin.index] = pin;
                        });
                        mapKit.addMapPins(pins);
                    }

                    scope.$on('$destroy', function() {
                        mapKit.options = orgOptions;
                        mapKit.destroyMap();
                    })


                })
            }
        };

        function getRectFromPins(pins) {
            var rect = {
                top: pins[0].lat, bottom: pins[0].lat, left: pins[0].lon, right: pins[0].lon
            };

            angular.forEach(pins, function(pin) {
               if (pin.lat > rect.top) rect.top = pin.lat;
               if (pin.lat < rect.bottom) rect.bottom = pin.lat;
               if (pin.lng < rect.left) rect.left = pin.lng;
               if (pin.lng > rect.right) rect.right = pin.lng;
            });

            return rect;
        }
    });