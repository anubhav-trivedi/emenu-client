'use strict';

angular.module('mk.Services')
    .factory('mkEmail', function ($http, $q, mkJobQueue, mkBridge) {

        mkJobQueue.registerWorker({
            name: 'email',
            work: function(emailParams) {
                return mkBridge.callNative({method: 'sendEmail', email: emailParams}).then(function(response) {
                    if (!response.success) {
                        return $q.reject(response.error);
                    }
                });
            }
        });

        return {
            sendEmail: function (options) {
                return mkJobQueue.addJob('email', options, options.jobDescription);
            }
        };
    });