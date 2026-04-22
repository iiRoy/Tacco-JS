( function ( ) {
    // Check if Date.now is available. If not, provide a polyfill.
    // This ensures compatibility with older JavaScript environments.
    if ( ! Date . now ) {
        Date . now = function ( ) {
            // Returns the number of milliseconds since the Unix Epoch.
            // Using the unary plus operator to convert Date object to a number.
            return + new Date ;
        } ;
    }

    // Attempt to set a CSS property using setProperty.
    // This block checks for browser compatibility with CSSStyleDeclaration.prototype.setProperty.
    try {
        document . createElement ( "div" ) . style . setProperty ( "opacity" , 0 , "" ) ;
    }
    catch ( error ) {
        // If setProperty throws an error (e.g., in IE9),
        // we'll provide a polyfill for it.
        var d3_style_prototype = CSSStyleDeclaration . prototype ,
            d3_style_setProperty = d3_style_prototype . setProperty ;

        // Override the original setProperty to ensure values are strings.
        d3_style_prototype . setProperty = function ( name , value , priority ) {
            // Call the original setProperty method.
            // Ensures value is always a string by concatenating with an empty string.
            d3_style_setProperty . call ( this , name , value + "" , priority ) ;
        } ;
    }

    // Initialize the D3 global object with its version.
    // This is the main entry point for the D3 library.
    d3 = { version : "2.9.5" } ; /* semantic versioning */


    /**
     * Extends a constructor's prototype with properties from an object.
     * This is a utility function for setting up D3's internal classes.
     *
     * @param {Function} ctor The constructor function to extend.
     * @param {Object} properties An object containing methods/properties to add to the prototype.
     */
    function d3_class ( ctor , properties ) {
        try {
            // Attempt to define properties using Object.defineProperty for non-enumerable methods.
            // This is the preferred modern way.
            for ( var key in properties ) {
                Object . defineProperty ( ctor . prototype , key , {
                    value : properties [ key ] ,
                    enumerable : false // Make methods non-enumerable to prevent accidental iteration.
                } ) ;
            }
        }
        catch ( e ) {
            // Fallback for older browsers that don't support Object.defineProperty.
            // In this case, properties are directly assigned, making them enumerable.
            ctor . prototype = properties ;
        }
    }


    // d3_array will initially point to d3_arraySlice,
    // which is the preferred method for converting pseudoarrays to arrays.
    var d3_array = d3_arraySlice ; // Conversion utility for NodeLists and arguments objects.


    /**
     * Converts a pseudoarray (like arguments or NodeList) into a true Array by iterating.
     * This is a fallback for environments where Array.prototype.slice.call might fail.
     *
     * @param {Object} pseudoarray The array-like object to convert.
     * @returns {Array} A new array containing elements from the pseudoarray.
     */
    function d3_arrayCopy ( pseudoarray ) {
        var i = -1 , // Initialize loop counter.
            n = pseudoarray . length , // Get the length of the pseudoarray.
            array = [ ] ; // Initialize an empty array to store results.

        while ( ++ i < n ) {
            array . push ( pseudoarray [ i ] ) ; // Add each element to the new array.
        }
        return array ; // Return the fully populated array.
    }


    /**
     * Converts a pseudoarray (like arguments or NodeList) into a true Array using Array.prototype.slice.
     * This is the most efficient method when available.
     *
     * @param {Object} pseudoarray The array-like object to convert.
     * @returns {Array} A new array containing elements from the pseudoarray.
     */
    function d3_arraySlice ( pseudoarray ) {
        return Array . prototype . slice . call ( pseudoarray ) ;
    }


    // Feature detection for d3_array:
    // Try to use d3_arraySlice first, as it's generally faster.
    try {
        d3_array ( document . documentElement . childNodes ) [ 0 ] . nodeType ;
    }
    catch ( e ) {
        // If d3_arraySlice fails (e.g., on some host objects),
        // fall back to the slower but more robust d3_arrayCopy.
        d3_array = d3_arrayCopy ;
    }


    // d3_arraySubclass provides a mechanism to inherit from Array.prototype.
    // It checks for __proto__ support first for better performance.
    var d3_arraySubclass = [ ] . __proto__ ?

    // Until ECMAScript supports array subclassing, prototype injection works well.
    // This is the preferred method for modern browsers.
    function ( array , prototype ) {
        array . __proto__ = prototype ; // Directly set the prototype chain.
    } :

    // And if your browser doesn't support __proto__, we'll use direct extension.
    // This is a fallback for older browsers, copying properties one by one.
    function ( array , prototype ) {
        for ( var property in prototype ) {
            array [ property ] = prototype [ property ] ; // Copy each property individually.
        }
    } ;


    /**
     * Creates a new D3 map from a given object.
     * D3 maps are similar to JavaScript's native Map but with specific D3 features.
     *
     * @param {Object} object The object to convert into a D3 map.
     * @returns {d3_Map} A new d3_Map instance.
     */
    d3 . map = function ( object ) {
        var map = new d3_Map ; // Create a new empty d3_Map.
        for ( var key in object ) {
            map . set ( key , object [ key ] ) ; // Populate the map with key-value pairs from the object.
        }
        return map ; // Return the populated map.
    } ;


    // Internal constructor for D3 Map objects.
    function d3_Map ( ) {
        /* This constructor is intentionally empty.
         * Map functionality is added via prototype extension using d3_class. */
    }


    // Extend the d3_Map prototype with essential map methods.
    d3_class ( d3_Map , {
        /**
         * Checks if the map contains a specific key.
         * @param {string} key The key to check for.
         * @returns {boolean} True if the key exists, false otherwise.
         */
        has : function ( key ) {
            return d3_map_prefix + key in this ;
        } ,

        /**
         * Retrieves the value associated with a key.
         * @param {string} key The key to retrieve the value for.
         * @returns {*} The value associated with the key, or undefined if not found.
         */
        get : function ( key ) {
            return this [ d3_map_prefix + key ] ;
        } ,

        /**
         * Sets a value for a given key in the map.
         * @param {string} key The key to set.
         * @param {*} value The value to associate with the key.
         * @returns {*} The value that was set.
         */
        set : function ( key , value ) {
            return this [ d3_map_prefix + key ] = value ;
        } ,

        /**
         * Removes a key-value pair from the map.
         * @param {string} key The key to remove.
         * @returns {boolean} True if the key was found and removed, false otherwise.
         */
        remove : function ( key ) {
            key = d3_map_prefix + key ; // Prefix the key for internal storage.
            return key in this && delete this [ key ] ; // Check existence and then delete.
        } ,

        /**
         * Returns an array of all keys in the map.
         * @returns {Array<string>} An array of keys.
         */
        keys : function ( ) {
            var keys = [ ] ;
            this . forEach ( function ( key ) { keys . push ( key ) ; } ) ;
            return keys ;
        } ,

        /**
         * Returns an array of all values in the map.
         * @returns {Array<*>} An array of values.
         */
        values : function ( ) {
            var values = [ ] ;
            this . forEach ( function ( key , value ) { values . push ( value ) ; } ) ;
            return values ;
        } ,

        /**
         * Returns an array of all key-value entries in the map.
         * Each entry is an object { key: ..., value: ... }.
         * @returns {Array<Object>} An array of entry objects.
         */
        entries : function ( ) {
            var entries = [ ] ;
            this . forEach ( function ( key , value ) { entries . push ( { key : key , value : value } ) ; } ) ;
            return entries ;
        } ,

        /**
         * Iterates over each key-value pair in the map.
         * @param {Function} f The callback function to execute for each entry.
         *                   It receives (key, value) as arguments.
         */
        forEach : function ( f ) {
            for ( var key in this ) {
                // Check if the key starts with the internal prefix, indicating a D3 map entry.
                if ( key . charCodeAt ( 0 ) === d3_map_prefixCode ) {
                    // Call the provided function with the un-prefixed key and its value.
                    f . call ( this , key . substring ( 1 ) , this [ key ] ) ;
                }
            }
        }
    } ) ;


    // Internal constant for D3 map key prefixing.
    // The null character prevents collision with built-in Object.prototype properties.
    var d3_map_prefix = "\0" ,
        d3_map_prefixCode = d3_map_prefix . charCodeAt ( 0 ) ; // Cache the char code for performance.


    /**
     * The identity function: returns its input unchanged.
     * @param {*} d The input value.
     * @returns {*} The input value.
     */
    function d3_identity ( d ) {
        return d ;
    }


    /**
     * Returns the 'this' context. Useful in callbacks where 'this' needs to be explicitly returned.
     * @returns {*} The 'this' context.
     */
    function d3_this ( ) {
        return this ;
    }


    /**
     * Always returns true.
     * @returns {boolean} true.
     */
    function d3_true ( ) {
        return true ;
    }


    /**
     * Converts a value into a "functor" (a function).
     * If the value is already a function, it's returned as-is.
     * Otherwise, a new function is returned that always returns the value.
     *
     * @param {*} v The value to convert to a functor.
     * @returns {Function} A function that returns `v`.
     */
    function d3_functor ( v ) {
        return typeof v === "function" ? v : function ( ) { return v ; } ;
    }


    // Expose d3_functor as a public D3 utility.
    d3 . functor = d3_functor ;


    /**
     * Copies a variable number of methods from a source object to a target object.
     * This is useful for "rebinding" methods, e.g., for event dispatchers.
     *
     * @param {Object} target The object to which methods will be copied.
     * @param {Object} source The object from which methods will be copied.
     * @param {...string} methods A list of method names to rebind.
     * @returns {Object} The target object.
     */
    d3 . rebind = function ( target , source ) {
        var i = 1 , // Start from the second argument (after target and source).
            n = arguments . length , // Total number of arguments.
            method ; // Variable to hold the current method name.

        while ( ++ i < n ) {
            // For each method name provided, create a re-bound function on the target.
            target [ method = arguments [ i ] ] = d3_rebind ( target , source , source [ method ] ) ;
        }
        return target ;
    } ;


    /**
     * Creates a re-bound function for getter-setter methods.
     * When called with arguments, it sets a value and returns the target object.
     * When called without arguments, it gets the value.
     *
     * @param {Object} target The object that the re-bound method should return when setting.
     * @param {Object} source The object where the original method resides.
     * @param {Function} method The original method to rebind.
     * @returns {Function} The re-bound function.
     */
    function d3_rebind ( target , source , method ) {
        return function ( ) {
            // Apply the original method to the source object with the current arguments.
            var value = method . apply ( source , arguments ) ;
            // If arguments were passed (indicating a setter call), return the target.
            // Otherwise (getter call), return the value from the original method.
            return arguments . length ? target : value ;
        } ;
    }


    /**
     * Compares two values for ascending order.
     * Used for sorting arrays.
     *
     * @param {*} a First value.
     * @param {*} b Second value.
     * @returns {number} -1 if a < b, 1 if a > b, 0 if a == b, or NaN if comparison is invalid.
     */
    d3 . ascending = function ( a , b ) {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN ;
    } ;


    /**
     * Compares two values for descending order.
     * Used for sorting arrays.
     *
     * @param {*} a First value.
     * @param {*} b Second value.
     * @returns {number} -1 if b < a, 1 if b > a, 0 if b == a, or NaN if comparison is invalid.
     */
    d3 . descending = function ( a , b ) {
        return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN ;
    } ;


    /**
     * Calculates the mean (average) of an array of numbers.
     * An optional accessor function `f` can be provided to extract numbers from objects.
     *
     * @param {Array<number>} array The array of numbers or objects.
     * @param {Function} [f] An optional accessor function (d, i) => number.
     * @returns {number|undefined} The mean, or undefined if no valid numbers are found.
     */
    d3 . mean = function ( array , f ) {
        var n = array . length , // Total number of elements in the array.
            a , // Variable to hold the current number.
            m = 0 , // Running mean.
            i = -1 , // Loop counter.
            j = 0 ; // Count of valid numbers processed.

        if ( arguments . length === 1 ) {
            // No accessor function, assume array contains numbers directly.
            while ( ++ i < n ) {
                if ( d3_number ( a = array [ i ] ) ) { // Check if the element is a valid number.
                    m += ( a - m ) / ++ j ; // Welford's algorithm for numerical stability.
                }
            }
        } else {
            // Accessor function provided.
            while ( ++ i < n ) {
                if ( d3_number ( a = f . call ( array , array [ i ] , i ) ) ) { // Apply accessor and validate.
                    m += ( a - m ) / ++ j ; // Update mean.
                }
            }
        }
        return j ? m : undefined ; // Return mean if valid numbers were found, otherwise undefined.
    } ;


    /**
     * Calculates the median of an array of numbers.
     * An optional accessor function `f` can be provided.
     *
     * @param {Array<number>} array The array of numbers or objects.
     * @param {Function} [f] An optional accessor function (d, i) => number.
     * @returns {number|undefined} The median, or undefined if no valid numbers are found.
     */
    d3 . median = function ( array , f ) {
        if ( arguments . length > 1 ) {
            array = array . map ( f ) ; // Apply accessor if provided.
        }
        array = array . filter ( d3_number ) ; // Filter out non-numeric values.
        return array . length ? d3 . quantile ( array . sort ( d3 . ascending ) , .5 ) : undefined ;
    } ;


    /**
     * Finds the minimum value in an array.
     * An optional accessor function `f` can be provided.
     *
     * @param {Array<number>} array The array of numbers or objects.
     * @param {Function} [f] An optional accessor function (d, i) => number.
     * @returns {number|undefined} The minimum value, or undefined if no valid numbers are found.
     */
    d3 . min = function ( array , f ) {
        var i = -1 , // Loop counter.
            n = array . length , // Array length.
            a , // Current minimum.
            b ; // Current element.

        if ( arguments . length === 1 ) {
            // No accessor function.
            // Find the first valid number to initialize 'a'.
            while ( ++ i < n && ( ( a = array [ i ] ) == null || a != a ) ) {
                a = undefined ;
            }
            // Iterate through the rest to find a smaller value.
            while ( ++ i < n ) {
                if ( ( b = array [ i ] ) != null && a > b ) {
                    a = b ;
                }
            }
        } else {
            // Accessor function provided.
            // Apply accessor and find the first valid number.
            while ( ++ i < n && ( ( a = f . call ( array , array [ i ] , i ) ) == null || a != a ) ) {
                a = undefined ;
            }
            // Apply accessor and find a smaller value.
            while ( ++ i < n ) {
                if ( ( b = f . call ( array , array [ i ] , i ) ) != null && a > b ) {
                    a = b ;
                }
            }
        }
        return a ;
    } ;


    /**
     * Finds the maximum value in an array.
     * An optional accessor function `f` can be provided.
     *
     * @param {Array<number>} array The array of numbers or objects.
     * @param {Function} [f] An optional accessor function (d, i) => number.
     * @returns {number|undefined} The maximum value, or undefined if no valid numbers are found.
     */
    d3 . max = function ( array , f ) {
        var i = -1 , // Loop counter.
            n = array . length , // Array length.
            a , // Current maximum.
            b ; // Current element.

        if ( arguments . length === 1 ) {
            // No accessor function.
            // Find the first valid number to initialize 'a'.
            while ( ++ i < n && ( ( a = array [ i ] ) == null || a != a ) ) {
                a = undefined ;
            }
            // Iterate through the rest to find a larger value.
            while ( ++ i < n ) {
                if ( ( b = array [ i ] ) != null && b > a ) {
                    a = b ;
                }
            }
        } else {
            // Accessor function provided.
            // Apply accessor and find the first valid number.
            while ( ++ i < n && ( ( a = f . call ( array , array [ i ] , i ) ) == null || a != a ) ) {
                a = undefined ;
            }
            // Apply accessor and find a larger value.
            while ( ++ i < n ) {
                if ( ( b = f . call ( array , array [ i ] , i ) ) != null && b > a ) {
                    a = b ;
                }
            }
        }
        return a ;
    } ;


    /**
     * Finds both the minimum and maximum values in an array.
     * An optional accessor function `f` can be provided.
     *
     * @param {Array<number>} array The array of numbers or objects.
     * @param {Function} [f] An optional accessor function (d, i) => number.
     * @returns {Array<number|undefined>} An array [min, max], or [undefined, undefined] if no valid numbers.
     */
    d3 . extent = function ( array , f ) {
        var i = -1 , // Loop counter.
            n = array . length , // Array length.
            a , // Minimum value.
            b , // Current element value.
            c ; // Maximum value.

        if ( arguments . length === 1 ) {
            // No accessor function.
            // Find the first valid number to initialize 'a' (min) and 'c' (max).
            while ( ++ i < n && ( ( a = c = array [ i ] ) == null || a != a ) ) {
                a = c = undefined ;
            }
            // Iterate through the rest to update min and max.
            while ( ++ i < n ) {
                if ( ( b = array [ i ] ) != null ) {
                    if ( a > b ) a = b ; // Update minimum.
                    if ( c < b ) c = b ; // Update maximum.
                }
            }
        } else {
            // Accessor function provided.
            // Apply accessor and find the first valid number.
            while ( ++ i < n && ( ( a = c = f . call ( array , array [ i ] , i ) ) == null || a != a ) ) {
                a = undefined ;
            }
            // Apply accessor and update min and max.
            while ( ++ i < n ) {
                if ( ( b = f . call ( array , array [ i ] , i ) ) != null ) {
                    if ( a > b ) a = b ; // Update minimum.
                    if ( c < b ) c = b ; // Update maximum.
                }
            }
        }
        return [ a , c ] ; // Return the [min, max] array.
    } ;


    // D3's random number generators.
    d3 . random = {
        /**
         * Generates random numbers with a normal (Gaussian) distribution.
         * Uses the Box-Muller transform.
         *
         * @param {number} [mean=0] The mean of the distribution.
         * @param {number} [deviation=1] The standard deviation of the distribution.
         * @returns {Function} A function that, when called, returns a new normally distributed random number.
         */
        normal : function ( mean , deviation ) {
            if ( arguments . length < 2 ) deviation = 1 ; // Default deviation is 1.
            if ( arguments . length < 1 ) mean = 0 ; // Default mean is 0.

            return function ( ) {
                var x , y , r ;
                // Generate two uniform random numbers (x, y) in [-1, 1] until their sum of squares (r) is in (0, 1).
                do {
                    x = Math . random ( ) * 2 - 1 ;
                    y = Math . random ( ) * 2 - 1 ;
                    r = x * x + y * y ;
                } while ( ! r || r > 1 ) ; // Ensure r is between (0, 1).

                // Apply Box-Muller transform.
                // Note: This implementation only uses one of the two possible numbers (x).
                return mean + deviation * x * Math . sqrt ( -2 * Math . log ( r ) / r ) ;
            } ;
        }
    } ;


    /**
     * Checks if a value is a valid finite number (not null, undefined, or NaN).
     * @param {*} x The value to check.
     * @returns {boolean} True if x is a valid number, false otherwise.
     */
    function d3_number ( x ) {
        return x != null && ! isNaN ( x ) ;
    }


    /**
     * Calculates the sum of an array of numbers.
     * An optional accessor function `f` can be provided.
     *
     * @param {Array<number>} array The array of numbers or objects.
     * @param {Function} [f] An optional accessor function (d, i) => number.
     * @returns {number} The sum of the numbers. Non-numeric values are ignored.
     */
    d3 . sum = function ( array , f ) {
        var s = 0 , // Initialize sum.
            n = array . length , // Array length.
            a , // Current number.
            i = -1 ; // Loop counter.

        if ( arguments . length === 1 ) {
            // No accessor function.
            while ( ++ i < n ) {
                if ( ! isNaN ( a = + array [ i ] ) ) { // Convert to number and check for NaN.
                    s += a ; // Add to sum.
                }
            }
        } else {
            // Accessor function provided.
            while ( ++ i < n ) {
                if ( ! isNaN ( a = + f . call ( array , array [ i ] , i ) ) ) { // Apply accessor, convert, check.
                    s += a ; // Add to sum.
                }
            }
        }

        return s ;
    } ;


    // Quantile calculation using R-7 method.
    // Reference: <http://en.wikipedia.org/wiki/Quantile>
    /**
     * Calculates the p-th quantile of a *sorted* array of values.
     *
     * @param {Array<number>} values A numerically sorted array.
     * @param {number} p The quantile probability (0 to 1).
     * @returns {number} The p-th quantile value.
     */
    d3 . quantile = function ( values , p ) {
        var H = ( values . length - 1 ) * p + 1 , // Calculate the 1-based index (H).
            h = Math . floor ( H ) , // Integer part of H.
            v = values [ h - 1 ] , // Value at the lower index.
            e = H - h ; // Fractional part of H.

        // If there's a fractional part, interpolate between values.
        return e ? v + e * ( values [ h ] - v ) : v ;
    } ;


    /**
     * Transposes a matrix (swaps rows and columns).
     *
     * @param {Array<Array<*>>} matrix The matrix to transpose.
     * @returns {Array<Array<*>>} The transposed matrix.
     */
    d3 . transpose = function ( matrix ) {
        // Uses d3.zip to perform the transposition.
        return d3 . zip . apply ( d3 , matrix ) ;
    } ;


    /**
     * Zips multiple arrays together, creating a new array of arrays.
     * Each inner array contains elements at the same index from the input arrays.
     *
     * @param {...Array<*>} arguments Multiple arrays to zip.
     * @returns {Array<Array<*>>} The zipped array.
     */
    d3 . zip = function ( ) {
        if ( ! ( n = arguments . length ) ) return [ ] ; // If no arrays, return empty.
        for ( var i = -1 , m = d3 . min ( arguments , d3_zipLength ) , zips = new Array ( m ) ; ++ i < m ; ) {
            for ( var j = -1 , n , zip = zips [ i ] = new Array ( n ) ; ++ j < n ; ) {
                zip [ j ] = arguments [ j ] [ i ] ; // Take the j-th array's i-th element.
            }
        }
        return zips ;
    } ;


    /**
     * Accessor function for d3.zip to get the length of an array.
     * @param {Array<*>} d An array.
     * @returns {number} The length of the array.
     */
    function d3_zipLength ( d ) {
        return d . length ;
    }


    /**
     * Creates a bisector object with `left` and `right` methods.
     * A bisector finds the insertion point for a value in a sorted array,
     * maintaining the sort order.
     *
     * @param {Function} f An accessor function to extract values for comparison.
     * @returns {Object} An object with `left` and `right` bisector methods.
     */
    d3 . bisector = function ( f ) {
        return {
            /**
             * Finds the insertion point for `x` in sorted array `a` such that all elements
             * to the left are less than `x`. Returns the index.
             *
             * @param {Array<*>} a The sorted array.
             * @param {*} x The value to bisect for.
             * @param {number} [lo=0] The lower bound of the search range.
             * @param {number} [hi=a.length] The upper bound of the search range.
             * @returns {number} The insertion index.
             */
            left : function ( a , x , lo , hi ) {
                if ( arguments . length < 3 ) lo = 0 ;
                if ( arguments . length < 4 ) hi = a . length ;

                while ( lo < hi ) {
                    var mid = lo + hi >> 1 ; // Efficient integer division by 2.
                    if ( f . call ( a , a [ mid ] , mid ) < x ) {
                        lo = mid + 1 ; // x is greater, search in the right half.
                    } else {
                        hi = mid ; // x is less or equal, search in the left half (including mid).
                    }
                }
                return lo ; // lo is the insertion point.
            } ,

            /**
             * Finds the insertion point for `x` in sorted array `a` such that all elements
             * to the left are less than or equal to `x`. Returns the index.
             *
             * @param {Array<*>} a The sorted array.
             * @param {*} x The value to bisect for.
             * @param {number} [lo=0] The lower bound of the search range.
             * @param {number} [hi=a.length] The upper bound of the search range.
             * @returns {number} The insertion index.
             */
            right : function ( a , x , lo , hi ) {
                if ( arguments . length < 3 ) lo = 0 ;
                if ( arguments . length < 4 ) hi = a . length ;

                while ( lo < hi ) {
                    var mid = lo + hi >> 1 ;
                    if ( x < f . call ( a , a [ mid ] , mid ) ) {
                        hi = mid ; // x is less, search in the left half (excluding mid).
                    } else {
                        lo = mid + 1 ; // x is greater or equal, search in the right half.
                    }
                }
                return lo ;
            }
        } ;
    } ;


    // Create a default bisector for identity function (compares numbers directly).
    var d3_bisector = d3 . bisector ( function ( d ) { return d ; } ) ;

    // Expose bisector methods on the d3 object.
    d3 . bisectLeft = d3_bisector . left ;
    d3 . bisect = d3 . bisectRight = d3_bisector . right ;


    /**
     * Finds the "first" (smallest) element in an array according to a comparator function.
     *
     * @param {Array<*>} array The array to search.
     * @param {Function} [f=d3.ascending] The comparator function (a, b) => -1, 0, or 1.
     * @returns {*} The first element.
     */
    d3 . first = function ( array , f ) {
        var i = 0 , // Loop counter.
            n = array . length , // Array length.
            a = array [ 0 ] , // Initialize 'a' with the first element.
            b ; // Variable for the current element in loop.

        if ( arguments . length === 1 ) {
            f = d3 . ascending ; // Default to ascending order if no comparator is provided.
        }

        while ( ++ i < n ) {
            if ( f . call ( array , a , b = array [ i ] ) > 0 ) {
                a = b ; // If current element 'b' is smaller than 'a', update 'a'.
            }
        }
        return a ; // Return the smallest element found.
    } ;


    /**
     * Finds the "last" (largest) element in an array according to a comparator function.
     *
     * @param {Array<*>} array The array to search.
     * @param {Function} [f=d3.ascending] The comparator function (a, b) => -1, 0, or 1.
     * @returns {*} The last element.
     */
    d3 . last = function ( array , f ) {
        var i = 0 , // Loop counter.
            n = array . length , // Array length.
            a = array [ 0 ] , // Initialize 'a' with the first element.
            b ; // Variable for the current element in loop.

        if ( arguments . length === 1 ) {
            f = d3 . ascending ; // Default to ascending order if no comparator is provided.
        }

        while ( ++ i < n ) {
            if ( f . call ( array , a , b = array [ i ] ) <= 0 ) {
                a = b ; // If current element 'b' is greater than or equal to 'a', update 'a'.
            }
        }
        return a ; // Return the largest element found.
    } ;


    /**
     * D3's nest operator for grouping data.
     * It allows hierarchical grouping and aggregation of data.
     *
     * @returns {Object} A nest object with methods for defining keys, sorting, and rolling up.
     */
    d3 . nest = function ( ) {
        var nest = { } , // The nest object to be returned.
            keys = [ ] , // Array of key accessor functions.
            sortKeys = [ ] , // Array of key comparator functions.
            sortValues , // Comparator function for leaf values.
            rollup ; // Rollup function for leaf nodes.


        /**
         * Recursively maps an array into a nested object structure.
         *
         * @param {Array<Object>} array The input data array.
         * @param {number} depth The current nesting depth (index into `keys`).
         * @returns {Object|Array} The nested object or rolled-up array.
         */
        function map ( array , depth ) {
            // Base case: if all keys have been processed.
            if ( depth >= keys . length ) {
                return rollup // If a rollup function is defined, apply it.
                    ? rollup . call ( nest , array )
                    : ( sortValues // Otherwise, sort leaf values if a comparator is defined.
                        ? array . sort ( sortValues )
                        : array ) ; // Or return the array as-is.
            }

            var i = -1 , // Loop counter for array elements.
                n = array . length , // Length of the current array.
                key = keys [ depth ++ ] , // The current key accessor function.
                keyValue , // Value returned by the key accessor.
                object , // Current data object.
                valuesByKey = new d3_Map , // Map to group elements by current key.
                values , // Array of objects for a given key.
                o = { } ; // The output object for this nesting level.

            // Group elements by the current key.
            while ( ++ i < n ) {
                if ( values = valuesByKey . get ( keyValue = key ( object = array [ i ] ) ) ) {
                    values . push ( object ) ; // Add to existing group.
                } else {
                    valuesByKey . set ( keyValue , [ object ] ) ; // Create new group.
                }
            }

            // Recursively process each group.
            valuesByKey . forEach ( function ( keyValue ) {
                o [ keyValue ] = map ( valuesByKey . get ( keyValue ) , depth ) ;
            } ) ;

            return o ; // Return the nested object.
        }


        /**
         * Converts a nested map structure into an array of entries.
         * Each entry is { key: ..., values: ... }.
         *
         * @param {Object} map The nested map created by the `map` function.
         * @param {number} depth The current nesting depth.
         * @returns {Array<Object>} An array of entries.
         */
        function entries ( map , depth ) {
            if ( depth >= keys . length ) return map ; // Base case: return the leaf node (which might be a rolled-up value).

            var a = [ ] , // Array to store entries for this level.
                sortKey = sortKeys [ depth ++ ] , // Key comparator for this level.
                key ; // Variable for iterating map keys.

            for ( key in map ) {
                a . push ( { key : key , values : entries ( map [ key ] , depth ) } ) ; // Recursively get entries for sub-maps.
            }

            if ( sortKey ) {
                // Sort entries by key if a sortKey comparator is provided.
                a . sort ( function ( a , b ) {
                    return sortKey ( a . key , b . key ) ;
                } ) ;
            }

            return a ; // Return the sorted array of entries.
        }


        // Public methods of the nest operator.

        /**
         * Applies the nesting operation to an array, returning a nested object (map).
         * @param {Array<Object>} array The input data array.
         * @returns {Object} The nested map.
         */
        nest . map = function ( array ) {
            return map ( array , 0 ) ; // Start nesting from depth 0.
        } ;

        /**
         * Applies the nesting operation to an array, returning a nested array of entries.
         * @param {Array<Object>} array The input data array.
         * @returns {Array<Object>} The nested array of entries.
         */
        nest . entries = function ( array ) {
            return entries ( map ( array , 0 ) , 0 ) ; // First map, then convert to entries.
        } ;

        /**
         * Adds a key accessor function to the nesting hierarchy.
         * @param {Function} d The key accessor function.
         * @returns {Object} The nest object (for chaining).
         */
        nest . key = function ( d ) {
            keys . push ( d ) ;
            return nest ;
        } ;

        /**
         * Specifies the order for the most-recently specified key.
         * Note: only applies to entries. Map keys are unordered!
         * @param {Function} order The comparator function for keys.
         * @returns {Object} The nest object (for chaining).
         */
        nest . sortKeys = function ( order ) {
            sortKeys [ keys . length - 1 ] = order ;
            return nest ;
        } ;

        /**
         * Specifies the order for leaf values.
         * Applies to both maps and entries array.
         * @param {Function} order The comparator function for leaf values.
         * @returns {Object} The nest object (for chaining).
         */
        nest . sortValues = function ( order ) {
            sortValues = order ;
            return nest ;
        } ;

        /**
         * Specifies a rollup function to apply to leaf arrays.
         * This function transforms the final array of grouped items into a single value.
         * @param {Function} f The rollup function.
         * @returns {Object} The nest object (for chaining).
         */
        nest . rollup = function ( f ) {
            rollup = f ;
            return nest ;
        } ;

        return nest ; // Return the configured nest object.
    } ;


    /**
     * Returns an array of enumerable own property names of an object.
     * Similar to Object.keys, but works for older browsers.
     *
     * @param {Object} map The object to get keys from.
     * @returns {Array<string>} An array of property names.
     */
    d3 . keys = function ( map ) {
        var keys = [ ] ;
        for ( var key in map ) {
            keys . push ( key ) ;
        }
        return keys ;
    } ;


    /**
     * Returns an array of enumerable own property values of an object.
     *
     * @param {Object} map The object to get values from.
     * @returns {Array<*>} An array of property values.
     */
    d3 . values = function ( map ) {
        var values = [ ] ;
        for ( var key in map ) {
            values . push ( map [ key ] ) ;
        }
        return values ;
    } ;


    /**
     * Returns an array of enumerable own property [key, value] entries of an object.
     * Each entry is an object { key: ..., value: ... }.
     *
     * @param {Object} map The object to get entries from.
     * @returns {Array<Object>} An array of entry objects.
     */
    d3 . entries = function ( map ) {
        var entries = [ ] ;
        for ( var key in map ) {
            entries . push ( { key : key , value : map [ key ] } ) ;
        }
        return entries ;
    } ;


    /**
     * Creates a new array by permuting the elements of an existing array
     * according to a given array of indexes.
     *
     * @param {Array<*>} array The original array.
     * @param {Array<number>} indexes An array of indexes specifying the new order.
     * @returns {Array<*>} The permuted array.
     */
    d3 . permute = function ( array , indexes ) {
        var permutes = [ ] , // The array to store permuted results.
            i = -1 , // Loop counter.
            n = indexes . length ; // Length of the indexes array.

        while ( ++ i < n ) {
            permutes [ i ] = array [ indexes [ i ] ] ; // Assign element from original array at specified index.
        }
        return permutes ;
    } ;


    /**
     * Merges multiple arrays into a single, flat array.
     *
     * @param {Array<Array<*>>} arrays An array of arrays to merge.
     * @returns {Array<*>} A new array containing all elements from the input arrays.
     */
    d3 . merge = function ( arrays ) {
        // Uses Array.prototype.concat.apply to flatten an array of arrays.
        return Array . prototype . concat . apply ( [ ] , arrays ) ;
    } ;


    /**
     * Splits an array into multiple sub-arrays based on a predicate function.
     * When the predicate returns true, a new sub-array is started.
     *
     * @param {Array<*>} array The input array to split.
     * @param {Function} [f=d3_splitter] The predicate function (d, i) => boolean.
     * @returns {Array<Array<*>>} An array of sub-arrays.
     */
    d3 . split = function ( array , f ) {
        var arrays = [ ] , // Array to hold all sub-arrays.
            values = [ ] , // Current sub-array being built.
            value , // Current element from the input array.
            i = -1 , // Loop counter.
            n = array . length ; // Length of the input array.

        if ( arguments . length < 2 ) {
            f = d3_splitter ; // Default splitter function if none provided.
        }

        while ( ++ i < n ) {
            if ( f . call ( values , value = array [ i ] , i ) ) {
                // If predicate is true, reset 'values' to start a new sub-array.
                values = [ ] ;
            } else {
                // If predicate is false, add to the current sub-array.
                if ( ! values . length ) {
                    arrays . push ( values ) ; // If it's a new sub-array, add it to 'arrays'.
                }
                values . push ( value ) ; // Add the current value.
            }
        }
        return arrays ;
    } ;


    /**
     * Default splitter function for d3.split.
     * Splits on null or undefined values.
     *
     * @param {*} d The current data element.
     * @returns {boolean} True if d is null or undefined, false otherwise.
     */
    function d3_splitter ( d ) {
        return d == null ;
    }


    /**
     * Collapses multiple spaces and trims leading/trailing whitespace from a string.
     *
     * @param {string} s The input string.
     * @returns {string} The collapsed string.
     */
    function d3_collapse ( s ) {
        // Trim leading/trailing whitespace, then replace multiple spaces with single space.
        return s . replace ( /^\s+|\s+$/g , "" ) . replace ( /\s+/g , " " ) ;
    }


    /**
     * Generates a numeric range.
     *
     * @param {number} start The start value (inclusive).
     * @param {number} [stop] The stop value (exclusive). If only one argument, it's `stop` and `start` is 0.
     * @param {number} [step=1] The step value.
     * @returns {Array<number>} An array of numbers in the specified range.
     * @throws {Error} If an infinite range is detected.
     */
    d3 . range = function ( start , stop , step ) {
        if ( arguments . length < 3 ) {
            step = 1 ; // Default step to 1.
            if ( arguments . length < 2 ) {
                stop = start ; // If only one argument, it's 'stop', and 'start' is 0.
                start = 0 ;
            }
        }
        // Check for infinite range (e.g., start=0, stop=1, step=0).
        if ( ( stop - start ) / step === Infinity ) {
            throw new Error ( "infinite range" ) ;
        }

        var range = [ ] , // Array to store the generated range.
            k = d3_range_integerScale ( Math . abs ( step ) ) , // Scaling factor to handle floating point precision.
            i = -1 , // Loop counter.
            j ; // Current value in the range.

        // Scale start, stop, and step to integers to avoid floating point issues during iteration.
        start *= k ;
        stop *= k ;
        step *= k ;

        if ( step < 0 ) {
            while ( ( j = start + step * ++ i ) > stop ) {
                range . push ( j / k ) ; // Add scaled value back to original scale.
            }
        } else {
            while ( ( j = start + step * ++ i ) < stop ) {
                range . push ( j / k ) ;
            }
        }
        return range ;
    } ;


    /**
     * Calculates an integer scaling factor to help with floating point precision
     * when generating ranges.
     * E.g., for step 0.1, k = 10; for 0.01, k = 100.
     *
     * @param {number} x The step value.
     * @returns {number} The integer scaling factor.
     */
    function d3_range_integerScale ( x ) {
        var k = 1 ;
        while ( x * k % 1 ) { // While x * k is not an integer.
            k *= 10 ; // Multiply k by 10.
        }
        return k ;
    }


    /**
     * Escapes special regular expression characters in a string.
     *
     * @param {string} s The input string.
     * @returns {string} The escaped string.
     */
    d3 . requote = function ( s ) {
        return s . replace ( d3_requote_re , "\\$&" ) ; // Prepend a backslash to each special character.
    } ;


    // Regular expression for characters that need to be escaped in a regex pattern.
    var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g ;


    /**
     * Rounds a number to a specified number of decimal places.
     *
     * @param {number} x The number to round.
     * @param {number} [n=0] The number of decimal places.
     * @returns {number} The rounded number.
     */
    d3 . round = function ( x , n ) {
        return n
            ? Math . round ( x * ( n = Math . pow ( 10 , n ) ) ) / n // Scale, round, then unscale.
            : Math . round ( x ) ; // Simple rounding to nearest integer.
    } ;


    /**
     * Makes an XMLHttpRequest (XHR) GET request.
     *
     * @param {string} url The URL to request.
     * @param {string} [mime] The MIME type to override (optional).
     * @param {Function} callback The callback function (receives req object or null on error).
     */
    d3 . xhr = function ( url , mime , callback ) {
        var req = new XMLHttpRequest ; // Create a new XMLHttpRequest object.

        if ( arguments . length < 3 ) {
            callback = mime ; // If MIME type is omitted, the second argument is the callback.
            mime = null ;
        } else if ( mime && req . overrideMimeType ) {
            req . overrideMimeType ( mime ) ; // Set MIME type if supported.
        }

        req . open ( "GET" , url , true ) ; // Open an asynchronous GET request.

        if ( mime ) {
            req . setRequestHeader ( "Accept" , mime ) ; // Set Accept header if MIME type is specified.
        }

        // Event handler for readystate changes.
        req . onreadystatechange = function ( ) {
            if ( req . readyState === 4 ) { // Check if the request is complete.
                var s = req . status ; // Get HTTP status code.
                // Call the callback with the request object if successful, or null on error.
                callback ( ! s && req . response || s >= 200 && s < 300 || s === 304 ? req : null ) ;
            }
        } ;

        req . send ( null ) ; // Send the request.
    } ;

} ) ( ) ;