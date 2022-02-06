'use strict';

angular.module('yoMenuApp')
    .controller('QuoteOrderCtrl', function($scope, $location, invoice, mkBridge) {
        var order = $scope.order;
        $scope.sending = false;
        $scope.checkedTerms = false;
        $scope.generateQuote = function(doPrint) {
            mkBridge.callNative({method: 'getSignature'}).then(function(signaturePath) {
                $scope.sending = true;
                return invoice.sendQuote(order, doPrint, signaturePath).then(function() {
                    $scope.sending = false;
                    $location.path("server/" + order.ServerId);
                }, function(error) {
                    console.log(error);
                    $scope.sending = false;
                });
            });
        };
    });