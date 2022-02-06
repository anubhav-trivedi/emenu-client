'use strict';

describe('yoMenuApp', function() {
    describe('ServerCtrl', function() {

        beforeEach(module('yoMenuApp'));

        var scope, stateParams, Server, Order, $controller, location;

        beforeEach(inject(function(_$controller_) {
            scope = {};
            location = {
                path: jasmine.createSpy('location.path')
            };
            stateParams = {serverId: "abc"};
            Server = {
                findOneFromCache: jasmine.createSpy('Server.findOneFromCache').andReturn($.Deferred())
            };
            Order = {
                create: jasmine.createSpy('Order.create')
            };
            $controller = _$controller_;
        }));


        it('reads and loads server', function() {
            var server = 'Ray';
            Server.findOneFromCache.andResolve(server);
            $controller('ServerCtrl', {
                $scope: scope, $stateParams: stateParams, Server: Server, $location: location
            });

            expect(Server.findOneFromCache).toHaveBeenCalledWith(stateParams.serverId);
            expect(scope.server).toEqual(server);
        });

        describe('createOrder', function() {

            beforeEach(function() {
                Server.findOneFromCache.andResolve('Ray');
                $controller('ServerCtrl', {
                    $scope: scope, $stateParams: stateParams, Server: Server, $location: location, Order: Order
                });
            });

            it('create a new order with current server and navigates to orders page', function() {
                Order.create.andReturn({Id: 'dfa'});

                scope.createOrder();

                expect(Order.create).toHaveBeenCalledWith({Server: 'Ray'});
                expect(location.path).toHaveBeenCalledWith('/order/dfa/customer_details')
            });
        })
    });
});