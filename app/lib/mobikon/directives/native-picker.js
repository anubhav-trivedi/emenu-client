angular.module('mk.Directives')
    .directive('mkNativePicker', function($window) {

        var PickerView = $window.plugins && $window.plugins.pickerView;

        return {
            restrict: 'A',
            scope: {
                pickerOptions: '&mkNativePicker',
                mkModel: "="
            },
            template: "<div ng-transclude ng-click='clicked()'></div>",
            transclude: true,
            controller: function($scope) {
                $scope.clicked = function() {

                    // set the default values
                    var pickerOptions = $scope.pickerOptions();
                    for (var i = 0; i < pickerOptions.length; ++i) {
                        pickerOptions[i].value = $scope.mkModel[pickerOptions[i].name]
                    }

                    PickerView.create(pickerOptions, {}, function(selectedValues, buttonIndex) {
                        if (buttonIndex != 0) { // 0 is cancel
                            $scope.mkModel = selectedValues;
                            $scope.$apply();
                            console.log(selectedValues);
                        }
                    });
                }
            }
        };
    });