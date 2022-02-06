'use strict';

angular.module('yoMenuApp', [
        'ui.router',
        'yoMenu.Services',
        'yoMenu.Directives',
        'ngTemplates',
        'mk.Config',
        'mk.Models',
        'mk.Utils',
        'mk.Directives',
        'mk.Directives.Grid',
        'mk.Filters',
        'breeze.directives',
        'ngGrid'
    ])
    .config(function ($stateProvider, $urlRouterProvider) {
        // Default path
        $urlRouterProvider.otherwise('/servers');
        // Different states of the app
        $stateProvider
            .state('servers', {
                url: '/servers',
                templateUrl: 'views/servers/servers.html',
                controller: 'ServersCtrl'
            })
            .state('password', {
                url: '/password/{serverId}',
                templateUrl: 'views/password/password.html',
                controller: 'PasswordCtrl'
            })
            .state('server', {
                url: '/server/{serverId}',
                templateUrl: 'views/server/server.html',
                controller: 'ServerCtrl',
                data: { back: 'servers' }
            })
            .state('order', {
                abstract: true, // This doesn't exist as a page
                url: '/order/{orderId}',
                templateUrl: 'views/order/order.html',
                controller: 'OrderCtrl'
            })
                .state('order.customerDetails', {
                    url: '/customer_details',
                    templateUrl: 'views/order/customer_details/customer_details.html',
                    controller: 'CustomerDetailsCtrl',
                    data: { back: 'server' }
                })
                .state('order.item', {
                    url: '/item/{itemId}',
                    templateUrl: 'views/order/item/item.html',
                    controller: 'ItemCtrl',
                    data: { }
                })
                .state('order.menu', {
                    url: '/menu',
                    templateUrl: 'views/order/menu/menu.html',
                    controller: 'MenuCtrl',
                    data: { back: 'order.customerDetails' }
                })
                    .state('order.menu.category', {
                        url: '/categories/{categoryId}',
                        templateUrl: 'views/order/menu/category/category.html',
                        controller: 'CategoryCtrl'
                    })
                        .state('order.menu.category.sub_category', {
                            url: '/sub_categories/{subCategoryId}',
                            templateUrl: 'views/order/menu/category/sub_category/sub_category.html',
                            controller: 'SubCategoryCtrl'
                        })
                .state('order.summary', {
                    url: '/summary',
                    templateUrl: 'views/order/summary/summary.html',
                    controller: 'SummaryCtrl',
                    data: { back: 'order.menu' }
                })
                .state('order.customize', {
                    url: '/customize',
                    templateUrl: 'views/order/customize/customize.html',
                    controller: 'CustomizeCtrl',
                    data: { back: 'order.summary' }
                })
                .state('order.salesOrder', {
                    url: '/sales_order',
                    templateUrl: 'views/order/sales_order/sales_order.html',
                    controller: 'SalesOrderCtrl',
                    data: { back: 'order.summary' }
                })
                .state('order.confirmOrder', {
                url: '/confirm_order',
                templateUrl: 'views/order/confirm_order/confirm_order.html',
                controller: 'ConfirmOrderCtrl',
                data: { back: 'order.salesOrder' }
                })
                .state('order.quoteOrder', {
                    url: '/quote_order',
                    templateUrl: 'views/order/quote_order/quote_order.html',
                    controller: 'QuoteOrderCtrl',
                    data: { back: 'order.summary' }
                })

            .state('email', {
                url: '/email',
                templateUrl: 'views/emails/confirmation.html'
            })
    }).run(function(mkData, $rootScope, Customer, Item, Menu, MenuType, Order, OrderItem, Server, SpecialInstruction, Table) {
        //todo: need to handle waiting for mkData to finish loading
        mkData.init(_.tail(arguments, 2)).then(function() {
            $rootScope.dataLoaded = true;
        })
    })
    .run(function(mkBridge) {
        FastClick.attach(document.body);
        mkBridge.init();
    })
    .run(function($rootScope, mkNavigation, mkBridge, mkOnlineStatus) {
        $rootScope.mk = {
            nav: mkNavigation,
            online: mkOnlineStatus.init()
        };

        $rootScope.openSettings = function() {
            mkBridge.callNative("openSettings");
        }
    });

// This module is used to load the html caches in dist build
angular.module('ngTemplates', []).config(function($provide) {
    /**
     * wrap ui-router template factory so that the contents of the ui-view is wrapped
     * by an extra element <div class='ui-view-holder'> </div>
     * This is currently used in animations
     */
    $provide.decorator('$templateFactory', ['$delegate', function($delegate) {
        var orgFromConfig = $delegate.fromConfig;
        $delegate.fromConfig = function() {
            return orgFromConfig.apply(this, arguments).then(function(response) {
                return "<span class='ui-view-holder' mk-state-class>\n" +
                    "    <span class='contents'>" + response + "</span>\n" +
                    "</span>";
            });
        };
        return $delegate;
    }]);
});
