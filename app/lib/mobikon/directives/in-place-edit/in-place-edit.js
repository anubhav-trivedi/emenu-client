angular.module('mk.Directives')
    .directive('mkInPlaceEdit', function ($timeout, $parse) {

        return {
            restrict: 'E',
            templateUrl: 'lib/mobikon/directives/in-place-edit/in-place-edit.html',
            scope: true,
            link: function(scope, element, attrs) {
                var options = scope.$eval(attrs.options),
                    parsed = $parse(attrs.value),
                    getter = parsed.bind(this, scope),
                    setter = parsed.assign.bind(this, scope),
                    editTypes = _.map(options, function(typeOptions, type) {
                        return {type: type, options: typeOptions};
                    });

                scope.filter = scope.$eval(attrs.filter);

                scope.editTypes = editTypes;
                scope.$watch(attrs.value, function(value) {
                    scope.value = value;
                });

                scope.edit = function(editType) {
                    scope.currentType = editType.type;
                    scope.input = { value: 0 };
                    $timeout(function() {
                       element.find('input').select();
                    });
                };

                scope.inputBlur = function() {
                    // the timeout is to wait for the submit event in case the green tick was clicked
                    $timeout(function() {
                        scope.currentType = null;
                    }, 100);
                };

                scope.submit = function() {
                    applyMap[scope.currentType](getter(), scope.input.value);
                    scope.currentType = null;
                };

                scope.editTypes = editTypes;

                var applyMap = {
                    add: function(oldVal, input) {
                        setter(oldVal + +input);
                    },
                    minus: function(oldVal, input) {
                        setter(oldVal - +input);
                    },
                    edit: function(oldVal, input) {
                        setter(input);
                    }
                }
            }
        }

    });