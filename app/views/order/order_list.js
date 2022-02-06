angular.module('yoMenuApp')
    .controller('OrderListCtrl', function($scope, config, $filter) {

        $scope.config = config;
        $scope.showAddOn = true;
        $scope.showOrderTerm = true;
        $scope.formattedDate =  $filter('date')($scope.order.PickupDate, 'MM/dd/yyyy HH:mm');
// I have used bootstrap datetimepicker as html5 datetime picker is not working porperly with AngularJS

        var today = $filter('date')(new Date(), 'MM/dd/yyyy HH:mm');
        $(".form_datetime").datetimepicker({
            format: "mm/dd/yyyy hh:ii",
            autoclose: true,
            todayBtn: true,
            startDate: today,
            pickerPosition: "bottom-left"
        });

        $scope.filterOnMenuTypeId = function(menuTypeId) {
            return function(orderItem) {
                return orderItem.Item.MenuTypeId == menuTypeId;
            }
        };

        $scope.filterOnMenuTypeIdAndCategory = function(menuTypeId, category) {
            return function(orderItem) {
                return orderItem.Item.MenuTypeId == menuTypeId && orderItem.Item.Category == category;
            }
        };

        $scope.$watch('order.Discount', function (val) {
            if(val) {
                $scope.order.BillAmount = null;
            }
        });

       $scope.$watch('formattedDate', function() {
           var date = $filter('date')($scope.formattedDate, 'MM/dd/yyyy HH:mm');
           $scope.order.PickupDate = date;
           return date;
       });
    })

    .filter('filterColor', function() {
        return function(text) {
            var obj = JSON.parse(text);
            return obj.color || '  -';
        }
    });
