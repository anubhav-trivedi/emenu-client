angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Address');
    })
    .factory('Address', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('Address');
                }
            },
            /* Instance Methods */
            {

            }
        );
    });