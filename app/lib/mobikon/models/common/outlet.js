'use strict';

angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Outlet');
    }).factory('Outlet', function(Model, $http, config) {
        return Model(
            {
                init: function() {
                    this.initialize('Outlet');
                }
            },
            {
                distance: function(outlet, accuracy) {
                    var distance = mku.coordinateDistance(
                        (outlet.latitude || outlet.getLat()), (outlet.longitude),
                        this.getLat(), this.getLng()
                    );

                    if (accuracy == 'smart') {
                        if (distance < 1.0) return distance.toFixed(2);
                        if (distance > 10.0) return distance.toFixed(0);
                        else return distance.toFixed(1);
                    } else {
                        return accuracy ? Number(distance.toFixed(accuracy)) : distance;
                    }
                },

                getLat: function() {
                    return this.locality && +this.locality.split(',')[0];
                },

                getLng: function() {
                    return this.locality && +this.locality.split(',')[1];
                },

                getPoint: function() {
                    if (!this.locality) return null;
                    var split = this.locality.split(',');
                    return {latitude: +split[0], longitude: +split[1]}
                },

                getRoute: function() {
                    return "#/properties/" + this.propertyId + "/" + this.id;
                },

                findAvailableTables: function(pax, from, to, minuteInterval) {

                    return $http({
                        url: config.features.bookings.api + '/Outlets/' + this.id + '/AvailableTables',
                        method: 'GET',
                        params: {
                            pax: pax,
                            searchFrom: from.toISOString(),
                            searchTo: to.toISOString(),
                            minuteInterval: minuteInterval
                        }
                    }).then(function(results) {
                        return _.map(results.data, function(result) {
                            return {
                                tableId: result.TableId,
                                times: _.map(result.Times, function(time) {
                                    return moment(time)
                                })
                            }
                        })
                    });
                }
            });
    });
