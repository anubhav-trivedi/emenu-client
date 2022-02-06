angular.module('mk.Directives')
    .directive('mkTimedBackground', function($timeout) {

        return {
            link: function(scope, element, attr) {
                var active = true,
                    imageMap = createImageMap(scope.$eval(attr.mkTimedBackground));


                if (!imageMap.length) return;

                setBg();

                scope.$on("$destroy", function() {
                    active = false;
                });

                function setBg() {
                    if (active) {
                        var image = imageMap[moment().hours()];
                        if (image) {
                            element.css("background-image", "url(" + image + ")");
                        }
                        $timeout(setBg, 60*1000);
                    }
                }

            }
        };


        function createImageMap(timeToBg) {
            var imageMap = [];
            angular.forEach(timeToBg, function(file, times) {
                var split = times.split("-"),
                    from = +split[0],
                    to = +split[1];

                for (var i = from; i != to; i = (i + 1) % 24) {
                    imageMap[i] = file;
                }
                imageMap[to] = file

            });
            return imageMap;
        }

    });
