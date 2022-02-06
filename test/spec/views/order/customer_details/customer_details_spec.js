'use strict';

describe('yoMenuApp', function() {
    describe('CustomerDetailsCtrl', function() {

        beforeEach(module('yoMenuApp'));

        var scope, Customer, location, $controller, customer;

        beforeEach(inject(function(_$controller_, $rootScope) {
            scope = $rootScope.$new();
            location = {
                path: jasmine.createSpy('location.path')
            };

            Customer = {
                create: jasmine.createSpy('Customer.create')
            };
            $controller = _$controller_;
            customer = {entityAspect: {validateProperty: jasmine.createSpy().andReturn(true)}};
        }));

        it('uses existing Customer stored on the order', function() {
            scope.order = {Customer: customer};

            createController();

            expect(scope.customer).toEqual(customer);
        });

        it('creates a new customer when order doesn\'t have one ', function() {
            var order = scope.order = {};
            Customer.create.andReturn(customer);

            expect(scope.customer).toBeUndefined(); // scope.customer == undefined

            createController();

            expect(scope.customer).toEqual(customer);
            expect(order.Customer).toEqual(customer);
        });

        it('sets initial states to false', function() {
            scope.order = {};

            createController();

            expect(scope.saving).toEqual(false);
            expect(scope.searching).toEqual(false);
            expect(scope.valid).toEqual(false);
        });

        it('sets uidIsValid to value of validateProperty', function() {
            scope.order = {Customer: customer};

            createController();
            scope.$apply();

            expect(scope.uidIsValid).toEqual(true);

            customer.UniqueId = 'blarg';
            customer.entityAspect.validateProperty.andReturn(false);
            scope.$apply();

            expect(scope.uidIsValid).toEqual(false);
            expect(customer.entityAspect.validateProperty).toHaveBeenCalled();
        });

        it('valid is true when unique id or company name, name and email are valid, false otherwise', function() {
            scope.order = {Customer: customer};

            createController();
            scope.$apply();

            expect(scope.valid).toEqual(false);

            customer.Name = "Banana";
            customer.Email = "";
            customer.UniqueId = "123";
            customer.CompanyName = "";
            scope.$apply();

            expect(scope.valid).toEqual(false);

            customer.Name = "";
            customer.Email = "banana@example.com";
            customer.UniqueId = "123";
            customer.CompanyName = "";
            scope.$apply();

            expect(scope.valid).toEqual(false);

            customer.Name = "Banana";
            customer.Email = "banana@example.com";
            customer.UniqueId = "";
            customer.CompanyName = "";
            scope.$apply();

            expect(scope.valid).toEqual(false);

            customer.Name = "Banana";
            customer.Email = "banana@example.com";
            customer.UniqueId = "123";
            scope.$apply();

            expect(scope.valid).toEqual(true);

            customer.Name = "Banana";
            customer.Email = "banana@example.com";
            customer.UniqueId = "";
            customer.CompanyName = "Mobikon";
            scope.$apply();

            expect(scope.valid).toEqual(true);

        });

        it('enables input if UniqueId is not empty and searching is false and saving is false', function() {
            scope.order = {Customer: customer};

            createController();
            scope.$apply();

            scope.uidIsValid = false;
            scope.$apply();

            expect(scope.inputEnabled).toEqual(false);

            scope.uidIsValid = true;
            scope.$apply();

            expect(scope.inputEnabled).toEqual(true);

            scope.uidIsValid = true;
            scope.searching = true;
            scope.saving = true;
            scope.$apply();

            expect(scope.inputEnabled).toEqual(false);

            scope.uidIsValid = true;
            scope.searching = false;
            scope.saving = true;
            scope.$apply();

            expect(scope.inputEnabled).toEqual(false);

            scope.uidIsValid = true;
            scope.searching = true;
            scope.saving = false;
            scope.$apply();

            expect(scope.inputEnabled).toEqual(false);

        });

        it('submits customer details if isValid and Input Enabled', function() {
            scope.order = {Customer: customer};
            createController();
            scope.$apply();

            scope.valid = true;
            scope.inputEnabled = true;
            scope.$apply();

            expect(scope.submitEnabled).toEqual(true);

            scope.valid = false;
            scope.inputEnabled = true;
            scope.$apply();

            expect(scope.submitEnabled).toEqual(false);

            scope.valid = true;
            scope.inputEnabled = false;
            scope.$apply();

            expect(scope.submitEnabled).toEqual(false);
        });

        it('checks whether customer is a corporate customer', function() {
            scope.order = {Customer: customer};

            createController();

            scope.isCorporate = true;
            scope.$apply();

            expect(scope.corporate).toEqual(true);
            expect(scope.customer.UniqueId).toEqual("");

            scope.isCorporate = false;
            scope.$apply();

            expect(scope.corporate).toEqual(false);
            expect(scope.customer.CompanyName).toEqual("");
        });

        describe('searchForExistingUser', function() {
            var customer, customer2, order, searchDeferred;
            beforeEach(function() {
                customer = {Id: 1};
                customer2 = {Id: 2};
                order = scope.order = {Customer: customer, uidIsValid: true};
                searchDeferred = $.Deferred();
                Customer.findOneFromServer = jasmine.createSpy('Customer.findOneFromServer').andReturn(searchDeferred);
                createController();
            });

            it('does not search if the unique id is invalid', function() {
                scope.uidIsValid = false;

                scope.searchForExistingUser();

                expect(scope.searching).toEqual(false);
                expect(Customer.findOneFromServer).not.toHaveBeenCalled();
            });

            it('searches for existing customer and sets it to scope and order', function() {
                scope.uidIsValid = true;
                customer.UniqueId = "123";

                scope.searchForExistingUser();

                expect(scope.searching).toEqual(true);
                expect(Customer.findOneFromServer).toHaveBeenCalledWith({UniqueId: "123"}, {searchLocal: false});

                searchDeferred.resolve(customer2);

                expect(scope.customer).toEqual(customer2);
                expect(order.Customer).toEqual(customer2);
                expect(scope.searching).toEqual(false);
            });

            it('sets searching back to false when search fails', function() {
                scope.uidIsValid = true;
                customer.UniqueId = "123";

                scope.searchForExistingUser();

                searchDeferred.reject();

                expect(scope.customer).toEqual(customer);
                expect(order.Customer).toEqual(customer);
                expect(scope.searching).toEqual(false);
            });
        });

        describe('submitDetails', function() {
            var customer, order, saveDeferred;
            beforeEach(function() {
                customer = {Id: 1};
                order = scope.order = {Id: "12", Customer: customer};

                customer.save = jasmine.createSpy('customer.save');
                saveDeferred = $.Deferred();
                customer.save.andReturn(saveDeferred);

                createController();
            });

            it('saves the customer and directs to menu', function() {
                scope.submitEnabled = true;

                scope.submitDetails();

                expect(scope.saving).toEqual(true);
                expect(scope.customer.save).toHaveBeenCalled();

                saveDeferred.resolve();

                expect(location.path).toHaveBeenCalledWith('/order/' + order.Id + '/menu');
                expect(scope.saving).toEqual(false);
            });

            it('sets saving to false when save fails', function() {
                scope.submitEnabled = true;

                scope.submitDetails();
                saveDeferred.reject();

                expect(location.path).not.toHaveBeenCalled();
                expect(scope.saving).toEqual(false);
            });

            it('does not search when submitEnabled is false', function() {
                scope.submitEnabled = false;

                scope.submitDetails();

                expect(scope.saving).toEqual(false);
                expect(scope.customer.save).not.toHaveBeenCalled();
            });

        });

        function createController() {
            return $controller('CustomerDetailsCtrl', {
                $scope: scope, Customer: Customer, $location: location
            });
        }
    });
});