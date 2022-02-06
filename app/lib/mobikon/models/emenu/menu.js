angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Menu');
    })
    .factory('Menu', function(Model, mkModelUtils) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('Menu');
                },

                properties: {
                    custom: mkModelUtils.JSONDataType
                }
            },
            /* Instance Methods */
            {

            }
        );
    });