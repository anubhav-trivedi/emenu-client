'use strict';

angular.module('yoMenuApp')
    .controller('SummaryCtrl', function($scope) {
        var order = $scope.order;
        $scope.disableButtons = true;
        $scope.$watchCollection('[order.Discount, order.BillAmount, order.OrderItems.length]', function(val) {
            if(val[0] && val[1]) {
                $scope.disableButtons = false;
            } else {
                if(val[2] > 0) {
                    $scope.disableButtons = true;
                } else {
                    $scope.disableButtons = false;
                }
            }
        });

    });