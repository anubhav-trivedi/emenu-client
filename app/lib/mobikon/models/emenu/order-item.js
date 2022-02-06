angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('OrderItem');
    })
    .factory('OrderItem', function(Model, mkModelUtils) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('OrderItem');
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