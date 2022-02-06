'use strict';

describe('yoMenuApp', function() {
    describe('SubCategoryCtrl', function() {

        beforeEach(module('yoMenuApp'));

        var scope, stateParams, $controller;

        beforeEach(inject(function($rootScope, _$controller_) {
            scope = $rootScope.$new();
            stateParams = {categoryId: 'abc'};
            $controller = _$controller_;
        }));

        it('reads the items from $scope.subCategories', inject(function($controller) {
            scope.subCategories = {desert: 'vanilla'};
            stateParams.subCategoryId = 'desert';
            spyOn(scope, '$watch').andCallThrough();
            $controller('SubCategoryCtrl', {
                $scope: scope, $stateParams: stateParams
            });
            scope.$apply();

            expect(scope.$watch.calls[0].args[0]).toEqual('subCategories');
            expect(scope.items).toEqual('vanilla');
        }));
    });
});