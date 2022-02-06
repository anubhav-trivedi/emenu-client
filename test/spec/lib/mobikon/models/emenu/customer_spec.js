'use strict';

describe('mk.Models', function() {
    describe('Customer', function() {

        beforeEach(module('mk.Models'));

        var Customer;

        beforeEach(inject(function(_Customer_) {
            Customer = _Customer_;
        }));

        describe('validations', function() {

            var customer;

            beforeEach(function() {
                customer = new Customer();
            });

            it('checks unique id is a valid Singapore IC', function() {
//                checkValidation(customer, 'UniqueId', null, "'IC Number' is required");
                checkValidation(customer, 'UniqueId', "abc", "'abc' is not a valid IC Number");
                checkValidation(customer, 'UniqueId', "G1234567L");
            });

            it('checks country code is a number', function() {
                checkValidation(customer, 'Cell_Country', null, "'Country Code' is required");
                checkValidation(customer, 'Cell_Country', "abc", "Country Code must be a number");
                checkValidation(customer, 'Cell_Country', "123");
            });

            it('checks the email is valid', function() {
                checkValidation(customer, 'Email', null, "'Email Address' is required");
                checkValidation(customer, 'Email', "abc", "The Email Address 'abc' is not a valid email address");
                checkValidation(customer, 'Email', "abc@abc", "The Email Address 'abc@abc' is not a valid email address");
                checkValidation(customer, 'Email', "abc@abc.com");
            });

            it('checks the singapore mobile number is valid', function() {
                checkValidation(customer, 'Cell_Number', null, "'Mobile Number' is required");
                checkValidation(customer, 'Cell_Number', "abc", "Mobile Number is not valid");
                checkValidation(customer, 'Cell_Number', "123", "Mobile Number is not valid");
                checkValidation(customer, 'Cell_Number', "23456789", "Mobile Number is not valid");
                checkValidation(customer, 'Cell_Number', "84056012");
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