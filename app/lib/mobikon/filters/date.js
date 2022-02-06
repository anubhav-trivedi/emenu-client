angular.module('mk.Filters')
    .filter('mkDate', function() {
        return function(dateOrMoment, format) {
            //todo i18n
            var target = moment(dateOrMoment),
                now = moment(),
                dayDiff = moment(target).startOf('day').diff(moment(now).startOf('day'), 'days'),
                hour = target.hours(),
                minute = target.minutes(),
                dayString,
                timeString;

            if (dayDiff == 0) {
                dayString = hour >= 18 ? "Tonight" : "Today";
            } else if (dayDiff == 1) {
                dayString = "Tomorrow"
            } else if (dayDiff == -1) {
                return "Yesterday"
            } else if (dayDiff > 0 && dayDiff < 7) {
                dayString = target.format('dddd'); // Tuesday
            } else {
                dayString = target.format('Do [of] MMM') // 31st of Dec
            }

            if (minute == 0) {
                timeString = target.format("ha");
            } else {
                timeString = target.format("h:ma");
            }

            if (!format) {
                return timeString + " " + dayString;
            } else {
                return format.replace("tt", timeString).replace("dd", dayString);
            }

        }
    });