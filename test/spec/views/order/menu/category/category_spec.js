'use strict';

describe('yoMenuApp', function() {
    describe('CategoryCtrl', function() {

        beforeEach(module('yoMenuApp'));

        var scope, stateParams, $controller;

        beforeEach(inject(function($rootScope, _$controller_) {
            scope = $rootScope.$new();
            stateParams = {categoryId: 'abc'};
            $controller = _$controller_;
        }));

        it('reads the subcategories from $scope.categories', inject(function($controller) {
            scope.categories = {food: {desert: 'vanilla'}};
            stateParams.categoryId = 'food';
            spyOn(scope, '$watch').andCallThrough();
            $controller('CategoryCtrl', {
                $scope: scope, $stateParams: stateParams
            });
            scope.$apply();

            expect(scope.$watch.calls[0].args[0]).toEqual('categories');
            expect(scope.subCategories).toEqual({desert: 'vanilla'});
        }));

        describe('getSubCategoryPath', function() {

            beforeEach(function() {
                scope.getCategoryPath = jasmine.createSpy().andReturn('banana');
                $controller('CategoryCtrl', {
                    $scope: scope, $stateParams: stateParams
                });
            });

            it('creates url from category url and subcategoryId', function() {
                var path = scope.getSubCategoryPath('vanilla');
                expect(path).toEqual('banana/sub_categories/vanilla');
            });

            it('url encodes the id', function() {
                var path = scope.getSubCategoryPath('vanilla icecream');
                expect(path).toEqual('banana/sub_categories/vanilla%20icecream');
            });
        });
    });
});
