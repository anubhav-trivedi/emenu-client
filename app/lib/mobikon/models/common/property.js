'use strict';

angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Property');
    }).factory('Property', function(Model) {
        return Model(
        {
            init: function() {
                this.initialize('Property', 'Properties');
            }
        },
        {
            getDistance: function(latLng, accuracy) {
                return _.min(this.outlets, distance).distance(latLng, accuracy);

                function distance(outlet) {
                    return outlet.distance(latLng);
                }
            },

            getAsset: function(path) {
                return "assets/properties/" + this.key + "/" + path;
            },

            getRegisterForm: function() {
                return JSON.parse(this.register_form)
            },

            getPhotos: function() {
                return JSON.parse(this.photos);
            },

            getRoute: function() {
                return "#/properties/" + this.id;
            }
        });
    });
