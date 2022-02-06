'use strict';

angular.module('yoMenuApp')
    .controller('ItemCtrl', function($scope, $stateParams, Item, OrderItem) {
        var order = $scope.order;
        Item.findOneFromCache($stateParams.itemId).then(function(item) {
            $scope.item = item;
            var orgOrderItem = order.getOrderItemForItem(item),
                workingOrderItem = orgOrderItem ? OrderItem.create({
                    Quantity: orgOrderItem.Quantity,
                    UnitPrice: orgOrderItem.UnitPrice,
                    Custom: orgOrderItem.Custom                     // Directly using Custom as a field instead of making key value pairs as parsing was a bit of a problem
                }) : OrderItem.create({
                    Quantity: null,
                    UnitPrice: $scope.item.Price,
                    Custom: {'color':'', 'minOrderAmount': null, 'bodyColor': null, 'cushionColor': null, 'temperedGrass': null}
                });

            $scope.orderItem = workingOrderItem;

            $scope.add = function() {
                workingOrderItem.Quantity += 1;
            };

            $scope.remove =  function() {
                if (workingOrderItem.Quantity > 0) workingOrderItem.Quantity -= 1;
            };

            $scope.clear = function() {
                workingOrderItem.Quantity = 0;
            };

            $scope.$watchCollection('[orderItem.Quantity * orderItem.UnitPrice, orderItem.Custom.minOrderAmount]', function(collectedValues) {
                workingOrderItem.TotalPrice = collectedValues[1] != null && collectedValues[1] != undefined && collectedValues != 0 && collectedValues[1] > collectedValues[0]? collectedValues[1] : collectedValues[0];
            });

            $scope.$watch('(orderItem.Quantity != null && orderItem.UnitPrice != null)  || (orderItem.Quantity != null && orderItem.Custom.minOrderAmount != null)', function(doneEnabled) {
                $scope.doneEnabled = doneEnabled;
            });

            $scope.reqClass = function() {
                $scope.doneTapped = true;
            }

            $scope.done = function() {
                if (workingOrderItem.Quantity) {
                    if (orgOrderItem) {
                        orgOrderItem.Quantity = workingOrderItem.Quantity;
                        orgOrderItem.UnitPrice = workingOrderItem.UnitPrice;
                        orgOrderItem.TotalPrice = workingOrderItem.TotalPrice;
                        orgOrderItem.Custom.color = workingOrderItem.Custom.color;
                        orgOrderItem.Custom.minOrderAmount = workingOrderItem.Custom.minOrderAmount;
                        orgOrderItem.Custom.bodyColor = workingOrderItem.Custom.bodyColor;
                        orgOrderItem.Custom.cushionColor = workingOrderItem.Custom.cushionColor;
                        orgOrderItem.Custom.temperedGrass = workingOrderItem.Custom.temperedGrass;
                    } else {
                        workingOrderItem.Order = order;
                        workingOrderItem.Item = item;
                    }
                } else if (orgOrderItem) {
                    orgOrderItem.entityAspect.setDeleted();
                }

                $scope.mk.nav.goBack();
            };

            $scope.cancel = function() {
                $scope.mk.nav.goBack();
            }
        });
    });