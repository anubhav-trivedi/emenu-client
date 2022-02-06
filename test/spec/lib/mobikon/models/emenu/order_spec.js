'use strict';

describe('mk.Models', function() {
    describe('Order', function() {

        beforeEach(module('mk.Models'));

        var Order;

        beforeEach(inject(function(_Order_) {
            Order = _Order_;
        }));

        describe('getTotal', function() {

            it('returns the total of all the OrderItems minus the discount', function() {
                var order = new Order();
                order.OrderItems = [{TotalPrice: 11}, {TotalPrice: 12.1}];
                order.Discount = 5;

                var total = order.getTotal();

                expect(total).toEqual(18.1);
            });

            it('uses the item price and quantity when order item doesnt have total price', function() {
                var order = new Order();
                order.OrderItems = [{Quantity: 3, Item: {Price: 2.1}}];

                var total = order.getTotal();

                expect(total).toBeCloseTo(6.3);
            })
        });

        describe('getOrderItemForItem', function() {

            var oi1, oi2, item, order;

            beforeEach(function() {
                oi1 = {ItemId: 1};
                oi2 = {ItemId: 2};
                order = new Order();
                order.OrderItems = [oi1, oi2];
            });

            it("returns an orderItem with the same id as the item", function() {
                var item = {Id: 2};

                var orderItem = order.getOrderItemForItem(item);

                expect(orderItem).toEqual(oi2);
            });

            it("returns null if no order item for the item can be found", function() {
                var item = {Id: 3};

                var orderItem = order.getOrderItemForItem(item);

                expect(orderItem).toEqual(null);
            })

        });

        describe('validations', function() {

            var order, messageTemplate;

            beforeEach(function() {
                order = new Order();
            });

            it('checks discount is valid', function() {
                checkValidation(order, 'Discount', "abc", "Discount is not valid");
                checkValidation(order, 'Discount', -123, "Discount is not valid");
                checkValidation(order, 'Discount', 0);
                checkValidation(order, 'Discount', 123);
                checkValidation(order, 'Discount', 123.1);
            });

            it('checks deposit amount is valid', function() {
                checkValidation(order, 'AmountPaid', "abc", "Deposit Amount is not valid");
                checkValidation(order, 'AmountPaid', -123, "Deposit Amount is not valid");
                checkValidation(order, 'AmountPaid', 0);
                checkValidation(order, 'AmountPaid', 123);
                checkValidation(order, 'AmountPaid', 123.1);
            });

            function checkValidation(model, propertyName, value, expectedMessage) {
                var message = null,
                    property = model.constructor.properties[propertyName];
                _.each(property.validations, function(validator) {
                    var error = validator.validate(value, {displayName: property.displayName});
                    if (error) {
                        message = error.errorMessage
                        return false;
                    }
                    return true;
                });
                expect(message).toEqual(expectedMessage || null);
            }
        })

    })
});