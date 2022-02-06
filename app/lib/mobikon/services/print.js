'use strict';

angular.module('mk.Services')
    .factory('mkPrint', function (mkBridge) {
        return {
            printHtml: function (html) {
                return mkBridge.callNative({method: 'printHtml', html: html});
            }
        };
    });