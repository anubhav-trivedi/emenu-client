'use strict';

describe('yoMenuApp', function() {
    describe('OrderListCtrl', function() {

        beforeEach(module('yoMenuApp'));

        var scope, config, controller;

        beforeEach(inject(function($controller) {
            scope = {};
            config = {config: 'something'};
            controller = $controller;
        }));

        it("sets the config on the scope", function() {
            createController();

            expect(scope.config).toEqual(config);
        });

        describe('filterOnMenuTypeId', function() {

            beforeEach(function() {
                createController();
            });

            it('creates a filter predicate from the menuTypeId', function() {
                var orderItem1 = {Item: {MenuTypeId: 'monkey'}};
                var orderItem2 = {Item: {MenuTypeId: 'banana'}};
                var predicate = scope.filterOnMenuTypeId('banana');

                expect(predicate(orderItem1)).toEqual(false);
                expect(predicate(orderItem2)).toEqual(true);
            });

        });


        function createController() {
            return controller('OrderListCtrl', {
                $scope: scope, config: config
            })
        }


    })
});