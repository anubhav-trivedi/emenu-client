angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('MenuType');
    })
    .factory('MenuType', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('MenuType');
                }
            },
            /* Instance Methods */
            {

            }
        );
    });