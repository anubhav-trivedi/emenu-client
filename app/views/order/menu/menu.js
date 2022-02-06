'use strict';

angular.module('yoMenuApp')
    .controller('MenuCtrl', function($scope, $stateParams, $state, $location, config, Item) {
        $scope.cartEmpty = true;
        Item.findAllFromCache({MenuTypeId: config.mainMenuTypeId}).then(function(items) {
            // categories -> sub category -> items
            // e.g. categories['Lighting']['Downlights'] = [{name: "blah", ...}, ..]
            var categories = $scope.categories = {};
            $.each(items, function(i, item) {
                var subCategories = getOrSet(categories, item.Category, {});
                var items = getOrSet(subCategories, item.SubCategory, []);
                items.push(item);
            });

           if (!$state.current.name.match(/\.category/)) {
               var firstCat = $scope.cleanName(_.keys(categories).sort()[0]);
               $state.go('order.menu.category', {categoryId: firstCat});
           }

        }, function(error) {
            console.log(error);
        });

        function getOrSet(obj, key, val) {
            if (!obj[key]) {
                obj[key] = val;
            }
            return obj[key];
        }

        $scope.getCategoryPath = function(category) {
            return '#/order/'+ encodeURIComponent($scope.order.Id) + '/menu/categories/' + encodeURIComponent($scope.cleanName(category));
        };

        $scope.itemClass = function(categoryId) {
            return $location.path().indexOf($scope.cleanName(categoryId)) != -1 ? 'active' : '';
        };

        $scope.$watch('order.OrderItems.length', function(value) {
            $scope.cartEmpty = !!value;
        });

        // these are dirty hacks because we are using names as urls instead of ids
        $scope.cleanName = function(name) {
            return name.replace(/\//g, '__');
        };

        $scope.uncleanName = function(name) {
            return name.replace(/__/g, '/');
        };
    });