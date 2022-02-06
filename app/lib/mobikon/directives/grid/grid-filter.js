'use strict';

angular.module('mk.Directives.Grid')
    .directive('mkGridFilter', function($timeout) {

        var ids = 0;

        return {
            restrict: 'A',
            scope: {
                col: '=mkGridFilter',
                filters: '='
            },
            template: '<i class="fa fa-filter"></i>',
            link: function(scope, element) {
                var id = 'mk-grid-filter-'+ids++,
                    filterOn = scope.col.colDef.value,
                    filters = scope.filters,
                    val = null,
                    filter = null;

                element.popover({
                    html: true,
                    animate: false,
                    content: '<form id="' + id + '"><input class="form-control" type="text"></form>',
                    placement: 'bottom',
                    container: 'body'
                }).on('shown.bs.popover', function() {
                    $('#' + id + ' > input').select().val(val);
                    $(document).on('keyup.' + id, function(ev) {
                        if (ev.keyCode == 27) close();
                    })
                }).on('hidden.bs.popover', function() {
                    $(document).off('.' + id);
                });

                $(document).on('submit', function(ev) {
                    ev.preventDefault();
                    var $input = $('#' + id + ' input');
                    $timeout(function() {
                        val = $.trim($input.val());

                        removeFilter();
                        if (val) addFilter(val);
                    });
                    close();
                });

                function close() {
                    element.popover('hide');
                }

                function removeFilter() {
                    for (var i = 0; i < filters.length; ++i) {
                        if (filters[i] == filter) {
                            filters.splice(i, 1);
                            break;
                        }
                    }
                }

                function addFilter(val) {
                    var newFilter = {};
                    newFilter[filterOn] = val;
                    filters.push(newFilter);
                    filter = newFilter;
                }
            }
        }

    });