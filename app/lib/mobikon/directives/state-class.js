angular.module('mk.Directives')
    .directive('mkStateClass', function() {
        return {
            restrict: 'A',
            priority: 10,
            link: function(scope, element) {
                var $uiView = element.parent().data('$uiView');
                element.addClass('mk-' + $uiView.state.name.replace(/\./g, '-'));
            }
        };
    });