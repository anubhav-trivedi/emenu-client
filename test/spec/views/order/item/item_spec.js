'use strict';

describe('yoMenuApp', function() {
    describe('ItemCtrl', function() {

        beforeEach(module('yoMenuApp'));

        var scope, stateParams, Item, OrderItem, $controller;

        beforeEach(inject(function(_$controller_) {
            scope = {};
            stateParams = {itemId: "abc"};
            Item = {
                findOneFromCache: jasmine.createSpy('Item.findOneFromCache').andReturn($.Deferred())
            };
            $controller = _$controller_;
        }));

        it('loads the item selected with its price', function() {
            var item = {
                Id: 'abc',
                ItemName: 'Banana',
                ItemPrice: '12'
            };
            var orderItem = {
                Id: '1',
                Quantity: 1
            };
            scope.order = {
                getOrderItemForItem: jasmine.createSpy('order.getOrderItemForItem').andReturn(orderItem)
            };

            Item.findOneFromCache.andResolve(item);

            createController();

            expect(Item.findOneFromCache).toHaveBeenCalledWith(stateParams.itemId);
            expect(scope.item).toEqual(item);
            expect(scope.orderItem).toEqual(orderItem);
        });

        describe('add', function() {
            var item, order, orderItem;
            beforeEach(function() {
                item = scope.item = {};
                order = scope.order = {
                    getOrderItemForItem: jasmine.createSpy('order.getOrderItemForItem').andReturn(null)
                };
                orderItem = {Quantity: 0};
                Item.findOneFromCache.andResolve(item);
                OrderItem = {
                    create: jasmine.createSpy('OrderItem.create').andReturn(orderItem)
                };
            })

            it('creates a new order item if item doesn\'t contain a order' , function() {
                createController();
                scope.add();

                expect(OrderItem.create).toHaveBeenCalledWith({ Order: order, Item: item, Quantity: 0, UnitPrice: item.ItemPrice });
                expect(scope.orderItem).toEqual(orderItem);
                expect(scope.orderItem.Quantity).toEqual(1);
                expect(scope.orderItem.TotalPrice).toEqual('12');
            })

            it('Adds to existing order item' , function() {
                createController();
                scope.orderItem = orderItem;
                scope.orderItem.Quantity = 1;
                scope.add();

                expect(OrderItem.create).not.toHaveBeenCalled();
                expect(scope.orderItem).toEqual(orderItem);
                expect(scope.orderItem.Quantity).toEqual(2);
            })
        });

        describe('remove', function() {
            var item, order, orderItem;
            beforeEach(function() {
                item = scope.item = {};
                order = scope.order = {
                    getOrderItemForItem: jasmine.createSpy('order.getOrderItemForItem').andReturn(null)
                };
                orderItem = {Quantity: 0};
                Item.findOneFromCache.andResolve(item);
                orderItem.entityAspect = {setDeleted: jasmine.createSpy('setDeleted')};
                createController();
            });

            it('removes the order item if quantity is 0', function() {
                scope.orderItem = orderItem;
                scope.orderItem.Quantity = 1;

                scope.remove();

                expect(orderItem.entityAspect.setDeleted).toHaveBeenCalled();
                expect(scope.orderItem).toEqual(null);
            });


            it('decreases the quantity', function() {
                scope.orderItem = orderItem;
                scope.orderItem.Quantity = 2;

                scope.remove();

                expect(orderItem.entityAspect.setDeleted).not.toHaveBeenCalled();
                expect(scope.orderItem.Quantity).toEqual(1);
            });

            it('does nothing if there is no order item', function() {
                scope.orderItem = orderItem = null;

                scope.remove();

                expect(scope.orderItem).toEqual(null);
            });
        });

        function createController() {
            return $controller('ItemCtrl', {
                $scope: scope, $stateParams: stateParams, Item: Item, OrderItem: OrderItem
            });
        }
    });
});
