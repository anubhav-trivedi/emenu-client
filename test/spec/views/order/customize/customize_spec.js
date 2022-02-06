'use strict';

describe('yoMenuapp', function() {
    describe('CustomizeCtrl', function() {
        beforeEach(module('yoMenuApp'));

        var scope, Item, config, OrderItem, controller;

        beforeEach(inject(function($controller) {
            scope = {
                $on: jasmine.createSpy('scope.on')
            };

            Item = {
                findAllFromCache: jasmine.createSpy('Item.findAllFromCache')
            };

            OrderItem = {
                create: jasmine.createSpy('OrderItem.create')
            };

            config = {addOnMenuType: '212'};
            controller = $controller;
        }));

        it('finds all Addon items and uses existing order items or creates new ones if they dont exist', function() {
            var items = [{Id: '1'}, {Id: '2', Price: 2.0}];
            var order = {Id: 'o1', OrderItems: []};
            var orderItem = {Id: 'a1', Order: order, Item: items[0], ItemId: '1'};
            var newOrderItem = {Item: items[1], Quantity: 1, TotalPrice: 2.0, ItemId: '2'};
            order.OrderItems.push(orderItem);
            scope.order = order;
            Item.findAllFromCache.andResolve(items);
            OrderItem.create.andReturn(newOrderItem);

            createController();

            expect(Item.findAllFromCache).toHaveBeenCalledWith({MenuTypeId: config.addOnMenuTypeId});
            expect(OrderItem.create).toHaveBeenCalledWith({Order: null, Item: items[1], TotalPrice: 2.0, Quantity: 1})
            expect(scope.addOnItems).toEqual(items);
            var expectedItemToOrderItem = {};
            expectedItemToOrderItem[items[0].Id] = orderItem;
            expectedItemToOrderItem[items[1].Id] = newOrderItem;
            expect(scope.itemToOrderItem).toEqual(expectedItemToOrderItem);
        });

        it('cleans up unused order items on destroy', function() {
            Item.findAllFromCache.andReturn($.Deferred());
            var deleted = {
                OrderId: null,
                entityAspect: {
                    setDeleted: jasmine.createSpy('entityAspect.setDeleted')
                }
            };
            var notDeleted = {
                OrderId: '123',
                entityAspect: {
                    setDeleted:jasmine.createSpy('entityAspect.setDeleted')
                }
            };

            createController();

            scope.itemToOrderItem = {
                isDeleted: deleted,
                isNotDeleted: notDeleted
            };

            expect(scope.$on.calls[0].args[0]).toEqual('$destroy');

            var destroy = scope.$on.calls[0].args[1];

            destroy();

            expect(deleted.entityAspect.setDeleted).toHaveBeenCalled();
            expect(notDeleted.entityAspect.setDeleted).not.toHaveBeenCalled();
        });

       function createController() {
           return controller('CustomizeCtrl', {
               $scope: scope, Item: Item, config: config, OrderItem: OrderItem
           });
       }

    });
});