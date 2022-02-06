'use strict';

describe('yoMenuApp', function() {
    describe('ConfirmOrderCtrl', function() {

        beforeEach(module('yoMenuApp'));

        var scope, location, order, controller;

        beforeEach(inject(function($controller) {
            scope = {};
            location = {
                path: jasmine.createSpy('location.path')
            };
            order = {
                save: jasmine.createSpy('order.save'),
                ServerId: '123'
            };
            scope.order = order;
            controller = $controller;
        }));

        describe('confirmOrder', function() {
            beforeEach(function() {
                createController();
            });

            it('does nothing if valid is false', function() {
                scope.valid = false;
                scope.confirmOrder();

                expect(order.save).not.toHaveBeenCalled();
                expect(scope.saving).toEqual(false);
            });

            it('saves the model and redirects to server page', function() {
                var saveDeferred = $.Deferred();
                order.save.andReturn(saveDeferred);

                expect(scope.saving).toEqual(false);

                scope.confirmOrder();

                expect(scope.saving).toEqual(true);
                expect(order.save).toHaveBeenCalled();

                saveDeferred.resolve();

                expect(location.path).toHaveBeenCalledWith('#/server/123');
                expect(scope.saving).toEqual(false);
            });
        });

        function createController() {
            return controller('ConfirmOrderCtrl', {
                $scope: scope, $location: location
            });
        }
    });
});