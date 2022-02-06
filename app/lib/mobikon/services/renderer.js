angular.module('mk.Services')
    .factory('mkRenderer', function($compile, $rootScope, $templateCache, $q, $http) {

        /**
         * Renders the given angularjs template with the params in a scope
         *
         * e.g.
         *
         * mkRenderer('<div>{{monkey}}</div>', {monkey: 'banana'}).then(function(html) {
         *      console.log(html); // <div>banana</div>
         * });
         *
         * or
         *
         * mkRenderer('views/somefile.html'....
         *
         * @param source address of a html file or a angularjs template
         * @param params the variables to put into the scope
         * @returns a promise which resolves with the rendered html
         */
        return function(source, params) {

            var templatePromise,
                resultDef = $q.defer();

            if (source.match(/\.html$/)) {
                templatePromise = $http.get(source, {cache: $templateCache}).
                    then(function(response) { return response.data; });
            } else {
                templatePromise = $q.when(source); // when creates an already resolved promise
            }

            templatePromise.then(function(template) {

                var scope = $rootScope.$new(),
                    $ele = $("<div></div>").html(template);

                _.extend(scope, params || {});

                var link = $compile($ele);
                link(scope);

                setTimeout(function() {
                    resultDef.resolve($ele.html());
                }, 0);
            });

            return resultDef.promise;
        };
    });