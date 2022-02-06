angular.module('mk.Directives')
    .directive('mkDateModel', function($timeout) {

        var ids = 0;

        return {
            restrict: 'A',
            scope: {
                value: '=mkDateModel'
            },
            link: function(scope, element) {
                var id = ids++,
                    original = scope.value,
                    $ele = $(element); // older versions of AJS dont auto wrap

                $ele.on('change.mkDateModel'+id, function() {
                    $timeout(function() {
                        var value = $ele.val();
                        scope.value = value ? moment(value).toDate() : original;
                        setEle();
                    });
                });

                scope.$watch('value', setEle);

                scope.$on('$destroy', function() {
                    $ele.off('change.mkDateModel'+id)
                });

                function setEle() {
                    $ele.val(scope.value && moment(scope.value).format('YYYY-MM-DD'));
                }
            }
        }

    });