angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('FeedbackCategory');
    })
    .factory('FeedbackCategory', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('FeedbackCategory', 'FeedbackCategories');
                }
            },
            /* Instance Methods */
            {

            }
        );
    });