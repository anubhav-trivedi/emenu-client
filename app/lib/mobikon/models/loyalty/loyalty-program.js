angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('LoyaltyProgram');
    })
    .factory('LoyaltyProgram', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('LoyaltyProgram');
                }
            },
            /* Instance Methods */
            {

            }
        );
    });