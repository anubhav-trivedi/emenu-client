angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Question');
    })
    .factory('Question', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('Question');
                }
            },
            /* Instance Methods */
            {

            }
        );
    });