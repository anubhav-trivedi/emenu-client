'use strict';

angular.module('mk.Directives')
    .directive('mkSelectOnFocus', function() {

        return function(scope, element, attrs) {
            element.bind('click', function() {
                this.select();
            });
        };
    });