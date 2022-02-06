'use strict';

angular.module('mk.Directives.Grid', ['ngGrid', 'mk.Models', 'mk.Services', 'mk.Filters'])
    .directive('mkGrid', function(mkData, mkModelUtils, mkModal, $q, $rootScope, $state, $templateFactory) {

        return {
            restrict: 'A',
            scope: {
                options: '=mkGrid'
            },
            template: "<div ng-if='gridOptions' ng-class='classes' ng-grid='gridOptions'></div>",
            link: function(scope, element) {

                scope.$watch('options', function(options) {
                    element.off('click.mkGrid');
                    if (!options) return;

                    if (scope.options.modelView) {
                        var modelViewOptions = scope.options.modelView.options;
                        if (scope.options.modelView.inheritFields) {
                            modelViewOptions.fields = _.union(scope.options.fields, modelViewOptions.fields);
                        }
                    }

                    element.on('click.mkGrid', '.ngRow', function() {
                        var $this = $(this);
                        var model = $this.data('$scope').row.entity.model;
                        mkModal.showModal('<div mk-model-view="model" options="options"></div>', {
                            title: scope.options.modelView.title,
                            scope: {
                                model: model,
                                options: modelViewOptions
                            }
                        });
                    });
                });
            },
            controller: function($scope) {

                $scope.$watch('options', function(options) {
                    if (!options) return;

                    prepareOptions(options);

                    $scope.filters = options.filters || [];

                    var minHeight;

                    if (options.paging) {
                        $scope.pagingOptions = _.defaults(_.pick(options.paging, 'pageSizes', 'pageSize', 'currentPage'), {
                            pageSizes: [options.paging.pageSize],
                            currentPage: 1
                        });
                        minHeight = options.paging.pageSize * 45;
                    }

                    $scope.classes = {
                        'row-clickable': $scope.options.modelView
                    };

                    $scope.gridOptions = {
                        data: 'data',
                        totalServerItems:'totalServerItems',
                        columnDefs: makeColumns(options),
                        enablePaging: !!$scope.pagingOptions,
                        showFooter: true,
                        pagingOptions: $scope.pagingOptions,
                        plugins: [new ngGridFlexibleHeightPlugin({minHeight: options.minHeight || minHeight})],
                        enableRowSelection: false
                    };
                });

                $scope.$watchCollection('filters', function(filters) {
                    if (!filters) return;
                    $scope.query = filters && mkModelUtils.makeQuery($scope.options);
                });

                $scope.$watch('pagingOptions', getData, true);
                $scope.$watch('query', getData);

                function getData() {
                    var pageOptions = $scope.pagingOptions,
                        options = $scope.options,
                        query = $scope.query;

                    if (!query || !options) return;

                    performQuery(options, query, pageOptions && pageOptions.pageSize, pageOptions && pageOptions.currentPage).then(function(data) {
                        $scope.data = data.page;
                        $scope.totalServerItems = data.total;
                    });
                }

            }
        };

        function performQuery(options, query, pageSize, page) {
            var pageQuery = !pageSize ? query : query
                .take(pageSize)
                .skip((page - 1) * pageSize);

            return mkData.manager.executeQuery(pageQuery).to$q().then(function(response) {
                return { page: mkModelUtils.parseModels(options, response.results), total: response.inlineCount };
            }, function(error) {
                console.log(error);
                return $q.reject(error);
            });
        }

        function prepareOptions(options) {
            _.forEach(options.fields, function(field) {
                if (!field.field) {
                    field.id = field.id || field.value.replace(/[\.\(\)]/g, '_');
                    field.field = field.id + '.value';
                    field.cellFilter = field.filter;
                }
            });
        }

        function makeColumns(options) {
            return _.map(options.fields, function(field) {
                return _.extend({
                    headerCellTemplate: field.customFilters && '<div ng-include="\'lib/mobikon/directives/grid/header-template.html\'"></div>'
                }, field);
            });
        }
    });
