angular.module('mk.Services')
    .factory('mkUrlParams', function($window) {

        var query = ($window.location.search || '').replace(/^\?/, ''),
            parts = query.split("&"),
            result = {};

        for (var i = 0; i < parts.length; ++i) {
            var keyAndValue = parts[i].split('=');

            result[keyAndValue[0]] = keyAndValue[1] ? decodeURIComponent(keyAndValue[1]) : true;
        }

        return result;
    });