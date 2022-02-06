'use strict';

angular.module('yoMenuApp')
    .controller('CustomizeCtrl', function($scope, Item, config, OrderItem) {
        var order = $scope.order,
            itemToOrderItem = $scope.itemToOrderItem = {};

        Item.findAllFromCache({MenuTypeId: config.addOnMenuTypeId}).then(function(addOnItems) {
            $scope.addOnItems = addOnItems;

            // retrieve the OrderItems for Add-ons already in the order
            angular.forEach($scope.order.OrderItems, function(orderItem) {
                if (orderItem.Item.MenuTypeId != config.addOnMenuTypeId) return;
                itemToOrderItem[orderItem.ItemId] = orderItem;
            });

            // Create OrderItems for Add-ons not already in the order
            angular.forEach(addOnItems, function(item) {
                var orderItem = itemToOrderItem[item.Id];
                if (!orderItem) {
                    // we set the default price to empty
                    var price = +item.Price || null;
                    orderItem = itemToOrderItem[item.Id] = OrderItem.create({
                        Order: null, // don't set the order until the checkbox is ticked
                        Item: item,
                        TotalPrice: price,
                        UnitPrice: price,
                        Quantity: 1
                    });
                }

                $scope.filterAddOns = function(category) {
                    return function(addOnItem) {
                        return addOnItem.Category == category;
                    }
                };

                $scope.$watch('itemToOrderItem["' + item.Id + '"].TotalPrice', function(price) {
                    orderItem.OrderId = price == null ?
                        null :
                        order.Id;
                    orderItem.UnitPrice = price;
                });

                $scope.$watch('itemToOrderItem["' + item.Id + '"].OrderId', function(orderId) {
                    if (!orderId) {
                        orderItem.TotalPrice = null;
                    }
                });

            });

            if (!order.Discount) {
                $scope.order.Discount = null;
                $scope.hasDiscount = false;
            } else {
                $scope.hasDiscount = true;
            }

            $scope.$watch('hasDiscount', function(hasDiscount) {
                if (!hasDiscount) {
                    $scope.order.Discount = null;
                }
            });

            $scope.$watch('order.Discount', function(discount) {
                $scope.hasDiscount = !!discount;
            });
        });

        // Make sure all the unused OrderItems are removed from the cache
        // This is called when page changes
        // it is NOT called when the browser refreshes, which will cause a leak
        $scope.$on('$destroy', function() {
            for (var itemId in $scope.itemToOrderItem) {
                var orderItem = $scope.itemToOrderItem[itemId];

                // We check if OrderId has been set blank by the view ng-false-value
                if (!orderItem.OrderId) {
                    orderItem.entityAspect.setDeleted();
                } else if (!orderItem.TotalPrice) {
                    orderItem.TotalPrice = 0;
                }
            }

            // set the price back to 0 if we had set it to null
            if (!order.Discount) $scope.order.Discount = 0;

        });
    });