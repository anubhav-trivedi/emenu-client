'use strict';

describe('yoMenuApp', function() {
    describe('SummaryCtrl', function() {

        beforeEach(module('yoMenuApp'));

        var scope, order, total, $controller, email;
        beforeEach(inject(function(_$controller_) { //Dependency Injection
            scope = {};
            total = 10.3;
            order = scope.order = {
                getTotal: jasmine.createSpy('order.getTotal').andReturn(total)
            };

            email = {
                sendOrderQuote: jasmine.createSpy('email.sendOrderQuote')
            };
            $controller = _$controller_;
        }));

//  GetTotal is called from the view
//        it('calculates total amount', function() {
//            createController();
//
//            expect(order.getTotal).toHaveBeenCalled();
//            expect(scope.orderTotal).toEqual(total);
//        });

        it('should send an email of the order quote', function() {
            createController();
            scope.generateQuote();

            expect(email.sendOrderQuote).toHaveBeenCalledWith(scope.order)
        })

        function createController() {
            return $controller('SummaryCtrl', {
                $scope: scope, email: email
            });
        }
    });
});