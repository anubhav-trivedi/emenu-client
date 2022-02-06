angular.module('mk.Directives')
    .directive('mkSideMenu', function(mkNavigation) {

        return {
            link: function(scope, element, attrs) {
                var isFirst = true;

                scope.$watch(attrs.mkSideMenu, function(isEnabled) {
                    var enabled = isEnabled == null || isEnabled;
                    if (enabled && isFirst) {
                        isFirst = false;
                        var snapper = new Snap({
                            element: element[0],
                            disable: 'right'
                        });
                        mkNavigation._setSnapper(snapper);
                    }

                    mkNavigation.sideMenuEnabled(enabled);
                });
            }
        }

    });