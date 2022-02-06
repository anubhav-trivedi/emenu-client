angular.module('mk.Directives')
    .directive('mkNativeDatePicker', function($timeout) {


        return {
            restrict: 'A',
            scope: {
                model: '=mkNativeDatePicker',
                min: '@',
                max: '@'
            },
            link: function(scope, element, attrs) {
                var pickerId,
                    now = moment(),
                    boundingRect = element[0].getBoundingClientRect(),
                    min = scope.min ? moment(scope.min, 'YYYY-MM-DD') : now.clone().subtract('years', 3),
                    max = scope.max ? moment(scope.max, 'YYYY-MM-DD') : now.clone().add('years', 3),
                    options = {
                        min: min.format('YYYY-MM-DD HH-mm'),
                        max: max.format('YYYY-MM-DD HH-mm'),
                        frame: {
                            x: 0,
                            y: boundingRect.top,
                            width: boundingRect.width,
                            height: boundingRect.height
                        }
                    };


                MKDatePicker.showDatePicker(options, function(result) {
                    $timeout(function() {
                        pickerId = result.id;
                        if (result.date) {
                            scope.model = moment(result.date, 'YYYY-MM-DD HH-mm').toDate()
                        }
                    });
                });

                scope.$on('$destroy', function() {
                    MKDatePicker.removeDatePicker(pickerId);
                })
            }
        };

        function createPickerOptions(min, max) {

        }


    });