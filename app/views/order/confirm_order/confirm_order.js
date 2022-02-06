'use strict';

angular.module('yoMenuApp')
    .controller('ConfirmOrderCtrl', function($scope, $location, invoice, mkBridge) {
        var order = $scope.order;
        $scope.saving = false;
        $scope.checkedTerms = false;
        $scope.confirmOrder = function(doPrint) {
            mkBridge.callNative({method: 'getSignature'}).then(function(signaturePath) {
                $scope.saving = true;
                order.save().then(function() {
                    return invoice.sendConfirmation(order, doPrint, signaturePath).then(function() {
                        $scope.saving = false;
                        $location.path("server/" + $scope.order.ServerId);
                    });
                }, function(error) {
                    console.log(error);
                    $scope.saving = false;
                });
            });
        };
    });