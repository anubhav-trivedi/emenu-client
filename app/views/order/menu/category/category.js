'use strict';

angular.module('yoMenuApp')
    .controller('CategoryCtrl', function($scope, $stateParams, $state, $location) {
        $scope.$watch('categories', function(categories) {
            if (categories) {
                $scope.subCategories = categories[$scope.uncleanName($stateParams.categoryId)];

                if (!$state.current.name.match(/\.sub_category/)) {
                    var firstCat = $scope.cleanName(_.keys($scope.subCategories).sort()[0]);
                    $state.go('order.menu.category.sub_category', {subCategoryId: firstCat})
                }
            }
        });

        $scope.getSubCategoryPath = function(subCategory) {
            return $scope.getCategoryPath($stateParams.categoryId) + '/sub_categories/' + encodeURIComponent($scope.cleanName(subCategory));
        };

        $scope.itemClass = function(subCategoryId) {
            return $location.path().indexOf($scope.cleanName(subCategoryId)) != -1 ? 'active' : '';
        };
    });
