/**
 * A simple replacement for ng-repeat which does no watching.
 * Good for watching static lists not expected to change
 */
angular.module('mk.Directives')
    .directive("mkFastRepeat", function() {
        return {
            transclude: 'element',
            priority: 1000,
            terminal: true,
            compile: function(element, attr, linker) {
                return function(scope, element, $attr){
                    var expression = $attr.mkFastRepeat,
                        match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)\s*$/),
                        lhs, rhs, valueIdentifier, keyIdentifier;

                    if (!match) {
                        throw Error("Expected mkFastRepeat in form of '_item_ in _collection_' but got '" +
                            expression + "'.");
                    }

                    lhs = match[1];
                    rhs = match[2];

                    match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
                    if (!match) {
                        throw ngRepeatMinErr('iidexp', "'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.",
                            lhs);
                    }
                    valueIdentifier = match[3] || match[1];
                    keyIdentifier = match[2];

                    var unwatch = scope.$watch(rhs, function(collection) {

                        if (!collection) return;
                        unwatch();

                        var frag = document.createDocumentFragment(),
                            index = 0;

                        angular.forEach(collection, function(value, key) {
                            frag.appendChild(createElement(value, key, index++));
                        });

                        element.after(frag);
                    });

                    function createElement(value, key, index) {
                        var childScope = scope.$new();
                        childScope[valueIdentifier] = value;
                        childScope[keyIdentifier] = key;
                        childScope.$index = index;
                        childScope.$first = (index === 0);
                        childScope.$last = false;
                        childScope.$middle = !(childScope.$first || childScope.$last);
                        return linker(childScope, angular.noop)[0];
                    }
                };
            }
        };
});