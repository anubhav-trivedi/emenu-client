angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('BookingOffer');
    })
    .factory('BookingOffer', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('BookingOffer');
                }
            },
            /* Instance Methods */
            {

            }
        );
    });
