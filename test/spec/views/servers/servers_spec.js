'use strict';

describe('yoMenuApp', function() {
    describe('ServersCtrl', function() {

        beforeEach(module('yoMenuApp'));

        var scope, config, Server;

        beforeEach(function() {
            scope = {};
            config = {menuId: "abc"};
            Server = {
                findAllFromCache: jasmine.createSpy('Server.findAllFromCache').andReturn($.Deferred())
            };
        });

        it('reads and loads servers', inject(function($controller) {
            var servers = ['Josh', 'Martin'];
            Server.findAllFromCache.andResolve(servers); //This returns a deffered bind to the server's object.
            $controller('ServersCtrl', {
                $scope: scope, config: config, Server: Server
            });

            expect(Server.findAllFromCache).toHaveBeenCalledWith({MenuId: config.menuId});
            expect(scope.servers).toEqual(servers);
        }));
    });
});