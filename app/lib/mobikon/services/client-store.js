angular.module('mk.Services')
    .factory('mkClientStore', function() {

        var localStorage = window.localStorage;

        return {
            get: function(key) { return localStorage[key]; },
            set: function(key, val) { localStorage[key] = val; },
            clear: function() { localStorage.clear(); }            ,
            remove: function(key) {
                var val = localStorage[key]
                delete localStorage[key];
                return val;
            }
        }

    });