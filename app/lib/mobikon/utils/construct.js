'use strict';

angular.module('mk.Utils', []).factory("Construct", function() {
    // ## construct.js
    // `Construct`
    // _This is a modified version of https://github.com/bitovi/canjs/blob/master/construct/construct.js
    // which is in turn a modified version of
    // [John Resig's class](http://ejohn.org/blog/simple-javascript-inheritance/).
    // It provides class level inheritance and callbacks._

    // A private flag used to initialize a new class instance without
    // initializing it's bindings.
    var initializing = 0;


    var Construct = function() {
        if (arguments.length) {
            return Construct.extend.apply(Construct, arguments);
        }
    };


    _.extend(Construct, {

        newInstance: function() {
            // Get a raw instance object (`init` is not called).
            var inst = this.instance(),
                args;

            // Call `setup` if there is a `setup`
            if (inst.setup) {
                args = inst.setup.apply(inst, arguments);
            }

            // Call `init` if there is an `init`
            // If `setup` returned `args`, use those as the arguments
            if (inst.init) {
                inst.init.apply(inst, args || arguments);
            }

            return inst;
        },
        // Overwrites an object with methods. Used in the `super` plugin.
        // `newProps` - New properties to add.
        // `oldProps` - Where the old properties might be (used with `super`).
        // `addTo` - What we are adding to.
        _inherit: function(newProps, oldProps, addTo) {
            _.extend(addTo || newProps, newProps || {})
        },
        // used for overwriting a single property.
        // this should be used for patching other objects
        // the super plugin overwrites this
        _overwrite: function(what, oldProps, propName, val) {
            what[propName] = val;
        },
        // Set `defaults` as the merger of the parent `defaults` and this
        // object's `defaults`. If you overwrite this method, make sure to
        // include option merging logic.

        setup: function(base) {
            this.defaults = _.extend(true, {}, base.defaults, this.defaults);
        },
        // Create's a new `class` instance without initializing by setting the
        // `initializing` flag.
        instance: function() {

            // Prevents running `init`.
            initializing = 1;

            var inst = new this();

            // Allow running `init`.
            initializing = 0;

            return inst;
        },
        // Extends classes.

        extend: function(klass, proto) {
            if (!proto) {
                proto = klass;
                klass = null;
            }
            proto = proto || {};

            var _super_class = this,
                _super = this.prototype,
                name, prototype;

            // Instantiate a base class (but only create the instance,
            // don't run the init constructor).
            prototype = this.instance();

            // Copy the properties over onto the new prototype.
            Construct._inherit(proto, _super, prototype);

            // The dummy class constructor.

            function Constructor() {
                // All construction is actually done in the init method.
                if (!initializing) {
                    return (!this || this.constructor !== Constructor) && arguments.length ?
                        // We are being called without `new` or we are extending.
                        Constructor.extend.apply(Constructor, arguments) :
                        // We are being called with `new`.
                        this.constructor.newInstance.apply(this.constructor, arguments);
                }
            }

            // Copy old stuff onto class (can probably be merged w/ inherit)
            for (name in _super_class) {
                if (_super_class.hasOwnProperty(name)) {
                    Constructor[name] = _super_class[name];
                }
            }

            // Copy new static properties on class.
            Construct._inherit(klass, _super_class, Constructor);

            // Set things that shouldn't be overwritten.
            _.extend(Constructor, {
                constructor: Constructor,
                prototype: prototype
            });

            // Make sure our prototype looks nice.
            Constructor.prototype.constructor = Constructor;


            // Call the class `setup` and `init`
            var t = [_super_class].concat($.makeArray(arguments)),
                args = Constructor.setup.apply(Constructor, t);

            if (Constructor.init) {
                Constructor.init.apply(Constructor, args || t);
            }


            return Constructor;

        }

    });

    return Construct;
});