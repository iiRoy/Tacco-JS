/*
 * This is a customized extension utility.
 * It integrates concepts from Backbone.js and John Resig's classic inheritance pattern.
 * Original sources: http://backbonejs.org and http://ejohn.org/blog/simple-javascript-inheritance/
 * The author claims no credit for the core logic, merely for the integration.
 */
( function ( root, factory ) {

    // Universal Module Definition (UMD) pattern for library loading.

    // Attempt to load as an AMD module first.
    if ( typeof define === 'function' && define.amd ) {
        define( [ 'underscore', 'backbone' ], function ( _, Backbone ) {
            // Even in an AMD environment, export globally for compatibility
            // with scripts that might still expect a global Backbone object.
            factory( _, Backbone );
        } );

    // If not AMD, check for Node.js / CommonJS environment.
    } else if ( typeof exports !== 'undefined' && typeof require === 'function' ) {
        var _ = require( 'underscore' ),
            Backbone = require( 'backbone' ); // Require Backbone module.
        factory( _, Backbone );

    // Finally, if no module loader is found, expose as a global browser variable.
    } else {
        factory( root._, root.Backbone );
    }

} ( this, function factory ( _, Backbone ) {

    // Overrides Backbone's `extend` method for Models, Collections, Routers, and Views.
    Backbone.Model.extend = Backbone.Collection.extend = Backbone.Router.extend = Backbone.View.extend = function ( protoProps, classProps ) {
        // The core inheritance logic is encapsulated in the `inherits` function.
        var child = inherits( this, protoProps, classProps );
        // Ensure the new child also has an `extend` method, referencing its own.
        child.extend = this.extend;
        return child;
    };

    // A helper function to indicate when a super method is called but not implemented.
    var unImplementedSuper = function ( method ) {
        throw "Super does not implement this method: " + method;
    };

    // Regular expression to test for the presence of `_super` in a function's source.
    var fnTest = /\b_super\b/;

    // This function creates a wrapper around methods that use `_super`.
    var makeWrapper = function ( parentProto, name, fn ) {
        // The actual wrapper function that will be called.
        var wrapper = function () {
            // Save the current `_super` reference to restore it later.
            var tmp = this._super;

            // Assign the parent's method to `this._super` for the duration of this call.
            // If the parent doesn't have the method, use `unImplementedSuper`.
            this._super = parentProto[ name ] || unImplementedSuper( name );

            var ret; // Variable to hold the return value of the wrapped function.
            try {
                // Call the original function, preserving `this` context and arguments.
                ret = fn.apply( this, arguments );
            } finally {
                // Always restore the original `_super` reference, even if an error occurs.
                this._super = tmp;
            }
            return ret; // Return the result of the original function.
        };

        // Copy any static properties (e.g., `length`, `name`) from the original function
        // to the new wrapper function.
        for ( var prop in fn ) {
            if ( fn.hasOwnProperty( prop ) ) { // Ensure it's an own property.
                wrapper[ prop ] = fn[ prop ];
                // Optionally delete from original, though not strictly necessary here.
                // delete fn[prop]; // Original line, might be for memory optimization.
            }
        }

        return wrapper; // The new wrapped function.
    };

    // An empty constructor function used for setting up the prototype chain.
    var ctor = function () {};

    // The main inheritance function, based on John Resig's pattern.
    var inherits = function ( parent, protoProps, staticProps ) {
        var child; // The new child constructor function.
        var parentProto = parent.prototype; // Reference to the parent's prototype.

        // Determine the child's constructor.
        // If `constructor` is explicitly defined in `protoProps`, use it.
        if ( protoProps && protoProps.hasOwnProperty( 'constructor' ) ) {
            child = protoProps.constructor;
        } else {
            // Otherwise, default to a constructor that simply calls the parent's constructor.
            child = function () {
                return parent.apply( this, arguments );
            };
        }

        // Extend the child constructor with static properties from the parent
        // and any additional `staticProps` provided.
        _.extend( child, parent, staticProps );

        // Establish the prototype chain: child.prototype inherits from parent.prototype.
        // This is done without calling the parent's constructor.
        ctor.prototype = parentProto;
        child.prototype = new ctor();

        // Add instance properties (from `protoProps`) to the child's prototype.
        if ( protoProps ) {
            _.extend( child.prototype, protoProps );

            // Iterate through `protoProps` to handle methods that use `_super`.
            for ( var name in protoProps ) {
                // If a property is a function and uses `_super`, wrap it.
                if ( typeof protoProps[ name ] === "function" && fnTest.test( protoProps[ name ] ) ) {
                    child.prototype[ name ] = makeWrapper( parentProto, name, protoProps[ name ] );
                }
            }
        }

        // Add any static properties specifically for the child constructor.
        if ( staticProps ) {
            _.extend( child, staticProps );
        }

        // Ensure the child's prototype `constructor` property points back to the child itself.
        child.prototype.constructor = child;

        // Store a reference to the parent's prototype on `child.__super__` for convenience.
        child.__super__ = parentProto;

        return child; // Return the newly created child constructor.
    };

    // The factory returns the `inherits` function, which is then used by Backbone.
    return inherits;
} ) );