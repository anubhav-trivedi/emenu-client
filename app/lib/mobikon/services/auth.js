angular.module('mk.Services')
    .factory('mkAuth', function($http, config) {

        return {
            login: function(username, password) {
                return $http.post(config.auth.host + '/login', {
                    username: username,
                    password: password
                }).then(function(result) {
                    return _.pick(result.data, 'userId', 'permissions');
                });
            }
        }


    });