'use strict';

angular.module('yoMenuApp')
    .controller('ServersCtrl', function($scope, config, Server) { // Second parameter should match model layer table names in data.js
        Server.findAllFromCache({MenuId: config.menuId}).then(function(servers) {
            $scope.servers = servers;
        }, function(error) {
            console.log(error);
        });
    });