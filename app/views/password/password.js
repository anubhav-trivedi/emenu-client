'use strict';

angular.module('yoMenuApp')
    .controller('PasswordCtrl', function($scope, Server, $stateParams, $location) {
        Server.findOneFromCache($stateParams.serverId).then(function(server) {
            $scope.password = "";
            $scope.server = server;
            $scope.invalidPassword = false;
            $scope.authenticateServer = function() {
                if(server.Password == $scope.password){
                    $scope.invalidPassword = false;
                    $location.path('/server/' + server.Id);
                }
                else {
                    $scope.invalidPassword = true;
                }
            }
        })
    });