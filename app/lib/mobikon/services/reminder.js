'use strict';

/**
 * Provides an interface for banner popdowns from the top of the screen for iOS.
 * todo: cancel notifications when clicked
 */
angular.module('mk.Services')
    .factory('mkReminder', function($window, $timeout) {

        return {
            /**
             * Sets a reminder at a given date/time.
             *
             * @param options Takes an object, example usage:
             *   mkReminder.setReminder({
             *     date: <the date/time as a Javascript Date object>,
             *     message: 'Your alert/reminder message',
             *     callback: function() { // optional callback for when the alert/reminder is clicked }
             *   });
             */
            setReminder: function(options) {
                _.defaults(options, {
                    callback: function() {}
                });
                var localNotifier = $window.localNotifier;
                if (localNotifier) {
                    localNotifier.addNotification({
                        fireDate: options.date,
                        alertBody: options.message,
                        foreground: function() {
                            // not sure what to do here
                        },
                        background: function() {
                            $timeout(function() {
                                options.callback();
                            });
                        }
                    });
                }
            }
        };
    });