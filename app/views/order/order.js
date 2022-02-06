'use strict';

angular.module('yoMenuApp')
    .controller('OrderCtrl', function($scope, $stateParams, Order) {
        Order.findOneFromCache($stateParams.orderId, {include: ["OrderItems", "Customer", "DeliveryAddress"]}).then(function(order) {
            $scope.order = order;
        })
    });