angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('ConciergeSetting');
    })
    .factory('ConciergeSetting', function(Model, Booking) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('ConciergeSetting');
                }
            },
            /* Instance Methods */
            {
                findBookingsFor: function(customer) {
                    return Booking.findAllFromServer({customerId: customer.id, conciergeSettingId: this.id})
                }
            }
        );
    });
