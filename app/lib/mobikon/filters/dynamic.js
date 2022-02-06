angular.module('mk.Filters')
    .filter('mkDynamic', function($filter) {
        /**
         * A filter that can call another filter by name of function
         * This is useful for calling a filter contained in a scope variable
         */
        return function(target, filter) {
            if (!filter) return target;

            var actualFilter = angular.isFunction(filter) ?
                    filter :
                    $filter(filter),
                args = _.toArray(arguments);

            args.splice(1, 1); // remove the filter arg
            return actualFilter.apply(this, args);
        }
    });