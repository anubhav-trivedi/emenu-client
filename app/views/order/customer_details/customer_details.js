'use strict';

angular.module('yoMenuApp')
    .controller('CustomerDetailsCtrl', function($scope, $location, config, Customer) {
        var order = $scope.order;

        var state = $scope.state = {
            saving: false,
            searching: false,
            valid: false,
            uidIsValid: false,
            submitted: false
        };

        $scope.customer = order.Customer || createCustomer(false);

        $scope.customer.IsCorporate = $scope.customer.IsCorporate || !!$scope.customer.CompanyName;

        order.Customer = $scope.customer;

        $scope.searchForExistingUser = function() {
            if (state.uidIsValid && $scope.customer.UniqueId) {
                state.searching = true;
                Customer.findOneFromServer(breeze.Predicate.and([
                        breeze.Predicate.create('UniqueId', '==', $scope.customer.UniqueId),
                        breeze.Predicate.create('AccountId', '==', config.accountId),
                        breeze.Predicate.create('CompanyName', $scope.customer.IsCorporate ? '!=' : '==' , null)
                    ]), {searchLocal: false}).then(function(customer) {
                        customer.IsCorporate = $scope.customer.IsCorporate;
                        $scope.customer = order.Customer = customer;
                        state.searching = false;
                }, function(error) {
                    $scope.customer = order.Customer = createCustomer($scope.customer.IsCorporate, $scope.customer.UniqueId);
                    console.log(error);
                    state.searching = false;
                });
            }
        };

        $scope.submitDetails = function() {
            state.submitted = true;
            if (state.submitEnabled) {
                state.saving = true;
                // Date of Birth is required for Customer Model, but its not a field inside
                // Customer Details for Evorich. Hence i am passing a hardcode value for Date of Birth
                $scope.customer.DateOfBirth = '01/01/1900';
                $scope.customer.save().then(function() {
                    $location.path('/order/' + order.Id + '/menu');
                    state.saving = false;
                }, function(error) {
                    console.log(error);
                    state.saving = false;
                });
            }
        };

        $scope.validate = function() {
            $scope.customer.entityAspect.validateEntity();
            state.validated = true;
        };

        $scope.$watch('customer.UniqueId', function() {
            state.uidIsValid = $scope.customer.entityAspect.validateProperty('UniqueId');
        });

        $scope.$watch('customer.CompanyName || customer.UniqueId && customer.Name && customer.Email', function(valid) {
            state.valid = !!valid; // !! To convert into bool
        });

        $scope.$watch('state.uidIsValid && !state.searching && !state.saving', function(inputEnabled) {
            state.inputEnabled = !!inputEnabled;
        });

        $scope.$watch('state.valid && state.inputEnabled', function(submitEnabled) {
            state.submitEnabled = !!submitEnabled;
        });

        var beenHere1 = 0;
        $scope.$watch('customer.IsCorporate', function(isCorporate) {
            if (!beenHere1++) return;
            if(isCorporate) {
                $scope.customer.UniqueId = null;
            } else {
                $scope.customer.CompanyName = null;
            }
        });


        function createCustomer(isCorporate, uniqueId) {
            var customer = Customer.create({
                UniqueId: uniqueId,
                AccountId: config.accountId,
                CellCountryCode: '65'
            });
            // IsCorporate is a local only field used for validation, it doesn't work if
            // included in the above create call
            customer.IsCorporate = isCorporate;
            return  customer;
        }
    });