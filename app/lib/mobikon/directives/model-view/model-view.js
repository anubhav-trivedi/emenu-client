angular.module('mk.Directives')
    .directive('mkModelView', function($stateParams, mkData, mkModelUtils) {
        return {
            templateUrl: 'lib/mobikon/directives/model-view/model-view.html',
            scope: {
                _model: '&mkModelView',
                options: '='
            },
            controller: function($scope) {
                var model = $scope.model = $scope._model(),
                    options = $scope.options,
                    Model = model.constructor,
                    modelId = model.id;

                $scope.$watch('model', function(model) {
                    $scope.data = mkModelUtils.parseModels(options, [model])[0];
                });

                $scope.$watch('options', function(options) {
                    if (!options || !options.associations) {
                        $scope.grids = [];
                    } else {
                        $scope.grids = _.map(options.associations, function(association) {
                            var navigationProperty = Model.entityType.getNavigationProperty(association.property),
                                modelType = navigationProperty && navigationProperty.entityType.shortName;
                            return {
                                displayName: association.displayName,
                                options: _.extend({}, association, {
                                    model: modelType,
                                    filters: _.union(makeFilters(navigationProperty), association.filters)
                                })
                            }
                        });
                    }
                });

                $scope.$watch('model.entityAspect.entityState', function(state) {
                    $scope.modified = state != breeze.EntityState.Unchanged;
                });

                $scope.save = function() {
                    $scope.isSaving = true;
                    $scope.data.save().then(function() {
                        $scope.isSaving = false;
                    });
                };

                $scope.$on('$destroy', function() {
                    if (!$scope.isSaving) {
                        $scope.model.entityAspect.rejectChanges();
                    }
                });

                function makeFilters(navigationProperty) {
                    var filter = {};
                    filter[navigationProperty && navigationProperty.inverse.foreignKeyNames[0]] = modelId;
                    return [filter];
                }
            }
        };
    });