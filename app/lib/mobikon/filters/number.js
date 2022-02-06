angular.module('mk.Filters')
    .filter('mk.Number', function() {
        return function(number, option) {
            if (!option) {
                return number;
            } else if (typeof option == "number") {
                return number.toFixed(option);
            } else if (option == "round") {
                if (number > 10) {
                    return Math.round(number);
                } else {
                    return number.toFixed(1);
                }
            }
            return number;
        }
    });