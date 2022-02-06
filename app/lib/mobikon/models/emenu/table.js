angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Table');
    })
    .factory('Table', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('Table');
                }
            },
            /* Instance Methods */
            {

            }
        );
    });