angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('SpecialInstruction');
    })
    .factory('SpecialInstruction', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('SpecialInstruction');
                }
            },
            /* Instance Methods */
            {

            }
        );
    });