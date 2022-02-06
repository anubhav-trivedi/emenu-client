'use strict';

angular.module('yoMenuApp')
  .controller('MainCtrl', function ($scope, Menu) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    Menu.findOneFromCache("C52C8071-6EA7-4D6B-A214-A25E90D1FC81").then(function(menu) {
        $scope.menu = menu;
    }, function(error) {
        console.log(error);
    });
  });
