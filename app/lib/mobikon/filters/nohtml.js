angular.module('mk.Filters')
    .filter('noHTML', function () {
        return function(text) {
            return text
                .replace(/&/g, '&amp;')
                .replace(/>/g, '&gt;')
                .replace(/</g, '&lt;');
        }
    });