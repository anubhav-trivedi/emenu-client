angular.module('mk.Directives')
    .directive('mkBookingSearch', function(Booking, BookingOffer) {

        return {
            restrict: 'EA',
            replace: false,
            templateUrl: 'lib/mobikon/directives/concierge/booking-search.html',
            scope: {
                outlet: '&mkBookingSearch',
                bookingSelected: '&',
                customer: '&',
                offer: '&'
            },
            controller: function($scope, $filter) {
                var outlet = $scope.outlet(),
                    customer = $scope.customer(),
                    offer = $scope.offer(),
                    conciergeSetting = outlet.conciergeSettings[0],
                    restrictions = createRestrictions($scope);

                $scope.pickerOptions = createPickerOptions(restrictions, $filter('mkDate'));
                $scope.currentSearch = createDefaultSearch(restrictions);

                conciergeSetting.findBookingsFor(customer).then(function(bookings) {
                    $scope.bookings = bookings;
                    checkExistingBookings($scope);
                });

                $scope.makeBooking = function(tableTime) {
                    var booking = Booking.create({
                        customer: customer,
                        conciergeSetting: conciergeSetting,
                        dateTime: tableTime.time.toDate(),
                        tableIds: tableTime.tableId,
                        pAX: $scope.currentSearch.pax,
                        bookingSource: "user app",
                        approxTurnAround: tableTime.time.clone().add('minutes', 60).toDate() //todo: this should be done server side
                    });

                    if (offer) {
                        BookingOffer.create({
                            booking: booking,
                            offer: offer
                        })
                    }

                    $scope.bookingSelected()(booking);
                };

                $scope.$watch('currentSearch', function(search) {
                    var pax = search.pax,
                        day = moment(search.day),
                        time = moment(search.time),
                        searchDate = $scope.searchDate = day.hours(time.hours()).minutes(time.minutes());


                    if (!checkExistingBookings($scope)) return;

                    $scope.searchState = 'searching';
                    $scope.times = null;

                    outlet.findAvailableTables(pax, searchDate.clone().subtract('hours', 1), searchDate.clone().add('hours', 1), 15).then(function(tableTimes) {

                        var timeTables = [],
                            startMinutes = getMinutes(restrictions.time.start),
                            endMinutes = getMinutes(restrictions.time.end);

                        for (var i = 0; i < tableTimes.length; ++i) {
                            var tableId = tableTimes[i].tableId;
                            for (var j = 0; j < tableTimes[i].times.length; ++j) {
                                var time = tableTimes[i].times[j],
                                    minutes = getMinutes(time);

                                if (minutes >= startMinutes && minutes <= endMinutes) {
                                    timeTables.push({time: time, tableId: tableId});
                                }
                            }
                        }

                        timeTables.sort(function(timeTable1, timeTable2) {
                            var timeDiff = timeTable1.time.diff(timeTable2.time),
                                paxDiff = timeTable1.seatingCapacity - timeTable2.seatingCapacity;

                            return timeDiff || paxDiff;
                        });

                        $scope.times = _.uniq(timeTables, true, function(timeTable) {
                            return +timeTable.time;
                        });

                        $scope.searchState = 'done';

                    }, function() {
                        $scope.searchState = 'failed';
                    });
                });
            }
        };

        function createPickerOptions(restrictions, mkDate) {
            var days = [],
                times = [],
                people = [];

            //todo i18n
            for (var day = moment(restrictions.day.start); !day.isAfter(restrictions.day.end); day.add('days', 1)) {
                if (_.indexOf(restrictions.days, day.day()) != -1) {
                    days.push({text: mkDate(day, 'dd'), value: moment(day)});
                }
            }

            for (var time = moment(restrictions.time.start); !time.isAfter(restrictions.time.end); time.add('minutes', 15)) {
                times.push({text: time.format("h:mma"), value: moment(time)});
            }

            for (var i = restrictions.pax.min; i < restrictions.pax.max; ++i) {
                people.push({text: i + (i == 1 ? ' Person' : ' People'), value: i})
            }

            return [
                { name: 'pax', title: 'People', width: 110, data: people },
                { name: 'day', title: 'Day', width: 110, data: days },
                { name: 'time', title: 'Time', width: 80, data: times }
            ];
        }

        function checkExistingBookings($scope) {
            var searchDay = moment($scope.currentSearch.day);
            $scope.existingBooking = _.find($scope.bookings, function(booking) {
                return moment(booking.dateTime).diff(searchDay, 'days') == 0;
            });
            return !$scope.existingBooking;
        }

        function createRestrictions($scope) {
            var startOfDay = moment().startOf('day'),
                endOfDay = moment().endOf('day'),
                offer = $scope.offer(),
                restriction = {
                    days: [0, 1, 2, 3, 4, 5, 6],
                    time: {start: startOfDay, end: endOfDay},
                    day: {start: startOfDay, end: moment(startOfDay).add('month', 1)},
                    pax: {min: 1, max: 10}
                };

            if (offer) {
                if (offer.validDaysOfWeek) {
                    restriction.days = _.map(offer.validDaysOfWeek, function(d) { return d % 7 }); // convert 1 - 7 to 0 - 6
                }
                if (offer.validFromDate) {
                    var from = moment(offer.validFromDate);
                    if (from.isBefore(startOfDay)) from = startOfDay;
                    restriction.day.start = from;
                }
                if (offer.validToDate) {
                    restriction.day.end = moment(offer.validToDate);
                }
                if (offer.validFromTime) {
                    restriction.time.start = moment(startOfDay).add(moment.duration.fromISOString(offer.validFromTime));
                }
                if (offer.validToTime) {
                    restriction.time.end = moment(startOfDay).add(moment.duration.fromISOString(offer.validToTime));
                }
                if (offer.maxGroupSize) {
                    restriction.pax.max = offer.maxGroupSize;
                }
                if (offer.minGroupSize) {
                    restriction.pax.max = offer.minGroupSize;
                }
            }

            return restriction;
        }

        function createDefaultSearch(restrictions) {
            var pax = 2,
                startOfDay = moment().startOf('day'),
                day = startOfDay,
                time = moment(startOfDay).hours(19).minutes(0);

            if (pax < restrictions.pax.min || pax > restrictions.pax.max) {
                pax = restrictions.pax.min;
            }

            if (time.isBefore(restrictions.time.start) || time.isAfter(restrictions.time.end)) {
                time = restrictions.time.start;
            }

            if (day.isBefore(restrictions.day.start) || day.isAfter(restrictions.day.end)) {
                day = restrictions.day.start;
            }

            return {
                pax: pax, time: time, day: day
            };
        }

        function getMinutes(m) {
            return m.hours() * 60 + m.minutes();
        }

    });