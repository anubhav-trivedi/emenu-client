angular.module('mk.Models')
    .config(function(mkDataProvider) {
        mkDataProvider.Model('Offer');
    })
    .factory('Offer', function(Model) {
        return Model(
            /* Static Methods */
            {
                init: function() {
                    this.initialize('Offer');
                }
            },
            /* Instance Methods */
            {
                isAvailable: function(when) {
                    when = when || moment();
                    return this.isActive &&
                        when.isBefore(moment(this.validToDate).endOf('day')) &&
                        when.isAfter(moment(this.validFromDate).startOf('day'));
                },

                isValidFor: function(booking) {
                    var dateTime = moment(booking.dateTime);
                    if (!this.isAvailable(dateTime)) return false;

                    var timeMs = dateTime.diff(dateTime.startOf('day')),
                        fromMs = moment.duration.fromISOString(this.validFromTime).asMilliseconds(),
                        toMs = moment.duration.fromISOString(this.validToTime).asMilliseconds();

                    if (timeMs < fromMs || timeMs > toMs) return false;

                    if (this.maxGroupSize > booking.pax) return false;

                    var days = this.getDays();
                    if (days.length && _.find(days, dateTime.format('dddd')) == -1) return false;

                    return true;
                },

                getRequirementText: function() {
                    //todo i18n
                    var pax = this.maxGroupSize,
                        days = this.getDays(),
                        msg = ['Valid'];

                    if (pax == 1) {
                        msg.push('for 1 person');
                    } else if (pax > 1) {
                        msg.push('for ' + pax + ' people');
                    }

                    if (days.length > 0 && days.length != 7) {
                        msg.push('on');
                        msg.push(days.join(', '));
                    }

                    if (this.validFromTime && this.validToTime) {
                        msg.push('between');
                        msg.push(moment().startOf('day').add(moment.duration.fromISOString(this.validFromTime)).format('h:mma'));
                        msg.push('and');
                        msg.push(moment().startOf('day').add(moment.duration.fromISOString(this.validToTime)).format('h:mma'));
                    }

                    if (this.validFromDate) {
                        msg.push('until');
                        msg.push(moment(this.validFromDate).format('[the] Do [of] MMMM'));
                    }

                    return msg.join(' ') + '.'
                },

                getDays: function() {
                  var nums = this.validWeekDays ? this.validWeekDays.split(',').sort() : [];
                  return _.map(nums, function(day) {
                      return moment().day(day % 7).format('dddd');
                  });
                }
            }
        );
    });