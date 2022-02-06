/**
 * A simplified and optimised version of ui-sref.
 * Does no work until clicked.
 * Does not support ui-sref-active
 * Does not set href or action elements
 * Does not propogate the event
 */
angular.module('mk.Directives')
    .directive('mkSref', function ($state, $timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind("click", function(e) {
                    var ref = parseStateRef(attrs.mkSref),
                        params = scope.$eval(ref.paramExpr),
                        base = stateContext(element) || $state.$current,
                        button = e.which || e.button;

                    if ((button === 0 || button == 1) && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
                        $timeout(function() {
                            scope.$apply(function() {
                                $state.go(ref.state, params, { relative: base });
                            });
                        });
                        e.preventDefault();
                        // stop the propogation to skip document event listeners (many set up by bootstrap taking 10ms on ipad)
                        e.stopPropagation();
                    }
                });
            }
        };

        function parseStateRef(ref) {
            var parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
            if (!parsed || parsed.length !== 4) throw new Error("Invalid state ref '" + ref + "'");
            return { state: parsed[1], paramExpr: parsed[3] || null };
        }

        function stateContext(el) {
            var stateData = el.parent().inheritedData('$uiView');

            if (stateData && stateData.state && stateData.state.name) {
                return stateData.state;
            }
        }
    }
)