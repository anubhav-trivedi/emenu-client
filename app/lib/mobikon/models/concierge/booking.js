angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Booking');
    })
    .factory('Booking', function(Model, $filter) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('Booking');
                }
            },
            /* Instance Methods */
            {
                save: function() {
                    var entities = [this].concat(this.bookingOffers);
                    return this.constructor.mkData.saveChanges(entities);
                },

                getDescription: function() {
                    //todo i18n
                    return this.pAX + " " + (this.pAX == 1 ? 'person' : 'people') + " for " + $filter('mkDate')(moment(this.dateTime));
                }
            }
        );
    });
