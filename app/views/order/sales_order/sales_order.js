'use strict';

angular.module('yoMenuApp')
    .controller('SalesOrderCtrl', function($scope, $filter) {
        $scope.proceedFurther = false;
        $scope.formattedDate =  $filter('date')($scope.order.PickupDate, 'MM/dd/yyyy HH:mm');
// I have used bootstrap datetimepicker as html5 datetime picker is not working properly with AngularJS

        var today = $filter('date')(new Date(), 'MM/dd/yyyy HH:mm');
        $(".form_datetime").datetimepicker({
            format: "mm/dd/yyyy hh:ii",
            autoclose: true,
            todayBtn: true,
            startDate: today,
            pickerPosition: "bottom-left"
        });

        $scope.$watch('formattedDate', function() {
            var date = $filter('date')($scope.formattedDate, 'MM/dd/yyyy HH:mm');
            $scope.order.PickupDate = date;
            return date;
        });

        $scope.$watchCollection('[order.Discount, order.BillAmount, order.OrderItems.length, order.PaymentMethod]', function(val) {
            if(val[0] && val[1]) {
                $scope.proceedFurther = false;
            } else {
                if(val[2] > 0 && val[3]) {
                    $scope.proceedFurther = true;
                } else {
                    $scope.proceedFurther = false;
                }
            }
        });
    });