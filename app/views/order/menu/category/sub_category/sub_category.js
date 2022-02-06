'use strict';

angular.module('yoMenuApp')
    .controller('SubCategoryCtrl', function($scope, $stateParams, $filter) {
        $scope.$watch('subCategories', function(subCategories) {
            if (subCategories) {
                $scope.items = subCategories[$scope.uncleanName($stateParams.subCategoryId)];
                $scope.groups = $filter('mk.Group')($scope.items, 3);
            }
        });
    });