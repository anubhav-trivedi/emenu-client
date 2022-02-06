'use strict';

describe('yoMenuApp', function() {
    describe('MenuCtrl', function() {

        beforeEach(module('yoMenuApp'));

        var scope, config, Item;

        beforeEach(function() {
            scope = {};
            config = {mainMenuTypeId: 'abc'};
            Item = {
                findAllFromCache: jasmine.createSpy('Item.findAllFromCache').andReturn($.Deferred())
            };
        });

        it('loads items into the categories', inject(function($controller) {
            var items = [
                {Category: 'Food', SubCategory: 'Chinese'},
                {Category: 'Food', SubCategory: 'Thai'},
                {Category: 'Drinks', SubCategory: 'Beer'}
            ];

            Item.findAllFromCache.andResolve(items);

            $controller('MenuCtrl', {
                $scope: scope, config: config, Item: Item
            });

            expect(Item.findAllFromCache).toHaveBeenCalledWith({MenuTypeId: config.mainMenuTypeId});
            expect(scope.categories).toEqual({
                Food: {
                    Chinese: [items[0]],
                    Thai: [items[1]]
                },
                Drinks: {
                    Beer: [items[2]]
                }
            })
        }));

        describe('getCategoryPath', function() {

            beforeEach(inject(function($controller) {
                $controller('MenuCtrl', {
                    $scope: scope, config: config, Item: Item
                });
            }));

            it('creates url from category id', function() {
                scope.order = {Id: '573hhe'};
                var path = scope.getCategoryPath('food');
                expect(path).toEqual('#/order/573hhe/menu/categories/food');
            });

            it('url encodes the id', function() {
                scope.order = {Id: '573h-h e'};
                var path = scope.getCategoryPath('spicy food');
                expect(path).toEqual('#/order/573h-h%20e/menu/categories/spicy%20food');
            });
        });

    });
});
