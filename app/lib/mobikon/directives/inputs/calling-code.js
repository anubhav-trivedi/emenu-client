'use strict';

/**
 * Creates a dropdown input with all the country codes.
 */
angular.module('mk.Directives')
    .directive('mkCallingCode', function() {

        var countries;

        return {
            restrict: 'A',
            scope: {
                callingCode: '=mkCallingCode' // this is the calling code value
            },
            template: '<select ng-model="selected" ng-options="c as (c.name + \' (+\' + c.callingCode + \')\') for c in countries"></select>',
            controller: function($scope, mkCountries) {
                // sorted by name, used in the ng-options directive
                countries =  $scope.countries = countries || _.sortBy(mkCountries.countries, 'name');

                // selected is the currently data-binded country object
                // here we set the initial value from the mkCallingCode value
                $scope.$watch('callingCode', function(callingCode) {
                    if (!$scope.selected) { // selected is undefined initially
                        $scope.selected = _.find(countries, function(country) {
                            return country.callingCode == callingCode;
                        });
                    }
                });

                // assigns the calling code value whenever the selection changes
                $scope.$watch('selected', function(selected) {
                    $scope.callingCode = +selected.callingCode;
                });
            }
        };
    });