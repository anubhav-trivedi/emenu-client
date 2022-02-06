angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Item');
    })
    .factory('Item', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('Item');
                    Object.defineProperty(this.prototype, 'Image', {
                        get: function() {
                            var match = this.ImagePath && this.ImagePath.match(/menu-images.*$/);
                            return match ? match[0] : this.ImagePath;
                        },
                        configurable: true
                    });
                }
            },
            /* Instance Methods */
            {

            }
        );
    });