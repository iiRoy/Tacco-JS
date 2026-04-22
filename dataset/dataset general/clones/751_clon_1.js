; ! function ( util, Name, PACKAGE ) {
    "use strict"; // Enforce strict mode for cleaner code.

    /*
     * This module provides extensions and utility methods for the native Object type.
     * It includes functions for deep comparison, aggregation, and property management.
     */
    util.x.cache( 'Object', function ( Type ) {
        /**
         * Helper function to determine if two arrays are deeply equal.
         * It checks length and then iterates, comparing elements using Type.equalTo.
         * @param {Array} a1 - The first array to compare.
         * @param {Array} a2 - The second array to compare.
         * @returns {boolean} - True if arrays are equal, false otherwise.
         */
        function arraysEqual( a1, a2 ) {
            return a1.length == a2.length && Array.coerce( a1 ).every( function ( v, i ) {
                return Type.equalTo( a2[ i ], v );
            } );
        }

        /**
         * Helper function to determine if two objects are deeply equal.
         * It compares property counts and then iterates through keys, checking values.
         * @param {Object} o1 - The first object.
         * @param {Object} o2 - The second object.
         * @returns {boolean} - True if objects are equal, false otherwise.
         */
        function objectsEqual( o1, o2 ) {
            // Check if the number of properties (including own properties) differs.
            if ( util.len( o1 ) !== util.len( o2 ) || Type.ownLen( o1 ) !== Type.ownLen( o2 ) ) {
                return false;
            }

            // Iterate over properties of the second object.
            for ( var k in o2 ) {
                // If a property exists in one but not the other, or values are not equal, return false.
                if ( util.has( o1, k ) !== util.has( o2, k ) || !Type.equalTo( o1[ k ], o2[ k ] ) ) {
                    return false;
                }
            }

            return true; // All checks passed, objects are equal.
        }

        // Define new methods to be added to the Object prototype (or Type constructor).
        util.defs( Type, {
            /**
             * Aggregates values in an object similar to Array.prototype.reduce.
             * @param {Object} o - The object to aggregate.
             * @param {*} val - The initial value of the accumulator.
             * @param {Function} fn - The reducer function.
             * @param {Object} [ctx] - The context for the reducer function.
             * @returns {*} - The aggregated value.
             */
            aggregate : function ( o, val, fn, ctx ) {
                ctx || ( ctx = o ); // Set context to the object if not provided.
                return Type.keys( o ).reduce( function ( res, k, i ) {
                    return fn.call( ctx, res, o[ k ], k, o, i );
                }, val );
            },

            /**
             * Clears all enumerable properties from an object.
             * @param {Object} o - The object to clear.
             * @returns {Object} - The cleared object.
             */
            clear : function ( o ) {
                Type.keys( o ).forEach( function ( k ) {
                    delete o[ k ]; // Delete each property.
                }, o );
                return o;
            },

            /**
             * Determines if two values are equal, considering their types (deep equality for arrays/objects).
             * @param {*} o - The first value.
             * @param {*} k - The second value.
             * @returns {boolean} - True if values are equal, false otherwise.
             */
            equalTo : function ( o, k ) {
                switch ( util.ntype( o ) ) {
                    case 'array'  :
                        return Array.isArray( k ) ? arraysEqual( o, k ) : false;
                    case 'object' :
                        return util.ntype( k ) == 'object' ? objectsEqual( o, k ) : false;
                    case 'date'   :
                        return +o == +k; // Compare Date objects by their timestamp.
                }
                return o == k; // Default comparison for primitive types.
            },

            /**
             * Returns an array of a given object's own enumerable property names.
             * @param {Object} o - The object to inspect.
             * @returns {Array<string>} - An array of property names.
             */
            ownKeys : function ( o ) {
                return Type.getOwnPropertyNames( o );
            },

            /**
             * Returns the number of own enumerable properties of an object.
             * @param {Object} o - The object to inspect.
             * @returns {number} - The count of own properties.
             */
            ownLen : function ( o ) {
                return Type.ownKeys( o ).length;
            }
        }, 'w' ); // All defined properties are writable.
    } ); // End of Object extensions.


    /*
     * This module extends the native Function prototype with various utility methods.
     * It provides functionalities like argument parsing, deferred execution, and memoization.
     */
    util.x.cache( 'Function', function ( Type ) {
        // Regular expressions used for parsing function arguments from its string representation.
        var re_args  = /^[\s\(]*function[^\(]*\(([^\)]*)\)/,
            re_split = /\s*,\s*/;

        // Defines a 'coerce' method on the Function constructor.
        util.def( Type, 'coerce', util.describe( function coerce( o ) {
            // If 'o' is already a function, return it; otherwise, return a function that returns 'o'.
            return util.ntype( o ) == 'function' ? o : function () {
                return o;
            };
        }, 'w' ) );

        // Defines new methods and properties on the Function.prototype.
        util.defs( Type.prototype, {
            // properties
            /**
             * A getter property that returns an array of the function's parameter names.
             * It parses the function's string representation.
             * @returns {Array<string>} - An array of parameter names.
             */
            params : {
                get : function () {
                    var names = String( this ).match( re_args )[ 1 ].trim().split( re_split );
                    // Handle case where there are no parameters (e.g., `function() {}`).
                    return names.length == 1 && !names[ 0 ] ? [] : names;
                }
            },
            // methods
            /**
             * Attempts to execute the function and catches any errors.
             * @param {Object} [ctx] - The context (`this`) for the function execution.
             * @returns {*} - The result of the function or the caught error.
             */
            attempt : function ( ctx ) {
                var args = Array.coerce( arguments, 1 ), // Collect arguments starting from the second one.
                    fn   = this;

                // Immediately invoked function expression to execute and handle errors.
                return function attempting() {
                    try {
                        return fn.apply( ctx || this, args );
                    } catch ( e ) {
                        return e; // Return the error object.
                    }
                }();
            },

            /**
             * "Bakes" the function, returning a new function that will have its original `this`
             * context prepended to its arguments when called.
             * @returns {Function} - A new, "baked" function.
             */
            bake : function () {
                var baked = 'baked',
                    fn    = this;
                // Memoize the baked function for efficiency.
                return fn[ baked ] || !util.def( fn, baked, util.describe( function () {
                    // Prepend `this` to the arguments array.
                    return fn.apply( this, [ this ].concat( Array.coerce( arguments ) ) );
                }.mimic( fn ), 'w' ) ) || fn[ baked ];
            },

            /**
             * Defers the execution of the function.
             * Uses `process.nextTick` in CommonJS environments, otherwise `delay(1)`.
             * @param {Object} [ctx] - The context (`this`) for the function execution.
             * @returns {*} - The result of `process.nextTick` or `delay`.
             */
            defer : util.ENV == 'commonjs'
                ? function ( ctx ) {
                    return process.nextTick( this.bind.apply( this, [ ctx ].concat( Array.coerce( arguments, 1 ) ) ) );
                }
                : function () {
                    return this.delay.apply( this, [ 1 ].concat( Array.coerce( arguments ) ) );
                },

            /**
             * Delays the execution of the function by a specified number of milliseconds.
             * Returns an object with a `stop` method to cancel the delay.
             * @param {number} ms - The delay in milliseconds.
             * @param {Object} [ctx] - The context (`this`) for the function execution.
             * @returns {Object} - An object containing `stop` method and `timeoutId`.
             */
            delay : function ( ms, ctx ) {
                var args = Array.coerce( arguments, 2 ), // Collect arguments after `ms` and `ctx`.
                    fn   = this;

                function delayed() {
                    delayed.stop(); // Ensure the timeout is cleared after execution.
                    return fn.apply( ctx || this, args );
                }

                // Attach methods to manage the delayed execution.
                return util.copy( delayed, {
                    stop : function () {
                        clearTimeout( this.timeoutId ); // Clear the scheduled timeout.
                        delete this.timeoutId;
                        return fn; // Return the original function.
                    },
                    timeoutId : setTimeout( delayed, ms ) // Store the timeout ID.
                } );
            },

            /**
             * Memoizes the function's results, caching them based on arguments.
             * Subsequent calls with the same arguments will return the cached result.
             * @param {Object} [ctx] - The context (`this`) for the function execution.
             * @param {Object} [cache] - An optional object to use as the cache.
             * @returns {Function} - The memoized function.
             */
            memoize : function ( ctx, cache ) {
                var fn = this;
                util.ntype( cache ) == 'object' || ( cache = util.obj() ); // Initialize cache if not provided.

                function memo() {
                    var args = Array.coerce( arguments ),
                        s    = args.toString(); // Use string representation of arguments as cache key.
                    // If result is in cache, return it; otherwise, compute, store, and return.
                    return s in cache ? cache[ s ] : ( cache[ s ] = fn.apply( ctx, args ) );
                }

                memo.unmemoize = function () {
                    return fn;
                }; // Allows access to the original function.
                return memo;
            },

            /**
             * A placeholder method that simply returns the function itself.
             * Intended for chaining or as a no-op.
             * @returns {Function} - The function itself.
             */
            stop : function () {
                return this;
            },

            /**
             * A placeholder method that simply returns the function itself.
             * Intended as the inverse of memoize, or a no-op.
             * @returns {Function} - The function itself.
             */
            unmemoize : function () {
                return this;
            },

            /**
             * Wraps the function with another "wrapper" function.
             * The wrapper receives the original function (bound to its context) as its first argument,
             * followed by any additional arguments passed to `wrap`, and then the arguments passed to the wrapped function.
             * @param {Function} wrapper - The function to wrap `this` with.
             * @param {...*} [args] - Additional arguments to pass to the wrapper.
             * @returns {Function} - The wrapped function.
             */
            wrap : function ( wrapper ) {
                var args = Array.coerce( arguments, 1 ), // Arguments for the wrapper, after the wrapper function itself.
                    fn   = this;
                return function () {
                    // Call the wrapper, passing the bound original function and collected arguments.
                    return wrapper.apply( this, [ fn.bind( this ) ].concat( args ).concat( Array.coerce( arguments ) ) );
                }.mimic( wrapper );
            }
        }, 'w' ); // All defined properties are writable.
    } ); // End of Function extensions.


    /*
     * This module provides a rich set of utility methods for working with arrays,
     * extending the native Array prototype.
     */
    util.x.cache( 'Array', function ( Type ) {
        // Helper functions for the `groupBy` method.
        function groupByFn( field, v ) {
            return field( v ) ? '0' : '1';
        }

        function groupByRegExp( field, v ) {
            return field.test( v ) ? '0' : '1';
        }

        function groupByStr( field, v ) {
            return Object.value( v, field ) || '1';
        }

        // Helper function to check if a value is falsey.
        function isFalsey( o ) {
            return !o ? null : o;
        }

        // Helper for sorting: returns the first element of a [value, sortKey] pair.
        function sortedVal( o ) {
            return o[ 0 ];
        }

        // Helper for sorting: creates a [value, sortKey] pair.
        function sortingVal( o ) {
            return [ o, ( typeof this == 'function' ? this( o ) : Object.value( o, this ) ) ];
        }

        var PROTO = Type.prototype, // Cache Array.prototype for performance.
            sort  = {
                desc : function ( a, b ) {
                    return a[ 1 ] == b[ 1 ] ? 0 : a[ 1 ] < b[ 1 ] ? 1 : -1;
                },
                asc  : function ( a, b ) {
                    return a[ 1 ] == b[ 1 ] ? 0 : a[ 1 ] > b[ 1 ] ? 1 : -1;
                }
            };

        // Aliases for sort functions based on common boolean/numeric representations.
        sort[ String( true ) ]  = sort[ 1 ] = sort.asc;
        sort[ String( !1 ) ]    = sort[ 0 ] = sort.desc;

        // Define `sortFns` property on the Array constructor.
        util.def( Type, 'sortFns', util.describe( { value : sort }, 'w' ) );

        // Define new methods on the Array.prototype.
        util.defs( Type.prototype, {
            /**
             * Aggregates array elements using a reducer function, similar to `reduce`.
             * @param {*} val - The initial value of the accumulator.
             * @param {Function} fn - The reducer function.
             * @param {Object} [ctx] - The context (`this`) for the reducer function.
             * @returns {*} - The aggregated value.
             */
            aggregate : function ( val, fn, ctx ) {
                return PROTO.reduce.call( this, function ( val, o, i, a ) {
                    return fn.call( ctx || o, val, o, i, a );
                }, val );
            },

            /**
             * Creates an object by associating elements from two arrays.
             * The current array provides values, and the argument array `a` provides keys.
             * @param {Array} a - An array whose elements will be used as keys.
             * @param {Function} [fn] - An optional mapping function for values.
             * @param {Object} [ctx] - The context for the mapping function.
             * @returns {Object} - The resulting object.
             */
            associate : function ( a, fn, ctx ) {
                fn  || ( fn = util );
                ctx || ( ctx = this );
                return PROTO.reduce.call( this, function ( o, v, i ) {
                    o[ a[ i ] ] = fn.call( ctx, v, i, this );
                    return o;
                }, util.obj() );
            },

            /**
             * Clears all elements from the array, setting its length to 0.
             * @returns {Array} - The cleared array.
             */
            clear : function () {
                this.length = 0;
                return this;
            },

            /**
             * Creates a shallow clone of the array.
             * @returns {Array} - A new array containing the same elements.
             */
            clone : function () {
                return PROTO.slice.call( this );
            },

            /**
             * Returns a new array with all falsey values (null, undefined, 0, false, '') removed.
             * If `falsey` is true, removes values that are `!o`.
             * @param {boolean} [falsey] - If true, compacts based on `!o`.
             * @returns {Array} - The compacted array.
             */
            compact : function ( falsey ) {
                return PROTO.mapc.call( this, falsey === true ? isFalsey : util );
            },

            /**
             * Checks if the array contains a specific element.
             * @param {*} o - The element to search for.
             * @returns {boolean} - True if the element is found, false otherwise.
             */
            contains : function ( o ) {
                return !!~PROTO.indexOf.call( this, o );
            },

            /**
             * Iterates over each element in the array, executing a callback function.
             * @param {Function} fn - The callback function.
             * @param {Object} [ctx] - The context for the callback function.
             * @returns {Array} - The original array (for chaining).
             */
            each : function ( fn, ctx ) {
                PROTO.forEach.call( this, fn, ctx || this );
                return this;
            },

            /**
             * Flattens a multi-dimensional array into a one-dimensional array.
             * Can flatten to a specified depth.
             * @param {number} [n] - The depth to flatten. If 0, no flattening.
             * @returns {Array} - The flattened array.
             */
            flatten : function ( n ) {
                if ( util.type( n ) == 'number' ) {
                    if ( n > 0 ) {
                        --n;
                    } else {
                        return this; // If depth is 0 or less, return original.
                    }
                }
                return PROTO.aggregate.call( this, [], function ( v, o, i ) {
                    Type.isArray( o ) ? v.splice.apply( v, [ v.length, 0 ].concat( o.flatten( n ) ) ) : v.push( o );
                    return v;
                }, this );
            },

            /**
             * Filters array elements based on a regular expression.
             * @param {RegExp|string} re - The regular expression or string pattern.
             * @param {Function} [fn] - An optional mapping function for matching elements.
             * @param {Object} [ctx] - The context for the mapping function.
             * @returns {Array} - A new array containing only the elements that matched.
             */
            grep : function ( re, fn, ctx ) {
                var a = this;
                fn  || ( fn = util );
                ctx || ( ctx = a );
                util.ntype( re ) != 'string' || ( re = new RegExp( re.escapeRE(), 'g' ) ); // Convert string to RegExp.
                return PROTO.aggregate.call( a, [], function ( v, o, i ) {
                    !re.test( o ) || v.push( fn.call( ctx, o, i, a ) );
                    return v;
                } );
            },

            /**
             * Groups elements of an array based on a function, regular expression, or string property.
             * @param {Function|RegExp|string} f - The grouping criterion.
             * @param {Function} [fn] - An optional mapping function for grouped elements.
             * @param {Object} [ctx] - The context for the mapping function.
             * @returns {Object} - An object where keys are group names and values are arrays of grouped elements.
             * @throws {TypeError} - If `f` is not a valid grouping criterion.
             */
            groupBy : function ( f, fn, ctx ) {
                fn || ( fn = util );
                var a     = this,
                    keys,
                    match,
                    res   = {};

                switch ( util.type( f ) ) {
                    case 'function' :
                        match = groupByFn;
                        break;
                    case 'regexp'   :
                        match = groupByRegExp;
                        break;
                    case 'number'   :
                    case 'string'   :
                        match = groupByStr;
                        keys  = PROTO.pluck.call( a, f, true ); // Extract potential keys if grouping by string/number.
                        break;
                    default         :
                        throw new TypeError( 'Array.prototype.groupBy can only match based on a Function, RegExp or String.' );
                }

                if ( keys ) {
                    keys.forEach( function ( k ) {
                        res[ k ] = [];
                    } );
                } else {
                    res[ '0' ] = []; // Default groups for boolean-like criteria.
                    res[ '1' ] = [];
                }

                return PROTO.aggregate.call( a, res, function ( v, o, i ) {
                    v[ match( f, o ) ].push( fn.call( this, o, i, a ) );
                    return v;
                }, ctx || a );
            },

            /**
             * Adds an element to the array if it is not already present.
             * @param {*} o - The element to include.
             * @returns {boolean} - True if the element was added, false otherwise.
             */
            include : function ( o ) {
                return PROTO.contains.call( this, o ) ? !1 : !this.push( o ) || true;
            },

            /**
             * Invokes a specified method on each object in the array that possesses that method.
             * The return values of the method calls are collected into a new array.
             * @param {string} fn - The name of the method to invoke.
             * @param {...*} [args] - Arguments to pass to the invoked method.
             * @returns {Array} - A new array containing the results of the method calls.
             */
            invokec : function ( fn ) {
                var args = Type.coerce( arguments, 1 ); // Collect additional arguments for the invoked method.
                return PROTO.mapc.call( this, function ( o, i ) {
                    return util.ntype( o[ fn ] ) == 'function' ? o[ fn ].apply( o, args ) : null;
                } );
            },

            /**
             * Retrieves an item from the array by its index, supporting negative indices
             * (where -1 refers to the last element, -2 to the second to last, etc.).
             * @param {number} i - The index of the item.
             * @returns {*} - The element at the specified index.
             */
            item : function ( i ) {
                return this[ i < 0 ? this.length + i : i ];
            },

            /**
             * Returns the last element of the array.
             * @returns {*} - The last element.
             */
            last : function () {
                return this[ this.length - 1 ];
            },

            /**
             * Maps each element of the array to a new value using a callback function,
             * and then compacts the resulting array by removing any falsey values.
             * @param {Function} fn - The mapping function.
             * @param {Object} [ctx] - The context for the mapping function.
             * @returns {Array} - A new array with mapped and compacted elements.
             */
            mapc : function ( fn, ctx ) {
                ctx || ( ctx = this );
                return PROTO.reduce.call( this, function ( v, o, i, a ) {
                    !util.exists( ( o = fn.call( ctx, o, i, a ) ) ) || v.push( o ); // Only push if not null/undefined.
                    return v;
                }, [] );
            },

            /**
             * Removes specified elements from the array.
             * @param {...*} [elements] - The elements to remove.
             * @returns {Array} - An array containing the elements that were removed.
             */
            remove : function () {
                var args = Type.coerce( arguments ),
                    i,
                    res  = [],
                    v;
                while ( v = args.shift() ) { // Iterate through elements to remove.
                    !~( i = PROTO.indexOf.call( this, v ) ) || res.push( PROTO.splice.call( this, i, 1 )[ 0 ] );
                }
                return res;
            },

            /**
             * Sorts the array based on a specific field or a custom sorting function.
             * Uses a Schwartzian transform for efficient sorting of complex objects.
             * @param {string|Function} f - The field name or function to extract the sorting key.
             * @param {string|Function} [d] - The sort direction ('asc', 'desc') or a custom comparison function.
             * @returns {Array} - A new sorted array.
             */
            sortBy : function ( f, d ) { // schwartzian optimised
                return PROTO.map.call( this, sortingVal, f )
                    .sort( util.ntype( d ) == 'function' ? d : sort[ String( d ).toLowerCase() ] || sort.asc )
                    .map( sortedVal );
            },

            /**
             * "Tucks" a key-value pair into each object within the array.
             * If `a` is an array, `a[i]` is used as the value for the `i`-th object.
             * Otherwise, `a` is used as the value for all objects.
             * @param {string} k - The key to add/set.
             * @param {*} a - The value or array of values to tuck.
             * @returns {Array} - The modified array (for chaining).
             */
            tuck : function ( k, a ) {
                var is_arr = Type.isArray( a );
                return PROTO.each.call( this, function ( o, i ) {
                    o[ k ] = is_arr ? a[ i ] : a;
                } );
            },

            /**
             * Returns a new array containing only the unique elements from the original array.
             * @returns {Array} - A new array with unique elements.
             */
            uniq : function () {
                return PROTO.reduce.call( this, function ( v, o ) {
                    v.contains( o ) || v.push( o ); // Add element only if not already present.
                    return v;
                }, [] );
            },

            /**
             * Returns a new array that is a clone of the original, but without the specified elements.
             * @param {...*} [elements] - The elements to exclude from the new array.
             * @returns {Array} - A new array without the specified elements.
             */
            without : function () {
                var a = PROTO.clone.call( this );
                a.remove.apply( a, arguments ); // Use the `remove` method on the clone.
                return a;
            },

            /**
             * Zips multiple arrays together, creating an array of arrays where each inner array
             * contains elements at the same index from each input array.
             * @param {...Array} [arrays] - The arrays to zip with the current array.
             * @returns {Array<Array>} - The zipped array.
             */
            zip : function () {
                var args = Type.coerce( arguments );
                args.unshift( this ); // Add the current array as the first argument.
                return PROTO.map.call( this, function ( o, i ) {
                    return args.pluck( i ); // Pluck elements at index 'i' from all input arrays.
                } );
            }
        }, 'w' ); // All defined properties are writable.
    } ); // End of Array extensions.


    /*
     * This module extends the native Number prototype with various utility methods,
     * including integer checks and formatting capabilities.
     */
    util.x.cache( 'Number', function ( Type ) {
        var abs     = Math.abs, // Reference to Math.abs for brevity.
            big_int = 9007199254740992, // Maximum safe integer in JavaScript.
            floor   = Math.floor; // Reference to Math.floor for brevity.

        util.defs( Type, {
            /**
             * Checks if a given value is an integer.
             * Complies with the ES6 `Number.isInteger` specification.
             * @param {*} v - The value to check.
             * @returns {boolean} - True if the value is an integer, false otherwise.
             */
            isInteger : function ( v ) {
                return util.type( v ) == 'number' && isFinite( v ) && v > -big_int && v < big_int && floor( v ) === v;
            },

            /**
             * Converts a given value to an integer.
             * Complies with the ES6 `Number.toInteger` specification.
             * @param {*} v - The value to convert.
             * @returns {number} - The integer representation of the value.
             */
            toInteger : function ( v ) {
                v = +v; // Coerce to a number.
                if ( isNaN( v ) ) {
                    return +0; // Return +0 for NaN.
                }
                if ( v === 0 || !isFinite( v ) ) {
                    return v; // Return 0, -0, Infinity, -Infinity as is.
                }
                return ( v < 0 ? -1 : 1 ) * abs( floor( v ) ); // Truncate fractional part.
            }
        }, 'w' ); // All defined properties are writable.

        util.defs( Type.prototype, {
            /**
             * Pads a number with leading zeros to reach a specified length.
             * @param {number} l - The desired total length of the number string.
             * @param {number} [radix=10] - The base for converting the number to a string.
             * @returns {string} - The padded number string.
             */
            pad : function ( l, radix ) {
                var s = this.toString( radix || 10 );
                return '0'.times( l - s.length ) + s;
            },

            /**
             * Executes a given function `n` times, where `n` is the number itself.
             * @param {Function} fn - The function to execute.
             * @param {Object} [ctx] - The context (`this`) for the function execution.
             * @returns {number} - The original number (for chaining).
             */
            times : function ( fn, ctx ) {
                util.range( 0, this ).forEach( fn, ctx || util.global ); // Iterate from 0 up to (but not including) `this`.
                return this;
            },

            /**
             * Converts the number to its hexadecimal string representation, padded to two digits.
             * @returns {string} - The hexadecimal string.
             */
            toHex : function () {
                return this.pad( 2, 16 );
            }
        }, 'w' ); // All defined properties are writable.
    } ); // End of Number extensions.


    /*
     * This module extends the native String prototype with a comprehensive set of utility methods.
     * It includes functions for string manipulation, formatting, and case conversion.
     */
    util.x.cache( 'String', function ( Type ) {
        var cache_chars     = util.obj(), // Cache for pre-compiled regexes for `clean` method.
            cache_slices    = util.obj(), // Cache for pre-compiled regexes for `sliceEvery` method.
            esc_chars       = /([-\*\+\?\.\|\^\$\/\\\(\)[\]\{\}])/g, // Characters to escape in regex patterns.
            esc_val         = '\\$1', // Replacement string for escaped characters.
            re_caps         = /([A-Z])/g, // Regex to find uppercase letters.
            re_hex          = /#?(\w{1,6})/, // Regex to match hexadecimal color codes.
            re_rgb          = /(\d{1,3})/g, // Regex to match RGB color components.
            re_split_string = /[\sA-Z_-]+/g, // Regex for splitting strings in `hyphenate` and `underscore`.
            re_trim_right   = /(.*?)\s*$/; // Regex for trimming trailing whitespace.

        // Helper function for `splitString` to handle case conversion.
        function _splitString( m, p ) {
            return p + p.toLowerCase();
        }

        /**
         * Splits a string into parts based on casing and common separators.
         * Used internally by `hyphenate`, `underscore`, and `toCamelCase`.
         * @param {string} s - The string to split.
         * @returns {Array<string>} - An array of string parts.
         */
        function splitString( s ) {
            s    = s.trim();
            var s0 = s.charAt( 0 ),
                s1 = s.charAt( 1 ),
                // Determine starting index for splitting logic to handle initial capitalization.
                i  = s0.toLowerCase() == s0 && s1 != ' ' && s1.toUpperCase() == s1 ? 2 : 1,
                o  = s.substring( i ).replace( re_caps, _splitString ).split( re_split_string );
            o[ 0 ] = s.substring( 0, i ) + o[ 0 ]; // Re-combine the initial part.
            return o;
        }

        /**
         * Note on ES6 String methods:
         * Some methods implemented here (e.g., `startsWith`, `endsWith`, `includes`) are proposed or
         * already part of ES6. This implementation extends `String.prototype` in a way that
         * native implementations, when available, will not be overwritten. These custom methods
         * will simply be superseded by the native ones.
         */
        util.defs( Type.prototype, {
            /**
             * Checks if a string is "blank" (empty or contains only whitespace).
             * @returns {boolean} - True if the string is blank, false otherwise.
             */
            blank : function () {
                return !!this.trim().empty();
            },

            /**
             * Capitalizes the first character of the string and converts the rest to lowercase.
             * @returns {string} - The capitalized string.
             */
            capitalize : function () {
                return this.charAt( 0 ).toUpperCase() + this.substring( 1 ).toLowerCase();
            },

            /**
             * Removes multiple consecutive occurrences of a specified character, replacing them with a single instance.
             * @param {string} [character=' '] - The character to clean.
             * @returns {string} - The cleaned string.
             */
            clean : function ( character ) {
                character = character || ' '; // Default to space if no character is specified.
                character = cache_chars[ character ] || ( cache_chars[ character ] = {
                    re   : new RegExp( '(' + character + '){1,}', 'g' ),
                    fill : character
                } );
                return this.split( character.re ).filter( function ( s ) {
                    return !s.blank() && s != character.fill;
                } ).join( character.fill );
            },

            /**
             * Checks if the string contains a specified substring.
             * @param {string} s - The substring to search for.
             * @returns {boolean} - True if the substring is found, false otherwise.
             */
            contains : function ( s ) {
                return !!~this.indexOf( s );
            },

            /**
             * Checks if the string is empty.
             * @returns {boolean} - True if the string is empty, false otherwise.
             */
            empty : function () {
                return Type( this ) === '';
            },

            /**
             * Checks if the string ends with a specified substring.
             * @param {string} s - The substring to check against.
             * @returns {boolean} - True if the string ends with `s`, false otherwise.
             */
            endsWith : function ( s ) {
                return this.length && this.lastIndexOf( s ) == this.length - s.length;
            },

            /**
             * Formats a string using placeholders. The implementation is "baked" from `util.format`.
             * @returns {string} - The formatted string.
             */
            format : util.format.bake(),

            /**
             * Performs global substitutions in a string. The implementation is "baked" from `util.gsub`.
             * @returns {string} - The string with substitutions applied.
             */
            gsub : util.gsub.bake(),

            /**
             * Converts a camelCase or PascalCase string to a hyphen-separated lowercase string.
             * @returns {string} - The hyphenated string.
             */
            hyphenate : function () {
                return splitString( this ).join( '-' ).toLowerCase();
            },

            /**
             * Case-insensitive check to see if the string includes another substring.
             * @param {string} s - The substring to search for.
             * @returns {boolean} - True if the substring is found (case-insensitively), false otherwise.
             */
            includes : function ( s ) {
                return this.toLowerCase().contains( Type( s ).toLowerCase() );
            },

            /**
             * Splits a string into an array of parts based on a regular expression.
             * Handles cases where the match is the entire string or null.
             * @param {RegExp} re - The regular expression to use for splitting.
             * @returns {Array<string>} - An array of string parts.
             */
            parts : function ( re ) {
                var m = Array.coerce( this.match( re ) );
                switch ( m.length ) {
                    case 1  :
                        if ( m[ 0 ] === null || m[ 0 ] === this ) {
                            return []; // If match is null or entire string, return empty array.
                        }
                    default :
                        m[ 0 ] !== this || m.shift(); // Remove the full match if it's the first element.
                        return m;
                }
            },

            /**
             * Escapes special characters in the string so it can be safely used as a literal
             * within a regular expression.
             * @returns {string} - The escaped string.
             */
            regexpEsc : function () {
                return this.replace( esc_chars, esc_val );
            },

            /**
             * Slices the string into an array of smaller strings, each of a specified maximum length `n`.
             * @param {number} n - The maximum length of each slice.
             * @returns {Array<string>} - An array of string slices.
             */
            sliceEvery : function ( n ) {
                n = parseInt( n, 10 );
                if ( isNaN( n ) || this.length < n || n == 0 ) {
                    return [ Type( this ) ]; // Return the original string in an array if invalid `n`.
                }
                return this.match( cache_slices[ n ] || ( cache_slices[ n ] = new RegExp( '(.{1,' + n + '})', 'g' ) ) );
            },

            /**
             * Checks if the string starts with a specified substring.
             * @param {string} s - The substring to check against.
             * @returns {boolean} - True if the string starts with `s`, false otherwise.
             */
            startsWith : function ( s ) {
                return !this.indexOf( s );
            },

            /**
             * Repeats the string `n` times.
             * @param {number} n - The number of times to repeat the string.
             * @returns {string} - The repeated string.
             */
            times : function ( n ) {
                return new Array( Number.toInteger( n ) + 1 ).join( this );
            },

            /**
             * Converts a hyphen-separated or underscore-separated string to camelCase.
             * @returns {string} - The camelCased string.
             */
            toCamelCase : function () {
                var parts = splitString( this ),
                    str   = [ parts.shift() ]; // Keep the first part as is (lowercase).
                return parts.reduce( function ( res, val ) {
                    res.push( val.capitalize() ); // Capitalize subsequent parts.
                    return res;
                }, str ).join( '' );
            },

            /**
             * Converts a hexadecimal color string (e.g., "#FFF", "F0F", "FF00FF") to an RGB hex string.
             * @returns {string} - The 6-digit RGB hex string (e.g., "#FF00FF").
             */
            toHex : ( function () {
                function toHex( o ) {
                    return parseInt( o, 10 ).pad( 2, 16 );
                }

                return function () {
                    var m = this.match( re_rgb ); // Try to match RGB components.
                    // If matched as RGB (e.g., "0,0,0"), convert to hex. Otherwise, assume it's already hex-like.
                    return '#' + ( ( m.length == 1 ) ? toHex( m[ 0 ] ).times( 3 ) : m.map( toHex ).join( '' ) );
                }
            }() ),

            /**
             * Parses a JSON string into a JavaScript object. The implementation is "baked" from `JSON.parse`.
             * @returns {Object} - The parsed JavaScript object.
             */
            toJSON : JSON.parse.bake(),

            /**
             * Converts a hexadecimal color string to an RGB string (e.g., "rgb(255, 0, 255)").
             * Can also return an array of RGB values.
             * @param {boolean} [as_array] - If true, returns an array `[R, G, B]`.
             * @returns {string|Array<number>} - The RGB string or array.
             */
            toRGB : function ( as_array ) {
                var o = this.match( re_hex )[ 1 ], // Extract the hex part.
                    l = o.length,
                    v;
                switch ( l ) {
                    case 6  :
                        break; // Already 6 digits.
                    case 3  :
                        o = this.times( 2 );
                        break; // Expand 3-digit hex (e.g., "F0F" -> "FF00FF").
                    case 2  :
                        o = this.times( 3 );
                        break; // Expand 2-digit hex (e.g., "FF" -> "FFFFFF").
                    default :
                        o = l > 6 ? o.substring( 0, 6 ) : l == 4 ? o + '00' : o + '0'; // Handle other lengths.
                }
                v = o.sliceEvery( 2 ).map( function ( v ) {
                    return parseInt( v, 16 );
                } ); // Convert hex pairs to decimal.
                return as_array === true ? v : 'rgb(' + v.join( ', ' ) + ')';
            },

            /**
             * Trims trailing whitespace from the right side of the string.
             * @returns {string} - The string with trailing whitespace removed.
             */
            trimRight : function () {
                return this.replace( re_trim_right, '$1' );
            },

            /**
             * Truncates the string to a specified length, adding an ellipsis (`...`) if it was truncated.
             * @param {number} [i=50] - The maximum length of the string.
             * @param {string} [c='...'] - The character(s) to append if truncated.
             * @returns {string} - The truncated string.
             */
            truncate : function ( i, c ) {
                i || ( i = 50 );
                util.ntype( c ) == 'string' || ( c = '...' );
                return this.length < i ? Type( this ) : this.substring( 0, i ).trimRight() + c;
            },

            /**
             * Converts a camelCase or PascalCase string to an underscore-separated lowercase string.
             * @returns {string} - The underscored string.
             */
            underscore : function () {
                return splitString( this ).join( '_' ).toLowerCase();
            }
        }, 'w' ); // All defined properties are writable.
    } ); // End of String extensions.


    /*
     * This final section of the script handles the exposure and initialization
     * of the library, making its utilities available in the chosen environment.
     */
    // Internal function to apply extensions (used by util.x).
    function __lib__() {
        util.x.apply( util, arguments );
        return __lib__;
    }

    /**
     * The public extension function.
     * Caches an extender for a given Type and then applies it.
     * @param {Function} Type - The constructor function (e.g., Object, Array) to extend.
     * @param {Function} extender - The function that defines the extensions for the Type.
     * @returns {Function} - The main library function for chaining.
     */
    function x( Type, extender ) {
        util.x.cache( Type.__name__, extender ).x( Type );
        return __lib__;
    }

    // Determine the global object or module.exports based on the environment.
    util.iter( PACKAGE ) || ( PACKAGE = util.ENV == 'commonjs' ? module : util.global );

    // Expose the n8iv library globally or via module.exports.
    util.defs( ( __lib__ = util.expose( __lib__, Name, PACKAGE ) ), {
        util : util, // A reference to the underlying utility library (m8).
        x    : x     // The public extension function.
    }, 'r' ); // These exposed properties are read-only.

    // Store a reference to the utility library (m8) on the n8iv object itself.
    util.expose( util, __lib__ );

    // Apply all pre-defined extensions to the core JavaScript types.
    util.x( Object, Array, Function, Number, String );

    // The IIFE (Immediately Invoked Function Expression) ensures that `util`
    // is correctly initialized based on whether `m8` or `require('m8')` is available.
}( typeof m8 != 'undefined' ? m8 : typeof require != 'undefined' ? require( 'm8' ) : null, 'n8iv' );