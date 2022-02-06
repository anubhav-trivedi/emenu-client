angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('LoyaltyMembership');
    })
    .factory('LoyaltyMembership', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('LoyaltyMembership');
                }
            },
            /* Instance Methods */
            {
                addPoints: function(points) {
                    this.totalPoints += points;
                    this.currentPoints += points;
                },

                redeem: function() {
                    if (this.currentPoints >= this.loyaltyProgram.requiredPoints) {
                        this.currentPoints -= this.loyaltyProgram.requiredPoints;
                        return true;
                    } else {
                        return false;
                    }
                },

                getRequiredPoints: function() {
                    return Math.max(0, this.loyaltyProgram.requiredPoints - this.currentPoints);
                },

                getRewardAmount: function() {
                    return Math.floor(this.currentPoints / this.loyaltyProgram.requiredPoints);
                }
            }
        );
    });