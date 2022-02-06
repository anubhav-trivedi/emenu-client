'use strict';

angular.module('mk.Services')
    .factory('mkDays', function() {

        // http://www.mom.gov.sg/employment-practices/leave-and-holidays/Pages/public-holidays-2014.aspx
        var singaporeHolidayDates = [
            "Jan 01, 2014", // New Year's Day
            "Jan 31, 2014", // Chinese New Year 1
            "Feb 01, 2014", // Chinese New Year 2
            "Apr 18, 2014", // Good Friday
            "May 01, 2014", // Labour Day
            "May 13, 2014", // Vesak Day
            "Jul 28, 2014", // Hari Raya Puasa
            "Aug 09, 2014", // National Day
            "Oct 06, 2014", // Hari Raya Haji (carry over from Sunday)
            "Oct 23, 2014", // Deepavali (subject to change)
            "Dec 25, 2014"  // Christmas Day
        ];

        return {
            // takes a date moment
            isWeekend: function(date) {
                return date.day() == 6 || date.day() == 0; // Saturday or Sunday
            },

            // takes a date moment
            isHoliday: function(date) {
                return _.find(singaporeHolidayDates, function(holiday) {
                    return date.dayOfYear() == moment(holiday, "MMM DD, YYYY").dayOfYear();
                }) != undefined;
            }
        };
    });