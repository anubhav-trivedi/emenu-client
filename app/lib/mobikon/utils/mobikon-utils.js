'use strict';

/**
 * A global namespace to put simple utility methods
 */
var mku = {

    /**
     * Get an existing value from an object, or set it before returning
     * @param object the object to get or set the value
     * @param key the key of the required value
     * @param valueOrFn either a value or a function that creates the value
     * @returns {*} either the existing value, or the newly set value
     */
    getOrSet: function(object, key, valueOrFn) {
        return object[key] = object[key] || (_.isFunction(valueOrFn) ? valueOrFn() : valueOrFn);
    },


    /**
     * Calculates the distance between two latitude longitude coordinates in KM
     * Haversine formula
     *
     * @param lat1
     * @param lon1
     * @param lat2
     * @param lon2
     * @returns {number} distnace in KM
     */
    coordinateDistance: function(lat1, lon1, lat2, lon2) {
        // from http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                        Math.sin(dLon/2) * Math.sin(dLon/2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d;

        function deg2rad(deg) {
            return deg * (Math.PI/180)
        }
    },

    trim: function(str) {
        return str.trim()
    },

    /**
     * A utility method useful for creating a callback that takes a function and calls it with some arguments
     *
     * @returns {Function} a function that will be called with the arguments passed to callWith
     */
    callWith: function() {
        var args = arguments;
        return function(fn) {
            return fn.apply(this, args);
        }
    },

    /**
     * Converts the value into an a array, useful normalising option arguments e.g.
     * null -> [],
     * 'banana' -> ['banana']
     * ['monkey'] -> ['monkey']
     * array likes e.g. arguments, are not converted to real arrays
     * does not make a copy
     *
     * @param value the value to normalise to an array
     * @returns {*} an array or array like object
     */
    normaliseArray: function(value) {
        if (value == null) return [];
        else if (_.isArray(value)) return value;
        else if (_.isString(value)) return [value];
        else if (typeof value.length == 'number') return value;
        else return [value];
    },

    /**
     * Wraps a function that returns a promise, such that everytime the function is called
     * the first promise is returned
     *
     * @param loader
     * @param $q the $q service
     * @param options.allowRetry if true the promise will be recreated if called after a failure
     * @returns {Function}
     */
    memorizePromise: function(loader, $q, options) {
        options = _.defaults(options || {}, {allowRetry: true});
        var promise;
        return function() {
            if (!promise) {
                promise = loader().then(null, function(reason) {
                    if (options.allowRetry) promise = null;
                    return $q.reject(reason);
                });
            }
            return promise;
        }
    },

    /**
     * returns an array that has no strings which are prefixes of other strings in the array
     * e.g. ['foo', 'baa', 'foobaa'] becomes ['baa', 'foobaa'] i.e. foo is removed as it is a prefix of foobaa
     *
     * currently uses an O(n^2) algorithm
     *
     * @param from an array of strings
     * @returns {Array} array of strings with no prefixes of each other
     */
    removePrefixes: function(from) {
        var clean = [];
        for (var i = 0; i < from.length; ++i) {
            var check = from[i];
            for (var j = 0; j < from.length; ++j) {
                var other = from[j];
                if (i != j && other.match('^' + check)) {
                    if (check != other || i < j) break;
                }
            }
            if (j == from.length) clean.push(check)
        }
        return clean;
    }

};