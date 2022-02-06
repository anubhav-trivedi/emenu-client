angular.module('mk.Widgets', ['mk.Services', 'mk.Directives', 'mk.Filters']);

(function(window) {
    var mk = window.mk = window.mk || {};
    mk.widget = function(name, optionsFn) {
        angular.module('mk.Widgets')
            .directive(directiveName(name), function($injector, config, $http, $timeout) {
                var options = $injector.invoke(optionsFn),
                    dashName = toApi(name);
                _.defaults(options, {
                    templateUrl: 'lib/mobikon/directives/widgets/' + dashName + '/' + dashName + '.html',
                    api: dashName
                });
                return {
                    restrict: 'E',
                    link: options.link,
                    scope: true,
                    controller: function($scope, $element) {
                        $scope._wdgOptions = options;
                        $scope.$watchCollection('mk.session.entityIds', function(entityIds) {
                            if (entityIds) {
                                $scope.loader = function() {
                                    return $http({method: 'GET', url: config.widgets.api + options.api, params: {'entity-id': entityIds}}).then(function(result) {
                                        var data = $scope.data = options.process ?
                                            options.process(result.data) :
                                            result.data;
                                        $timeout(function() {
                                            if (options.controller) options.controller($scope, $element, data);
                                        })
                                    });
                                }
                            }
                        });
                    },
                    templateUrl: 'lib/mobikon/directives/widgets/widget.html'
                }
            })
    };

    function directiveName(name) {
        return 'mkWdg' + name.substr(0,1).toUpperCase() + name.substr(1);
    }

    function toApi(id) {
        return id.replace(/[A-Z]/g, function(a) {
            return '-' + a.toLowerCase()
        });
    }
})(window);

