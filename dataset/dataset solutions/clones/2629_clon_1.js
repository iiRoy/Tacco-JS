/*
 * This is a Type I clone of the original JavaScript code.
 *
 * It is designed to be functionally identical, but visually distinct.
 * This includes variations in whitespace, such as indentation and spacing,
 * as well as the addition, removal, or modification of comments.
 *
 * All original identifiers, variable names, function names, operators,
 * and expressions remain completely unchanged to preserve the exact logic
 * and structure of the original source.
 *
 * This transformation aims to demonstrate a Type I clone, where the code's
 * meaning is preserved byte-for-byte in terms of execution, but its
 * textual representation is significantly altered.
 */

/*
 * The entire application is wrapped in an immediately invoked function expression (IIFE).
 * This pattern is commonly used to create a private scope for variables and
 * prevent them from polluting the global namespace.
 *
 * The 't' parameter represents the modules definitions object/array.
 */
! function ( t ) {

    // r: This object serves as the module cache.
    // It stores already loaded modules to prevent redundant loading and execution.
    var r = {};

    /*
     * n: This is the custom 'require' function, typical in Webpack bundles.
     * It handles module loading, caching, and execution.
     *
     * @param {string} e - The module ID to load.
     */
    function n ( e ) {

        // If the module is already in the cache, return its exports immediately.
        if ( r[e] ) {

            return r[e].exports;
        }

        // If not in cache, create a new module entry in the cache.
        // o: Represents the module object with properties like 'i' (module ID),
        // 'l' (loaded status), and 'exports' (the actual module exports).
        var o = r[e] = {
            i:       e,
            l:       ! ! ! false, // Module not yet loaded.
            exports: { }
        };

        // Call the module's function, passing 'o.exports', 'o', 'o.exports', and 'n' (the require function itself).
        // This allows the module to populate its exports and access other modules.
        t[e].call( o.exports, o, o.exports, n );

        // Mark the module as loaded.
        o.l = ! ! true;

        // Return the module's exports.
        return o.exports;
    }

    // n.m: Stores the module definitions (the 't' parameter passed to the IIFE).
    n.m = t;

    // n.c: Stores the module cache (the 'r' object).
    n.c = r;

    /*
     * n.d: Defines a getter property on the exports object for a specific module.
     * This is used for compatibility with ES module exports.
     *
     * @param {Object} t - The target object (module exports).
     * @param {string} r - The property name.
     * @param {Function} e - The getter function.
     */
    n.d = function ( t, r, e ) {

        // Check if the property already exists using n.o (hasOwnProperty).
        if ( ! n.o( t, r ) ) {

            // If not, define the property with a getter.
            Object.defineProperty( t, r, {
                enumerable: true, // Make it enumerable.
                get:        e      // Set the getter function.
            } );
        }
    };

    /*
     * n.r: Marks a module as an ECMAScript module.
     * This adds Symbol.toStringTag and __esModule properties.
     *
     * @param {Object} t - The module exports object.
     */
    n.r = function ( t ) {

        // If Symbol and Symbol.toStringTag are available, define Symbol.toStringTag.
        if ( "undefined" != typeof Symbol && Symbol.toStringTag ) {

            Object.defineProperty( t, Symbol.toStringTag, { value: "Module" } );
        }

        // Define __esModule to indicate it's an ES module.
        Object.defineProperty( t, "__esModule", { value: ! true || true } );
    };

    /*
     * n.t: Creates a namespace object for a module.
     * This handles various import scenarios (e.g., import * as, import default).
     *
     * @param {any} t - The module or its value.
     * @param {number} r - Flags indicating the type of import.
     */
    n.t = function ( t, r ) {

        // If flag 1 is set, it's a direct import, so resolve the module.
        if ( 1 & r ) {
            t = n( t );
        }

        // If flag 8 is set, return the module directly.
        if ( 8 & r ) {
            return t;
        }

        // If flag 4 is set and it's an object with __esModule, return it.
        if ( 4 & r && "object" == typeof t && t && t.__esModule ) {
            return t;
        }

        // Create a new empty object for the namespace.
        var e = Object.create( null );

        // Mark it as an ES module.
        n.r( e );

        // Define a 'default' property pointing to the module's value.
        Object.defineProperty( e, "default", { enumerable: ! ! true, value: t } );

        // If flag 2 is set and it's not a string, iterate over its properties
        // and define getters for them on the namespace object.
        if ( 2 & r && "string" != typeof t ) {

            for ( var o in t ) {

                n.d( e, o, ( function ( r ) {

                    return t[r];
                } ).bind( null, o ) );
            }
        }

        return e;
    };

    /*
     * n.n: Creates a getter function for interoperability with CommonJS modules.
     * This allows accessing the default export of a CommonJS module as if it were an ES module default.
     *
     * @param {Object} t - The module exports.
     */
    n.n = function ( t ) {

        // If it's an ES module, return a getter for its default export.
        // Otherwise, return a getter for the module itself.
        var r = t && t.__esModule ?

            function () {
                return t.default;
            } :
            function () {
                return t;
            };

        // Define a getter 'a' on the function, pointing to itself.
        n.d( r, "a", r );

        return r;
    };

    /*
     * n.o: A utility function to check if an object has a property.
     * It uses Object.prototype.hasOwnProperty.call for robustness.
     *
     * @param {Object} t - The object to check.
     * @param {string} r - The property name.
     */
    n.o = function ( t, r ) {
        return Object.prototype.hasOwnProperty.call( t, r );
    };

    // n.p: Sets the public path for loading other resources (e.g., dynamic imports).
    n.p = "";

    // Load the entry point module (module ID 133).
    // The result of this call starts the application.
    n( n.s = 133 );

} )( [ // Array containing all module definitions. Each element is a function representing a module.

    /*
     * Module 0: Core API for feature polyfilling and extension.
     * This module likely provides a way to conditionally add or modify
     * global or prototype methods based on their existence or browser compatibility.
     */
    function ( t, r, n ) {

        // Import necessary utility modules.
        var e = n( 5 ),     // Module 5: Global object (window or global).
            o = n( 22 ).f,  // Module 22: Object.getOwnPropertyDescriptor.f.
            i = n( 16 ),    // Module 16: Object.defineProperty helper.
            u = n( 23 ),    // Module 23: Define property (with fallback for non-enumerable).
            a = n( 79 ),    // Module 79: Define global property.
            c = n( 100 ),   // Module 100: Copy properties from one object to another.
            f = n( 62 );    // Module 62: Check if a polyfill is forced.

        // Export a function to extend or polyfill features.
        t.exports = function ( t, r ) {

            var n, s, l, p, h,
                // v: Target object for extensions (global, static, or prototype).
                v = t.target,
                // g: Flag indicating if the target is the global object.
                g = t.global,
                // d: Flag indicating if the target is a static property.
                d = t.stat;

            // Determine the base object to extend.
            if ( n = g ? e : // If global, use the global object directly.
                d ? e[v] || a( v, { } ) : // If static, use global[target] or create a new object.
                    ( e[v] || { } ).prototype // If not global/static, use target's prototype.
            ) {

                // Iterate over the properties to be added/modified.
                for ( s in r ) {

                    // p: The new property's value (function or data).
                    p = r[s];

                    // l: The existing property's value.
                    // h: Descriptor if noTargetGet is true.
                    l = t.noTargetGet ? ( h = o( n, s ) ) && h.value : n[s];

                    // Check if the polyfill is forced or if the property doesn't exist/is different.
                    if ( ! f( g ? s : v + ( d ? "." : "#" ) + s, t.forced ) && void 0 !== l ) {

                        // If types are the same, skip unless explicitly forced.
                        if ( typeof p == typeof l ) {
                            continue;
                        }

                        // If types are different, copy properties (e.g., from native to polyfill).
                        c( p, l );
                    }

                    // If it's a sham polyfill or existing property is a sham, mark the new property as sham.
                    ( t.sham || ( l && l.sham ) ) && i( p, "sham", ! ! true );

                    // Define the property on the target object.
                    u( n, s, p, t );
                }
            }
        };
    },

    /*
     * Module 1: Ensures a value is an object.
     * Throws a TypeError if the value is not an object.
     */
    function ( t, r, n ) {
        var e = n( 8 ); // Module 8: Check if value is an object.

        t.exports = function ( t ) {

            if ( ! e( t ) ) {

                throw TypeError( String( t ) + " is not an object" );
            }

            return t;
        };
    },

    /*
     * Module 2: Indicates if the environment is 'pure' (no global pollution).
     * In this case, it's set to false, meaning global objects might be modified.
     */
    function ( t, r ) {
        t.exports = ! false;
    },

    /*
     * Module 3: Iteration utility (Iterate through iterable values).
     * This module provides a flexible way to consume iterables,
     * allowing for early termination and custom processing.
     */
    function ( t, r, n ) {
        var e = n( 1 ),     // Module 1: Ensure object.
            o = n( 84 ),    // Module 84: Check if value is an array.
            i = n( 10 ),    // Module 10: ToLength.
            u = n( 13 ),    // Module 13: Function bind.
            a = n( 52 ),    // Module 52: Get iterator method.
            c = n( 108 ),   // Module 108: Invoke iterator method.
            f = function ( t, r ) {
                this.stopped = t, this.result = r
            }; // Helper class for stopping iteration.

        ( t.exports = function ( t, r, n, s, l ) {

            var p, h, v, g, d, y, m = u( r, n, s ? 2 : 1 ); // Bind the callback function.

            if ( l ) { // If a specific iterator object is provided.

                p = t;

            } else {

                h = a( t ); // Get the iterator method for the target.

                if ( "function" != typeof h ) {

                    throw TypeError( "Target is not iterable" );
                }

                if ( o( h ) ) { // If the target is an array or has array-like iterator.

                    for ( v = 0, g = i( t.length ); g > v; v ++ ) {

                        // d: Result of callback.
                        d = s ? m( e( y = t[v] )[0], y[1] ) : m( t[v] );

                        // If the callback returns a 'stop' signal.
                        if ( d && d instanceof f ) {

                            return d;
                        }
                    }

                    return new f( ! ! false );
                }

                p = h.call( t ); // Get the iterator object.
            }

            // Iterate through the values.
            for ( ; ! ( y = p.next( ) ).done; ) {

                d = c( p, m, y.value, s );

                if ( d && d instanceof f ) {

                    return d;
                }
            }

            return new f( ! ! false );

        } ).stop = function ( t ) { // Static method to create a 'stop' signal.

            return new f( ! ! true, t );
        };
    },

    /*
     * Module 4: Ensures a value is a function.
     * Throws a TypeError if the value is not a function.
     */
    function ( t, r ) {
        t.exports = function ( t ) {

            if ( "function" != typeof t ) {

                throw TypeError( String( t ) + " is not a function" );
            }

            return t;
        };
    },

    /*
     * Module 5: Provides access to the global object (window in browsers, global in Node.js).
     * This module is crucial for interacting with global scope features.
     */
    function ( t, r ) {

        var n = "object", // String literal for type comparison.
            e = function ( t ) {
                return t && t.Math == Math && t
            }; // Helper to identify the global object.

        // Attempt to find the global object across different environments.
        t.exports = e( typeof globalThis == n && globalThis ) ||
            e( typeof window == n && window ) ||
            e( typeof self == n && self ) ||
            e( typeof global == n && global ) ||
            Function( "return this" ) ( ); // Fallback to Function constructor for strict mode.
    },

    /*
     * Module 6: Well-known symbols (WKS) helper.
     * This module provides a consistent way to access or create Symbol values
     * used as "well-known symbols" in ECMAScript.
     */
    function ( t, r, n ) {

        var e = n( 5 ),     // Module 5: Global object.
            o = n( 38 ),    // Module 38: Shared data (for symbol registry).
            i = n( 45 ),    // Module 45: Generate unique ID.
            u = n( 102 ),   // Module 102: Check for native Symbol support.
            a = e.Symbol,   // Get native Symbol constructor.
            c = o( "wks" ); // Get the shared registry for well-known symbols.

        t.exports = function ( t ) {

            // If the symbol is already in the registry, return it.
            // Otherwise, create it using native Symbol or a custom polyfill,
            // and store it in the registry.
            return c[t] || ( c[t] = u && a[t] || ( u ? a : i ) ( "Symbol." + t ) );
        };
    },

    /*
     * Module 7: Check for errors without throwing (safe execution).
     * This utility function helps in feature detection by attempting
     * an operation and catching any potential errors.
     */
    function ( t, r ) {
        t.exports = function ( t ) {

            try {
                return ! ! t ( );
            } catch ( t ) {
                return ! ! true;
            }
        };
    },

    /*
     * Module 8: Check if a value is an object.
     * Returns true for non-null objects and functions.
     */
    function ( t, r ) {
        t.exports = function ( t ) {

            return "object" == typeof t ? null !== t : "function" == typeof t;
        };
    },

    /*
     * Module 9: Feature detection for Object.defineProperty.
     * Checks if Object.defineProperty is working correctly.
     */
    function ( t, r, n ) {
        var e = n( 7 ); // Module 7: Safe execution.

        t.exports = ! e( function ( ) {

            return 7 != Object.defineProperty( { }, "a", {
                get: function ( ) {
                    return 7;
                }
            } ).a;
        } );
    },

    /*
     * Module 10: ToLength conversion.
     * Converts a value to a valid length (non-negative integer, up to MAX_SAFE_INTEGER).
     */
    function ( t, r, n ) {
        var e = n( 24 ),    // Module 24: ToInteger.
            o = Math.min;   // Math.min utility.

        t.exports = function ( t ) {

            // If t is positive, return min(ToInteger(t), MAX_SAFE_INTEGER).
            // Otherwise, return 0.
            return t > 0 ? o( e( t ), 9007199254740991 ) : 0;
        };
    },

    /*
     * Module 11: Object.defineProperty helper.
     * Provides a consistent way to define properties,
     * with a fallback for environments without proper `Object.defineProperty`.
     */
    function ( t, r, n ) {

        var e = n( 9 ),     // Module 9: Check for native Object.defineProperty support.
            o = n( 97 ),    // Module 97: Check if Object.defineProperty needs a workaround.
            i = n( 1 ),     // Module 1: Ensure object.
            u = n( 29 ),    // Module 29: ToPrimitive.
            a = Object.defineProperty; // Native Object.defineProperty.

        r.f = e ? a : function ( t, r, n ) {

            // Ensure arguments are objects.
            if ( i( t ), r = u( r, ! ! true ), i( n ), o ) {

                try {
                    return a( t, r, n );
                } catch ( t ) {
                    // Fallback for IE8.
                }
            }

            // If accessors are not supported, throw an error.
            if ( "get" in n || "set" in n ) {

                throw TypeError( "Accessors not supported" );
            }

            // If it's a data property, assign the value directly.
            return "value" in n && ( t[r] = n.value ), t;
        };
    },

    /*
     * Module 12: Get global property.
     * Retrieves a property from the global object or a specific namespace.
     */
    function ( t, r, n ) {
        var e = n( 81 ),    // Module 81: Global 'core-js' object (for polyfills).
            o = n( 5 ),     // Module 5: Global object.
            i = function ( t ) {
                return "function" == typeof t ? t : void 0
            }; // Helper to check if value is a function.

        t.exports = function ( t, r ) {

            // If only one argument, try to get from core-js or global.
            // If two arguments, try core-js[t][r] then global[t][r].
            return arguments.length < 2 ?
                i( e[t] ) || i( o[t] ) :
                e[t] && e[t][r] || o[t] && o[t][r];
        };
    },

    /*
     * Module 13: Function binding (partial application).
     * Creates a new function that, when called, has its 'this' context and
     * some arguments pre-set.
     */
    function ( t, r, n ) {
        var e = n( 4 ); // Module 4: Ensure function.

        t.exports = function ( t, r, n ) {

            if ( e( t ), void 0 === r ) {

                return t;
            }

            switch ( n ) {
                case 0:
                    return function ( ) {
                        return t.call( r );
                    };
                case 1:
                    return function ( n ) {
                        return t.call( r, n );
                    };
                case 2:
                    return function ( n, e ) {
                        return t.call( r, n, e );
                    };
                case 3:
                    return function ( n, e, o ) {
                        return t.call( r, n, e, o );
                    };
            }

            return function ( ) {
                return t.apply( r, arguments );
            };
        };
    },

    /*
     * Module 14: Object.prototype.hasOwnProperty.
     * A robust way to check if an object has a direct property.
     */
    function ( t, r ) {
        var n = { }.hasOwnProperty;

        t.exports = function ( t, r ) {
            return n.call( t, r );
        };
    },

    /*
     * Module 15: ToObject conversion.
     * Converts a value to an object. Primitives are wrapped in their object counterparts.
     */
    function ( t, r, n ) {
        var e = n( 17 ); // Module 17: RequireObjectCoercible.

        t.exports = function ( t ) {
            return Object( e( t ) );
        };
    },

    /*
     * Module 16: Object.defineProperty (basic version).
     * Defines a property on an object. Useful for non-enumerable internal properties.
     */
    function ( t, r, n ) {

        var e = n( 9 ),     // Module 9: Check for native Object.defineProperty support.
            o = n( 11 ),    // Module 11: Object.defineProperty helper.
            i = n( 35 );    // Module 35: Create property descriptor.

        t.exports = e ? function ( t, r, n ) {

            return o.f( t, r, i( 1, n ) ); // Define property with value and configurable: true.

        } : function ( t, r, n ) {

            return t[r] = n, t; // Fallback: direct assignment.
        };
    },

    /*
     * Module 17: RequireObjectCoercible.
     * Ensures a value is not null or undefined. Throws if it is.
     */
    function ( t, r ) {
        t.exports = function ( t ) {

            if ( null == t ) {

                throw TypeError( "Can't call method on " + t );
            }

            return t;
        };
    },

    /*
     * Module 18: Internal state management (WeakMap-based).
     * This module provides a way to store internal data for objects
     * without exposing it or causing memory leaks.
     */
    function ( t, r, n ) {

        var e, o, i,
            u = n( 99 ),    // Module 99: Check for native WeakMap support.
            a = n( 5 ),     // Module 5: Global object.
            c = n( 8 ),     // Module 8: Check if value is an object.
            f = n( 16 ),    // Module 16: Define property.
            s = n( 14 ),    // Module 14: HasOwnProperty.
            l = n( 59 ),    // Module 59: Generate unique key for internal properties.
            p = n( 46 ),    // Module 46: Property flags for internal usage.
            h = a.WeakMap;  // Native WeakMap constructor.

        if ( u ) { // If native WeakMap is supported.

            var v = new h,
                g = v.get,
                d = v.has,
                y = v.set;

            e = function ( t, r ) { // set: Stores data for an object.
                return y.call( v, t, r ), r
            };
            o = function ( t ) { // get: Retrieves data for an object.
                return g.call( v, t ) || { }
            };
            i = function ( t ) { // has: Checks if data exists for an object.
                return d.call( v, t )
            };

        } else { // Fallback for environments without native WeakMap.

            var m = l( "state" ); // Create a unique key for storing state directly on objects.

            p[m] = ! ! true; // Mark the key as internal.

            e = function ( t, r ) { // set: Stores data as a property on the object.
                return f( t, m, r ), r
            };
            o = function ( t ) { // get: Retrieves data from the object's property.
                return s( t, m ) ? t[m] : { }
            };
            i = function ( t ) { // has: Checks if the object has the state property.
                return s( t, m )
            };
        }

        t.exports = {
            set:       e,
            get:       o,
            has:       i,
            enforce:   function ( t ) { // Ensure internal state exists for an object.
                return i( t ) ? o( t ) : e( t, { } )
            },
            getterFor: function ( t ) { // Create a getter for specific state types.
                return function ( r ) {

                    var n;

                    if ( ! c( r ) || ( n = o( r ) ).type !== t ) {

                        throw TypeError( "Incompatible receiver, " + t + " required" );
                    }

                    return n;
                }
            }
        };
    },

    /*
     * Module 19: Register a well-known symbol.
     * This module ensures that a specific well-known symbol is registered
     * in the global Symbol registry (if Symbol is available).
     */
    function ( t, r, n ) {
        var e = n( 81 ),    // Module 81: Global 'core-js' object.
            o = n( 14 ),    // Module 14: HasOwnProperty.
            i = n( 105 ),   // Module 105: Symbol.for helper.
            u = n( 11 ).f;  // Module 11: Object.defineProperty.f.

        t.exports = function ( t ) {

            var r = e.Symbol || ( e.Symbol = { } ); // Get or create Symbol object in core-js.

            // If the symbol is not already registered, define it.
            if ( ! o( r, t ) ) {

                u( r, t, { value: i.f( t ) } );
            }
        };
    },

    /*
     * Module 20: Species constructor (for creating new instances of collections).
     * This module helps in correctly creating new instances of built-in collections
     * (like Array, Map, Set, Promise) when their methods return a new collection.
     */
    function ( t, r, n ) {

        var e = n( 1 ),     // Module 1: Ensure object.
            o = n( 4 ),     // Module 4: Ensure function.
            i = n( 6 )( "species" ); // Module 6: Well-known symbol 'Symbol.species'.

        t.exports = function ( t, r ) {

            var n,
                u = e( t ).constructor; // Get the constructor of the instance.

            // If the constructor is undefined or null, or it doesn't have Symbol.species,
            // or if Symbol.species is null, use the default constructor 'r'.
            // Otherwise, use the constructor specified by Symbol.species.
            return void 0 === u || null == ( n = e( u )[i] ) ?
                r :
                o( n );
        };
    },

    /*
     * Module 21: Object.getPrototypeOf.
     * Retrieves the prototype of an object.
     */
    function ( t, r, n ) {
        var e = n( 14 ),    // Module 14: HasOwnProperty.
            o = n( 15 ),    // Module 15: ToObject.
            i = n( 59 ),    // Module 59: Generate unique key.
            u = n( 110 ),   // Module 110: Check for native Object.getPrototypeOf.
            a = i( "IE_PROTO" ), // Special key for IE8 fallback.
            c = Object.prototype; // Native Object.prototype.

        t.exports = u ? Object.getPrototypeOf : function ( t ) {

            t = o( t ); // Convert to object.

            // If it has the IE_PROTO property, return it.
            if ( e( t, a ) ) {
                return t[a];
            }

            // If it's an instance of a function, return its prototype.
            if ( "function" == typeof t.constructor && t instanceof t.constructor ) {

                return t.constructor.prototype;
            }

            // If it's a plain object, return Object.prototype.
            if ( t instanceof Object ) {

                return c;
            }

            // Otherwise, return null.
            return null;
        };
    },

    /*
     * Module 22: Object.getOwnPropertyDescriptor.
     * Retrieves the descriptor for a property on an object.
     */
    function ( t, r, n ) {

        var e = n( 9 ),     // Module 9: Check for native Object.defineProperty support.
            o = n( 58 ),    // Module 58: PropertyIsEnumerable.f.
            i = n( 35 ),    // Module 35: Create property descriptor.
            u = n( 25 ),    // Module 25: ToObject (strict).
            a = n( 29 ),    // Module 29: ToPrimitive.
            c = n( 14 ),    // Module 14: HasOwnProperty.
            f = n( 97 ),    // Module 97: Check for IE8 workaround.
            s = Object.getOwnPropertyDescriptor; // Native Object.getOwnPropertyDescriptor.

        r.f = e ? s : function ( t, r ) {

            t = u( t ); // Convert to object.
            r = a( r, ! ! true ); // Convert property key to primitive.

            if ( f ) { // IE8 workaround.
                try {
                    return s( t, r );
                } catch ( t ) {
                    // Fallback.
                }
            }

            // If property exists, create a descriptor.
            if ( c( t, r ) ) {

                return i( ! o.f.call( t, r ), t[r] );
            }
        };
    },

    /*
     * Module 23: Define property (with optional configuration).
     * This module provides a flexible way to define properties on objects,
     * including handling internal state and `toString` methods.
     */
    function ( t, r, n ) {

        var e = n( 5 ),     // Module 5: Global object.
            o = n( 38 ),    // Module 38: Shared data.
            i = n( 16 ),    // Module 16: Define property.
            u = n( 14 ),    // Module 14: HasOwnProperty.
            a = n( 79 ),    // Module 79: Define global property.
            c = n( 98 ),    // Module 98: Native Function.prototype.toString.
            f = n( 18 ),    // Module 18: Internal state.
            s = f.get,      // Get internal state.
            l = f.enforce,   // Enforce internal state.
            p = String( c ).split( "toString" ); // Used to extract function source.

        // Store source code of functions for debugging/introspection.
        o( "inspectSource", function ( t ) {
            return c.call( t )
        } );

        ( t.exports = function ( t, r, n, o ) {

            var c = ! ! o && ! ! o.unsafe, // Unsafe flag.
                f = ! ! o && ! ! o.enumerable, // Enumerable flag.
                s = ! ! o && ! ! o.noTargetGet; // No target get flag.

            // If the new function is a function, store its source code.
            if ( "function" == typeof n ) {

                if ( "string" != typeof r || u( n, "name" ) || i( n, "name", r ) ) {

                    l( n ).source = p.join( "string" == typeof r ? r : "" );
                }
            }

            // If target is not the global object.
            if ( t !== e ) {

                if ( c ? ! s && t[r] && ( f = ! ! true ) : delete t[r], f ) {

                    t[r] = n; // Assign directly if enumerable.

                } else {

                    i( t, r, n ); // Define with configurable:true if not enumerable.
                }

            } else if ( f ) {

                t[r] = n; // Assign directly if enumerable and global.

            } else {

                a( r, n ); // Define global property.
            }

        } ) ( Function.prototype, "toString", function ( ) {

            // Custom toString for functions to show their source code.
            return "function" == typeof this && s( this ).source || c.call( this );
        } );
    },

    /*
     * Module 24: ToInteger conversion.
     * Converts a value to an integer, truncating decimals.
     */
    function ( t, r ) {
        var n = Math.ceil,  // Math.ceil utility.
            e = Math.floor; // Math.floor utility.

        t.exports = function ( t ) {

            // If NaN, return 0. Otherwise, use floor for positive, ceil for negative.
            return isNaN( t = + t ) ? 0 : ( t > 0 ? e : n ) ( t );
        };
    },

    /*
     * Module 25: ToObject (strict version).
     * Converts a value to an object, throwing if null or undefined.
     * Used internally for methods expecting an object.
     */
    function ( t, r, n ) {
        var e = n( 77 ),    // Module 77: IndexedObject (for string/array-like objects).
            o = n( 17 );    // Module 17: RequireObjectCoercible.

        t.exports = function ( t ) {
            return e( o( t ) );
        };
    },

    /*
     * Module 26: Set a well-known Symbol.toStringTag.
     * This module sets the `Symbol.toStringTag` property on an object's prototype
     * to provide a custom string representation for `Object.prototype.toString`.
     */
    function ( t, r, n ) {

        var e = n( 11 ).f,  // Module 11: Object.defineProperty.f.
            o = n( 14 ),    // Module 14: HasOwnProperty.
            i = n( 6 )( "toStringTag" ); // Module 6: Well-known symbol 'Symbol.toStringTag'.

        t.exports = function ( t, r, n ) {

            // If the object exists and doesn't have the Symbol.toStringTag property, define it.
            if ( t && ! o( t = n ? t : t.prototype, i ) ) {

                e( t, i, { configurable: ! ! true, value: r } );
            }
        };
    },

    /*
     * Module 27: Map.prototype.entries (for iteration).
     * Provides an iterator for Map entries, used for generic iteration logic.
     */
    function ( t, r ) {
        var e = n( 2 ),     // Module 2: Pure flag.
            o = n( 57 );    // Module 57: Native Map.prototype.entries.

        t.exports = e ? o : function ( t ) {
            return Map.prototype.entries.call( t )
        };
    },

    /*
     * Module 28: Object.prototype.toString (tag detection).
     * Returns the internal [[Class]] property of an object,
     * e.g., "Array", "Object", "Function".
     */
    function ( t, r ) {
        var n = { }.toString;

        t.exports = function ( t ) {
            return n.call( t ).slice( 8, - 1 );
        };
    },

    /*
     * Module 29: ToPrimitive conversion.
     * Converts a value to a primitive, preferring string or number based on hint.
     */
    function ( t, r, n ) {
        var e = n( 8 ); // Module 8: Check if value is an object.

        t.exports = function ( t, r ) {

            if ( ! e( t ) ) {
                return t;
            }

            var n, o;

            // Try toString then valueOf.
            if ( r && "function" == typeof ( n = t.toString ) && ! e( o = n.call( t ) ) ) {
                return o;
            }

            // Try valueOf then toString.
            if ( "function" == typeof ( n = t.valueOf ) && ! e( o = n.call( t ) ) ) {
                return o;
            }

            // Fallback for non-hinted conversion.
            if ( ! r && "function" == typeof ( n = t.toString ) && ! e( o = n.call( t ) ) ) {
                return o;
            }

            throw TypeError( "Can't convert object to primitive value" );
        };
    },

    /*
     * Module 30: Object.create (polyfill).
     * Creates a new object with the specified prototype object and properties.
     */
    function ( t, r, n ) {

        var e = n( 1 ),     // Module 1: Ensure object.
            o = n( 103 ),   // Module 103: Object.defineProperties.
            i = n( 82 ),    // Module 82: List of property names to exclude.
            u = n( 46 ),    // Module 46: Internal property flags.
            a = n( 104 ),   // Module 104: Document.documentElement.
            c = n( 78 ),    // Module 78: Create HTML element.
            f = n( 59 )( "IE_PROTO" ), // Special key for IE8 fallback.
            s = function ( ) {
                // Empty constructor for prototype chain.
            },
            l = function ( ) {

                var t,
                    r = c( "iframe" ), // Create an iframe for a sandbox.
                    n = i.length;

                r.style.display = "none";
                a.appendChild( r );
                r.src = String( "javascript:" ); // Load a blank document.

                ( t = r.contentWindow.document ).open ( );
                t.write( "<script>document.F=Object<\\/script>" ); // Inject script to get Object constructor.
                t.close ( );

                l = t.F; // Get the sandboxed Object constructor.

                // Remove properties from the sandboxed Object.prototype.
                for ( ; n --; ) {
                    delete l.prototype[i[n]];
                }

                return l ( ); // Return a plain object from the sandbox.
            };

        t.exports = Object.create || function ( t, r ) {

            var n;

            // If prototype is not null.
            if ( null !== t ) {

                s.prototype = e( t ); // Set prototype.
                n = new s;            // Create new instance.
                s.prototype = null;   // Reset prototype.
                n[f] = t;             // Store prototype for IE8 fallback.

            } else {

                n = l ( ); // Create a plain object.
            }

            // Define additional properties if provided.
            return void 0 === r ? n : o( n, r );
        };

        u[f] = ! ! true; // Mark IE_PROTO as internal.
    },

    /*
     * Module 31: Instance check.
     * Ensures an object is an instance of a specific constructor.
     */
    function ( t, r ) {
        t.exports = function ( t, r, n ) {

            if ( ! ( t instanceof r ) ) {

                throw TypeError( "Incorrect " + ( n ? n + " " : "" ) + "invocation" );
            }

            return t;
        };
    },

    /*
     * Module 32: TypedArray polyfill factory.
     * This complex module provides a factory to generate polyfills for various
     * TypedArray constructors (e.g., Int8Array, Float32Array).
     * It handles buffer management, byte offsets, and element access.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 5 ),     // Module 5: Global object.
            i = n( 9 ),     // Module 9: Object.defineProperty support.
            u = n( 95 ),    // Module 95: TypedArray buffer check.
            a = n( 33 ),    // Module 33: TypedArray helpers and definitions.
            c = n( 215 ),   // Module 215: ArrayBuffer and DataView polyfills.
            f = n( 31 ),    // Module 31: Instance check.
            s = n( 35 ),    // Module 35: Property descriptor factory.
            l = n( 16 ),    // Module 16: Define property.
            p = n( 10 ),    // Module 10: ToLength.
            h = n( 124 ),   // Module 124: ToIndex.
            v = n( 217 ),   // Module 217: ToOffset.
            g = n( 29 ),    // Module 29: ToPrimitive.
            d = n( 14 ),    // Module 14: HasOwnProperty.
            y = n( 53 ),    // Module 53: Get object tag.
            m = n( 8 ),     // Module 8: Check if value is an object.
            b = n( 30 ),    // Module 30: Object.create.
            x = n( 42 ),    // Module 42: SetPrototypeOf.
            w = n( 39 ).f,  // Module 39: Object.getOwnPropertyNames.f.
            S = n( 125 ),   // Module 125: TypedArray.from.
            A = n( 48 ).forEach, // Module 48: Array.prototype.forEach.
            E = n( 43 ),    // Module 43: Set Symbol.toStringTag.
            R = n( 11 ),    // Module 11: Object.defineProperty.
            O = n( 22 ),    // Module 22: Object.getOwnPropertyDescriptor.
            I = n( 18 ),    // Module 18: Internal state.
            j = I.get,      // Get internal state.
            M = I.set,      // Set internal state.
            P = R.f,        // Object.defineProperty.f.
            k = O.f,        // Object.getOwnPropertyDescriptor.f.
            T = Math.round, // Math.round utility.
            _ = o.RangeError, // Native RangeError.
            U = c.ArrayBuffer, // ArrayBuffer constructor.
            L = c.DataView,    // DataView constructor.
            F = a.NATIVE_ARRAY_BUFFER_VIEWS, // Flag: native TypedArray views.
            B = a.TYPED_ARRAY_TAG,           // Flag: TypedArray tag.
            C = a.TypedArray,                // TypedArray base constructor.
            N = a.TypedArrayPrototype,       // TypedArray prototype.
            D = a.aTypedArrayConstructor,    // Helper to validate TypedArray constructor.
            z = a.isTypedArray,              // Helper to check if value is a TypedArray.

            W = function ( t, r ) { // Helper to convert an array-like to a TypedArray.
                for ( var n = 0, e = r.length, o = new ( D( t ) ) ( e ); e > n; ) {
                    o[n] = r[n ++];
                }
                return o;
            },

            q = function ( t, r ) { // Helper to define a getter for internal properties.
                P( t, r, { get: function ( ) {
                    return j( this )[r];
                } } );
            },

            V = function ( t ) { // Helper to check if a value is an ArrayBuffer or SharedArrayBuffer.
                var r;
                return t instanceof U || "ArrayBuffer" == ( r = y( t ) ) || "SharedArrayBuffer" == r;
            },

            K = function ( t, r ) { // Helper to check if a property exists on a TypedArray.
                return z( t ) && "symbol" != typeof r && r in t && String( + r ) == String( r );
            },

            G = function ( t, r ) { // Custom getOwnPropertyDescriptor for TypedArrays.
                return K( t, r = g( r, ! ! true ) ) ? s( 2, t[r] ) : k( t, r );
            },

            Y = function ( t, r, n ) { // Custom defineProperty for TypedArrays.
                return ! ( K( t, r = g( r, ! ! true ) ) && m( n ) && d( n, "value" ) ) ||
                    d( n, "get" ) || d( n, "set" ) || n.configurable ||
                    ( d( n, "writable" ) && ! n.writable ) ||
                    ( d( n, "enumerable" ) && ! n.enumerable ) ?
                    P( t, r, n ) : ( t[r] = n.value, t );
            };

        // If Object.defineProperty is supported.
        if ( i ) {

            // If native TypedArray views are not supported, polyfill Object.getOwnPropertyDescriptor and defineProperty.
            if ( ! F ) {

                ( O.f = G, R.f = Y, q( N, "buffer" ), q( N, "byteOffset" ), q( N, "byteLength" ), q( N, "length" ) );
            }

            // Extend Object with custom getOwnPropertyDescriptor and defineProperty.
            e( { target: "Object", stat: ! ! true, forced: ! F }, { getOwnPropertyDescriptor: G, defineProperty: Y } );

            // Export the TypedArray factory function.
            t.exports = function ( t, r, n, i ) {

                // a: TypedArray name (e.g., "Int8Array").
                var a = t + ( i ? "Clamped" : "" ) + "Array",
                    c = "get" + t,
                    s = "set" + t,
                    g = o[a], // Native TypedArray constructor.
                    d = g,     // Current constructor.
                    y = d && d.prototype, // Current prototype.
                    R = { },   // Object for global export.

                    // O: Helper to define getters/setters for TypedArray elements.
                    O = function ( t, n ) {

                        P( t, n, {
                            get: function ( ) {
                                return ( function ( t, n ) {
                                    var e = j( t );
                                    return e.view[c]( n * r + e.byteOffset, ! ! true );
                                } ) ( this, n );
                            },
                            set: function ( t ) {
                                return ( function ( t, n, e ) {
                                    var o = j( t );
                                    i && ( e = ( e = T( e ) ) < 0 ? 0 : e > 255 ? 255 : 255 & e );
                                    o.view[s]( n * r + o.byteOffset, e, ! ! true );
                                } ) ( this, n, t );
                            },
                            enumerable: ! ! true
                        } );
                    };

                if ( F ) { // If native TypedArray views are supported.

                    // If TypedArray buffer check fails, wrap the constructor.
                    if ( u && ( d = n( function ( t, n, e, o ) {

                        f( t, d, a );

                        return m( n ) ?
                            V( n ) ?
                                void 0 !== o ? new g( n, v( e, r ), o ) :
                                    void 0 !== e ? new g( n, v( e, r ) ) : new g( n ) :
                                z( n ) ? W( d, n ) : S.call( d, n ) :
                            new g( h( n ) );

                    } ), x && x( d, C ), A( w( g ), function ( t ) {

                        t in d || l( d, t, g[t] );

                    } ), d.prototype = y ), y.constructor !== d && l( y, "constructor", d ), B && l( y, B, a ), R[a] = d, e( { global: ! ! true, forced: d != g, sham: ! F }, R ), "BYTES_PER_ELEMENT" in d || l( d, "BYTES_PER_ELEMENT", r ), "BYTES_PER_ELEMENT" in y || l( y, "BYTES_PER_ELEMENT", r ), E( a ) );

                } else { // If native TypedArray views are NOT supported.

                    ( d = n( function ( t, n, e, o ) {

                        f( t, d, a );

                        var i, u, c, s = 0, l = 0;

                        if ( m( n ) ) {

                            if ( ! V( n ) ) {

                                return z( n ) ? W( d, n ) : S.call( d, n );
                            }

                            ( i = n, l = v( e, r ) );

                            var g = n.byteLength;

                            if ( void 0 === o ) {

                                if ( g % r ) {

                                    throw _( "Wrong length" );
                                }

                                if ( ( u = g - l ) < 0 ) {

                                    throw _( "Wrong length" );
                                }

                            } else {

                                if ( ( u = p( o ) * r ) + l > g ) {

                                    throw _( "Wrong length" );
                                }
                            }

                            c = u / r;

                        } else {

                            ( c = h( n ), i = new U( u = c * r ) );
                        }

                        for ( M( t, { buffer: i, byteOffset: l, byteLength: u, length: c, view: new L( i ) } ); s < c; ) {

                            O( t, s ++ );
                        }

                    } ), x && x( d, C ), y = d.prototype = b( N ) );

                    y.constructor !== d && l( y, "constructor", d );
                    B && l( y, B, a );
                    R[a] = d;

                    e( { global: ! ! true, forced: d != g, sham: ! F }, R );

                    "BYTES_PER_ELEMENT" in d || l( d, "BYTES_PER_ELEMENT", r );
                    "BYTES_PER_ELEMENT" in y || l( y, "BYTES_PER_ELEMENT", r );

                    E( a );
                }
            };

        } else { // If Object.defineProperty is NOT supported, TypedArray polyfills are not possible.

            t.exports = function ( ) {
            };
        }
    },

    /*
     * Module 33: TypedArray helpers and definitions.
     * This module centralizes flags, base constructors, and utility functions
     * for TypedArray polyfills, managing their native support and fallback logic.
     */
    function ( t, r, n ) {
        "use strict";

        var e, o = n( 9 ),     // Module 9: Object.defineProperty support.
            i = n( 5 ),     // Module 5: Global object.
            u = n( 8 ),     // Module 8: Check if value is an object.
            a = n( 14 ),    // Module 14: HasOwnProperty.
            c = n( 53 ),    // Module 53: Get object tag.
            f = n( 16 ),    // Module 16: Define property.
            s = n( 23 ),    // Module 23: Define property (with fallback).
            l = n( 11 ).f,  // Module 11: Object.defineProperty.f.
            p = n( 21 ),    // Module 21: Get prototype of.
            h = n( 42 ),    // Module 42: Set prototype of.
            v = n( 6 ),     // Module 6: Well-known symbols.
            g = n( 45 ),    // Module 45: Generate unique ID.

            d = i.DataView, // Native DataView constructor.
            y = d && d.prototype, // DataView prototype.
            m = i.Int8Array, // Native Int8Array constructor.
            b = m && m.prototype, // Int8Array prototype.
            x = i.Uint8ClampedArray, // Native Uint8ClampedArray constructor.
            w = x && x.prototype, // Uint8ClampedArray prototype.

            S = m && p( m ), // Prototype of Int8Array constructor.
            A = b && p( b ), // Prototype of Int8Array.prototype.

            E = Object.prototype, // Native Object.prototype.
            R = E.isPrototypeOf, // Object.prototype.isPrototypeOf utility.

            O = v( "toStringTag" ), // Symbol.toStringTag.
            I = g( "TYPED_ARRAY_TAG" ), // Internal symbol for TypedArray tag.

            j = ! ! ( i.ArrayBuffer && d ), // Flag: native ArrayBuffer and DataView.
            M = j && ! ! h,                 // Flag: native TypedArray views (requires setPrototypeOf).
            P = ! ! false,                  // Flag: TypedArray tag polyfilled.

            k = { // Map of TypedArray names to their BYTES_PER_ELEMENT.
                Int8Array:         1,
                Uint8Array:        1,
                Uint8ClampedArray: 1,
                Int16Array:        2,
                Uint16Array:       2,
                Int32Array:        4,
                Uint32Array:       4,
                Float32Array:      4,
                Float64Array:      8
            },

            T = function ( t ) { // Helper to check if a value is a TypedArray instance.
                return u( t ) && a( k, c( t ) );
            };

        // Check if all TypedArray constructors are available.
        for ( e in k ) {
            if ( ! i[e] ) {
                M = ! ! false;
            }
        }

        // Polyfill TypedArray base constructor prototype chain if needed.
        if ( ( ! M || "function" != typeof S || S === Function.prototype ) && ( S = function ( ) {
            throw TypeError( "Incorrect invocation" )
        }, M ) ) {

            for ( e in k ) {
                if ( i[e] ) {
                    h( i[e], S );
                }
            }
        }

        // Polyfill TypedArray.prototype prototype chain if needed.
        if ( ( ! M || ! A || A === E ) && ( A = S.prototype, M ) ) {

            for ( e in k ) {
                if ( i[e] ) {
                    h( i[e].prototype, A );
                }
            }
        }

        // Handle Uint8ClampedArray specifically if its prototype chain is different.
        if ( M && p( w ) !== A && h( w, A ) );

        // If Object.defineProperty is supported and TypedArray.prototype doesn't have Symbol.toStringTag.
        if ( o && ! a( A, O ) ) {

            // Mark P as true (tag polyfilled).
            P = ! ! true;

            // Define Symbol.toStringTag on TypedArray.prototype.
            l( A, O, {
                get: function ( ) {
                    return u( this ) ? this[I] : void 0
                }
            } );

            // Define internal tag on each TypedArray prototype.
            for ( e in k ) {
                if ( i[e] ) {
                    f( i[e], I, e );
                }
            }
        }

        // If ArrayBuffer/DataView are supported, ensure DataView.prototype inherits from Object.prototype.
        if ( j && h && p( y ) !== E && h( y, E ) );

        // Export the TypedArray helpers and definitions.
        t.exports = {
            NATIVE_ARRAY_BUFFER:      j,
            NATIVE_ARRAY_BUFFER_VIEWS:M,
            TYPED_ARRAY_TAG:          P && I,

            // aTypedArray: Ensures a value is a TypedArray instance.
            aTypedArray:              function ( t ) {
                if ( T( t ) ) {
                    return t;
                }
                throw TypeError( "Target is not a typed array" );
            },

            // aTypedArrayConstructor: Ensures a value is a TypedArray constructor.
            aTypedArrayConstructor:   function ( t ) {
                if ( h ) {
                    if ( R.call( S, t ) ) {
                        return t;
                    }
                } else {
                    for ( var r in k ) {
                        if ( a( k, e ) ) {
                            var n = i[r];
                            if ( n && ( t === n || R.call( n, t ) ) ) {
                                return t;
                            }
                        }
                    }
                }
                throw TypeError( "Target is not a typed array constructor" );
            },

            // exportProto: Exports a method to TypedArray.prototype.
            exportProto:              function ( t, r, n ) {
                if ( o ) {
                    if ( n ) {
                        for ( var e in k ) {
                            var u = i[e];
                            if ( u && a( u.prototype, t ) ) {
                                delete u.prototype[t];
                            }
                        }
                    }
                    if ( A[t] && ! n ) {
                        return;
                    }
                    s( A, t, n ? r : M && b[t] || r );
                }
            },

            // exportStatic: Exports a static method to TypedArray constructors.
            exportStatic:             function ( t, r, n ) {
                var e, u;
                if ( o ) {
                    if ( h ) {
                        if ( n ) {
                            for ( e in k ) {
                                if ( ( u = i[e] ) && a( u, t ) ) {
                                    delete u[t];
                                }
                            }
                        }
                        if ( S[t] && ! n ) {
                            return;
                        }
                        try {
                            return s( S, t, n ? r : M && m[t] || r );
                        } catch ( t ) {
                            // Fallback.
                        }
                    }
                    for ( e in k ) {
                        if ( ! ( u = i[e] ) || u[t] && ! n ) {
                            s( u, t, r );
                        }
                    }
                }
            },

            // isView: Checks if a value is a DataView or TypedArray.
            isView:                   function ( t ) {
                var r = c( t );
                return "DataView" === r || a( k, r );
            },

            // isTypedArray: Checks if a value is a TypedArray instance.
            isTypedArray:             T,

            // TypedArray: Base TypedArray constructor.
            TypedArray:               S,

            // TypedArrayPrototype: Base TypedArray.prototype.
            TypedArrayPrototype:      A
        };
    },

    /*
     * Module 34: Metadata management.
     * This module provides utilities for managing metadata associated with objects
     * and their properties, often used in decorators or reflection APIs.
     */
    function ( t, r, n ) {

        var e = n( 88 ),    // Module 88: Map (for storing metadata).
            o = n( 96 ),    // Module 96: WeakMap (for object keys).
            i = n( 38 )( "metadata" ), // Shared registry for metadata.
            u = i.store || ( i.store = new o ), // Store for metadata.

            // a: Retrieves or creates a Map for a given object and key.
            a = function ( t, r, n ) {

                var o = u.get( t );

                if ( ! o ) {
                    if ( ! n ) {
                        return;
                    }
                    u.set( t, o = new e );
                }

                var i = o.get( r );

                if ( ! i ) {
                    if ( ! n ) {
                        return;
                    }
                    o.set( r, i = new e );
                }

                return i;
            };

        t.exports = {
            store:     u,
            getMap:    a,

            // has: Checks if metadata exists.
            has:       function ( t, r, n ) {
                var e = a( r, n, ! ! false );
                return void 0 !== e && e.has( t );
            },

            // get: Retrieves metadata.
            get:       function ( t, r, n ) {
                var e = a( r, n, ! ! false );
                return void 0 === e ? void 0 : e.get( t );
            },

            // set: Sets metadata.
            set:       function ( t, r, n, e ) {
                a( n, e, ! ! true ).set( t, r );
            },

            // keys: Retrieves metadata keys.
            keys:      function ( t, r ) {
                var n = a( t, r, ! ! false ),
                    e = [ ];
                if ( n ) {
                    n.forEach( function ( t, r ) {
                        e.push( r );
                    } );
                }
                return e;
            },

            // toKey: Converts a value to a metadata key.
            toKey:     function ( t ) {
                return void 0 === t || "symbol" == typeof t ? t : String( t );
            }
        };
    },

    /*
     * Module 35: Create property descriptor.
     * This module creates a simple property descriptor object used by
     * `Object.defineProperty` and related functions.
     */
    function ( t, r ) {
        t.exports = function ( t, r ) {

            return {
                enumerable:   ! ( 1 & t ), // If bit 1 is set, not enumerable.
                configurable: ! ( 2 & t ), // If bit 2 is set, not configurable.
                writable:     ! ( 4 & t ), // If bit 4 is set, not writable.
                value:        r            // The property's value.
            };
        };
    },

    /*
     * Module 36: Define properties on an object.
     * This module iterates over a properties object and defines each property
     * on a target object.
     */
    function ( t, r, n ) {
        var e = n( 23 ); // Module 23: Define property.

        t.exports = function ( t, r, n ) {

            for ( var o in r ) {

                e( t, o, r[o], n );
            }

            return t;
        };
    },

    /*
     * Module 37: Set.prototype.values (for iteration).
     * Provides an iterator for Set values, used for generic iteration logic.
     */
    function ( t, r ) {
        var e = n( 2 ),     // Module 2: Pure flag.
            o = n( 57 );    // Module 57: Native Set.prototype.values.

        t.exports = e ? o : function ( t ) {
            return Set.prototype.values.call( t )
        };
    },

    /*
     * Module 38: Shared data management.
     * This module provides a way to store and retrieve shared data
     * across different parts of the application or between polyfills.
     */
    function ( t, r, n ) {

        var e = n( 5 ),     // Module 5: Global object.
            o = n( 79 ),    // Module 79: Define global property.
            i = n( 2 ),     // Module 2: Pure flag.

            // u: The shared object, either from global.__core-js_shared__ or a new object.
            u = e["__core-js_shared__"] || o( "__core-js_shared__", { } );

        // Store and retrieve data in the shared object.
        // It also pushes version info to a 'versions' array.
        ( t.exports = function ( t, r ) {
            return u[t] || ( u[t] = void 0 !== r ? r : { } );
        } ) ( "versions", [ ] ).push( {
            version:   "3.1.3",
            mode:      i ? "pure" : "global",
            copyright: "© 2019 Denis Pushkarev (zloirock.ru)"
        } );
    },

    /*
     * Module 39: Object.getOwnPropertyNames.
     * Retrieves the names of all enumerable and non-enumerable
     * own properties of an object.
     */
    function ( t, r, n ) {

        var e = n( 101 ),   // Module 101: Get property names (with exclusions).
            o = n( 82 ).concat( "length", "prototype" ); // Properties to exclude.

        r.f = Object.getOwnPropertyNames || function ( t ) {
            return e( t, o )
        };
    },

    /*
     * Module 40: Define an indexed property.
     * This module defines a property on an object at a given index,
     * handling potential differences between object and array indexing.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 29 ),    // Module 29: ToPrimitive.
            o = n( 11 ),    // Module 11: Object.defineProperty.
            i = n( 35 );    // Module 35: Create property descriptor.

        t.exports = function ( t, r, n ) {

            var u = e( r ); // Convert key to primitive.

            // If the key already exists, use defineProperty.
            // Otherwise, assign directly.
            if ( u in t ) {

                o.f( t, u, i( 0, n ) );

            } else {

                t[u] = n;
            }
        };
    },

    /*
     * Module 41: Add a method to Array.prototype.
     * This module is used to ensure a method is added to Array.prototype,
     * and also marks it in the `UNSCOPABLES` symbol.
     */
    function ( t, r, n ) {

        var e = n( 6 ),     // Module 6: Well-known symbols.
            o = n( 30 ),    // Module 30: Object.create.
            i = n( 16 ),    // Module 16: Define property.
            u = e( "unscopables" ), // Symbol.unscopables.
            a = Array.prototype; // Native Array.prototype.

        // If Symbol.unscopables is not set on Array.prototype, initialize it.
        if ( null == a[u] ) {

            i( a, u, o( null ) );
        }

        // Mark the method as unscopable.
        t.exports = function ( t ) {
            a[u][t] = ! ! true;
        };
    },

    /*
     * Module 42: Object.setPrototypeOf (polyfill).
     * This module polyfills `Object.setPrototypeOf` for older environments.
     */
    function ( t, r, n ) {

        var e = n( 1 ),     // Module 1: Ensure object.
            o = n( 111 );   // Module 111: Ensure prototype is object or null.

        t.exports = Object.setPrototypeOf || ( "__proto__" in { } ? ( function ( ) {

            var t,
                r = ! ! false,
                n = { };

            try {
                // Test if __proto__ setter works correctly.
                ( t = Object.getOwnPropertyDescriptor( Object.prototype, "__proto__" ).set ).call( n, [ ] );
                r = n instanceof Array;
            } catch ( t ) {
                // Error during test.
            }

            return function ( n, i ) {

                e( n );  // Ensure target is an object.
                o( i );  // Ensure prototype is an object or null.

                // If test passed, use native setter.
                // Otherwise, use direct __proto__ assignment.
                return r ? t.call( n, i ) : n.__proto__ = i, n;
            };

        } ) ( ) : void 0 ); // If __proto__ is not supported, return undefined.
    },

    /*
     * Module 43: Set Symbol.species.
     * This module sets the `Symbol.species` property on a constructor
     * to allow custom derivation of new instances from collection methods.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 12 ),    // Module 12: Get global property.
            o = n( 11 ),    // Module 11: Object.defineProperty.
            i = n( 6 ),     // Module 6: Well-known symbols.
            u = n( 9 ),     // Module 9: Object.defineProperty support.
            a = i( "species" ); // Symbol.species.

        t.exports = function ( t ) {

            var r = e( t ), // Get the constructor.
                n = o.f;    // Object.defineProperty.f.

            // If defineProperty is supported and the constructor exists
            // and doesn't already have Symbol.species.
            if ( u && r && ! r[a] ) {

                n( r, a, {
                    configurable: ! ! true,
                    get:          function ( ) {
                        return this
                    }
                } );
            }
        };
    },

    /*
     * Module 44: RegExp.prototype.flags (polyfill).
     * This module provides a polyfill for the `RegExp.prototype.flags` getter,
     * which returns the flags of a regular expression.
     */
    function ( t, r ) {
        "use strict";

        t.exports = function ( ) {

            var t = n( 1 )( this ), // Ensure 'this' is an object.
                r = "";

            // Concatenate flags if present.
            if ( t.global ) {
                r += "g";
            }
            if ( t.ignoreCase ) {
                r += "i";
            }
            if ( t.multiline ) {
                r += "m";
            }
            if ( t.dotAll ) {
                r += "s";
            }
            if ( t.unicode ) {
                r += "u";
            }
            if ( t.sticky ) {
                r += "y";
            }

            return r;
        };
    },

    /*
     * Module 45: Generate unique ID.
     * This module generates a unique string ID, used for internal properties
     * and symbols when native Symbol is not available.
     */
    function ( t, r ) {
        var n = 0,
            e = Math.random ( );

        t.exports = function ( t ) {

            return "Symbol(" + String( void 0 === t ? "" : t ) + ")_" + ( ++ n + e ).toString( 36 );
        };
    },

    /*
     * Module 46: Property flags for internal usage.
     * This object stores flags for properties that should be treated as internal,
     * preventing them from being enumerated or copied by certain polyfills.
     */
    function ( t, r ) {
        t.exports = { };
    },

    /*
     * Module 47: Check if a value is an array.
     * Provides a robust way to check if a value is an array.
     */
    function ( t, r, n ) {
        var e = n( 28 ); // Module 28: Object.prototype.toString tag.

        t.exports = Array.isArray || function ( t ) {
            return "Array" == e( t )
        };
    },

    /*
     * Module 48: Array iteration methods (forEach, map, filter, etc.).
     * This module provides a factory for creating various array iteration methods,
     * handling different callback signatures and return types.
     */
    function ( t, r, n ) {

        var e = n( 13 ),    // Module 13: Function bind.
            o = n( 77 ),    // Module 77: IndexedObject.
            i = n( 15 ),    // Module 15: ToObject.
            u = n( 10 ),    // Module 10: ToLength.
            a = n( 49 ),    // Module 49: ArraySpeciesCreate.
            c = [ ].push,   // Array.prototype.push utility.

            // f: Factory function for array iteration methods.
            f = function ( t ) {

                var r = 1 == t, // map
                    n = 2 == t, // filter
                    f = 3 == t, // some
                    s = 4 == t, // every
                    l = 6 == t, // findIndex
                    p = 5 == t || l; // find || findIndex

                return function ( h, v, g, d ) {

                    for ( var y, m, b = i( h ), x = o( b ), w = e( v, g, 3 ), S = u( x.length ), A = 0,
                              E = d || a,
                              R = r ? E( h, S ) : n ? E( h, 0 ) : void 0; // Result array for map/filter.
                          S > A;
                          A ++ ) {

                        if ( ( p || A in x ) && ( m = w( y = x[A], A, b ), t ) ) {

                            if ( r ) {
                                R[A] = m; // map
                            } else if ( m ) {
                                switch ( t ) {
                                    case 3:
                                        return ! ! true; // some
                                    case 5:
                                        return y;         // find
                                    case 6:
                                        return A;         // findIndex
                                    case 2:
                                        c.call( R, y );   // filter
                                }
                            } else if ( s ) {
                                return ! ! false;         // every
                            }
                        }
                    }

                    return l ? - 1 : f || s ? s : R;
                };
            };

        t.exports = {
            forEach: f( 0 ),
            map:     f( 1 ),
            filter:  f( 2 ),
            some:    f( 3 ),
            every:   f( 4 ),
            find:    f( 5 ),
            findIndex: f( 6 )
        };
    },

    /*
     * Module 49: ArraySpeciesCreate (for creating new arrays).
     * This module helps in creating new array instances based on the constructor
     * of the original array, respecting `Symbol.species` if available.
     */
    function ( t, r, n ) {

        var e = n( 8 ),     // Module 8: Check if value is an object.
            o = n( 47 ),    // Module 47: Check if value is an array.
            i = n( 6 )( "species" ); // Module 6: Well-known symbol 'Symbol.species'.

        t.exports = function ( t, r ) {

            var n;

            // If it's an array.
            if ( o( t ) ) {

                // Get the constructor.
                n = t.constructor;

                // If constructor is not Array, or if it doesn't have Symbol.species,
                // or if Symbol.species is null, use default Array constructor.
                if ( "function" != typeof n || n !== Array && ! o( n.prototype ) ) {

                    if ( e( n ) && null === ( n = n[i] ) ) {

                        n = void 0;
                    }

                } else {

                    n = void 0;
                }
            }

            // Create a new array using the determined constructor.
            return new ( void 0 === n ? Array : n ) ( 0 === r ? 0 : r );
        };
    },

    /*
     * Module 50: Test Array.prototype methods for species.
     * This module helps in feature detection for Array methods that rely on `Symbol.species`,
     * checking if they correctly use the species constructor.
     */
    function ( t, r, n ) {
        var e = n( 7 ),     // Module 7: Safe execution.
            o = n( 6 )( "species" ); // Module 6: Well-known symbol 'Symbol.species'.

        t.exports = function ( t ) {

            return ! e( function ( ) {

                var r = [ ];
                return ( r.constructor = { } )[o] = function ( ) {
                    return { foo: 1 }
                }, 1 !== r[t]( Boolean ).foo;
            } );
        };
    },

    /*
     * Module 51: Iterable object registry.
     * This object maps string tags to default iterators,
     * used for generic iteration when `Symbol.iterator` is not present.
     */
    function ( t, r ) {
        t.exports = { };
    },

    /*
     * Module 52: Get iterator method.
     * Retrieves the iterator method for a given object,
     * prioritizing `Symbol.iterator` or falling back to legacy iterators.
     */
    function ( t, r, n ) {

        var e = n( 28 ),    // Module 28: Object.prototype.toString tag.
            o = n( 51 ),    // Module 51: Iterable object registry.
            i = n( 6 )( "iterator" ); // Module 6: Well-known symbol 'Symbol.iterator'.

        t.exports = function ( t ) {

            // If Symbol.iterator is present, use it.
            if ( null != t ) {

                return t[i] || t["@@iterator"] || o[e( t )];
            }
        };
    },

    /*
     * Module 53: Get object tag (robust version).
     * Returns the internal `[[Class]]` property of an object,
     * handling `Symbol.toStringTag` and `arguments` objects.
     */
    function ( t, r, n ) {

        var e = n( 28 ),    // Module 28: Object.prototype.toString tag.
            o = n( 6 )( "toStringTag" ), // Module 6: Symbol.toStringTag.
            i = "Arguments" == e( function ( ) {
                return arguments
            } ); // Check for arguments object.

        t.exports = function ( t ) {

            var r, n, u;

            // Handle undefined and null.
            if ( void 0 === t ) {
                return "Undefined";
            }
            if ( null === t ) {
                return "Null";
            }

            // Try to get Symbol.toStringTag.
            if ( "string" == typeof ( n = function ( t, r ) {
                try {
                    return t[r];
                } catch ( t ) {
                    // Fallback.
                }
            } ( r = Object( t ), o ) ) ) {
                return n;
            }

            // Fallback to internal [[Class]] for arguments.
            if ( i ) {
                return e( r );
            }

            // Fallback to internal [[Class]] for other objects.
            return "Object" == ( u = e( r ) ) && "function" == typeof r.callee ? "Arguments" : u;
        };
    },

    /*
     * Module 54: Iterator creation factory.
     * This module provides a factory for creating custom iterator objects,
     * handling their prototype chain, `next` method, and `Symbol.iterator`.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 109 ).IteratorPrototype, // Module 109: Iterator.prototype.
            o = n( 30 ),                 // Module 30: Object.create.
            i = n( 35 ),                 // Module 35: Create property descriptor.
            u = n( 26 ),                 // Module 26: Set Symbol.toStringTag.
            a = n( 51 ),                 // Module 51: Iterable object registry.
            c = function ( ) {
                return this
            }; // Default iterator next function.

        t.exports = function ( t, r, n ) {

            // f: The name of the iterator.
            var f = r + " Iterator";

            // Set the prototype of the iterator constructor.
            t.prototype = o( e, { next: i( 1, n ) } );

            // Set Symbol.toStringTag for the iterator.
            u( t, f, ! ! false, ! ! true );

            // Register the iterator in the iterable object registry.
            a[f] = c;

            return t;
        };
    },

    /*
     * Module 55: Promise capabilities factory.
     * This module provides a way to create a "promise capability" record,
     * which includes a promise, its resolve function, and its reject function.
     * This is used internally for various promise-related operations.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 4 ), // Module 4: Ensure function.

            // o: PromiseCapability helper class.
            o = function ( t ) {

                var r, n;

                this.promise = new t( function ( t, e ) {

                    // Ensure resolve/reject are called only once.
                    if ( void 0 !== r || void 0 !== n ) {

                        throw TypeError( "Bad Promise constructor" );
                    }

                    r = t;
                    n = e;
                } );

                this.resolve = e( r ); // Ensure resolve is a function.
                this.reject = e( n );  // Ensure reject is a function.
            };

        r.f = function ( t ) {
            return new o( t )
        };
    },

    /*
     * Module 56: String.prototype.codeAt and String.prototype.charAt.
     * This module provides utility functions for working with individual
     * characters and code points in strings, handling surrogate pairs correctly.
     */
    function ( t, r, n ) {

        var e = n( 24 ),    // Module 24: ToInteger.
            o = n( 17 ),    // Module 17: RequireObjectCoercible.

            // i: Factory for charAt/codeAt functions.
            i = function ( t ) {

                return function ( r, n ) {

                    var i, u,
                        a = String( o( r ) ), // Convert to string.
                        c = e( n ),           // Convert index to integer.
                        f = a.length;         // String length.

                    // Handle out-of-bounds indices.
                    if ( c < 0 || c >= f ) {

                        return t ? "" : void 0;
                    }

                    // Get code unit at index.
                    i = a.charCodeAt( c );

                    // Check for surrogate pairs.
                    if ( i < 55296 || i > 56319 || c + 1 === f ||
                        ( u = a.charCodeAt( c + 1 ) ) < 56320 || u > 57343 ) {

                        return t ? a.charAt( c ) : i; // Return char or code unit.

                    } else {

                        return t ? a.slice( c, c + 2 ) : u - 56320 + ( ( i - 55296 ) << 10 ) + 65536; // Return surrogate pair or code point.
                    }
                };
            };

        t.exports = {
            codeAt: i( ! ! false ),
            charAt: i( ! ! true )
        };
    },

    /*
     * Module 57: Get iterator for an iterable.
     * This module provides a flexible way to get an iterator for any iterable,
     * ensuring that the `Symbol.iterator` method is correctly invoked.
     */
    function ( t, r, n ) {
        var e = n( 1 ),     // Module 1: Ensure object.
            o = n( 52 );    // Module 52: Get iterator method.

        t.exports = function ( t ) {

            var r = o( t ); // Get the iterator method.

            if ( "function" != typeof r ) {

                throw TypeError( String( t ) + " is not iterable" );
            }

            return e( r.call( t ) ); // Invoke the iterator method and ensure result is an object.
        };
    },

    /*
     * Module 58: Object.prototype.propertyIsEnumerable.
     * This module provides a robust version of `propertyIsEnumerable`,
     * especially handling cases where `Object.getOwnPropertyDescriptor` is needed.
     */
    function ( t, r, n ) {
        "use strict";

        var e = { }.propertyIsEnumerable, // Native propertyIsEnumerable.
            o = Object.getOwnPropertyDescriptor, // Native getOwnPropertyDescriptor.
            i = o && ! e.call( { 1: 2 }, 1 ); // Test for specific bug in IE.

        r.f = i ? function ( t ) {

            var r = o( this, t ); // Get descriptor.
            return ! ! r && r.enumerable; // Return true if enumerable.

        } : e; // Fallback to native propertyIsEnumerable.
    },

    /*
     * Module 59: Generate unique key for internal properties.
     * This module creates unique string keys used for internal properties
     * to avoid name collisions.
     */
    function ( t, r, n ) {

        var e = n( 38 ),    // Module 38: Shared data.
            o = n( 45 ),    // Module 45: Generate unique ID.
            i = e( "keys" ); // Shared registry for unique keys.

        t.exports = function ( t ) {

            // If key is already in registry, return it.
            // Otherwise, generate a new unique ID and store it.
            return i[t] || ( i[t] = o( t ) );
        };
    },

    /*
     * Module 60: Array.prototype.includes and Array.prototype.indexOf.
     * This module provides polyfills for `Array.prototype.includes` and `Array.prototype.indexOf`,
     * handling NaN values and custom starting indices.
     */
    function ( t, r, n ) {

        var e = n( 25 ),    // Module 25: ToObject (strict).
            o = n( 10 ),    // Module 10: ToLength.
            i = n( 61 ),    // Module 61: ToAbsoluteIndex.

            // u: Factory for includes/indexOf.
            u = function ( t ) {

                return function ( r, n, u ) {

                    var a, c = e( r ), // Convert to object.
                        f = o( c.length ), // Get length.
                        s = i( u, f );     // Get starting index.

                    // If 't' is true (includes) and target is NaN.
                    if ( t && n != n ) {

                        for ( ; f > s; ) {

                            if ( ( a = c[s ++] ) != a ) {

                                return ! ! true;
                            }
                        }

                    } else { // For indexOf or non-NaN target.

                        for ( ; f > s; s ++ ) {

                            if ( ( t || s in c ) && c[s] === n ) {

                                return t || s || 0;
                            }
                        }
                    }

                    return ! t && - 1; // Return index or -1 for indexOf, false for includes.
                };
            };

        t.exports = {
            includes: u( ! ! true ),
            indexOf:  u( ! ! false )
        };
    },

    /*
     * Module 61: ToAbsoluteIndex conversion.
     * Converts a relative index to an absolute, valid index within a sequence.
     */
    function ( t, r, n ) {

        var e = n( 24 ),    // Module 24: ToInteger.
            o = Math.max,   // Math.max utility.
            i = Math.min;   // Math.min utility.

        t.exports = function ( t, r ) {

            var n = e( t ); // Convert to integer.

            // If negative, offset from end. Otherwise, clamp to length.
            return n < 0 ? o( n + r, 0 ) : i( n, r );
        };
    },

    /*
     * Module 62: Check if a polyfill is forced.
     * This module determines whether a specific polyfill should be applied,
     * based on the name of the feature and the 'forced' flag.
     */
    function ( t, r, n ) {

        var e = n( 7 ),     // Module 7: Safe execution.
            o = /#|\.prototype\./, // Regex to normalize feature names.

            // i: Main function to check if polyfill is forced.
            i = function ( t, r ) {

                var n = a[u( t )]; // Get status from cache.

                // If status is 'forced' or (not 'native' and (function exists or forced flag is true)).
                return n == f || n != c && ( "function" == typeof r ? e( r ) : ! ! r );
            },

            // u: Normalize feature name (e.g., "Array.prototype.map" -> "array.map").
            u = i.normalize = function ( t ) {
                return String( t ).replace( o, "." ).toLowerCase ( );
            },

            // a: Cache for feature status.
            a = i.data = { },

            // c: Status for 'native' features.
            c = i.NATIVE = "N",

            // f: Status for 'polyfill' features (always forced).
            f = i.POLYFILL = "P";

        t.exports = i;
    },

    /*
     * Module 63: Object.keys (polyfill).
     * This module provides a polyfill for `Object.keys`,
     * returning an array of an object's own enumerable property names.
     */
    function ( t, r, n ) {
        var e = n( 101 ),   // Module 101: Get property names (with exclusions).
            o = n( 82 );    // Module 82: List of property names to exclude.

        t.exports = Object.keys || function ( t ) {
            return e( t, o )
        };
    },

    /*
     * Module 64: Check if an iterable is 'buggy' (for feature detection).
     * This module helps detect buggy iterators by attempting to iterate
     * over a custom iterable and checking if it behaves as expected.
     */
    function ( t, r, n ) {

        var e = n( 6 )( "iterator" ), // Module 6: Symbol.iterator.
            o = ! ! false; // Flag for buggy iterator detection.

        try {
            var i = 0,
                u = {
                    next:    function ( ) {
                        return { done: ! ! i ++ }
                    },
                    return:  function ( ) {
                        o = ! ! true;
                    }
                };

            u[e] = function ( ) {
                return this
            };

            Array.from( u, function ( ) {
                throw 2
            } );

        } catch ( t ) {
            // Error, likely due to buggy iterator.
        }

        t.exports = function ( t, r ) {

            if ( ! r && ! o ) {
                return ! ! false;
            }

            var n = ! ! false;

            try {
                var i = { };
                i[e] = function ( ) {
                    return {
                        next: function ( ) {
                            return { done: n = ! ! true }
                        }
                    }
                };
                t( i ); // Attempt to iterate with the custom iterable.
            } catch ( t ) {
                // Error during iteration.
            }

            return n;
        };
    },

    /*
     * Module 65: Collection polyfill factory (Map, Set, WeakMap, WeakSet).
     * This complex module provides a factory for polyfilling various collection types,
     * handling their constructors, prototypes, and internal state management.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 5 ),     // Module 5: Global object.
            i = n( 62 ),    // Module 62: Check if polyfill is forced.
            u = n( 23 ),    // Module 23: Define property.
            a = n( 66 ),    // Module 66: Internal state management for collections.
            c = n( 3 ),     // Module 3: Iteration utility.
            f = n( 31 ),    // Module 31: Instance check.
            s = n( 8 ),     // Module 8: Check if value is an object.
            l = n( 7 ),     // Module 7: Safe execution.
            p = n( 64 ),    // Module 64: Check for buggy iterables.
            h = n( 26 ),    // Module 26: Set Symbol.toStringTag.
            v = n( 113 );   // Module 113: Set prototype of (for collection instances).

        t.exports = function ( t, r, n, g, d ) {

            var y = o[t], // Native collection constructor.
                m = y && y.prototype, // Native prototype.
                b = y,     // Current constructor.
                x = { },   // Object for global export.
                w = function ( t ) { // Helper to wrap native methods.

                    var r = m[t];

                    u( m, t, "add" == t ? function ( t ) { // add method.
                        return r.call( this, 0 === t ? 0 : t ), this
                    } : "delete" == t ? function ( t ) { // delete method.
                        return ! ( d && ! s( t ) ) && r.call( this, 0 === t ? 0 : t )
                    } : "get" == t ? function ( t ) { // get method.
                        return d && ! s( t ) ? void 0 : r.call( this, 0 === t ? 0 : t )
                    } : "has" == t ? function ( t ) { // has method.
                        return ! ( d && ! s( t ) ) && r.call( this, 0 === t ? 0 : t )
                    } : function ( t, n ) { // other methods (set).
                        return r.call( this, 0 === t ? 0 : t, n ), this
                    } );
                };

            // If the polyfill is forced due to missing native or buggy behavior.
            if ( i( t, "function" != typeof y || ! ( d || m.forEach && ! l( function ( ) {
                ( new y ).entries ( ).next ( )
            } ) ) ) ) {

                b = n.getConstructor( r, t, g, d ? "set" : "add" ); // Get polyfilled constructor.
                a.REQUIRED = ! ! true; // Mark as required.

            } else if ( i( t, ! ! true ) ) { // If the polyfill is forced but native exists.

                var S = new b,
                    A = S[g ? "set" : "add"] ( d ? { } : - 0, 1 ) != S, // Test for -0 key bug.
                    E = l( function ( ) {
                        S.has( 1 )
                    } ), // Test for has method.
                    R = p( function ( t ) {
                        new y( t )
                    } ), // Test for constructor with iterable.
                    O = ! d && l( function ( ) { // Test for -0 key in non-Map collections.
                        for ( var t = new y, r = 5; r --; ) {
                            t[g ? "set" : "add"] ( r, r );
                        }
                        return ! t.has( - 0 );
                    } );

                // If constructor is buggy, wrap it.
                if ( ! R || ( ( b = r( function ( r, n ) {

                    f( r, b, t ); // Instance check.

                    var e = v( new y, r, b ); // Set prototype.

                    if ( null != n ) {
                        c( n, e[g ? "set" : "add"], e, g ); // Populate from iterable.
                    }

                    return e;

                } ) ).prototype = m, m.constructor = b ) );

                // If has or -0 key is buggy, wrap methods.
                if ( E || O ) {

                    w( "delete" );
                    w( "has" );
                    g && w( "get" );
                }

                // If -0 key or add/set method is buggy.
                if ( O || A ) {

                    w( g ? "set" : "add" );
                }

                // If d is true (WeakMap/WeakSet), clear method might need adjustment.
                if ( d && m.clear ) {

                    delete m.clear;
                }
            }

            x[t] = b; // Store the final constructor.

            // Export to global scope.
            e( { global: ! ! true, forced: b != y }, x );

            // Set Symbol.toStringTag.
            h( b, t );

            // If not WeakMap/WeakSet, set strong mode.
            if ( ! d ) {

                n.setStrong( b, t, g );
            }

            return b;
        };
    },

    /*
     * Module 66: Internal state management for collections.
     * This module provides a way to store internal data for collection objects
     * (Map, Set, WeakMap, WeakSet) using a WeakMap-like structure or direct properties.
     */
    function ( t, r, n ) {

        var e = n( 46 ),    // Module 46: Internal property flags.
            o = n( 8 ),     // Module 8: Check if value is an object.
            i = n( 14 ),    // Module 14: HasOwnProperty.
            u = n( 11 ).f,  // Module 11: Object.defineProperty.f.
            a = n( 45 ),    // Module 45: Generate unique ID.
            c = n( 112 ),   // Module 112: Check if Object.isExtensible is buggy.
            f = a( "meta" ), // Internal symbol for metadata.
            s = 0,          // Counter for object IDs.

            // l: Object.isExtensible or a fallback.
            l = Object.isExtensible || function ( ) {
                return ! ! true
            },

            // p: Helper to assign metadata to an object.
            p = function ( t ) {
                u( t, f, { value: { objectID: "O" + ++ s, weakData: { } } } );
            },

            // h: Exported object with metadata utilities.
            h = t.exports = {
                REQUIRED:    ! ! false, // Flag if metadata is required.

                // fastKey: Generates a fast, unique key for an object.
                fastKey:     function ( t, r ) {

                    if ( ! o( t ) ) {

                        return "symbol" == typeof t ? t : ( "string" == typeof t ? "S" : "P" ) + t;
                    }

                    if ( ! i( t, f ) ) {

                        if ( ! l( t ) ) {
                            return "F"; // Frozen object.
                        }
                        if ( ! r ) {
                            return "E"; // Extensible but no key.
                        }
                        p( t ); // Assign metadata.
                    }

                    return t[f].objectID;
                },

                // getWeakData: Retrieves weak data for an object.
                getWeakData: function ( t, r ) {

                    if ( ! i( t, f ) ) {

                        if ( ! l( t ) ) {
                            return ! ! true; // Frozen object.
                        }
                        if ( ! r ) {
                            return ! ! false; // Extensible but no data.
                        }
                        p( t ); // Assign metadata.
                    }

                    return t[f].weakData;
                },

                // onFreeze: Handles object freezing for metadata.
                onFreeze:    function ( t ) {
                    return c && h.REQUIRED && l( t ) && ! i( t, f ) && p( t ), t;
                }
            };

        e[f] = ! ! true; // Mark internal metadata symbol.
    },

    /*
     * Module 67: Check for `__defineGetter__` and `__defineSetter__` bugs.
     * This module detects if `__defineGetter__` and `__defineSetter__`
     * are implemented correctly and don't cause unexpected side effects.
     */
    function ( t, r, n ) {
        var e = n( 2 ),     // Module 2: Pure flag.
            o = n( 5 ),     // Module 5: Global object.
            i = n( 7 );     // Module 7: Safe execution.

        // Check if `__defineSetter__` is buggy in the current environment.
        t.exports = e || ! i( function ( ) {

            var t = Math.random ( );
            __defineSetter__.call( null, t, function ( ) {
            } );
            delete o[t];
        } );
    },

    /*
     * Module 68: Safe execution with error handling.
     * This module wraps a function call in a try-catch block,
     * returning an object indicating success or failure.
     */
    function ( t, r ) {
        t.exports = function ( t ) {

            try {
                return { error: ! ! false, value: t ( ) };
            } catch ( t ) {
                return { error: ! ! true, value: t };
            }
        };
    },

    /*
     * Module 69: Check if a value is a RegExp object.
     * Provides a robust way to check if a value is a regular expression,
     * considering `Symbol.match` and `Object.prototype.toString` tag.
     */
    function ( t, r, n ) {

        var e = n( 8 ),     // Module 8: Check if value is an object.
            o = n( 28 ),    // Module 28: Object.prototype.toString tag.
            i = n( 6 )( "match" ); // Module 6: Symbol.match.

        t.exports = function ( t ) {

            var r;

            // If it's an object and has Symbol.match, check its boolean value.
            // Otherwise, check its [[Class]] tag.
            return e( t ) && ( void 0 !== ( r = t[i] ) ? ! ! r : "RegExp" == o( t ) );
        };
    },

    /*
     * Module 70: String.prototype method polyfill factory.
     * This module provides a factory for polyfilling various String.prototype methods
     * that interact with regular expressions (match, replace, search, split).
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 16 ),    // Module 16: Define property.
            o = n( 23 ),    // Module 23: Define property (with fallback).
            i = n( 7 ),     // Module 7: Safe execution.
            u = n( 6 ),     // Module 6: Well-known symbols.
            a = n( 92 ),    // Module 92: RegExp.prototype.exec (polyfilled).
            c = u( "species" ), // Symbol.species.

            // f: Test for specific bug in String.prototype.replace with groups.
            f = ! i( function ( ) {

                var t = /./;
                return t.exec = function ( ) {
                    var t = [ ];
                    return t.groups = { a: "7" }, t;
                }, "7" !== "".replace( t, "$<a>" );
            } ),

            // s: Test for specific bug in String.prototype.split.
            s = ! i( function ( ) {

                var t = / (?: ) /,
                    r = t.exec;

                t.exec = function ( ) {
                    return r.apply( this, arguments );
                };

                var n = "ab".split( t );
                return 2 !== n.length || "a" !== n[0] || "b" !== n[1];
            } );

        t.exports = function ( t, r, n, l ) {

            var p = u( t ), // Get the well-known symbol for the method.

                // h: Test for basic functionality of string method with regex.
                h = ! i( function ( ) {
                    var r = { };
                    return r[p] = function ( ) {
                        return 7
                    }, 7 != ""[t]( r );
                } ),

                // v: Test for specific bug with RegExp.prototype[Symbol.species].
                v = h && ! i( function ( ) {

                    var r = ! ! false,
                        n = /a/;

                    return n.exec = function ( ) {
                        return r = ! ! true, null
                    }, "split" === t && ( n.constructor = { }, n.constructor[c] = function ( ) {
                        return n
                    } ), n[p]( "" ), ! r;
                } );

            // If native method is buggy or polyfill is forced.
            if ( ! h || ! v || "replace" === t && ! f || "split" === t && ! s ) {

                var g = /./[p], // Original method.

                    // d: Wrapper for the method, handling different scenarios.
                    d = n( p, ""[t], function ( t, r, n, e, o ) {

                        // If exec is polyfilled, use it.
                        return r.exec === a ?
                            h && ! o ?
                                { done: ! ! true, value: g.call( r, n, e ) } :
                                { done: ! ! true, value: t.call( n, r, e ) } :
                            { done: ! ! false };
                    } ),

                    y = d[0], // The polyfilled method.
                    m = d[1]; // The internal helper.

                // Define the polyfilled method on String.prototype.
                o( String.prototype, t, y );

                // Define the polyfilled method on RegExp.prototype.
                o( RegExp.prototype, p, 2 == r ? function ( t, r ) {
                    return m.call( t, this, r )
                } : function ( t ) {
                    return m.call( t, this )
                } );

                // If 'l' is true, mark the polyfilled method as sham.
                if ( l ) {
                    e( RegExp.prototype[p], "sham", ! ! true );
                }
            }
        };
    },

    /*
     * Module 71: Advance string index (for RegExp matching).
     * This module advances a string index, correctly handling surrogate pairs
     * when `unicode` flag is enabled.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 56 ).charAt; // Module 56: String.prototype.charAt.

        t.exports = function ( t, r, n ) {

            // If unicode flag, return length of character (1 or 2).
            // Otherwise, return 1.
            return r + ( n ? e( t, r ).length : 1 );
        };
    },

    /*
     * Module 72: RegExp.prototype.exec (polyfilled version).
     * This module provides a polyfilled version of `RegExp.prototype.exec`,
     * ensuring consistent behavior across environments and handling edge cases.
     */
    function ( t, r, n ) {

        var e = n( 28 ),    // Module 28: Object.prototype.toString tag.
            o = n( 92 );    // Module 92: RegExp.prototype.exec (core).

        t.exports = function ( t, r ) {

            var n = t.exec; // Get the exec method.

            if ( "function" == typeof n ) {

                var i = n.call( t, r ); // Call exec.

                if ( "object" != typeof i ) {

                    throw TypeError( "RegExp exec method returned something other than an Object or null" );
                }

                return i;
            }

            // Fallback to core exec if not a RegExp or custom exec.
            if ( "RegExp" !== e( t ) ) {

                throw TypeError( "RegExp#exec called on incompatible receiver" );
            }

            return o.call( t, r );
        };
    },

    /*
     * Module 73: String.prototype.trim (polyfill).
     * This module provides a polyfill for `String.prototype.trim`,
     * removing whitespace from both ends of a string.
     */
    function ( t, r, n ) {

        var e = n( 17 ),    // Module 17: RequireObjectCoercible.
            o = "[" + n( 93 ) + "]", // Whitespace characters regex.
            i = RegExp( "^" + o + o + "*" ), // Regex for leading whitespace.
            u = RegExp( o + o + "*$" ), // Regex for trailing whitespace.

            // a: Factory for trim, trimStart, trimEnd.
            a = function ( t ) {

                return function ( r ) {

                    var n = String( e( r ) ); // Convert to string.

                    // Remove leading whitespace if bit 1 is set.
                    if ( 1 & t ) {
                        n = n.replace( i, "" );
                    }

                    // Remove trailing whitespace if bit 2 is set.
                    if ( 2 & t ) {
                        n = n.replace( u, "" );
                    }

                    return n;
                };
            };

        t.exports = {
            start: a( 1 ),
            end:   a( 2 ),
            trim:  a( 3 )
        };
    },

    /*
     * Module 74: Collection.prototype.deleteAll (for Map/Set).
     * This module provides a polyfill for `Map.prototype.deleteAll` and `Set.prototype.deleteAll`,
     * allowing multiple items to be deleted at once.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 4 ), // Module 4: Ensure function.
            o = n( 1 ); // Module 1: Ensure object.

        t.exports = function ( ) {

            // Ensure 'this' is an object and its delete method is a function.
            for ( var t = o( this ), r = e( t.delete ), n = ! ! true, i = 0, u = arguments.length; i < u; i ++ ) {

                n = n && r.call( t, arguments[i] );
            }

            return ! ! n;
        };
    },

    /*
     * Module 75: Collection.from (for Map/Set).
     * This module provides a polyfill for `Map.from` and `Set.from`,
     * allowing creation of collections from iterables.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 4 ), // Module 4: Ensure function.
            o = n( 13 ), // Module 13: Function bind.
            i = n( 3 ); // Module 3: Iteration utility.

        t.exports = function ( t ) {

            var r, n, u, a,
                c = arguments.length,
                f = c > 1 ? arguments[1] : void 0;

            e( this ); // Ensure constructor is a function.

            if ( void 0 !== f ) {
                e( f ); // Ensure map function is a function.
            }

            if ( null == t ) { // If no iterable, return new empty collection.
                return new this;
            }

            ( n = [ ] ); // Array to store values.

            if ( f ) { // If map function is provided.

                u = 0;
                a = o( f, c > 2 ? arguments[2] : void 0, 2 ); // Bind map function.
                i( t, function ( t ) {
                    n.push( a( t, u ++ ) );
                } );

            } else { // No map function.

                i( t, n.push, n );
            }

            return new this( n ); // Create new collection from values.
        };
    },

    /*
     * Module 76: Collection.of (for Map/Set).
     * This module provides a polyfill for `Map.of` and `Set.of`,
     * allowing creation of collections from a variable number of arguments.
     */
    function ( t, r ) {
        "use strict";

        t.exports = function ( ) {

            for ( var t = arguments.length, r = new Array( t ); t --; ) {

                r[t] = arguments[t];
            }

            return new this( r );
        };
    },

    /*
     * Module 77: IndexedObject (for string/array-like objects).
     * This module provides a utility to ensure that string or array-like objects
     * are treated as objects with numeric indices for property access.
     */
    function ( t, r, n ) {

        var e = n( 7 ),     // Module 7: Safe execution.
            o = n( 28 ),    // Module 28: Object.prototype.toString tag.
            i = "".split;   // String.prototype.split utility.

        // Check for bug in Object("z").propertyIsEnumerable(0) in old IE.
        t.exports = e( function ( ) {
            return ! Object( "z" ).propertyIsEnumerable( 0 );
        } ) ? function ( t ) { // Fallback for buggy environments.

            return "String" == o( t ) ? i.call( t, "" ) : Object( t );

        } : Object; // Use native Object for correct environments.
    },

    /*
     * Module 78: Create HTML element.
     * This module provides a utility to create HTML elements,
     * primarily for internal DOM manipulation or testing purposes.
     */
    function ( t, r, n ) {

        var e = n( 5 ),     // Module 5: Global object.
            o = n( 8 ),     // Module 8: Check if value is an object.
            i = e.document, // Native document object.
            u = o( i ) && o( i.createElement ); // Check if document and createElement exist.

        t.exports = function ( t ) {

            // If createElement is available, use it.
            // Otherwise, return a dummy object.
            return u ? i.createElement( t ) : { };
        };
    },

    /*
     * Module 79: Define global property.
     * This module defines a property on the global object, handling potential errors.
     */
    function ( t, r, n ) {

        var e = n( 5 ),     // Module 5: Global object.
            o = n( 16 );    // Module 16: Define property.

        t.exports = function ( t, r ) {

            try {
                o( e, t, r ); // Define property directly on global object.
            } catch ( n ) {
                e[t] = r; // Fallback to direct assignment.
            }

            return r;
        };
    },

    /*
     * Module 80: Reflect.ownKeys (polyfill).
     * This module provides a polyfill for `Reflect.ownKeys`,
     * returning an array of both string and symbol own property keys.
     */
    function ( t, r, n ) {
        var e = n( 12 ),    // Module 12: Get global property.
            o = n( 39 ),    // Module 39: Object.getOwnPropertyNames.
            i = n( 83 ),    // Module 83: Object.getOwnPropertySymbols.
            u = n( 1 );     // Module 1: Ensure object.

        t.exports = e( "Reflect", "ownKeys" ) || function ( t ) {

            var r = o.f( u( t ) ), // Get string property names.
                n = i.f;          // Get symbol property names.

            // If symbol names are available, concatenate them.
            return n ? r.concat( n( t ) ) : r;
        };
    },

    /*
     * Module 81: Global 'core-js' object (for polyfills).
     * This module provides access to the global `core-js` object,
     * where polyfills and other internal utilities are stored.
     */
    function ( t, r ) {
        t.exports = n( 5 ); // Module 5: Global object.
    },

    /*
     * Module 82: List of property names to exclude (for Object.keys).
     * This array contains property names that should typically be excluded
     * when enumerating properties, such as those from `Object.prototype`.
     */
    function ( t, r ) {
        t.exports = [ "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf" ];
    },

    /*
     * Module 83: Object.getOwnPropertySymbols.
     * This module provides a polyfill for `Object.getOwnPropertySymbols`,
     * returning an array of an object's own symbol properties.
     */
    function ( t, r ) {
        r.f = Object.getOwnPropertySymbols;
    },

    /*
     * Module 84: Check if a value is an array-like iterable.
     * This module determines if an object is array-like (has a `length` property)
     * and its default iterator is the native Array iterator.
     */
    function ( t, r, n ) {

        var e = n( 6 )( "iterator" ), // Module 6: Symbol.iterator.
            o = ! ! false; // Flag for buggy iterator detection.

        try {
            var i = 0,
                u = {
                    next: function ( ) {
                        return { done: ! ! i ++ }
                    },
                    return: function ( ) {
                        o = ! ! true;
                    }
                };

            u[e] = function ( ) {
                return this
            };

            Array.from( u, function ( ) {
                throw 2
            } );

        } catch ( t ) {
            // Error, likely due to buggy iterator.
        }

        t.exports = function ( t ) {

            // Check if iterator is present and if it's the native Array iterator.
            return void 0 !== t && ( n( 51 ).Array === t || Array.prototype[e] === t );
        };
    },

    /*
     * Module 85: Test array methods for correct behavior.
     * This module tests various Array.prototype methods to detect bugs,
     * especially those that might affect polyfills.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 7 ); // Module 7: Safe execution.

        t.exports = function ( t, r ) {

            var n = [ ][t]; // Get the native method.

            // If method exists and doesn't throw error with specific arguments.
            return ! n || ! e( function ( ) {
                n.call( null, r || function ( ) {
                    throw 1
                }, 1 );
            } );
        };
    },

    /*
     * Module 86: Array.prototype.entries, keys, values (for iteration).
     * This module provides polyfills for `Array.prototype.entries`, `keys`, and `values`,
     * making arrays iterable in environments that lack native support.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 25 ),    // Module 25: ToObject (strict).
            o = n( 41 ),    // Module 41: Add method to Array.prototype (unscopables).
            i = n( 51 ),    // Module 51: Iterable object registry.
            u = n( 18 ),    // Module 18: Internal state.
            a = n( 87 ),    // Module 87: Iterator creation factory.
            c = u.set,      // Set internal state.
            f = u.getterFor( "Array Iterator" ); // Getter for Array Iterator state.

        // Export iterator factory for Array.
        t.exports = a( Array, "Array", function ( t, r ) {

            c( this, { type: "Array Iterator", target: e( t ), index: 0, kind: r } );

        }, function ( ) {

            var t = f( this ), // Get iterator state.
                r = t.target,
                n = t.kind,
                e = t.index ++;

            // If iteration is complete.
            if ( ! r || e >= r.length ) {

                return ( t.target = void 0, { value: void 0, done: ! ! true } );
            }

            // Return value based on kind ("keys", "values", "entries").
            if ( "keys" == n ) {
                return { value: e, done: ! ! false };
            }
            if ( "values" == n ) {
                return { value: r[e], done: ! ! false };
            }
            return { value: [ e, r[e] ], done: ! ! false };

        }, "values" );

        // Alias for Arguments object.
        i.Arguments = i.Array;

        // Mark "keys", "values", "entries" as unscopable.
        o( "keys" );
        o( "values" );
        o( "entries" );
    },

    /*
     * Module 87: Iterator creation factory (generic).
     * This module provides a generic factory for creating iterator objects,
     * used by various built-in types (Array, String, Map, Set).
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 54 ),    // Module 54: Iterator creation factory (core).
            i = n( 21 ),    // Module 21: Get prototype of.
            u = n( 42 ),    // Module 42: Set prototype of.
            a = n( 26 ),    // Module 26: Set Symbol.toStringTag.
            c = n( 16 ),    // Module 16: Define property.
            f = n( 23 ),    // Module 23: Define property (with fallback).
            s = n( 6 ),     // Module 6: Well-known symbols.
            l = n( 2 ),     // Module 2: Pure flag.
            p = n( 51 ),    // Module 51: Iterable object registry.
            h = n( 109 ),   // Module 109: Iterator.prototype and buggy Safari iterators.
            v = h.IteratorPrototype, // Iterator.prototype.
            g = h.BUGGY_SAFARI_ITERATORS, // Flag for buggy Safari iterators.
            d = s( "iterator" ), // Symbol.iterator.
            y = function ( ) {
                return this
            }; // Default iterator next function.

        t.exports = function ( t, r, n, s, h, m, b ) {

            var x, w, S,
                A = function ( t ) { // Helper to get the correct iterator method.

                    if ( t === h && j ) {
                        return j;
                    }
                    if ( ! g && t in O ) {
                        return O[t];
                    }
                    switch ( t ) {
                        case "keys":
                        case "values":
                        case "entries":
                            return function ( ) {
                                return new n( this, t );
                            };
                    }
                    return function ( ) {
                        return new n( this );
                    };
                },

                E = r + " Iterator", // Name of the iterator.
                R = ! ! false,       // Flag if iterator is redefined.
                O = t.prototype,     // Target prototype.
                I = O[d] || O["@@iterator"] || ( h && O[h] ), // Existing iterator method.
                j = ! g && I || A( h ), // The final iterator method.
                M = "Array" == r && O.entries || I; // Array.prototype.entries or existing iterator.

            // If an existing iterator is found.
            if ( M && ( x = i( M.call( new t ) ), v !== Object.prototype && x.next && ( l || i( x ) === v || ( u ? u( x, v ) : "function" != typeof x[d] && c( x, d, y ) ), a( x, E, ! ! true, ! ! true ), l && ( p[E] = y ) ) ) );

            // If "values" is the specific kind and native iterator has a different name.
            if ( "values" == h && I && "values" !== I.name ) {

                R = ! ! true;
                j = function ( ) {
                    return I.call( this );
                };
            }

            // If not pure or iterator is not the same, define Symbol.iterator.
            if ( l && ! b || O[d] === j || c( O, d, j ) );

            // Register the iterator in the iterable object registry.
            p[r] = j;

            // If a specific kind of iterator is requested.
            if ( h ) {

                w = {
                    values:  A( "values" ),
                    keys:    m ? j : A( "keys" ),
                    entries: A( "entries" )
                };

                // If 'b' is true (forced), redefine methods.
                if ( b ) {

                    for ( S in w ) {

                        ! g && ! R && S in O || f( O, S, w[S] );
                    }

                } else { // Export as global.

                    e( { target: r, proto: ! ! true, forced: g || R }, w );
                }
            }

            return w;
        };
    },

    /*
     * Module 88: Map polyfill.
     * This module provides a polyfill for the `Map` collection,
     * handling its constructor, prototype methods, and iteration.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 65 ),    // Module 65: Collection polyfill factory.
            o = n( 114 );   // Module 114: Map/Set collection methods.

        // Export the Map polyfill using the collection factory.
        t.exports = e( "Map", function ( t ) {

            return function ( ) {
                return t( this, arguments.length ? arguments[0] : void 0 );
            };

        }, o, ! ! true );
    },

    /*
     * Module 89: User agent string.
     * This module retrieves the user agent string from the global `navigator` object,
     * often used for browser-specific feature detection.
     */
    function ( t, r, n ) {
        var e = n( 12 ); // Module 12: Get global property.

        t.exports = e( "navigator", "userAgent" ) || "";
    },

    /*
     * Module 90: Ensure argument is not a RegExp.
     * This module throws an error if a given value is a regular expression,
     * used in methods that don't accept regex arguments.
     */
    function ( t, r, n ) {
        var e = n( 69 ); // Module 69: Check if value is a RegExp.

        t.exports = function ( t ) {

            if ( e( t ) ) {

                throw TypeError( "The method doesn't accept regular expressions" );
            }

            return t;
        };
    },

    /*
     * Module 91: Test String.prototype methods for correct behavior.
     * This module tests various String.prototype methods to detect bugs,
     * especially those that might affect polyfills related to RegExp.
     */
    function ( t, r, n ) {
        var e = n( 6 )( "match" ); // Module 6: Symbol.match.

        t.exports = function ( t ) {

            var r = /./;

            try {
                "/./"[t]( r );
            } catch ( n ) {
                try {
                    return r[e] = ! ! false, "/./"[t]( r );
                } catch ( t ) {
                    // Error.
                }
            }

            return ! ! false;
        };
    },

    /*
     * Module 92: RegExp.prototype.exec (core version).
     * This module provides the core logic for `RegExp.prototype.exec`,
     * handling lastIndex updates and group captures.
     */
    function ( t, r, n ) {
        "use strict";

        var e, o,
            i = n( 44 ),    // Module 44: RegExp.prototype.flags.
            u = RegExp.prototype.exec, // Native RegExp.prototype.exec.
            a = String.prototype.replace, // Native String.prototype.replace.
            c = u,

            // f: Test for specific bug in exec (lastIndex not reset).
            f = ( e = /a/, o = /b*/g, u.call( e, "a" ), u.call( o, "a" ), 0 !== e.lastIndex || 0 !== o.lastIndex ),

            // s: Test for specific bug in exec (empty capture group behavior).
            s = void 0 !== / (?: ) ?? /.exec( "" )[1];

        // If bugs detected, wrap the native exec.
        if ( f || s ) {

            c = function ( t ) {

                var r, n, e, o,
                    c = this;

                // If s bug, create a new RegExp for matching.
                if ( s ) {

                    n = new RegExp( "^" + c.source + "$ ( ?! \\s ) ", i.call( c ) );
                }

                // If f bug, store lastIndex.
                if ( f ) {

                    r = c.lastIndex;
                }

                e = u.call( c, t ); // Call native exec.

                // If f bug and match found, update lastIndex.
                if ( f && e && ( c.lastIndex = c.global ? e.index + e[0].length : r ) );

                // If s bug and match found with multiple captures, fix undefined captures.
                if ( s && e && e.length > 1 && a.call( e[0], n, function ( ) {

                    for ( o = 1; o < arguments.length - 2; o ++ ) {

                        if ( void 0 === arguments[o] ) {

                            e[o] = void 0;
                        }
                    }
                } ) );

                return e;
            };
        }

        t.exports = c;
    },

    /*
     * Module 93: Whitespace characters string.
     * This string contains common whitespace characters used by `String.prototype.trim`.
     */
    function ( t, r ) {
        t.exports = "\t\n\v\f\r \u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\ufeff";
    },

    /*
     * Module 94: Test String.prototype.trim methods for correct behavior.
     * This module tests `String.prototype.trim`, `trimStart`, and `trimEnd`
     * to detect bugs and ensure correct whitespace removal.
     */
    function ( t, r, n ) {
        var e = n( 7 ),     // Module 7: Safe execution.
            o = n( 93 );    // Module 93: Whitespace characters.

        t.exports = function ( t ) {

            // Test if method exists, removes specific whitespace, and has correct name.
            return e( function ( ) {

                return ! ! o[t] ( ) || " \u2028\u2029\ufeff " != " \u2028\u2029\ufeff "[t] ( ) || o[t].name !== t;
            } );
        };
    },

    /*
     * Module 95: Test TypedArray buffer creation.
     * This module performs various tests on TypedArray constructors and ArrayBuffer
     * to detect bugs related to buffer creation and resizing.
     */
    function ( t, r, n ) {

        var e = n( 5 ),     // Module 5: Global object.
            o = n( 7 ),     // Module 7: Safe execution.
            i = n( 64 ),    // Module 64: Check for buggy iterables.
            u = n( 33 ).NATIVE_ARRAY_BUFFER_VIEWS, // Flag: native TypedArray views.
            a = e.ArrayBuffer, // Native ArrayBuffer.
            c = e.Int8Array;   // Native Int8Array.

        t.exports = ! u || ! o( function ( ) { // Test basic Int8Array creation.
            c( 1 );
        } ) || ! o( function ( ) { // Test Int8Array with negative length.
            new c( - 1 );
        } ) || ! i( function ( t ) { // Test Int8Array with various arguments.
            new c, new c( null ), new c( 1.5 ), new c( t );
        }, ! ! true ) || o( function ( ) { // Test Int8Array with ArrayBuffer and offset.
            return 1 !== new c( new a( 2 ), 1, void 0 ).length;
        } );
    },

    /*
     * Module 96: WeakMap polyfill.
     * This module provides a polyfill for the `WeakMap` collection,
     * handling its constructor, prototype methods, and iteration.
     */
    function ( t, r, n ) {
        "use strict";

        var e,
            o = n( 5 ),     // Module 5: Global object.
            i = n( 36 ),    // Module 36: Define properties.
            u = n( 66 ),    // Module 66: Internal state management for collections.
            a = n( 65 ),    // Module 65: Collection polyfill factory.
            c = n( 126 ),   // Module 126: Weak collection methods.
            f = n( 8 ),     // Module 8: Check if value is an object.
            s = n( 18 ).enforce, // Enforce internal state.
            l = n( 99 ),    // Module 99: Check for native WeakMap support.
            p = ! o.ActiveXObject && "ActiveXObject" in o, // Test for IE ActiveX.
            h = Object.isExtensible, // Native Object.isExtensible.

            // v: Helper to wrap WeakMap methods.
            v = function ( t ) {
                return function ( ) {
                    return t( this, arguments.length ? arguments[0] : void 0 );
                };
            },

            // g: The exported WeakMap constructor.
            g = t.exports = a( "WeakMap", v, c, ! ! true, ! ! true );

        // If native WeakMap is supported but IE ActiveX bug exists.
        if ( l && p ) {

            e = c.getConstructor( v, "WeakMap", ! ! true ); // Get the polyfilled constructor.
            u.REQUIRED = ! ! true; // Mark as required.

            var d = g.prototype,
                y = d.delete,
                m = d.has,
                b = d.get,
                x = d.set;

            // Wrap prototype methods to handle frozen objects.
            i( d, {
                delete: function ( t ) {

                    if ( f( t ) && ! h( t ) ) {

                        var r = s( this );
                        return r.frozen || ( r.frozen = new e ), y.call( this, t ) || r.frozen.delete( t );
                    }
                    return y.call( this, t );
                },
                has:    function ( t ) {

                    if ( f( t ) && ! h( t ) ) {

                        var r = s( this );
                        return r.frozen || ( r.frozen = new e ), m.call( this, t ) || r.frozen.has( t );
                    }
                    return m.call( this, t );
                },
                get:    function ( t ) {

                    if ( f( t ) && ! h( t ) ) {

                        var r = s( this );
                        return r.frozen || ( r.frozen = new e ), m.call( this, t ) ? b.call( this, t ) : r.frozen.get( t );
                    }
                    return b.call( this, t );
                },
                set:    function ( t, r ) {

                    if ( f( t ) && ! h( t ) ) {

                        var n = s( this );
                        n.frozen || ( n.frozen = new e );
                        m.call( this, t ) ? x.call( this, t, r ) : n.frozen.set( t, r );

                    } else {

                        x.call( this, t, r );
                    }

                    return this;
                }
            } );
        }
    },

    /*
     * Module 97: Check for IE8 `Object.defineProperty` bug.
     * This module detects a specific bug in IE8 where `Object.defineProperty`
     * fails on non-DOM objects.
     */
    function ( t, r, n ) {

        var e = n( 9 ),     // Module 9: Object.defineProperty support.
            o = n( 7 ),     // Module 7: Safe execution.
            i = n( 78 );    // Module 78: Create HTML element.

        t.exports = ! e && ! o( function ( ) {

            return 7 != Object.defineProperty( i( "div" ), "a", {
                get: function ( ) {
                    return 7;
                }
            } ).a;
        } );
    },

    /*
     * Module 98: Native Function.prototype.toString.
     * This module provides access to the original, native `Function.prototype.toString`,
     * often used for introspection or to bypass polyfilled versions.
     */
    function ( t, r, n ) {
        var e = n( 38 ); // Module 38: Shared data.

        t.exports = e( "native-function-to-string", Function.toString );
    },

    /*
     * Module 99: Check for native WeakMap support.
     * This module detects if the environment has a native `WeakMap` implementation
     * that behaves as expected.
     */
    function ( t, r, n ) {

        var e = n( 5 ),     // Module 5: Global object.
            o = n( 98 ),    // Module 98: Native Function.prototype.toString.
            i = e.WeakMap;  // Native WeakMap constructor.

        // Check if WeakMap is a function and its string representation indicates native code.
        t.exports = "function" == typeof i && /native code/.test( o.call( i ) );
    },

    /*
     * Module 100: Copy properties from one object to another.
     * This module copies properties from a source object to a target object,
     * handling descriptors and ensuring correct behavior.
     */
    function ( t, r, n ) {

        var e = n( 14 ),    // Module 14: HasOwnProperty.
            o = n( 80 ),    // Module 80: Reflect.ownKeys.
            i = n( 22 ),    // Module 22: Object.getOwnPropertyDescriptor.
            u = n( 11 );    // Module 11: Object.defineProperty.

        t.exports = function ( t, r ) {

            for ( var n = o( r ), a = u.f, c = i.f, f = 0; f < n.length; f ++ ) {

                var s = n[f];

                // If property doesn't exist on target, define it.
                if ( ! e( t, s ) ) {

                    a( t, s, c( r, s ) );
                }
            }
        };
    },

    /*
     * Module 101: Get property names (with exclusions).
     * This module retrieves property names from an object,
     * excluding specific properties if provided.
     */
    function ( t, r, n ) {

        var e = n( 14 ),    // Module 14: HasOwnProperty.
            o = n( 25 ),    // Module 25: ToObject (strict).
            i = n( 60 ).indexOf, // Module 60: Array.prototype.indexOf.
            u = n( 46 );    // Module 46: Internal property flags.

        t.exports = function ( t, r ) {

            var n, a = o( t ), // Convert to object.
                c = 0,
                f = [ ];

            // Iterate over own properties.
            for ( n in a ) {

                // If not an internal property and exists on object.
                if ( ! e( u, n ) && e( a, n ) ) {

                    f.push( n );
                }
            }

            // Iterate over excluded properties.
            for ( ; r.length > c; ) {

                // If property exists on object and not already in list.
                if ( e( a, n = r[c ++] ) && ! ~ i( f, n ) ) {

                    f.push( n );
                }
            }

            return f;
        };
    },

    /*
     * Module 102: Check for native Symbol support.
     * This module detects if the environment has a native `Symbol` implementation
     * that behaves correctly.
     */
    function ( t, r, n ) {
        var e = n( 7 ); // Module 7: Safe execution.

        // Check if Object.getOwnPropertySymbols exists and works correctly.
        t.exports = ! ! Object.getOwnPropertySymbols && ! e( function ( ) {
            return ! String( Symbol ( ) );
        } );
    },

    /*
     * Module 103: Object.defineProperties.
     * This module provides a polyfill for `Object.defineProperties`,
     * defining multiple properties on an object at once.
     */
    function ( t, r, n ) {

        var e = n( 9 ),     // Module 9: Object.defineProperty support.
            o = n( 11 ),    // Module 11: Object.defineProperty.
            i = n( 1 ),     // Module 1: Ensure object.
            u = n( 63 );    // Module 63: Object.keys.

        t.exports = e ? Object.defineProperties : function ( t, r ) {

            i( t ); // Ensure target is an object.

            for ( var n, e = u( r ), a = e.length, c = 0; a > c; ) {

                o.f( t, n = e[c ++], r[n] );
            }

            return t;
        };
    },

    /*
     * Module 104: Document.documentElement.
     * This module provides access to `document.documentElement`,
     * often used for appending elements to the DOM.
     */
    function ( t, r, n ) {
        var e = n( 12 ); // Module 12: Get global property.

        t.exports = e( "document", "documentElement" );
    },

    /*
     * Module 105: Symbol.for helper.
     * This module provides a helper function to retrieve or create a Symbol
     * from the global Symbol registry, used by `Symbol.for`.
     */
    function ( t, r, n ) {
        r.f = n( 6 ); // Module 6: Well-known symbols.
    },

    /*
     * Module 106: Array.prototype.flat / flatMap (core logic).
     * This module provides the core logic for `Array.prototype.flat` and `flatMap`,
     * flattening arrays to a specified depth.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 47 ),    // Module 47: Check if value is an array.
            o = n( 10 ),    // Module 10: ToLength.
            i = n( 13 ),    // Module 13: Function bind.

            // u: Recursive flattening function.
            u = function ( t, r, n, a, c, f, s, l ) {

                for ( var p, h = c, v = 0, g = ! ! s && i( s, l, 3 ); v < a; ) {

                    if ( v in n ) {

                        if ( p = g ? g( n[v], v, r ) : n[v], f > 0 && e( p ) ) {

                            h = u( t, r, p, o( p.length ), h, f - 1 ) - 1;

                        } else {

                            if ( h >= 9007199254740991 ) {

                                throw TypeError( "Exceed the acceptable array length" );
                            }

                            t[h] = p;
                        }

                        h ++;
                    }

                    v ++;
                }

                return h;
            };

        t.exports = u;
    },

    /*
     * Module 107: Array.from (polyfill).
     * This module provides a polyfill for `Array.from`,
     * creating a new Array instance from an iterable or array-like object.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 13 ),    // Module 13: Function bind.
            o = n( 15 ),    // Module 15: ToObject.
            i = n( 108 ),   // Module 108: Invoke iterator method.
            u = n( 84 ),    // Module 84: Check if array-like iterable.
            a = n( 10 ),    // Module 10: ToLength.
            c = n( 40 ),    // Module 40: Define indexed property.
            f = n( 52 );    // Module 52: Get iterator method.

        t.exports = function ( t ) {

            var r, n, s, l, p,
                h = o( t ), // Convert to object.
                v = "function" == typeof this ? this : Array, // Constructor.
                g = arguments.length,
                d = g > 1 ? arguments[1] : void 0, // Map function.
                y = void 0 !== d,
                m = 0,
                b = f( h ); // Get iterator method.

            // If map function is provided, bind it.
            if ( y && ( d = e( d, g > 2 ? arguments[2] : void 0, 2 ) ) );

            // If no iterator or it's an array-like iterable.
            if ( null == b || v == Array && u( b ) ) {

                for ( n = new v( r = a( h.length ) ); r > m; m ++ ) {

                    c( n, m, y ? d( h[m], m ) : h[m] );
                }

            } else { // If it's a generic iterable.

                for ( l = b.call( h ), n = new v; ! ( s = l.next ( ) ).done; m ++ ) {

                    c( n, m, y ? i( l, d, [ s.value, m ], ! ! true ) : s.value );
                }
            }

            return n.length = m, n;
        };
    },

    /*
     * Module 108: Invoke iterator method.
     * This module invokes a method on an iterator, handling potential errors
     * and ensuring cleanup if the iterator has a `return` method.
     */
    function ( t, r, n ) {
        var e = n( 1 ); // Module 1: Ensure object.

        t.exports = function ( t, r, n, o ) {

            try {
                return o ? r( e( n )[0], n[1] ) : r( n );
            } catch ( r ) {
                var i = t.return;
                throw void 0 !== i && e( i.call( t ) ), r;
            }
        };
    },

    /*
     * Module 109: Iterator.prototype and buggy Safari iterators.
     * This module defines `Iterator.prototype` and detects bugs in Safari's
     * iterator implementations.
     */
    function ( t, r, n ) {
        "use strict";

        var e, o, i,
            u = n( 21 ),    // Module 21: Get prototype of.
            a = n( 16 ),    // Module 16: Define property.
            c = n( 14 ),    // Module 14: HasOwnProperty.
            f = n( 6 ),     // Module 6: Well-known symbols.
            s = n( 2 ),     // Module 2: Pure flag.
            l = f( "iterator" ), // Symbol.iterator.
            p = ! ! false; // Flag for buggy Safari iterators.

        // Test for buggy Safari iterators.
        if ( [ ].keys && ( "next" in ( i = [ ].keys ( ) ) ? ( o = u( u( i ) ) ) !== Object.prototype && ( e = o ) : p = ! ! true ) );

        // If no Iterator.prototype found, create a fallback.
        if ( null == e ) {

            e = { };
        }

        // If not pure and Symbol.iterator not defined, define it.
        if ( s || c( e, l ) || a( e, l, function ( ) {
            return this
        } ) );

        t.exports = {
            IteratorPrototype:      e,
            BUGGY_SAFARI_ITERATORS: p
        };
    },

    /*
     * Module 110: Check for native Object.getPrototypeOf support.
     * This module detects if the environment has a native `Object.getPrototypeOf`
     * implementation that works correctly.
     */
    function ( t, r, n ) {
        var e = n( 7 ); // Module 7: Safe execution.

        // Test if `Object.getPrototypeOf` works for objects with `constructor` property set to null.
        t.exports = ! e( function ( ) {
            function t ( ) {
            }
            return t.prototype.constructor = null, Object.getPrototypeOf( new t ) !== t.prototype;
        } );
    },

    /*
     * Module 111: Ensure prototype is object or null.
     * This module checks if a value is a valid prototype (object or null),
     * throwing a TypeError if it's not.
     */
    function ( t, r, n ) {
        var e = n( 8 ); // Module 8: Check if value is an object.

        t.exports = function ( t ) {

            if ( ! e( t ) && null !== t ) {

                throw TypeError( "Can't set " + String( t ) + " as a prototype" );
            }

            return t;
        };
    },

    /*
     * Module 112: Check for buggy `Object.isExtensible`.
     * This module detects if `Object.isExtensible` behaves unexpectedly,
     * especially with objects that have been prevented from extensions.
     */
    function ( t, r, n ) {
        var e = n( 7 ); // Module 7: Safe execution.

        // Test `Object.isExtensible` with an object whose extensions are prevented.
        t.exports = ! e( function ( ) {
            return Object.isExtensible( Object.preventExtensions( { } ) );
        } );
    },

    /*
     * Module 113: Set prototype of (for collection instances).
     * This module sets the prototype of a new collection instance,
     * handling `Object.setPrototypeOf` and potential inheritance.
     */
    function ( t, r, n ) {

        var e = n( 8 ),     // Module 8: Check if value is an object.
            o = n( 42 );    // Module 42: SetPrototypeOf.

        t.exports = function ( t, r, n ) {

            var i, u;

            // If `Object.setPrototypeOf` is available and constructor is different.
            if ( o && "function" == typeof ( i = r.constructor ) && i !== n && e( u = i.prototype ) && u !== n.prototype ) {

                o( t, u ); // Set prototype to constructor's prototype.
            }

            return t;
        };
    },

    /*
     * Module 114: Map/Set collection methods (core logic).
     * This module provides the core logic for `Map` and `Set` methods,
     * including internal state management, iteration, and common operations.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 11 ).f,  // Module 11: Object.defineProperty.f.
            o = n( 30 ),    // Module 30: Object.create.
            i = n( 36 ),    // Module 36: Define properties.
            u = n( 13 ),    // Module 13: Function bind.
            a = n( 31 ),    // Module 31: Instance check.
            c = n( 3 ),     // Module 3: Iteration utility.
            f = n( 87 ),    // Module 87: Iterator creation factory.
            s = n( 43 ),    // Module 43: Set Symbol.species.
            l = n( 9 ),     // Module 9: Object.defineProperty support.
            p = n( 66 ).fastKey, // Module 66: Generate fast key.
            h = n( 18 ),    // Module 18: Internal state.
            v = h.set,      // Set internal state.
            g = h.getterFor; // Getter for internal state.

        t.exports = {
            // getConstructor: Factory for collection constructors.
            getConstructor: function ( t, r, n, f ) {

                var h = t( function ( t, e ) {

                    a( t, h, r ); // Instance check.

                    v( t, { type: r, index: o( null ), first: void 0, last: void 0, size: 0 } ); // Initialize internal state.

                    if ( ! l ) {
                        t.size = 0; // Set size property if no native getter.
                    }

                    if ( null != e ) {
                        c( e, t[f], t, n ); // Populate from iterable.
                    }

                } ),
                    m = g( r ), // Getter for collection's internal state.

                    // d: Helper to add/set an item.
                    d = function ( t, r, n ) {

                        var e, o,
                            i = m( t ), // Get internal state.
                            u = y( t, r ); // Find existing entry.

                        if ( u ) { // If entry exists, update its value.

                            u.value = n;

                        } else { // Otherwise, create a new entry.

                            ( i.last = u = {
                                index:    o = p( r, ! ! true ),
                                key:      r,
                                value:    n,
                                previous: e = i.last,
                                next:     void 0,
                                removed:  ! ! false
                            }, i.first || ( i.first = u ), e && ( e.next = u ), l ? i.size ++ : t.size ++ );

                            if ( "F" !== o ) { // If not a frozen object, store in index.
                                i.index[o] = u;
                            }
                        }

                        return t;
                    },

                    // y: Helper to find an entry by key.
                    y = function ( t, r ) {

                        var n,
                            e = m( t ), // Get internal state.
                            o = p( r ); // Get key.

                        if ( "F" !== o ) { // If not a frozen object, check index.
                            return e.index[o];
                        }

                        // Iterate through entries for frozen objects.
                        for ( n = e.first; n; n = n.next ) {

                            if ( n.key == r ) {
                                return n;
                            }
                        }
                    };

                // Define prototype methods.
                i( h.prototype, {
                    // clear: Clears all entries.
                    clear:   function ( ) {

                        for ( var t = m( this ), r = t.index, n = t.first; n; ) {

                            ( n.removed = ! ! true, n.previous && ( n.previous = n.previous = void 0 ), delete r[n.index], n = n.next );
                        }

                        ( t.first = t.last = void 0, l ? t.size = 0 : this.size = 0 );
                    },

                    // delete: Deletes an entry by key.
                    delete:  function ( t ) {

                        var r = m( this ),
                            n = y( this, t );

                        if ( n ) {

                            var e = n.next,
                                o = n.previous;

                            ( delete r.index[n.index], n.removed = ! ! true, o && ( o.next = e ), e && ( e.previous = o ), r.first == n && ( r.first = e ), r.last == n && ( r.last = o ), l ? r.size -- : this.size -- );
                        }

                        return ! ! n;
                    },

                    // forEach: Iterates over entries with a callback.
                    forEach: function ( t ) {

                        for ( var r, n = m( this ), e = u( t, arguments.length > 1 ? arguments[1] : void 0, 3 ); r = r ? r.next : n.first; ) {

                            for ( e( r.value, r.key, this ); r && r.removed; ) {

                                r = r.previous;
                            }
                        }
                    },

                    // has: Checks if an entry exists by key.
                    has:     function ( t ) {
                        return ! ! y( this, t );
                    }
                } );

                // Define get/set or add methods based on 'n' flag (isMap).
                i( h.prototype, n ? {
                    get: function ( t ) {
                        var r = y( this, t );
                        return r && r.value;
                    },
                    set: function ( t, r ) {
                        return d( this, 0 === t ? 0 : t, r );
                    }
                } : {
                    add: function ( t ) {
                        return d( this, t = 0 === t ? 0 : t, t );
                    }
                } );

                // Define 'size' getter if Object.defineProperty is supported.
                if ( l ) {

                    e( h.prototype, "size", {
                        get: function ( ) {
                            return m( this ).size;
                        }
                    } );
                }

                return h;
            },

            // setStrong: Sets up strong iteration methods (entries, keys, values).
            setStrong:      function ( t, r, n ) {

                var e = r + " Iterator",
                    o = g( r ),
                    i = g( e );

                f( t, r, function ( t, r ) {

                    v( this, { type: e, target: t, state: o( t ), kind: r, last: void 0 } );

                }, function ( ) {

                    for ( var t = i( this ), r = t.kind, n = t.last; n && n.removed; ) {

                        n = n.previous;
                    }

                    // If target exists and next entry is found.
                    if ( t.target && ( t.last = n = n ? n.next : t.state.first ) ) {

                        if ( "keys" == r ) {
                            return { value: n.key, done: ! ! false };
                        }
                        if ( "values" == r ) {
                            return { value: n.value, done: ! ! false };
                        }
                        return { value: [ n.key, n.value ], done: ! ! false };

                    } else { // Iteration complete.

                        return ( t.target = void 0, { value: void 0, done: ! ! true } );
                    }

                }, n ? "entries" : "values", ! n, ! ! true );

                s( r ); // Set Symbol.species for the collection.
            }
        };
    },

    /*
     * Module 115: Object.assign (polyfill).
     * This module provides a polyfill for `Object.assign`,
     * copying enumerable own properties from one or more source objects to a target object.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 9 ),     // Module 9: Object.defineProperty support.
            o = n( 7 ),     // Module 7: Safe execution.
            i = n( 63 ),    // Module 63: Object.keys.
            u = n( 83 ),    // Module 83: Object.getOwnPropertySymbols.
            a = n( 58 ),    // Module 58: PropertyIsEnumerable.
            c = n( 15 ),    // Module 15: ToObject.
            f = n( 77 ),    // Module 77: IndexedObject.
            s = Object.assign; // Native Object.assign.

        // If native `Object.assign` is buggy or not present.
        t.exports = ! s || o( function ( ) {

            var t = { },
                r = { },
                n = Symbol ( );

            return t[n] = 7, "abcdefghijklmnopqrst".split( "" ).forEach( function ( t ) {
                r[t] = t
            } ), 7 != s( { }, t )[n] || "abcdefghijklmnopqrst" != i( s( { }, r ) ).join( "" );

        } ) ? function ( t, r ) { // Polyfilled version.

            var n = c( t ), // Convert target to object.
                o = arguments.length,
                s = 1,
                l = u.f,
                p = a.f;

            for ( ; o > s; ) {

                for ( var h, v = f( arguments[s ++] ), g = l ? i( v ).concat( l( v ) ) : i( v ), d = g.length, y = 0; d > y; ) {

                    h = g[y ++];

                    // If `Object.defineProperty` is supported and property is enumerable.
                    if ( e && ! p.call( v, h ) ) {
                        continue;
                    }

                    n[h] = v[h]; // Copy property.
                }
            }

            return n;

        } : s; // Use native `Object.assign`.
    },

    /*
     * Module 116: Object.entries and Object.values (polyfill).
     * This module provides polyfills for `Object.entries` and `Object.values`,
     * returning arrays of key-value pairs or values respectively.
     */
    function ( t, r, n ) {

        var e = n( 9 ),     // Module 9: Object.defineProperty support.
            o = n( 63 ),    // Module 63: Object.keys.
            i = n( 25 ),    // Module 25: ToObject (strict).
            u = n( 58 ).f,  // Module 58: PropertyIsEnumerable.f.

            // a: Factory for entries/values.
            a = function ( t ) {

                return function ( r ) {

                    for ( var n, a = i( r ), c = o( a ), f = c.length, s = 0, l = [ ]; f > s; ) {

                        n = c[s ++];

                        // If `Object.defineProperty` is supported and property is enumerable.
                        if ( e && ! u.call( a, n ) ) {
                            continue;
                        }

                        l.push( t ? [ n, a[n] ] : a[n] ); // Push key-value pair or just value.
                    }

                    return l;
                };
            };

        t.exports = {
            entries: a( ! ! true ),
            values:  a( ! ! false )
        };
    },

    /*
     * Module 117: Set/Clear Immediate (polyfill).
     * This module provides polyfills for `setImmediate` and `clearImmediate`,
     * using `postMessage` or `process.nextTick` for asynchronous execution.
     */
    function ( t, r, n ) {

        var e, o, i, u = n( 5 ),     // Module 5: Global object.
            a = n( 7 ),     // Module 7: Safe execution.
            c = n( 28 ),    // Module 28: Object.prototype.toString tag.
            f = n( 13 ),    // Module 13: Function bind.
            s = n( 104 ),   // Module 104: Document.documentElement.
            l = n( 78 ),    // Module 78: Create HTML element.
            p = u.location, // Window.location.
            h = u.setImmediate, // Native setImmediate.
            v = u.clearImmediate, // Native clearImmediate.
            g = u.process,  // Native process object (Node.js).
            d = u.MessageChannel, // Native MessageChannel.
            y = 0,          // Counter for immediate IDs.
            m = { },        // Map for immediate callbacks.

            // b: Executes a callback by ID.
            b = function ( t ) {

                if ( m.hasOwnProperty( t ) ) {

                    var r = m[t];
                    delete m[t];
                    r ( );
                }
            },

            // x: Creates a wrapper for `b`.
            x = function ( t ) {
                return function ( ) {
                    b( t );
                };
            },

            // w: MessageChannel handler.
            w = function ( t ) {
                b( t.data );
            },

            // S: PostMessage handler.
            S = function ( t ) {
                u.postMessage( t + "", p.protocol + "//" + p.host );
            };

        // If native setImmediate/clearImmediate are not available.
        if ( ! h || ! v ) {

            h = function ( t ) {

                for ( var r = [ ], n = 1; arguments.length > n; ) {

                    r.push( arguments[n ++] );
                }

                return m[++ y] = function ( ) {
                    ( "function" == typeof t ? t : Function( t ) ).apply( void 0, r );
                }, e( y ), y;
            };

            v = function ( t ) {
                delete m[t];
            };

            if ( "process" == c( g ) ) { // Node.js environment.

                e = function ( t ) {
                    g.nextTick( x( t ) );
                };

            } else if ( d && d.now ) { // MessageChannel support.

                ( i = ( o = new d ).port2, o.port1.onmessage = w, e = f( i.postMessage, i, 1 ) );

            } else if ( ! u.addEventListener || "function" != typeof postMessage || u.importScripts || a( S ) ) {

                // Fallback for older browsers (script onreadystatechange or setTimeout).
                e = "onreadystatechange" in l( "script" ) ? function ( t ) {

                    s.appendChild( l( "script" ) ).onreadystatechange = function ( ) {

                        s.removeChild( this );
                        b( t );
                    };

                } : function ( t ) {
                    setTimeout( x( t ), 0 );
                };

            } else { // Modern browser with postMessage.

                ( e = S, u.addEventListener( "message", w, ! ! false ) );
            }
        }

        t.exports = {
            set:   h,
            clear: v
        };
    },

    /*
     * Module 118: Queue microtask.
     * This module provides a utility to queue a microtask,
     * ensuring it runs asynchronously before the next rendering frame.
     */
    function ( t, r, n ) {

        var e, o, i, u, a, c, f,
            s = n( 5 ),     // Module 5: Global object.
            l = n( 22 ).f,  // Module 22: Object.getOwnPropertyDescriptor.f.
            p = n( 28 ),    // Module 28: Object.prototype.toString tag.
            h = n( 117 ).set, // Module 117: SetImmediate.
            v = n( 89 ),    // Module 89: User agent string.
            g = s.MutationObserver || s.WebKitMutationObserver, // Native MutationObserver.
            d = s.process,  // Native process object (Node.js).
            y = s.Promise,  // Native Promise.
            m = "process" == p( d ), // Flag: Node.js environment.
            b = l( s, "queueMicrotask" ), // Native queueMicrotask.
            x = b && b.value; // Value of native queueMicrotask.

        // If native queueMicrotask is not available.
        if ( ! x ) {

            // e: Function to execute queued microtasks.
            e = function ( ) {

                var t, r;

                if ( m && ( t = d.domain ) ) {
                    t.exit ( ); // Exit Node.js domain.
                }

                for ( ; o; ) {

                    ( r = o.fn, o = o.next );

                    try {
                        r ( );
                    } catch ( t ) {
                        throw o ? u ( ) : i = void 0, t; // If error, clear queue and rethrow.
                    }
                }

                ( i = void 0, t && t.enter ( ) ); // Re-enter Node.js domain.
            };

            if ( m ) { // Node.js environment.

                u = function ( ) {
                    d.nextTick( e );
                };

            } else if ( g && ! /( iphone | ipod | ipad ) .* applewebkit / i.test( v ) ) { // MutationObserver support (excluding specific Safari bug).

                ( a = ! ! true, c = document.createTextNode( "" ), new g( e ).observe( c, { characterData: ! ! true } ), u = function ( ) {
                    c.data = a = ! a;
                } );

            } else if ( y && y.resolve ) { // Promise support.

                ( f = y.resolve( void 0 ), u = function ( ) {
                    f.then( e );
                } );

            } else { // Fallback to setImmediate.

                u = function ( ) {
                    h.call( s, e );
                };
            }
        }

        t.exports = x || function ( t ) {

            var r = { fn: t, next: void 0 };

            // Add task to queue.
            if ( i ) {
                i.next = r;
            }
            if ( ! o ) {
                ( o = r, u ( ) );
            }

            i = r;
        };
    },

    /*
     * Module 119: Promise species factory (for creating new promises).
     * This module creates a new promise using the `Symbol.species` constructor
     * of the original promise, ensuring correct inheritance.
     */
    function ( t, r, n ) {

        var e = n( 1 ),     // Module 1: Ensure object.
            o = n( 8 ),     // Module 8: Check if value is an object.
            i = n( 55 );    // Module 55: Promise capabilities factory.

        t.exports = function ( t, r ) {

            // If 'r' is an object and is an instance of 't', return it directly.
            if ( e( t ), o( r ) && r.constructor === t ) {
                return r;
            }

            var n = i.f( t ); // Get promise capabilities.

            return ( 0, n.resolve ) ( r ), n.promise; // Resolve the promise and return it.
        };
    },

    /*
     * Module 120: Handle unhandled promise rejections.
     * This module provides a utility to log unhandled promise rejections,
     * often used for debugging and preventing silent errors.
     */
    function ( t, r, n ) {
        var e = n( 5 ); // Module 5: Global object.

        t.exports = function ( t, r ) {

            var n = e.console;

            // If console exists and has an error method, log the error.
            if ( n && n.error ) {

                if ( 1 === arguments.length ) {
                    n.error( t );
                } else {
                    n.error( t, r );
                }
            }
        };
    },

    /*
     * Module 121: Set polyfill.
     * This module provides a polyfill for the `Set` collection,
     * handling its constructor, prototype methods, and iteration.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 65 ),    // Module 65: Collection polyfill factory.
            o = n( 114 );   // Module 114: Map/Set collection methods.

        // Export the Set polyfill using the collection factory.
        t.exports = e( "Set", function ( t ) {

            return function ( ) {
                return t( this, arguments.length ? arguments[0] : void 0 );
            };

        }, o );
    },

    /*
     * Module 122: String.prototype.padStart/padEnd (core logic).
     * This module provides the core logic for `String.prototype.padStart` and `padEnd`,
     * padding a string with another string until it reaches a target length.
     */
    function ( t, r, n ) {

        var e = n( 10 ),    // Module 10: ToLength.
            o = n( 204 ),   // Module 204: String.prototype.repeat.
            i = n( 17 ),    // Module 17: RequireObjectCoercible.
            u = Math.ceil,  // Math.ceil utility.

            // a: Factory for padStart/padEnd.
            a = function ( t ) {

                return function ( r, n, a ) {

                    var c, f,
                        s = String( i( r ) ), // Convert to string.
                        l = s.length,         // String length.
                        p = void 0 === a ? " " : String( a ), // Pad string.
                        h = e( n );           // Target length.

                    // If target length is less than or equal to current length, or pad string is empty, return original.
                    if ( h <= l || "" == p ) {
                        return s;
                    }

                    // Calculate padding length.
                    ( c = h - l, f = o.call( p, u( c / p.length ) ) );

                    // Truncate padding if too long.
                    if ( f.length > c ) {
                        f = f.slice( 0, c );
                    }

                    // Prepend or append padding based on 't' flag.
                    return t ? s + f : f + s;
                };
            };

        t.exports = {
            start: a( ! ! false ),
            end:   a( ! ! true )
        };
    },

    /*
     * Module 123: Test `String.prototype.padStart` / `padEnd` for Safari bug.
     * This module detects a specific bug in Safari's implementation of
     * `String.prototype.padStart` and `padEnd` related to user agent.
     */
    function ( t, r, n ) {
        var e = n( 89 ); // Module 89: User agent string.

        // Check if user agent matches Safari version with known bug.
        t.exports = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test( e );
    },

    /*
     * Module 124: ToIndex conversion.
     * Converts a value to a valid index (non-negative integer).
     */
    function ( t, r, n ) {

        var e = n( 24 ),    // Module 24: ToInteger.
            o = n( 10 );    // Module 10: ToLength.

        t.exports = function ( t ) {

            if ( void 0 === t ) {
                return 0;
            }

            var r = e( t ), // Convert to integer.
                n = o( r ); // Convert to length.

            // If value changed after ToLength, it's an invalid length/index.
            if ( r !== n ) {

                throw RangeError( "Wrong length or index" );
            }

            return n;
        };
    },

    /*
     * Module 125: TypedArray.from (polyfill).
     * This module provides a polyfill for `TypedArray.from`,
     * creating a new TypedArray instance from an iterable or array-like object.
     */
    function ( t, r, n ) {

        var e = n( 15 ),    // Module 15: ToObject.
            o = n( 10 ),    // Module 10: ToLength.
            i = n( 52 ),    // Module 52: Get iterator method.
            u = n( 84 ),    // Module 84: Check if array-like iterable.
            a = n( 13 ),    // Module 13: Function bind.
            c = n( 33 ).aTypedArrayConstructor; // Module 33: TypedArray constructor validator.

        t.exports = function ( t ) {

            var r, n, f, s, l,
                p = e( t ), // Convert to object.
                h = arguments.length,
                v = h > 1 ? arguments[1] : void 0, // Map function.
                g = void 0 !== v,
                d = i( p ); // Get iterator method.

            // If map function is provided, bind it.
            if ( g && h > 2 && ( v = a( v, arguments[2], 2 ) ) );

            // If no iterator or it's not an array-like iterable.
            if ( null != d && ! u( d ) ) {

                for ( l = d.call( p ), p = [ ]; ! ( s = l.next ( ) ).done; ) {

                    p.push( s.value );
                }
            }

            for ( n = o( p.length ), f = new ( c( this ) ) ( n ), r = 0; n > r; r ++ ) {

                f[r] = g ? v( p[r], r ) : p[r];
            }

            return f;
        };
    },

    /*
     * Module 126: Weak collection methods (core logic).
     * This module provides the core logic for `WeakMap` and `WeakSet` methods,
     * handling internal state management and common operations.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 36 ),    // Module 36: Define properties.
            o = n( 66 ).getWeakData, // Module 66: Get weak data.
            i = n( 1 ),     // Module 1: Ensure object.
            u = n( 8 ),     // Module 8: Check if value is an object.
            a = n( 31 ),    // Module 31: Instance check.
            c = n( 3 ),     // Module 3: Iteration utility.
            f = n( 48 ),    // Module 48: Array iteration methods.
            s = n( 14 ),    // Module 14: HasOwnProperty.
            l = n( 18 ),    // Module 18: Internal state.
            p = l.set,      // Set internal state.
            h = l.getterFor, // Getter for internal state.
            v = 0,          // Counter for object IDs.

            // g: Helper to get/create a 'frozen' Map for frozen objects.
            g = function ( t ) {
                return t.frozen || ( t.frozen = new m );
            },

            // m: Simple Map-like class for frozen objects.
            m = function ( ) {
                this.entries = [ ];
            },

            // b: Helper to find an entry in the 'frozen' Map.
            b = function ( t, r ) {
                return f.find( t.entries, function ( t ) {
                    return t[0] === r;
                } );
            };

        // Define methods for the 'frozen' Map.
        m.prototype = {
            get:    function ( t ) {
                var r = b( this, t );
                if ( r ) {
                    return r[1];
                }
            },
            has:    function ( t ) {
                return ! ! b( this, t );
            },
            set:    function ( t, r ) {
                var n = b( this, t );
                n ? n[1] = r : this.entries.push( [ t, r ] );
            },
            delete: function ( t ) {
                var r = f.findIndex( this.entries, function ( r ) {
                    return r[0] === t;
                } );
                return ! ~ r && this.entries.splice( r, 1 ), ! ! ~ r;
            }
        };

        t.exports = {
            // getConstructor: Factory for weak collection constructors.
            getConstructor: function ( t, r, n, f ) {

                var l = t( function ( t, e ) {

                    a( t, l, r ); // Instance check.

                    p( t, { type: r, id: v ++, frozen: void 0 } ); // Initialize internal state.

                    if ( null != e ) {
                        c( e, t[f], t, n ); // Populate from iterable.
                    }

                } ),
                    m = h( r ), // Getter for collection's internal state.

                    // g: Helper to add/set an item.
                    g = function ( t, r, n ) {

                        var e = m( t ), // Get internal state.
                            u = o( i( r ), ! ! true ); // Get weak data for the key.

                        // If key is frozen, use the 'frozen' Map.
                        // Otherwise, store directly on weak data object.
                        return ! ! true === u ? g( e ).set( r, n ) : u[e.id] = n, t;
                    };

                // Define prototype methods.
                e( l.prototype, {
                    // delete: Deletes an entry by key.
                    delete: function ( t ) {

                        var r = m( this );

                        if ( ! u( t ) ) {
                            return ! ! false; // Not an object.
                        }

                        var n = o( t ); // Get weak data for the key.

                        // If key is frozen, use the 'frozen' Map.
                        // Otherwise, delete from weak data object.
                        return ! ! true === n ? g( r ).delete( t ) : n && s( n, r.id ) && delete n[r.id];
                    },

                    // has: Checks if an entry exists by key.
                    has:    function ( t ) {

                        var r = m( this );

                        if ( ! u( t ) ) {
                            return ! ! false; // Not an object.
                        }

                        var n = o( t ); // Get weak data for the key.

                        // If key is frozen, use the 'frozen' Map.
                        // Otherwise, check weak data object.
                        return ! ! true === n ? g( r ).has( t ) : n && s( n, r.id );
                    }
                } );

                // Define get/set or add methods based on 'n' flag (isMap).
                e( l.prototype, n ? {
                    get: function ( t ) {

                        var r = m( this );

                        if ( u( t ) ) {

                            var n = o( t ); // Get weak data for the key.

                            // If key is frozen, use the 'frozen' Map.
                            // Otherwise, get from weak data object.
                            return ! ! true === n ? g( r ).get( t ) : n ? n[r.id] : void 0;
                        }
                    },
                    set: function ( t, r ) {
                        return g( this, t, r );
                    }
                } : {
                    add: function ( t ) {
                        return g( this, t, ! ! true );
                    }
                } );

                return l;
            }
        };
    },

    /*
     * Module 127: Composite key helper.
     * This module provides a utility for creating and managing composite keys,
     * allowing multiple values to act as a single key in a Map-like structure.
     */
    function ( t, r, n ) {

        var e = n( 88 ),    // Module 88: Map.
            o = n( 96 ),    // Module 96: WeakMap.
            i = n( 30 ),    // Module 30: Object.create.
            u = n( 8 ),     // Module 8: Check if value is an object.

            // a: Helper class for composite keys.
            a = function ( ) {
                this.object = null, this.symbol = null, this.primitives = null, this.objectsByIndex = i( null );
            };

        // Define methods for composite key helper.
        a.prototype.get = function ( t, r ) {
            return this[t] || ( this[t] = r ( ) );
        };

        a.prototype.next = function ( t, r, n ) {

            var i = n ? this.objectsByIndex[t] || ( this.objectsByIndex[t] = new o ) : this.primitives || ( this.primitives = new e ),
                u = i.get( r );

            if ( u ) {
                return u;
            }

            return i.set( r, u = new a ), u;
        };

        var c = new a; // Root instance.

        t.exports = function ( ) {

            var t, r, n = c, e = arguments.length;

            // Process object components.
            for ( t = 0; t < e; t ++ ) {

                if ( u( r = arguments[t] ) ) {

                    n = n.next( t, r, ! ! true );
                }
            }

            // If no object components and 'this' is Object, throw error.
            if ( this === Object && n === c ) {

                throw TypeError( "Composite keys must contain a non-primitive component" );
            }

            // Process primitive components.
            for ( t = 0; t < e; t ++ ) {

                if ( ! u( r = arguments[t] ) ) {

                    n = n.next( t, r, ! ! false );
                }
            }

            return n;
        };
    },

    /*
     * Module 128: Math.scale (polyfill).
     * This module provides a polyfill for `Math.scale`,
     * scaling a value from one range to another.
     */
    function ( t, r ) {
        t.exports = Math.scale || function ( t, r, n, e, o ) {

            // Handle NaN and infinite values.
            if ( 0 === arguments.length || t != t || r != r || n != n || e != e || o != o ) {
                return NaN;
            }

            if ( t === 1 / 0 || t === - 1 / 0 ) {
                return t;
            }

            return ( t - r ) * ( o - e ) / ( n - r ) + e;
        };
    },

    /*
     * Module 129: Collection.prototype.addAll (for Map/Set).
     * This module provides a polyfill for `Map.prototype.addAll` and `Set.prototype.addAll`,
     * allowing multiple items to be added at once.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 4 ), // Module 4: Ensure function.
            o = n( 1 ); // Module 1: Ensure object.

        t.exports = function ( ) {

            // Ensure 'this' is an object and its add method is a function.
            for ( var t = o( this ), r = e( t.add ), n = 0, i = arguments.length; n < i; n ++ ) {

                r.call( t, arguments[n] );
            }

            return t;
        };
    },

    /*
     * Module 130: URL polyfill feature detection.
     * This module detects various bugs and inconsistencies in native `URL` and `URLSearchParams`
     * implementations, used to determine if polyfills are needed.
     */
    function ( t, r, n ) {
        var e = n( 7 ),     // Module 7: Safe execution.
            o = n( 6 ),     // Module 6: Well-known symbols.
            i = n( 2 );     // Module 2: Pure flag.
            u = o( "iterator" ); // Symbol.iterator.

        t.exports = ! e( function ( ) {

            var t = new URL( "b?e=1", "http://a" ),
                r = t.searchParams;

            return t.pathname = "c%20d",
                i && ! t.toJSON ||
                ! r.sort ||
                "http://a/c%20d?e=1" !== t.href ||
                "1" !== r.get( "e" ) ||
                "a=1" !== String( new URLSearchParams( "?a=1" ) ) ||
                ! r[u] ||
                "a" !== new URL( "https://a@b" ).username ||
                "b" !== new URLSearchParams( new URLSearchParams( "a=b" ) ).get( "a" ) ||
                "xn--e1aybc" !== new URL( "http://тест" ).host ||
                "#%D0%B1" !== new URL( "http://a#б" ).hash;
        } );
    },

    /*
     * Module 131: URLSearchParams polyfill.
     * This module provides a polyfill for the `URLSearchParams` interface,
     * handling parsing, serialization, and modification of query strings.
     */
    function ( t, r, n ) {
        "use strict";

        n( 86 ); // Module 86: Array iteration methods.

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 130 ),   // Module 130: URL polyfill feature detection.
            i = n( 23 ),    // Module 23: Define property.
            u = n( 36 ),    // Module 36: Define properties.
            a = n( 26 ),    // Module 26: Set Symbol.toStringTag.
            c = n( 54 ),    // Module 54: Iterator creation factory.
            f = n( 18 ),    // Module 18: Internal state.
            s = n( 31 ),    // Module 31: Instance check.
            l = n( 14 ),    // Module 14: HasOwnProperty.
            p = n( 13 ),    // Module 13: Function bind.
            h = n( 1 ),     // Module 1: Ensure object.
            v = n( 8 ),     // Module 8: Check if value is an object.
            g = n( 57 ),    // Module 57: Get iterator for an iterable.
            d = n( 52 ),    // Module 52: Get iterator method.
            y = n( 6 )( "iterator" ), // Symbol.iterator.
            m = f.set,      // Set internal state.
            b = f.getterFor( "URLSearchParams" ), // Getter for URLSearchParams state.
            x = f.getterFor( "URLSearchParamsIterator" ), // Getter for URLSearchParamsIterator state.
            w = /\+/g,      // Regex for '+' character.
            S = Array( 4 ), // Array for cached regexes.

            // A: Creates a regex for URL decoding.
            A = function ( t ) {
                return S[t - 1] || ( S[t - 1] = RegExp( "((?:%[\\da-f]{2}){"+t+"})", "gi" ) );
            },

            // E: Decodes a URI component, handling errors.
            E = function ( t ) {
                try {
                    return decodeURIComponent( t );
                } catch ( r ) {
                    return t;
                }
            },

            // R: Decodes a URL parameter value.
            R = function ( t ) {
                var r = t.replace( w, " " ), n = 4;
                try {
                    return decodeURIComponent( r );
                } catch ( t ) {
                    for ( ; n; ) {
                        r = r.replace( A( n -- ), E );
                    }
                    return r;
                }
            },

            // O: Regex for characters to encode in URL parameters.
            O = /[!'()~]|%20/g,

            // I: Map of characters to their encoded form.
            I = {
                "!":   "%21",
                "'":   "%27",
                "(":   "%28",
                ")":   "%29",
                "~":   "%7E",
                "%20": "+"
            },

            // j: Replaces characters with their encoded form.
            j = function ( t ) {
                return I[t];
            },

            // M: Encodes a URL parameter value.
            M = function ( t ) {
                return encodeURIComponent( t ).replace( O, j );
            },

            // P: Parses a query string and populates an array of key-value pairs.
            P = function ( t, r ) {
                if ( r ) {
                    for ( var n, e, o = r.split( "&" ), i = 0; i < o.length; ) {
                        if ( ( n = o[i ++] ).length ) {
                            ( e = n.split( "=" ), t.push( { key: R( e.shift ( ) ), value: R( e.join( "=" ) ) } ) );
                        }
                    }
                }
            },

            // k: Updates the searchParams from a query string.
            k = function ( t ) {
                this.entries.length = 0;
                P( this.entries, t );
            },

            // T: Ensures minimum number of arguments.
            T = function ( t, r ) {
                if ( t < r ) {
                    throw TypeError( "Not enough arguments" );
                }
            },

            // _: Iterator for URLSearchParams.
            _ = c( function ( t, r ) {
                m( this, { type: "URLSearchParamsIterator", iterator: g( b( t ).entries ), kind: r } );
            }, "Iterator", function ( ) {
                var t = x( this ),
                    r = t.kind,
                    n = t.iterator.next ( ),
                    e = n.value;
                return n.done || ( n.value = "keys" === r ? e.key : "values" === r ? e.value : [ e.key, e.value ] ), n;
            } ),

            // U: URLSearchParams constructor.
            U = function ( ) {

                s( this, U, "URLSearchParams" ); // Instance check.

                var t, r, n, e, o, i, u,
                    a = arguments.length > 0 ? arguments[0] : void 0,
                    c = this,
                    f = [ ];

                m( c, { type: "URLSearchParams", entries: f, updateURL: function ( ) {
                }, updateSearchParams: k } ); // Initialize internal state.

                if ( void 0 !== a ) {

                    if ( v( a ) ) { // If iterable or object.

                        if ( "function" == typeof ( t = d( a ) ) ) { // If iterable.

                            for ( r = t.call( a ); ! ( n = r.next ( ) ).done; ) {

                                if ( ( o = ( e = g( h( n.value ) ) ).next ( ) ).done || ( i = e.next ( ) ).done || ! e.next ( ).done ) {

                                    throw TypeError( "Expected sequence with length 2" );
                                }

                                f.push( { key: o.value + "", value: i.value + "" } );
                            }

                        } else { // If object.

                            for ( u in a ) {

                                if ( l( a, u ) ) {

                                    f.push( { key: u, value: a[u] + "" } );
                                }
                            }
                        }

                    } else { // If string.

                        P( f, "string" == typeof a ? "?" === a.charAt( 0 ) ? a.slice( 1 ) : a : a + "" );
                    }
                }
            },

            L = U.prototype; // URLSearchParams.prototype.

        // Define prototype methods.
        u( L, {
            append:        function ( t, r ) {
                T( arguments.length, 2 );
                var n = b( this );
                n.entries.push( { key: t + "", value: r + "" } );
                n.updateURL ( );
            },
            delete:        function ( t ) {
                T( arguments.length, 1 );
                for ( var r = b( this ), n = r.entries, e = t + "", o = 0; o < n.length; ) {
                    n[o].key === e ? n.splice( o --, 1 ) : o ++;
                }
                r.updateURL ( );
            },
            get:           function ( t ) {
                T( arguments.length, 1 );
                for ( var r = b( this ).entries, n = t + "", e = 0; e < r.length; e ++ ) {
                    if ( r[e].key === n ) {
                        return r[e].value;
                    }
                }
                return null;
            },
            getAll:        function ( t ) {
                T( arguments.length, 1 );
                for ( var r = b( this ).entries, n = t + "", e = [ ], o = 0; o < r.length; o ++ ) {
                    if ( r[o].key === n ) {
                        e.push( r[o].value );
                    }
                }
                return e;
            },
            has:           function ( t ) {
                T( arguments.length, 1 );
                for ( var r = b( this ).entries, n = t + "", e = 0; e < r.length; ) {
                    if ( r[e ++].key === n ) {
                        return ! ! true;
                    }
                }
                return ! ! false;
            },
            set:           function ( t, r ) {
                T( arguments.length, 1 );
                for ( var n, e = b( this ), o = e.entries, i = ! ! false, u = t + "", a = r + "", c = 0; c < o.length; c ++ ) {
                    if ( ( n = o[c] ).key === u ) {
                        i ? o.splice( c --, 1 ) : ( i = ! ! true, n.value = a );
                    }
                }
                if ( ! i ) {
                    o.push( { key: u, value: a } );
                }
                e.updateURL ( );
            },
            sort:          function ( ) {
                var t, r, n,
                    e = b( this ),
                    o = e.entries,
                    i = o.slice ( );

                for ( o.length = 0, n = 0; n < i.length; n ++ ) {

                    for ( t = i[n], r = 0; r < n; r ++ ) {

                        if ( o[r].key > t.key ) {

                            o.splice( r, 0, t );
                            break;
                        }
                    }

                    if ( r === n ) {
                        o.push( t );
                    }
                }

                e.updateURL ( );
            },
            forEach:       function ( t ) {
                for ( var r, n = b( this ).entries, e = p( t, arguments.length > 1 ? arguments[1] : void 0, 3 ), o = 0; o < n.length; ) {
                    e( ( r = n[o ++] ).value, r.key, this );
                }
            },
            keys:          function ( ) {
                return new _( this, "keys" );
            },
            values:        function ( ) {
                return new _( this, "values" );
            },
            entries:       function ( ) {
                return new _( this, "entries" );
            }
        }, { enumerable: ! ! true } );

        // Set Symbol.iterator and toString methods.
        i( L, y, L.entries );
        i( L, "toString", function ( ) {
            for ( var t, r = b( this ).entries, n = [ ], e = 0; e < r.length; ) {
                t = r[e ++], n.push( M( t.key ) + "=" + M( t.value ) );
            }
            return n.join( "&" );
        }, { enumerable: ! ! true } );

        // Set Symbol.toStringTag.
        a( U, "URLSearchParams" );

        // Export to global scope.
        e( { global: ! ! true, forced: ! o }, { URLSearchParams: U } );

        t.exports = { URLSearchParams: U, getState: b };
    },

    /*
     * Module 132: Node.js 'fs' module.
     * This module imports the native Node.js 'fs' (file system) module,
     * used for reading files (e.g., stdin).
     */
    function ( t, r ) {
        t.exports = require( "fs" );
    },

    /*
     * Module 133: Main entry point.
     * This is the main module that orchestrates the loading of other modules
     * and executes the primary application logic.
     */
    function ( t, r, n ) {
        "use strict";

        // Mark this module as an ECMAScript module.
        n.r( r );

        // Import various polyfills and features.
        n( 134 ), n( 136 ), n( 137 ), n( 138 ), n( 139 ), n( 140 ), n( 141 ), n( 142 ), n( 143 ), n( 144 ), n( 145 ), n( 146 ), n( 147 ), n( 148 ), n( 149 ), n( 150 ), n( 151 ), n( 152 ), n( 153 ), n( 86 ), n( 154 ), n( 156 ), n( 157 ), n( 158 ), n( 159 ), n( 160 ), n( 161 ), n( 162 ), n( 163 ), n( 165 ), n( 166 ), n( 88 ), n( 167 ), n( 169 ), n( 170 ), n( 171 ), n( 172 ), n( 173 ), n( 174 ), n( 175 ), n( 176 ), n( 177 ), n( 178 ), n( 180 ), n( 181 ), n( 182 ), n( 183 ), n( 184 ), n( 186 ), n( 187 ), n( 188 ), n( 189 ), n( 190 ), n( 191 ), n( 192 ), n( 193 ), n( 194 ), n( 195 ), n( 196 ), n( 197 ), n( 198 ), n( 199 ), n( 121 ), n( 200 ), n( 201 ), n( 202 ), n( 203 ), n( 205 ), n( 206 ), n( 207 ), n( 209 ), n( 210 ), n( 211 ), n( 212 ), n( 213 ), n( 214 ), n( 218 ), n( 219 ), n( 220 ), n( 221 ), n( 222 ), n( 223 ), n( 224 ), n( 225 ), n( 226 ), n( 227 ), n( 228 ), n( 229 ), n( 230 ), n( 96 ), n( 231 ), n( 232 ), n( 233 ), n( 234 ), n( 235 ), n( 236 ), n( 237 ), n( 238 ), n( 239 ), n( 240 ), n( 241 ), n( 242 ), n( 243 ), n( 244 ), n( 245 ), n( 247 ), n( 248 ), n( 249 ), n( 250 ), n( 251 ), n( 252 ), n( 253 ), n( 254 ), n( 255 ), n( 256 ), n( 257 ), n( 258 ), n( 259 ), n( 262 ), n( 263 ), n( 264 ), n( 265 ), n( 266 ), n( 267 ), n( 268 ), n( 270 ), n( 271 ), n( 272 ), n( 274 ), n( 275 ), n( 276 ), n( 277 ), n( 278 ), n( 279 ), n( 280 ), n( 281 ), n( 282 ), n( 283 ), n( 284 ), n( 285 ), n( 286 ), n( 287 ), n( 288 ), n( 289 ), n( 290 ), n( 291 ), n( 292 ), n( 293 ), n( 294 ), n( 295 ), n( 296 ), n( 297 ), n( 298 ), n( 299 ), n( 300 ), n( 301 ), n( 302 ), n( 303 ), n( 304 ), n( 305 ), n( 306 ), n( 307 ), n( 308 ), n( 309 ), n( 310 ), n( 311 ), n( 312 ), n( 313 ), n( 314 ), n( 315 ), n( 316 ), n( 317 ), n( 318 ), n( 319 ), n( 322 ), n( 131 ), n( 323 );

        // Import the 'fs' module for file system operations.
        var e = n( 132 );

        // Main application logic wrapped in an IIFE.
        ! function ( t ) {

            var r = t.split( "\n" )[1].split( " " ), // Process input string.
                n = 0,
                e = ! ! true,
                o = ! ! false,
                i = void 0;

            try {
                // Iterate over values to calculate sum of reciprocals.
                for ( var u, a = r[Symbol.iterator] ( ); ! ( e = ( u = a.next ( ) ).done ); e = ! ! true ) {

                    n += 1 / u.value;
                }

            } catch ( t ) {

                o = ! ! true;
                i = t;

            } finally {

                try {
                    if ( ! e && null != a.return ) {
                        a.return ( );
                    }
                } finally {
                    if ( o ) {
                        throw i;
                    }
                }
            }

            // Print the reciprocal of the sum.
            console.log( 1 / n );

        } ( e.readFileSync( "/dev/stdin", "utf8" ) ); // Read input from stdin.
    },

    /*
     * Module 134: Symbol polyfill.
     * This module provides a polyfill for the `Symbol` constructor,
     * handling unique symbol creation and description.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 5 ),     // Module 5: Global object.
            i = n( 2 ),     // Module 2: Pure flag.
            u = n( 9 ),     // Module 9: Object.defineProperty support.
            a = n( 102 ),   // Module 102: Check for native Symbol support.
            c = n( 7 ),     // Module 7: Safe execution.
            f = n( 14 ),    // Module 14: HasOwnProperty.
            s = n( 47 ),    // Module 47: Check if value is an array.
            l = n( 8 ),     // Module 8: Check if value is an object.
            p = n( 1 ),     // Module 1: Ensure object.
            h = n( 15 ),    // Module 15: ToObject.
            v = n( 25 ),    // Module 25: ToObject (strict).
            g = n( 29 ),    // Module 29: ToPrimitive.
            d = n( 35 ),    // Module 35: Create property descriptor.
            y = n( 30 ),    // Module 30: Object.create.
            m = n( 63 ),    // Module 63: Object.keys.
            b = n( 39 ),    // Module 39: Object.getOwnPropertyNames.
            x = n( 135 ),   // Module 135: Object.getOwnPropertyNames.f (for window).
            w = n( 83 ),    // Module 83: Object.getOwnPropertySymbols.
            S = n( 22 ),    // Module 22: Object.getOwnPropertyDescriptor.
            A = n( 11 ),    // Module 11: Object.defineProperty.
            E = n( 58 ),    // Module 58: PropertyIsEnumerable.
            R = n( 16 ),    // Module 16: Define property.
            O = n( 23 ),    // Module 23: Define property (with fallback).
            I = n( 38 ),    // Module 38: Shared data.
            j = n( 59 ),    // Module 59: Generate unique key.
            M = n( 46 ),    // Module 46: Internal property flags.
            P = n( 45 ),    // Module 45: Generate unique ID.
            k = n( 6 ),     // Module 6: Well-known symbols.
            T = n( 105 ),   // Module 105: Symbol.for helper.
            _ = n( 19 ),    // Module 19: Register a well-known symbol.
            U = n( 26 ),    // Module 26: Set Symbol.toStringTag.
            L = n( 18 ),    // Module 18: Internal state.
            F = n( 48 ).forEach, // Module 48: Array.prototype.forEach.

            B = j( "hidden" ), // Internal symbol for hidden properties.
            C = k( "toPrimitive" ), // Symbol.toPrimitive.
            N = L.set,      // Set internal state.
            D = L.getterFor( "Symbol" ), // Getter for Symbol internal state.

            z = Object.prototype, // Native Object.prototype.
            W = o.Symbol,   // Native Symbol constructor.
            q = o.JSON,     // Native JSON object.
            V = q && q.stringify, // JSON.stringify.

            K = S.f,        // Object.getOwnPropertyDescriptor.f.
            G = A.f,        // Object.defineProperty.f.
            Y = x.f,        // Object.getOwnPropertyNames.f (for window).
            $ = E.f,        // PropertyIsEnumerable.f.

            J = I( "symbols" ), // Shared registry for symbols.
            Q = I( "op-symbols" ), // Shared registry for symbols defined on Object.prototype.
            X = I( "string-to-symbol-registry" ), // Shared registry for Symbol.for.
            Z = I( "symbol-to-string-registry" ), // Shared registry for Symbol.keyFor.
            H = I( "wks" ), // Shared registry for well-known symbols.

            tt = o.QObject, // ActiveX QObject (for IE).
            rt = ! ! tt && ! ! tt.prototype && ! ! tt.prototype.findChild, // Test for QObject bug.

            // nt: Define property, handling QObject bug.
            nt = u && c( function ( ) {

                return 7 != y( G( { }, "a", {
                    get: function ( ) {
                        return G( this, "a", { value: 7 } ).a;
                    }
                } ) ).a;

            } ) ? function ( t, r, n ) {

                var e = K( z, r );
                if ( e ) {
                    delete z[r];
                }
                G( t, r, n );
                if ( e && t !== z ) {
                    G( z, r, e );
                }

            } : G,

            // et: Creates a new Symbol object.
            et = function ( t, r ) {

                var n = J[t] = y( W.prototype ); // Create new Symbol object with prototype.
                N( n, { type: "Symbol", tag: t, description: r } ); // Store internal state.

                if ( u ) {
                    n.description = r; // Set description property.
                }

                return n;
            },

            // ot: Checks if a value is a Symbol instance.
            ot = a && "symbol" == typeof W.iterator ? function ( t ) {
                return "symbol" == typeof t
            } : function ( t ) {
                return Object( t ) instanceof W
            },

            // it: Defines a property, handling symbols.
            it = function ( t, r, n ) {

                if ( t === z ) {
                    it( Q, r, n );
                }

                p( t ); // Ensure target is an object.
                var e = g( r, ! ! true ); // Convert key to primitive.

                // If it's a known symbol.
                if ( f( J, e ) ) {

                    // If enumerable, make sure it's not hidden.
                    if ( n.enumerable ) {
                        if ( f( t, B ) && t[B][e] ) {
                            t[B][e] = ! ! false;
                        }
                    } else { // If not enumerable, hide it.
                        if ( ! f( t, B ) ) {
                            G( t, B, d( 1, { } ) );
                        }
                        t[B][e] = ! ! true;
                    }

                    nt( t, e, n ); // Define property.

                } else {

                    G( t, e, n ); // Define property directly.
                }
            },

            // ut: Defines multiple properties.
            ut = function ( t, r ) {

                p( t ); // Ensure target is an object.

                var n = v( r ), // Convert source to object.
                    e = m( n ).concat( st( n ) ); // Get all string and symbol properties.

                F( e, function ( r ) {

                    if ( u && ! $.call( n, r ) ) { // If not enumerable and defineProperty is supported.
                        return;
                    }

                    it( t, r, n[r] ); // Define property.
                } );

                return t;
            },

            // at: Checks if a property is enumerable, handling symbols.
            at = function ( t ) {

                var r = g( t, ! ! true ),
                    n = $.call( this, r );

                // If not Object.prototype and not a known symbol or not hidden.
                return ! ( this === z && f( J, r ) && ! f( Q, r ) ) &&
                    ( ! ( n || ! f( this, r ) || ! f( J, r ) || f( this, B ) && this[B][r] ) || n );
            },

            // ct: Retrieves property descriptor, handling symbols.
            ct = function ( t, r ) {

                var n = v( t ),
                    e = g( r, ! ! true );

                // If not Object.prototype or not a known symbol or not on QObject.
                if ( n !== z || ! f( J, e ) || f( Q, e ) ) {

                    var o = K( n, e ); // Get native descriptor.

                    // If descriptor exists and is a known symbol and not hidden.
                    if ( o && ! f( J, e ) || f( n, B ) && n[B][e] ) {
                        o.enumerable = ! ! true; // Mark as enumerable.
                    }

                    return o;
                }
            },

            // ft: Retrieves all string property names, excluding internal.
            ft = function ( t ) {

                var r = Y( v( t ) ),
                    n = [ ];

                F( r, function ( t ) {

                    if ( ! f( J, t ) && ! f( M, t ) ) {

                        n.push( t );
                    }
                } );

                return n;
            },

            // st: Retrieves all symbol property names.
            st = function ( t ) {

                var r = t === z,
                    n = Y( r ? Q : v( t ) ),
                    e = [ ];

                F( n, function ( t ) {

                    if ( f( J, t ) && ( ! r || f( z, t ) ) ) {

                        e.push( J[t] );
                    }
                } );

                return e;
            };

        // If native Symbol is not supported.
        if ( ! a ) {

            // Polyfill Symbol constructor.
            O( ( W = function ( ) {

                if ( this instanceof W ) {

                    throw TypeError( "Symbol is not a constructor" );
                }

                var t = arguments.length && void 0 !== arguments[0] ? String( arguments[0] ) : void 0,
                    r = P( t ), // Generate unique ID.
                    n = function ( t ) {

                        if ( this === z && n.call( Q, t ) );

                        if ( f( this, B ) && f( this[B], r ) ) {

                            this[B][r] = ! ! false;
                        }

                        nt( this, r, d( 1, t ) ); // Define property on `this`.
                    };

                if ( u && rt ) { // QObject bug workaround.

                    nt( z, r, { configurable: ! ! true, set: n } );
                }

                return et( r, t ); // Create and return Symbol object.

            } ).prototype, "toString", function ( ) {

                return D( this ).tag; // Custom toString.

            } );

            ( E.f = at, A.f = it, S.f = ct, b.f = x.f = ft, w.f = st );

            // If Object.defineProperty is supported.
            if ( u ) {

                G( W.prototype, "description", { configurable: ! ! true, get: function ( ) {
                    return D( this ).description;
                } } );

                if ( ! i ) { // If not pure, define propertyIsEnumerable on Object.prototype.
                    O( z, "propertyIsEnumerable", at, { unsafe: ! ! true } );
                }
            }

            T.f = function ( t ) {
                return et( k( t ), t );
            };
        }

        // Export Symbol to global scope.
        e( { global: ! ! true, wrap: ! ! true, forced: ! a, sham: ! a }, { Symbol: W } );

        // Register well-known symbols.
        F( m( H ), function ( t ) {
            _( t );
        } );

        // Export static Symbol methods.
        e( { target: "Symbol", stat: ! ! true, forced: ! a }, {
            for:    function ( t ) {

                var r = String( t );
                if ( f( X, r ) ) {
                    return X[r];
                }

                var n = W( r );
                return X[r] = n, Z[n] = r, n;
            },
            keyFor: function ( t ) {

                if ( ! ot( t ) ) {

                    throw TypeError( t + " is not a symbol" );
                }

                if ( f( Z, t ) ) {
                    return Z[t];
                }
            },
            useSetter: function ( ) {
                rt = ! ! true;
            },
            useSimple: function ( ) {
                rt = ! ! false;
            }
        } );

        // Export Object static methods related to symbols.
        e( { target: "Object", stat: ! ! true, forced: ! a, sham: ! u }, {
            create:               function ( t, r ) {
                return void 0 === r ? y( t ) : ut( y( t ), r );
            },
            defineProperty:       it,
            defineProperties:     ut,
            getOwnPropertyDescriptor: ct
        } );

        // Export Object static methods for property names/symbols.
        e( { target: "Object", stat: ! ! true, forced: ! a }, { getOwnPropertyNames: ft, getOwnPropertySymbols: st } );

        // Export Object.getOwnPropertySymbols with a workaround for buggy implementations.
        e( { target: "Object", stat: ! ! true, forced: c( function ( ) {
            w.f( 1 );
        } ) }, {
            getOwnPropertySymbols: function ( t ) {
                return w.f( h( t ) );
            }
        } );

        // Polyfill JSON.stringify for symbols.
        if ( q ) {

            e( { target: "JSON", stat: ! ! true, forced: ! a || c( function ( ) {

                var t = W ( );
                return "[null]" != V( [ t ] ) || "{}" != V( { a: t } ) || "{}" != V( Object( t ) );

            } ) }, {
                stringify: function ( t ) {

                    for ( var r, n, e = [ t ], o = 1; arguments.length > o; ) {

                        e.push( arguments[o ++] );
                    }

                    if ( n = r = e[1], ( l( r ) || void 0 !== t ) && ! ot( t ) ) {

                        if ( s( r ) ) {

                            r = function ( t, r ) {

                                if ( "function" == typeof n && ( r = n.call( this, t, r ) ), ! ot( r ) ) {
                                    return r;
                                }
                            };
                        }

                        e[1] = r;
                        return V.apply( q, e );
                    }
                }
            } );
        }

        // Define Symbol.toPrimitive on Symbol.prototype.
        if ( ! W.prototype[C] ) {
            R( W.prototype, C, W.prototype.valueOf );
        }

        // Set Symbol.toStringTag for Symbol.
        U( W, "Symbol" );

        // Mark internal symbol.
        M[B] = ! ! true;
    },

    /*
     * Module 135: Object.getOwnPropertyNames for window object.
     * This module provides a specialized version of `Object.getOwnPropertyNames`
     * for the global `window` object, handling its unique properties.
     */
    function ( t, r, n ) {

        var e = n( 25 ),    // Module 25: ToObject (strict).
            o = n( 39 ).f,  // Module 39: Object.getOwnPropertyNames.f.
            i = { }.toString, // Native Object.prototype.toString.
            u = "object" == typeof window && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames( window ) : [ ]; // Names for window.

        r.f = function ( t ) {

            // If it's the window object, use a special handler.
            if ( u && "[object Window]" == i.call( t ) ) {

                return ( function ( t ) {
                    try {
                        return o( t );
                    } catch ( t ) {
                        return u.slice ( );
                    }
                } ) ( t );
            }

            return o( e( t ) ); // Otherwise, use standard getOwnPropertyNames.
        };
    },

    /*
     * Module 136: Symbol.prototype.description polyfill.
     * This module provides a polyfill for the `Symbol.prototype.description` getter,
     * ensuring that symbols have a correct description property.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 9 ),     // Module 9: Object.defineProperty support.
            i = n( 5 ),     // Module 5: Global object.
            u = n( 14 ),    // Module 14: HasOwnProperty.
            a = n( 8 ),     // Module 8: Check if value is an object.
            c = n( 11 ).f,  // Module 11: Object.defineProperty.f.
            f = n( 100 ),   // Module 100: Copy properties.
            s = i.Symbol;   // Native Symbol constructor.

        // If Object.defineProperty is supported and Symbol.prototype.description is missing or buggy.
        if ( o && "function" == typeof s && ( ! ( "description" in s.prototype ) || void 0 !== s( ).description ) ) {

            var l = { }, // Object to track empty symbols.

                // p: Polyfilled Symbol constructor.
                p = function ( ) {

                    var t = arguments.length < 1 || void 0 === arguments[0] ? void 0 : String( arguments[0] ),
                        r = this instanceof p ? new s( t ) : void 0 === t ? s ( ) : s( t );

                    if ( "" === t ) {
                        l[r] = ! ! true; // Mark as empty symbol.
                    }

                    return r;
                };

            f( p, s ); // Copy properties from native Symbol.

            var h = p.prototype = s.prototype; // Set prototype.
            h.constructor = p; // Set constructor.

            var v = h.toString, // Native toString.
                g = "Symbol(test)" == String( s( "test" ) ), // Test toString behavior.
                d = /^Symbol\((.*)\)[^)]+$/; // Regex to extract description.

            // Define `description` getter on prototype.
            c( h, "description", {
                configurable: ! ! true,
                get:          function ( ) {

                    var t = a( this ) ? this.valueOf ( ) : this,
                        r = v.call( t );

                    if ( u( l, t ) ) { // If empty symbol.
                        return "";
                    }

                    var n = g ? r.slice( 7, - 1 ) : r.replace( d, "$1" ); // Extract description.

                    return "" === n ? void 0 : n;
                }
            } );

            // Export to global scope.
            e( { global: ! ! true, forced: ! ! true }, { Symbol: p } );
        }
    },

    /*
     * Module 137: Register Symbol.asyncIterator.
     * This module registers the well-known `Symbol.asyncIterator` symbol.
     */
    function ( t, r, n ) {
        n( 19 )( "asyncIterator" ); // Module 19: Register a well-known symbol.
    },

    /*
     * Module 138: Register Symbol.hasInstance.
     * This module registers the well-known `Symbol.hasInstance` symbol.
     */
    function ( t, r, n ) {
        n( 19 )( "hasInstance" ); // Module 19: Register a well-known symbol.
    },

    /*
     * Module 139: Register Symbol.isConcatSpreadable.
     * This module registers the well-known `Symbol.isConcatSpreadable` symbol.
     */
    function ( t, r, n ) {
        n( 19 )( "isConcatSpreadable" ); // Module 19: Register a well-known symbol.
    },

    /*
     * Module 140: Register Symbol.match.
     * This module registers the well-known `Symbol.match` symbol.
     */
    function ( t, r, n ) {
        n( 19 )( "match" ); // Module 19: Register a well-known symbol.
    },

    /*
     * Module 141: Register Symbol.replace.
     * This module registers the well-known `Symbol.replace` symbol.
     */
    function ( t, r, n ) {
        n( 19 )( "replace" ); // Module 19: Register a well-known symbol.
    },

    /*
     * Module 142: Register Symbol.search.
     * This module registers the well-known `Symbol.search` symbol.
     */
    function ( t, r, n ) {
        n( 19 )( "search" ); // Module 19: Register a well-known symbol.
    },

    /*
     * Module 143: Register Symbol.species.
     * This module registers the well-known `Symbol.species` symbol.
     */
    function ( t, r, n ) {
        n( 19 )( "species" ); // Module 19: Register a well-known symbol.
    },

    /*
     * Module 144: Register Symbol.split.
     * This module registers the well-known `Symbol.split` symbol.
     */
    function ( t, r, n ) {
        n( 19 )( "split" ); // Module 19: Register a well-known symbol.
    },

    /*
     * Module 145: Register Symbol.toPrimitive.
     * This module registers the well-known `Symbol.toPrimitive` symbol.
     */
    function ( t, r, n ) {
        n( 19 )( "toPrimitive" ); // Module 19: Register a well-known symbol.
    },

    /*
     * Module 146: Register Symbol.toStringTag.
     * This module registers the well-known `Symbol.toStringTag` symbol.
     */
    function ( t, r, n ) {
        n( 19 )( "toStringTag" ); // Module 19: Register a well-known symbol.
    },

    /*
     * Module 147: Array.prototype.concat (polyfill).
     * This module provides a polyfill for `Array.prototype.concat`,
     * ensuring correct behavior with `Symbol.isConcatSpreadable`.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 7 ),     // Module 7: Safe execution.
            i = n( 47 ),    // Module 47: Check if value is an array.
            u = n( 8 ),     // Module 8: Check if value is an object.
            a = n( 15 ),    // Module 15: ToObject.
            c = n( 10 ),    // Module 10: ToLength.
            f = n( 40 ),    // Module 40: Define indexed property.
            s = n( 49 ),    // Module 49: ArraySpeciesCreate.
            l = n( 50 ),    // Module 50: Test Array.prototype methods for species.
            p = n( 6 )( "isConcatSpreadable" ), // Symbol.isConcatSpreadable.

            // h: Test for `Symbol.isConcatSpreadable` bug.
            h = ! o( function ( ) {
                var t = [ ];
                return t[p] = ! ! false, t.concat ( )[0] !== t;
            } ),

            // v: Test if concat works correctly.
            v = l( "concat" ),

            // g: Checks if a value is concat-spreadable.
            g = function ( t ) {
                if ( ! u( t ) ) {
                    return ! ! false;
                }
                var r = t[p];
                return void 0 !== r ? ! ! r : i( t );
            };

        // Export concat polyfill.
        e( { target: "Array", proto: ! ! true, forced: ! h || ! v }, {
            concat: function ( t ) {

                var r, n, e, o, i, u = a( this ), // Convert 'this' to object.
                    l = s( u, 0 ),             // Create new array.
                    p = 0;

                for ( r = - 1, e = arguments.length; r < e; r ++ ) {

                    i = - 1 === r ? u : arguments[r]; // Current item.

                    if ( g( i ) ) { // If concat-spreadable.

                        if ( p + ( o = c( i.length ) ) > 9007199254740991 ) {

                            throw TypeError( "Maximum allowed index exceeded" );
                        }

                        for ( n = 0; n < o; n ++, p ++ ) {

                            if ( n in i ) {
                                f( l, p, i[n] );
                            }
                        }

                    } else { // Not concat-spreadable.

                        if ( p >= 9007199254740991 ) {

                            throw TypeError( "Maximum allowed index exceeded" );
                        }

                        f( l, p ++, i );
                    }
                }

                return l.length = p, l; // Set final length and return.
            }
        } );
    },

    /*
     * Module 148: Array.prototype.filter (polyfill).
     * This module provides a polyfill for `Array.prototype.filter`.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 48 ).filter; // Module 48: Array.prototype.filter (core).

        // Export filter polyfill.
        e( { target: "Array", proto: ! ! true, forced: ! n( 50 )( "filter" ) }, {
            filter: function ( t ) {

                return o( this, t, arguments.length > 1 ? arguments[1] : void 0 );
            }
        } );
    },

    /*
     * Module 149: Array.prototype.flat (polyfill).
     * This module provides a polyfill for `Array.prototype.flat`.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 106 ),   // Module 106: Array.prototype.flat/flatMap (core).
            i = n( 15 ),    // Module 15: ToObject.
            u = n( 10 ),    // Module 10: ToLength.
            a = n( 24 ),    // Module 24: ToInteger.
            c = n( 49 );    // Module 49: ArraySpeciesCreate.

        // Export flat polyfill.
        e( { target: "Array", proto: ! ! true }, {
            flat: function ( ) {

                var t = arguments.length ? arguments[0] : void 0, // Depth argument.
                    r = i( this ),                               // Convert 'this' to object.
                    n = u( r.length ),                           // Get length.
                    e = c( r, 0 );                               // Create new array.

                return e.length = o( e, r, r, n, 0, void 0 === t ? 1 : a( t ) ), e; // Flatten and return.
            }
        } );
    },

    /*
     * Module 150: Array.prototype.flatMap (polyfill).
     * This module provides a polyfill for `Array.prototype.flatMap`.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 106 ),   // Module 106: Array.prototype.flat/flatMap (core).
            i = n( 15 ),    // Module 15: ToObject.
            u = n( 10 ),    // Module 10: ToLength.
            a = n( 4 ),     // Module 4: Ensure function.
            c = n( 49 );    // Module 49: ArraySpeciesCreate.

        // Export flatMap polyfill.
        e( { target: "Array", proto: ! ! true }, {
            flatMap: function ( t ) {

                var r,
                    n = i( this ),                         // Convert 'this' to object.
                    e = u( n.length );                     // Get length.

                a( t );                                    // Ensure callback is a function.

                return ( r = c( n, 0 ) ).length = o( r, n, n, e, 0, 1, t, arguments.length > 1 ? arguments[1] : void 0 ), r; // Flatten and map.
            }
        } );
    },

    /*
     * Module 151: Array.from (static polyfill).
     * This module provides a static polyfill for `Array.from`.
     */
    function ( t, r, n ) {
        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 107 );   // Module 107: Array.from (core).

        // Export Array.from static polyfill.
        e( { target: "Array", stat: ! ! true, forced: ! n( 64 )( function ( t ) {
            Array.from( t );
        } ) }, { from: o } );
    },

    /*
     * Module 152: Array.prototype.includes (polyfill).
     * This module provides a polyfill for `Array.prototype.includes`.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 60 ).includes, // Module 60: Array.prototype.includes (core).
            i = n( 41 );    // Module 41: Add method to Array.prototype (unscopables).

        // Export includes polyfill.
        e( { target: "Array", proto: ! ! true }, {
            includes: function ( t ) {

                return o( this, t, arguments.length > 1 ? arguments[1] : void 0 );
            }
        } );

        // Mark 'includes' as unscopable.
        i( "includes" );
    },

    /*
     * Module 153: Array.prototype.indexOf (polyfill).
     * This module provides a polyfill for `Array.prototype.indexOf`.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 60 ).indexOf, // Module 60: Array.prototype.indexOf (core).
            i = n( 85 ),    // Module 85: Test array methods for correct behavior.
            u = [ ].indexOf, // Native Array.prototype.indexOf.

            // a: Test for specific bug in indexOf (e.g., -0).
            a = ! ! u && 1 / [ 1 ].indexOf( 1, - 0 ) < 0,

            // c: Check if indexOf is buggy.
            c = i( "indexOf" );

        // Export indexOf polyfill.
        e( { target: "Array", proto: ! ! true, forced: a || c }, {
            indexOf: function ( t ) {

                return a ? u.apply( this, arguments ) || 0 : o( this, t, arguments.length > 1 ? arguments[1] : void 0 );
            }
        } );
    },

    /*
     * Module 154: Array.prototype.lastIndexOf (polyfill).
     * This module provides a polyfill for `Array.prototype.lastIndexOf`.
     */
    function ( t, r, n ) {
        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 155 );   // Module 155: Array.prototype.lastIndexOf (core).

        // Export lastIndexOf polyfill.
        e( { target: "Array", proto: ! ! true, forced: o !== [ ].lastIndexOf }, { lastIndexOf: o } );
    },

    /*
     * Module 155: Array.prototype.lastIndexOf (core logic).
     * This module provides the core logic for `Array.prototype.lastIndexOf`,
     * searching an array for a value from right to left.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 25 ),    // Module 25: ToObject (strict).
            o = n( 24 ),    // Module 24: ToInteger.
            i = n( 10 ),    // Module 10: ToLength.
            u = n( 85 ),    // Module 85: Test array methods for correct behavior.
            a = Math.min,   // Math.min utility.
            c = [ ].lastIndexOf, // Native Array.prototype.lastIndexOf.

            // f: Test for specific bug in lastIndexOf (e.g., -0).
            f = ! ! c && 1 / [ 1 ].lastIndexOf( 1, - 0 ) < 0,

            // s: Check if lastIndexOf is buggy.
            s = u( "lastIndexOf" );

        t.exports = f || s ? function ( t ) {

            if ( f ) {
                return c.apply( this, arguments ) || 0;
            }

            var r = e( this ),       // Convert 'this' to object.
                n = i( r.length ),   // Get length.
                u = n - 1;           // Starting index.

            // Adjust starting index if provided.
            if ( arguments.length > 1 ) {
                u = a( u, o( arguments[1] ) );
            }

            // Adjust negative starting index.
            if ( u < 0 ) {
                u = n + u;
            }

            // Iterate from right to left.
            for ( ; u >= 0; u -- ) {

                if ( u in r && r[u] === t ) {
                    return u || 0;
                }
            }

            return - 1; // Not found.

        } : c; // Use native lastIndexOf.
    },

    /*
     * Module 156: Array.prototype.map (polyfill).
     * This module provides a polyfill for `Array.prototype.map`.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 48 ).map; // Module 48: Array.prototype.map (core).

        // Export map polyfill.
        e( { target: "Array", proto: ! ! true, forced: ! n( 50 )( "map" ) }, {
            map: function ( t ) {

                return o( this, t, arguments.length > 1 ? arguments[1] : void 0 );
            }
        } );
    },

    /*
     * Module 157: Array.prototype.slice (polyfill).
     * This module provides a polyfill for `Array.prototype.slice`.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 8 ),     // Module 8: Check if value is an object.
            i = n( 47 ),    // Module 47: Check if value is an array.
            u = n( 61 ),    // Module 61: ToAbsoluteIndex.
            a = n( 10 ),    // Module 10: ToLength.
            c = n( 25 ),    // Module 25: ToObject (strict).
            f = n( 40 ),    // Module 40: Define indexed property.
            s = n( 50 ),    // Module 50: Test Array.prototype methods for species.
            l = n( 6 )( "species" ), // Symbol.species.
            p = [ ].slice,   // Native Array.prototype.slice.
            h = Math.max;   // Math.max utility.

        // Export slice polyfill.
        e( { target: "Array", proto: ! ! true, forced: ! s( "slice" ) }, {
            slice: function ( t, r ) {

                var n, e, s, v = c( this ), // Convert 'this' to object.
                    g = a( v.length ),       // Get length.
                    d = u( t, g ),           // Start index.
                    y = u( void 0 === r ? g : r, g ); // End index.

                // If it's an array and species constructor is Array or undefined.
                if ( i( v ) && ( "function" != typeof ( n = v.constructor ) || n !== Array && ! i( n.prototype ) ? o( n ) && null === ( n = n[l] ) && ( n = void 0 ) : n = void 0, n === Array || void 0 === n ) ) {

                    return p.call( v, d, y ); // Use native slice.
                }

                // Create new array using species constructor.
                for ( e = new ( void 0 === n ? Array : n ) ( h( y - d, 0 ) ), s = 0; d < y; d ++, s ++ ) {

                    if ( d in v ) {
                        f( e, s, v[d] ); // Copy elements.
                    }
                }

                return e.length = s, e; // Set final length and return.
            }
        } );
    },

    /*
     * Module 158: Array.prototype.sort (polyfill).
     * This module provides a polyfill for `Array.prototype.sort`.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 4 ),     // Module 4: Ensure function.
            i = n( 15 ),    // Module 15: ToObject.
            u = n( 7 ),     // Module 7: Safe execution.
            a = n( 85 ),    // Module 85: Test array methods for correct behavior.
            c = [ ].sort,   // Native Array.prototype.sort.

            // f: Test for sort with undefined callback.
            f = u( function ( ) {
                [ 1, 2, 3 ].sort( void 0 );
            } ),

            // s: Test for sort with null callback.
            s = u( function ( ) {
                [ 1, 2, 3 ].sort( null );
            } ),

            // l: Check if sort is buggy.
            l = a( "sort" );

        // Export sort polyfill.
        e( { target: "Array", proto: ! ! true, forced: f || ! s || l }, {
            sort: function ( t ) {

                // If no callback, use native sort.
                // Otherwise, use native sort with callback.
                return void 0 === t ? c.call( i( this ) ) : c.call( i( this ), o( t ) );
            }
        } );
    },

    /*
     * Module 159: Set Symbol.species for Array.
     * This module sets the `Symbol.species` property on the `Array` constructor.
     */
    function ( t, r, n ) {
        n( 43 )( "Array" ); // Module 43: Set Symbol.species.
    },

    /*
     * Module 160: Array.prototype.splice (polyfill).
     * This module provides a polyfill for `Array.prototype.splice`.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 61 ),    // Module 61: ToAbsoluteIndex.
            i = n( 24 ),    // Module 24: ToInteger.
            u = n( 10 ),    // Module 10: ToLength.
            a = n( 15 ),    // Module 15: ToObject.
            c = n( 49 ),    // Module 49: ArraySpeciesCreate.
            f = n( 40 ),    // Module 40: Define indexed property.
            s = n( 50 ),    // Module 50: Test Array.prototype methods for species.
            l = Math.max,   // Math.max utility.
            p = Math.min;   // Math.min utility.

        // Export splice polyfill.
        e( { target: "Array", proto: ! ! true, forced: ! s( "splice" ) }, {
            splice: function ( t, r ) {

                var n, e, s, h, v, g,
                    d = a( this ),       // Convert 'this' to object.
                    y = u( d.length ),   // Get length.
                    m = o( t, y ),       // Start index.
                    b = arguments.length;

                // Calculate delete count and insert count.
                if ( 0 === b ) {
                    n = e = 0;
                } else if ( 1 === b ) {
                    ( n = 0, e = y - m );
                } else {
                    ( n = b - 2, e = p( l( i( r ), 0 ), y - m ) );
                }

                // Check for exceeding max length.
                if ( y + n - e > 9007199254740991 ) {

                    throw TypeError( "Maximum allowed length exceeded" );
                }

                // Copy deleted elements to result array.
                for ( s = c( d, e ), h = 0; h < e; h ++ ) {

                    if ( ( v = m + h ) in d ) {
                        f( s, h, d[v] );
                    }
                }

                // Adjust length of result array.
                s.length = e;

                // Shift elements if insert count is less than delete count.
                if ( n < e ) {

                    for ( h = m; h < y - e; h ++ ) {

                        ( g = h + n, ( v = h + e ) in d ? d[g] = d[v] : delete d[g] );
                    }

                    for ( h = y; h > y - e + n; h -- ) {

                        delete d[h - 1];
                    }

                } else if ( n > e ) { // Shift elements if insert count is greater than delete count.

                    for ( h = y - e; h > m; h -- ) {

                        ( g = h + n - 1, ( v = h + e - 1 ) in d ? d[g] = d[v] : delete d[g] );
                    }
                }

                // Insert new elements.
                for ( h = 0; h < n; h ++ ) {

                    d[h + m] = arguments[h + 2];
                }

                return d.length = y - e + n, s; // Set final length and return deleted elements.
            }
        } );
    },

    /*
     * Module 161: Mark "flat" as unscopable.
     * This module marks the "flat" method as unscopable for `Array.prototype`.
     */
    function ( t, r, n ) {
        n( 41 )( "flat" ); // Module 41: Add method to Array.prototype (unscopables).
    },

    /*
     * Module 162: Mark "flatMap" as unscopable.
     * This module marks the "flatMap" method as unscopable for `Array.prototype`.
     */
    function ( t, r, n ) {
        n( 41 )( "flatMap" ); // Module 41: Add method to Array.prototype (unscopables).
    },

    /*
     * Module 163: Date.prototype[Symbol.toPrimitive] (polyfill).
     * This module provides a polyfill for `Date.prototype[Symbol.toPrimitive]`,
     * controlling how Date objects are converted to primitive values.
     */
    function ( t, r, n ) {

        var e = n( 16 ),    // Module 16: Define property.
            o = n( 164 ),   // Module 164: Date.prototype[Symbol.toPrimitive] (core).
            i = n( 6 )( "toPrimitive" ), // Symbol.toPrimitive.
            u = Date.prototype; // Native Date.prototype.

        // If Symbol.toPrimitive is not on Date.prototype, define it.
        if ( ! ( i in u ) ) {
            e( u, i, o );
        }
    },

    /*
     * Module 164: Date.prototype[Symbol.toPrimitive] (core logic).
     * This module provides the core logic for `Date.prototype[Symbol.toPrimitive]`,
     * converting Date objects to primitive values based on a hint.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 1 ),     // Module 1: Ensure object.
            o = n( 29 );    // Module 29: ToPrimitive.

        t.exports = function ( t ) {

            // Validate hint.
            if ( "string" !== t && "number" !== t && "default" !== t ) {

                throw TypeError( "Incorrect hint" );
            }

            return o( e( this ), "number" !== t ); // Convert to primitive.
        };
    },

    /*
     * Module 165: Function.prototype[Symbol.hasInstance] (polyfill).
     * This module provides a polyfill for `Function.prototype[Symbol.hasInstance]`,
     * used by the `instanceof` operator.
     */
    function ( t, r, n ) {
        "use strict";

        var e = n( 8 ),     // Module 8: Check if value is an object.
            o = n( 11 ),    // Module 11: Object.defineProperty.
            i = n( 21 ),    // Module 21: Get prototype of.
            u = n( 6 )( "hasInstance" ), // Symbol.hasInstance.
            a = Function.prototype; // Native Function.prototype.

        // If Symbol.hasInstance is not on Function.prototype, define it.
        if ( ! ( u in a ) ) {

            o.f( a, u, {
                value: function ( t ) {

                    if ( "function" != typeof this || ! e( t ) ) {
                        return ! ! false;
                    }

                    // If 'this' prototype is not an object, use direct instanceof.
                    if ( ! e( this.prototype ) ) {
                        return t instanceof this;
                    }

                    // Traverse prototype chain.
                    for ( ; t = i( t ); ) {

                        if ( this.prototype === t ) {
                            return ! ! true;
                        }
                    }

                    return ! ! false;
                }
            } );
        }
    },

    /*
     * Module 166: Set Symbol.toStringTag for JSON.
     * This module sets the `Symbol.toStringTag` property for the global `JSON` object.
     */
    function ( t, r, n ) {
        var e = n( 5 ); // Module 5: Global object.

        n( 26 )( e.JSON, "JSON", ! ! true ); // Module 26: Set Symbol.toStringTag.
    },

    /*
     * Module 167: Math.acosh (polyfill).
     * This module provides a polyfill for `Math.acosh`.
     */
    function ( t, r, n ) {
        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 168 ),   // Module 168: Math.log1p.
            i = Math.acosh, // Native Math.acosh.
            u = Math.log,   // Native Math.log.
            a = Math.sqrt,  // Native Math.sqrt.
            c = Math.LN2;   // Math.LN2 constant.

        // Export acosh polyfill.
        e( { target: "Math", stat: ! ! true, forced: ! i || 710 != Math.floor( i( Number.MAX_VALUE ) ) || i( 1 / 0 ) != 1 / 0 }, {
            acosh: function ( t ) {

                return ( t = + t ) < 1 ? NaN :
                    t > 94906265.62425156 ? u( t ) + c :
                        o( t - 1 + a( t - 1 ) * a( t + 1 ) );
            }
        } );
    },

    /*
     * Module 168: Math.log1p (polyfill).
     * This module provides a polyfill for `Math.log1p`.
     */
    function ( t, r ) {
        var n = Math.log; // Native Math.log.

        t.exports = Math.log1p || function ( t ) {

            // Use approximation for small values, otherwise native log.
            return ( t = + t ) > - 1e-8 && t < 1e-8 ? t - t * t / 2 : n( 1 + t );
        };
    },

    /*
     * Module 169: Set Symbol.toStringTag for Math.
     * This module sets the `Symbol.toStringTag` property for the global `Math` object.
     */
    function ( t, r, n ) {
        n( 26 )( Math, "Math", ! ! true ); // Module 26: Set Symbol.toStringTag.
    },

    /*
     * Module 170: Object.assign (static polyfill).
     * This module provides a static polyfill for `Object.assign`.
     */
    function ( t, r, n ) {
        var e = n( 0 ),     // Module 0: Feature polyfilling API.
            o = n( 115 );   // Module 115: Object.assign (core).

        // Export assign polyfill.
        e( { target: "Object", stat: ! ! true, forced: Object.assign !== o