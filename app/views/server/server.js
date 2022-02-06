'use strict';

angular.module('yoMenuApp')
    .controller('ServerCtrl', function($scope, $stateParams, $location, Server, Order, mkModelUtils, mkData, Address, $filter) {
        Server.findOneFromCache($stateParams.serverId).then(function(server) {
            $scope.server = server;
            $scope.createOrder = function() {
                var order = Order.create({Server: $scope.server, MenuId: server.MenuId, Date: new Date(), Tax: 0.07});
                order.DeliveryAddress = Address.create({});
                $location.path('/order/' + order.Id + '/customer_details');
            }
        });

        $scope.dateRange = {
            from: moment().subtract('months', 1),
            to: moment()
        };

        $scope.$watch('dateRange.to', update);
        $scope.$watch('dateRange.from', update);

        $scope.$watch('orderOptions', updateTotals);


        var to, from;

        function update(val) {
            if (to == $scope.dateRange.to && from == $scope.dateRange.from) return;

            to = $scope.dateRange.to;
            from = $scope.dateRange.from;

            if (!to || !from) return;

            if (to.isBefore(from)) {
                if (val == from) $scope.dateRange.to = moment(from);
                else $scope.dateRange.from = moment(to);
                return;
            }

            $scope.orderOptions = {
                model: 'Order',
                filters: [
                    breeze.Predicate.create('Date', '>=', from.toDate()),
                    breeze.Predicate.create('Date', '<=', moment(to).endOf('day').toDate()),
                    { ServerId: $stateParams.serverId }
                ],
                fields: [
                    { displayName: 'Order No', value: 'OrderNo', customFilters: true},
                    { displayName: 'Customer', value: 'Customer.Name' },
                    { displayName: 'Order Date', value: 'Date', filter: 'date' },
                    { displayName: 'Delivery/Installation Date', value: 'PickupDate', filter: 'date' },
                    { displayName: 'Order Amount', value: 'getTotal()', expand: 'OrderItems', filter: 'currency' },
                    { displayName: 'Paid', value: 'AmountPaid', filter: 'currency' },
                    { displayName: 'Balance Due', value: 'getBalance()', filter: 'currency' },
                    { displayName: 'Payment Mode', value: 'PaymentMethod' }
                ],
                orderBy: [
                    'Date desc'
                ],
                modelView: {
                    title: 'Order',
                    inheritFields: true,
                    options: {
                        fields: [

                        ],
                        associations: [
                            {
                                property: 'OrderItems',
                                displayName: 'Items',
                                filters: [
                                    {'Item.Category': {not: 'Order Terms and Conditions'} }
                                ],
                                fields: [
                                    { displayName: 'Item', value: 'Item.Name',width: "60%" },
                                    { displayName: 'Quantity', id: 'quantity', value: 'Quantity', width: "20%" },
                                    { displayName: 'Total', id: 'total', value: 'TotalPrice', filter: 'currency', width: "20%" }
                                ],
                                orderBy: [
                                    'Item.MenuTypeId', 'Item.Category'
                                ]
                            },
                            {
                                property: 'OrderItems',
                                displayName: 'Terms and Conditions',
                                filters: [
                                    {'Item.Category': 'Order Terms and Conditions' }
                                ],
                                fields: [
                                    { displayName: 'Term', value: 'Item.Name' }
                                ]
                            }

                        ]
                    }
                },
                paging: {
                    pageSize: 13
                },
                minHeight: 477
            };
        }

        function updateTotals(options) {
            if (options) {
                var query = mkModelUtils.makeQuery(options);
                mkData.manager.executeQuery(query).to$q().then(function(response) {
                    var total = 0,
                        paid = 0;
                    angular.forEach(response.results, function(order) {
                        total += order.getTotal() || 0;
                        paid += order.AmountPaid || 0;
                    });
                    $scope.total = total;
                    $scope.paid = paid;
                });
            }

        }
    })

    .filter('showQuantity', function() {
        return function(text) {
            return text == 'AddOn' || text == 'Order Terms and Conditions';
        }
    });
