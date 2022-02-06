'use strict';

/**
 * Provides an interface for notification popups on both web and iOS.
 * todo: i18n
 */
angular.module('mk.Services')
    .factory('mkNotification', function($timeout) {

        return {
            /**
             * Show a popup notification with a few selectable options.
             * More than 2 buttons can be added for iOS.
             *
             * @param options Takes an object, example usage:
             *   mkNotification.confirm({
             *     title: 'Your title',
             *     message: 'Your message',
             *     buttons: ['OK', 'Cancel'],
             *     1: function() { // callback for 'OK' button },
             *     2: function() { // callback for 'Cancel' button }
             *   });
             *
             * note: javascript confirmation dialog box limitations:
             *       1. only two buttons: "OK" or "Cancel"
             *       2. cannot set title
             */
            confirm: function(options) {
                if (navigator.notification) {
                    navigator.notification.confirm(
                        options.message,
                        function(buttonIdx) {
                            $timeout(function() {
                                options[buttonIdx](); // calls appropriate callback based on index
                            });
                        },
                        options.title,
                        options.buttons || ['Confirm', 'Cancel']
                    );
                } else {
                    confirm(options.message) ? options[1]() : options[2]();
                }
            },

            /**
             * Show an alert popup box.
             *
             * @param options Takes an object, example usage:
             *   mkNotification.alert({
             *     title: 'Your title',
             *     message: 'Your message',
             *     buttonName: 'Your button name',
             *     callback: function() { // optional callback for button }
             *   });
             *
             * note: cannot set title for javascript alert dialog box
             */
            alert: function(options) {
                _.defaults(options, {
                    callback: function() {},
                    buttonName: 'Ok'
                });
                if (navigator.notification) {
                    navigator.notification.alert(
                        options.message,
                        options.callback,
                        options.title,
                        options.buttonName
                    );
                } else {
                    alert(options.message);
                    options.callback();
                }
            }
        };
    });