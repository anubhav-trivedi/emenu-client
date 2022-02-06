angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Server');
    })
    .factory('Server', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('Server');
                    Object.defineProperty(this.prototype, 'Image', {
                        get: function() {
                            var match = this.ImagePath && this.ImagePath.match(/menu-images.*$/);
                            return match ? match[0] : this.ImagePath;
                        }
                    })
                }
            },
            /* Instance Methods */
            {

            }
        );
    });