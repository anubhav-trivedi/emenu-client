angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('FeedbackSetting');
    })
    .factory('FeedbackSetting', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('FeedbackSetting');
                }
            },
            /* Instance Methods */
            {

            }
        );
    });