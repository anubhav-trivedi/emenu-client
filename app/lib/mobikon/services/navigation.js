angular.module('mk.Services')
    .factory('mkNavigation', function($timeout, $window, $location, $rootScope, $state, $rootElement) {

        var self = {
            /**
             * Use this to navigate backwards
             *
             * Resolves the back state in the order of 'to' parameter, 'back' state data, or browser history
             *
             * @param to the state to go back to, can be relative, e.g. 'order.server'
             * @param stateAttrs the state attributes, e.g. {serverId: 123}
             */
            goBack: function(to, stateAttrs) {
                self.goingBack = true;
                $timeout(function() {
                    self.goingBack = false;
                }, 10);

                var data = $state.$current.data,
                    back = to || data && data.back;

                if (back && !back.match(/^#/)) {
                    back = $state.href(back, stateAttrs || {}, {inherit: true, relative: $state.$current});
                }

                if (back) {
                    $location.url(back.match(/^#(.*)/)[1]);
                } else {
                    $window.history.back();
                }
            },

            getTransition: function() {

                //todo this is a hack, timeout needs to match time in transition.scss
                $rootElement.addClass('mk-in-transition');
                $timeout(function() {
                    $rootElement.removeClass('mk-in-transition');
                }, 400);

                if (self.goingBack) {
                    return "slide-back";
                } else {
                    return "slide-forward";
                }

            },

            _setSnapper: function(snapper) {
                this.snapper = snapper;
            },

            toggleSideMenu: function() {
                var snapper = this.snapper;

                if( snapper.state().state=="left" ){
                    snapper.close();
                    $rootScope.sideMenuOpen = false;
                } else {
                    snapper.open('left');
                    $rootScope.sideMenuOpen = true;
                }

            },

            /**
             * Use this to enable/disable a side menu that has been initialized.
             * @param enabled True to enable, false otherwise.
             */
            sideMenuEnabled: function(enabled) {
                if (this.snapper) {
                    if (enabled) this.snapper.enable();
                    else this.snapper.disable();
                }
            }
        };

        return self;
    });