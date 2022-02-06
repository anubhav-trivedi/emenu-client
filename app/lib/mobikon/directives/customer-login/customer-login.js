'use strict';

angular.module('mk.Directives')
    .directive('mkCustomerLogin', function(mkFacebook, mkNotification, mkAuth, mkClientStore, $location, config) {

        return {
            restrict: 'EA',
            scope: {
                redirect: '@',
                allowSkip: '=',
                callback: '='
            },
            templateUrl: 'lib/mobikon/directives/customer-login/customer-login.html',
            controller: function($scope, $state) {

                $scope.providers = config.auth.providers;

                $scope.oauthLogin = function(provider) {
                    startLogin(mkAuth.oauthLogin(provider));
                };

                $scope.mobikonLogin = function() {
                    startLogin(mkAuth.mobikonLogin());
                };

                $scope.mobikonRegister = function() {
                    startLogin(mkAuth.mobikonRegister());
                };

                $scope.skip = function() {
                    redirect();
                    callback('skipped');
                };

                function startLogin(loginPromise) {
                    $scope.loginLoader = function() {
                        $scope.loginState = "Logging In";
                        callback('logging-in');
                        return loginPromise.then(completeLogin, loginFailed);
                    }
                }

                function completeLogin(customer) {
                    callback('logged-in', customer);
                    redirect()
                }

                function loginFailed(reason) {
                    $scope.loginLoader = null;
                    callback('error');
                    if (reason != 'cancel') {
                        mkNotification.alert({
                            message: 'Sorry login has failed. Please try again later.'
                        });
                    }
                }

                function redirect() {
                    var redirect = $scope.redirect;
                    if (redirect) {
                        if (redirect[0] == '/') {
                            $location.path(redirect);
                        } else {
                            $state.go(redirect);
                        }
                    }
                }

                function callback() {
                    if ($scope.callback) {
                        $scope.callback.apply($scope, arguments);
                    }
                }

            }
        }
    });