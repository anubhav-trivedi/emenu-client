angular.module('mk.Filters')
    .filter('newline', function () {
        return function(text) {
            return text.replace(/ \\n /, "\n");
        }
    })

    .filter('newline1', function () {
        return function(text) {
            return text.replace(/\\n/, "\n ");
        }
    });

