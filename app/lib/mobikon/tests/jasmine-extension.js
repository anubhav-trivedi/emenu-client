(function() {
    var orgDef = $.Deferred;
    $.Deferred = function() {
        var def = orgDef.apply(this, arguments);
        def.to$q = function() {return this;}
        var orgPromise = def.promise;
        def.promise = function() {
            return _.extend(orgPromise.apply(this, arguments), {
                to$q: function() { return this; }
            });
        };
        return def;
    };

    jasmine.Spy.prototype.andResolve = function() {
        var args = arguments;
        this.plan = function() {
            var deferred = $.Deferred();
            deferred.resolve.apply(deferred, args);
            return deferred.promise();
        };
        return this;
    };

    jasmine.Spy.prototype.andReject = function() {
        var args = arguments;
        this.plan = function() {
            var deferred = $.Deferred();
            deferred.reject.apply(deferred, args);
            return deferred.promise();
        };
        return this;
    };

    jasmine.Spy.prototype.andReturnThis = function() {
        this.plan = function() {
            return this;
        }
    };

    jasmine.Spy.prototype.andChain = jasmine.Spy.prototype.andReturnThis;
})();

