'use strict';

describe('mk.Models', function() {
    describe('OrderItem', function() {

        beforeEach(module('mk.Models'));

        var OrderItem;

        beforeEach(inject(function(_OrderItem_) {
            OrderItem = _OrderItem_;
        }));


        describe('validations', function() {

            var orderItem, messageTemplate;

            beforeEach(function() {
                orderItem = new OrderItem();
            });

            it('checks total price is valid', function() {
                checkValidation(orderItem, 'TotalPrice', "abc", "Add On Price is not valid");
                checkValidation(orderItem, 'TotalPrice', ".", "Add On Price is not valid");
                checkValidation(orderItem, 'TotalPrice', "123.");
                checkValidation(orderItem, 'TotalPrice', "123.4");
            });


            function checkValidation(model, propertyName, value, expectedMessage) {
                var message = null,
                    property = model.constructor.properties[propertyName];
                _.each(property.validations, function(validator) {
                    var error = validator.validate(value, {displayName: property.displayName});
                    if (error) {
                        message = error.errorMessage;
                        return false;
                    }
                    return true;
                });
                expect(message).toEqual(expectedMessage || null);
            }
        })

    })
});
