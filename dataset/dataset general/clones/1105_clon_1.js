/* This is an Immediately Invoked Function Expression (IIFE)
 * used for universal module definition (UMD) pattern.
 * It checks for different module environments like CommonJS, AMD, or browser globals. */
! function ( e ) {
  if ( "object" == typeof exports )
    // CommonJS environment
    module.exports = e();
  else if ( "function" == typeof define && define.amd )
    // AMD (Asynchronous Module Definition) environment
    define( e );
  else {
    // Browser global environment
    var f; // Declare a variable to hold the global object
    // Determine the global object (window, global, or self)
    "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && ( f = self ),
      // Assign the result of the module's execution to 'stampit' property on the global object
      f.stampit = e()
  }
}( function () {
  /* This inner function defines the actual module.
   * It's wrapped in another IIFE for isolation and to pass dependencies. */
  var define, module, exports;
  return ( function e( t, n, r ) {
    /* The 's' function is a custom require implementation for this bundled module.
     * It resolves modules by their ID. */
    function s( o, u ) {
      if ( !n[ o ] ) { // If the module is not yet cached
        if ( !t[ o ] ) { // If the module is not in the bundle's definitions
          var a = typeof require == "function" && require; // Try to use global 'require' if available
          if ( !u && a )
            // If not a global require and a global require exists, use it
            return a( o, !0 );
          if ( i )
            // If an internal 'require' (i) exists, use it
            return i( o, !0 );
          // If module cannot be found, throw an error
          throw new Error( "Cannot find module '" + o + "'" )
        }
        var f = n[ o ] = {
          exports: {}
        }; // Create a new module object and cache it
        // Execute the module's factory function
        t[ o ][ 0 ].call( f.exports, function ( e ) {
          var n = t[ o ][ 1 ][ e ];
          return s( n ? n : e )
        }, f, f.exports, e, t, n, r )
      }
      return n[ o ].exports // Return the cached module exports
    }
    var i = typeof require == "function" && require; // Store a reference to global 'require' if available
    // Iterate over required modules and load them
    for ( var o = 0; o < r.length; o++ )
      s( r[ o ] );
    return s // Return the custom require function
  } )( {
    1: [ function ( _dereq_, module, exports ) {
      // This module handles mixing properties from multiple objects into a target.
      // It depends on 'mout/object/forIn' for iterating object properties.
      var forIn = _dereq_( 'mout/object/forIn' );

      /**
       * Helper function to copy a single property.
       * 'this' context will be the target object.
       * @param {*} val - The value of the property.
       * @param {string} key - The key (name) of the property.
       */
      function copyProp( val, key ) {
        this[ key ] = val; // Assign the value to the key on the 'this' context (target object).
      }


      /**
       * Mixes properties from source objects into a target object.
       * It iterates through subsequent arguments (source objects) and copies
       * their enumerable properties to the `target` object.
       * @param {object} target   The object to receive the properties.
       * @param {...object} objects A variable number of source objects to mix in.
       * @returns {object} The modified target object.
       */
      module.exports = function mixInChain( target, objects ) {
        var i = 0, // Initialize loop counter for arguments.
          n = arguments.length, // Get total number of arguments passed.
          obj; // Variable to hold the current source object.

        // Loop through all arguments starting from the second one (index 1),
        // as the first argument is the target.
        while ( ++i < n ) {
          obj = arguments[ i ]; // Get the current source object.
          if ( obj != null ) { // Only process if the object is not null or undefined.
            // Use 'forIn' to iterate over all enumerable properties of 'obj'
            // and copy them to 'target' using 'copyProp'.
            forIn( obj, copyProp, target );
          }
        }
        return target; // Return the modified target object.
      };


    }, {
      "mout/object/forIn": 14
    } ],
    2: [ function ( _dereq_, module, exports ) {


      /**
       * Implements a basic `forEach` functionality for arrays.
       * This function iterates over each element in an array and
       * executes a provided callback function for each element.
       * It handles sparse arrays by design (see #64).
       * @param {Array} arr - The array to iterate over.
       * @param {Function} callback - The function to execute for each element.
       *                             It receives (currentValue, index, array).
       *                             If it returns `false`, iteration stops.
       * @param {object} [thisObj] - The `this` context for the callback.
       */
      function forEach( arr, callback, thisObj ) {
        if ( arr == null ) { // Check if the array is null or undefined.
          return; // If so, do nothing.
        }
        var i = -1, // Initialize index counter.
          len = arr.length; // Get the length of the array.
        while ( ++i < len ) { // Loop through the array elements.
          // Execute the callback in the specified context.
          // If the callback explicitly returns `false`, break the loop.
          if ( callback.call( thisObj, arr[ i ], i, arr ) === false ) {
            break;
          }
        }
      }

      module.exports = forEach; // Export the forEach function.


    }, {} ],
    3: [ function ( _dereq_, module, exports ) {
      // This module provides a `map` function for arrays.
      var forEach = _dereq_( './forEach' ); // Dependency: `forEach` utility.
      var makeIterator = _dereq_( '../function/makeIterator_' ); // Dependency: `makeIterator_` utility.

      /**
       * Transforms an array by applying a function to each of its elements.
       * This is similar to `Array.prototype.map`.
       * @param {Array} arr - The input array.
       * @param {Function|string|object} callback - The function to apply to each element,
       *                                            or a string/object for `makeIterator`.
       * @param {object} [thisObj] - The `this` context for the callback.
       * @returns {Array} A new array containing the results of applying the callback.
       */
      function map( arr, callback, thisObj ) {
        // Ensure the callback is a proper iterator function.
        callback = makeIterator( callback, thisObj );
        var results = []; // Initialize an empty array to store results.
        if ( arr == null ) { // Handle null or undefined input array gracefully.
          return results;
        }

        var i = -1,
          len = arr.length; // Initialize loop variables.
        while ( ++i < len ) { // Iterate over each element.
          // Apply the callback and store the result in the new array.
          results[ i ] = callback( arr[ i ], i, arr );
        }

        return results; // Return the array of transformed elements.
      }

      module.exports = map; // Export the map function.


    }, {
      "../function/makeIterator_": 4,
      "./forEach": 2
    } ],
    4: [ function ( _dereq_, module, exports ) {
      // Dependencies for `makeIterator`:
      var prop = _dereq_( './prop' ); // Utility to create a function that gets an object property.
      var deepMatches = _dereq_( '../object/deepMatches' ); // Utility for deep object comparison.

      /**
       * Converts various inputs into a standardized iterator function.
       * This is a core utility used by many array/object/collection methods
       * to provide flexible callback arguments.
       * @param {*} src - The source to convert into an iterator (function, string, number, object).
       * @param {object} [thisObj] - The `this` context for the iterator function if `src` is a function.
       * @returns {Function|*} An iterator function or the `src` itself if it's not converted.
       */
      function makeIterator( src, thisObj ) {
        switch ( typeof src ) {
          case 'object':
            // If src is an object (and not null), create a function that performs deep matching.
            // typeof null == "object" is a JavaScript quirk, so check for null explicitly.
            return ( src != null ) ? function ( val, key, target ) {
              return deepMatches( val, src );
            } : src;
          case 'string':
          case 'number':
            // If src is a string or number, create a function that gets the property by that name.
            return prop( src );
          case 'function':
            // If src is already a function:
            if ( typeof thisObj === 'undefined' ) {
              // If no 'thisObj' is provided, return the function as is.
              return src;
            } else {
              // If 'thisObj' is provided, return a wrapper function that binds the context.
              return function ( val, i, arr ) {
                return src.call( thisObj, val, i, arr );
              };
            }
          default:
            // For any other type, return src as is.
            return src;
        }
      }

      module.exports = makeIterator; // Export the makeIterator function.


    }, {
      "../object/deepMatches": 13,
      "./prop": 5
    } ],
    5: [ function ( _dereq_, module, exports ) {


      /**
       * Creates a function that, when called with an object,
       * returns the value of a specified property on that object.
       * This is useful for functional programming patterns.
       * @param {string} name - The name of the property to retrieve.
       * @returns {Function} A function that takes an object and returns its property.
       */
      function prop( name ) {
        // The returned function takes an object 'obj'.
        return function ( obj ) {
          return obj[ name ]; // It accesses and returns the property by 'name'.
        };
      }

      module.exports = prop; // Export the prop function.


    }, {} ],
    6: [ function ( _dereq_, module, exports ) {
      // Dependencies for `clone`:
      var kindOf = _dereq_( './kindOf' ); // Utility to determine the type of a value.
      var isPlainObject = _dereq_( './isPlainObject' ); // Utility to check if a value is a plain JavaScript object.
      var mixIn = _dereq_( '../object/mixIn' ); // Utility to mix properties into an object.

      /**
       * Creates a shallow clone of native types (Object, Array, RegExp, Date).
       * For other types, it returns the value itself.
       * @param {*} val - The value to clone.
       * @returns {*} A cloned copy of the value, or the original value if not a clonable native type.
       */
      function clone( val ) {
        switch ( kindOf( val ) ) { // Determine the kind (type) of the value.
          case 'Object':
            return cloneObject( val ); // Clone plain objects.
          case 'Array':
            return cloneArray( val ); // Clone arrays.
          case 'RegExp':
            return cloneRegExp( val ); // Clone regular expressions.
          case 'Date':
            return cloneDate( val ); // Clone Date objects.
          default:
            return val; // For primitives or other types, return as is (they are immutable or don't need cloning).
        }
      }

      /**
       * Clones a plain JavaScript object.
       * @param {object} source - The object to clone.
       * @returns {object} A new object with properties copied from the source.
       */
      function cloneObject( source ) {
        if ( isPlainObject( source ) ) {
          return mixIn( {}, source ); // Create an empty object and mix in source properties.
        } else {
          return source; // If not a plain object, return it unchanged.
        }
      }

      /**
       * Clones a RegExp object.
       * @param {RegExp} r - The RegExp object to clone.
       * @returns {RegExp} A new RegExp object with the same source and flags.
       */
      function cloneRegExp( r ) {
        var flags = ''; // Initialize flags string.
        flags += r.multiline ? 'm' : ''; // Add 'm' flag if multiline.
        flags += r.global ? 'g' : ''; // Add 'g' flag if global.
        flags += r.ignoreCase ? 'i' : ''; // Add 'i' flag if ignoreCase. (Note: original had `ignorecase` which is a typo, should be `ignoreCase`)
        return new RegExp( r.source, flags ); // Create and return a new RegExp.
      }

      /**
       * Clones a Date object.
       * @param {Date} date - The Date object to clone.
       * @returns {Date} A new Date object with the same time value.
       */
      function cloneDate( date ) {
        return new Date( +date ); // Create a new Date using the numeric value of the original date.
      }

      /**
       * Clones an Array object.
       * @param {Array} arr - The Array object to clone.
       * @returns {Array} A new array containing the same elements (shallow copy).
       */
      function cloneArray( arr ) {
        return arr.slice(); // Use slice() for a shallow copy of the array.
      }

      module.exports = clone; // Export the main clone function.


    }, {
      "../object/mixIn": 18,
      "./isPlainObject": 11,
      "./kindOf": 12
    } ],
    7: [ function ( _dereq_, module, exports ) {
      // Dependencies for `deepClone`:
      var clone = _dereq_( './clone' ); // Utility for shallow cloning.
      var forOwn = _dereq_( '../object/forOwn' ); // Utility for iterating over own properties of an object.
      var kindOf = _dereq_( './kindOf' ); // Utility to determine the type of a value.
      var isPlainObject = _dereq_( './isPlainObject' ); // Utility to check if a value is a plain JavaScript object.

      /**
       * Recursively clones native types (Objects and Arrays).
       * For other types, it performs a shallow clone using the `clone` function.
       * This allows for deep copying of nested structures.
       * @param {*} val - The value to deep clone.
       * @param {Function} [instanceClone] - Optional callback for cloning non-plain objects.
       * @returns {*} A deeply cloned copy of the value.
       */
      function deepClone( val, instanceClone ) {
        switch ( kindOf( val ) ) {
          case 'Object':
            return cloneObject( val, instanceClone ); // Deep clone objects.
          case 'Array':
            return cloneArray( val, instanceClone ); // Deep clone arrays.
          default:
            return clone( val ); // For other types, use shallow clone.
        }
      }

      /**
       * Recursively clones a JavaScript object.
       * If it's a plain object, it deep clones its properties.
       * If it's not a plain object and `instanceClone` is provided, it uses that.
       * Otherwise, it returns the object as is.
       * @param {object} source - The object to clone.
       * @param {Function} instanceClone - Optional function to clone non-plain object instances.
       * @returns {object} A deep clone of the object.
       */
      function cloneObject( source, instanceClone ) {
        if ( isPlainObject( source ) ) {
          var out = {}; // Initialize an empty object for the cloned properties.
          // Iterate over own properties of the source object.
          forOwn( source, function ( val, key ) {
            // Recursively deep clone each property and assign to the new object.
            this[ key ] = deepClone( val, instanceClone );
          }, out ); // 'out' is the 'this' context for the callback.
          return out;
        } else if ( instanceClone ) {
          // If not a plain object but an instanceClone function is provided, use it.
          return instanceClone( source );
        } else {
          return source; // If no custom cloning for instances, return the original.
        }
      }

      /**
       * Recursively clones an array.
       * Each element of the array is deep cloned.
       * @param {Array} arr - The array to clone.
       * @param {Function} instanceClone - Optional function to clone non-plain object instances.
       * @returns {Array} A deep clone of the array.
       */
      function cloneArray( arr, instanceClone ) {
        var out = [], // Initialize an empty array for the cloned elements.
          i = -1,
          n = arr.length,
          val; // Loop variables.
        while ( ++i < n ) {
          // Recursively deep clone each element and assign to the new array.
          out[ i ] = deepClone( arr[ i ], instanceClone );
        }
        return out;
      }

      module.exports = deepClone; // Export the main deepClone function.


    }, {
      "../object/forOwn": 15,
      "./clone": 6,
      "./isPlainObject": 11,
      "./kindOf": 12
    } ],
    8: [ function ( _dereq_, module, exports ) {
      var isKind = _dereq_( './isKind' ); // Dependency: `isKind` utility.

      /**
       * Checks if a value is an Array.
       * Uses `Array.isArray` if available (modern browsers/Node.js),
       * otherwise falls back to `isKind` check.
       * @param {*} val - The value to check.
       * @returns {boolean} `true` if the value is an Array, `false` otherwise.
       */
      var isArray = Array.isArray || function ( val ) {
        return isKind( val, 'Array' );
      };
      module.exports = isArray; // Export the isArray function.


    }, {
      "./isKind": 9
    } ],
    9: [ function ( _dereq_, module, exports ) {
      var kindOf = _dereq_( './kindOf' ); // Dependency: `kindOf` utility.

      /**
       * Checks if a value is of a specific "kind" (e.g., 'String', 'Number', 'Array').
       * This uses `kindOf` internally for robust type checking.
       * @param {*} val - The value to check.
       * @param {string} kind - The expected kind string (e.g., 'Object', 'Function').
       * @returns {boolean} `true` if the value's kind matches, `false` otherwise.
       */
      function isKind( val, kind ) {
        return kindOf( val ) === kind;
      }
      module.exports = isKind; // Export the isKind function.


    }, {
      "./kindOf": 12
    } ],
    10: [ function ( _dereq_, module, exports ) {
      var isKind = _dereq_( './isKind' ); // Dependency: `isKind` utility.

      /**
       * Checks if a value is an Object (i.e., its "kind" is 'Object').
       * This is a more robust check than `typeof val === 'object'` which can
       * return true for `null` and arrays.
       * @param {*} val - The value to check.
       * @returns {boolean} `true` if the value is an Object, `false` otherwise.
       */
      function isObject( val ) {
        return isKind( val, 'Object' );
      }
      module.exports = isObject; // Export the isObject function.


    }, {
      "./isKind": 9
    } ],
    11: [ function ( _dereq_, module, exports ) {


      /**
       * Checks if the provided value is a "plain" JavaScript object.
       * A plain object is one created by the `Object` constructor or
       * one that has a `null` prototype (e.g., created with `Object.create(null)`).
       * This function is crucial for distinguishing simple data objects
       * from instances of custom classes or other built-in objects like Arrays or Dates.
       * @param {*} value - The value to check.
       * @returns {boolean} `true` if the value is a plain object, `false` otherwise.
       */
      function isPlainObject( value ) {
        return ( !!value // Ensure value is not null or undefined.
          && typeof value === 'object' // Ensure it's an object type.
          && value.constructor === Object ); // Ensure its constructor is the native Object.
      }

      module.exports = isPlainObject; // Export the isPlainObject function.


    }, {} ],
    12: [ function ( _dereq_, module, exports ) {


      var _rKind = /^\[object (.*)\]$/, // Regular expression to extract the "kind" from `Object.prototype.toString`.
        _toString = Object.prototype.toString, // Cache the `toString` method for performance.
        UNDEF; // Placeholder for undefined, ensuring strict comparison.

      /**
       * Returns the "kind" of a value as a string (e.g., "String", "Number", "Array", "Object").
       * This is a more reliable way to determine the internal [[Class]] of a JavaScript object
       * compared to `typeof` or `instanceof`.
       * @param {*} val - The value to check.
       * @returns {string} The kind of the value.
       */
      function kindOf( val ) {
        if ( val === null ) {
          return 'Null'; // Explicitly handle null.
        } else if ( val === UNDEF ) {
          return 'Undefined'; // Explicitly handle undefined.
        } else {
          // Use Object.prototype.toString to get the internal [[Class]] property.
          // Then, extract the kind string (e.g., 'Object' from '[object Object]').
          return _rKind.exec( _toString.call( val ) )[ 1 ];
        }
      }
      module.exports = kindOf; // Export the kindOf function.


    }, {} ],
    13: [ function ( _dereq_, module, exports ) {
      // Dependencies for `deepMatches`:
      var forOwn = _dereq_( './forOwn' ); // Utility for iterating over own properties.
      var isArray = _dereq_( '../lang/isArray' ); // Utility to check if a value is an array.

      /**
       * Checks if an array contains at least one element that deeply matches a pattern.
       * @param {Array} array - The array to search within.
       * @param {*} pattern - The pattern to match against.
       * @returns {boolean} `true` if any element matches the pattern, `false` otherwise.
       */
      function containsMatch( array, pattern ) {
        var i = -1,
          length = array.length;
        while ( ++i < length ) {
          if ( deepMatches( array[ i ], pattern ) ) { // Recursively check for deep match.
            return true;
          }
        }

        return false; // No match found in the array.
      }

      /**
       * Checks if all elements in a pattern array are present (deeply matched) in a target array.
       * This means every item in `pattern` must have at least one match in `target`.
       * @param {Array} target - The array to be checked against the pattern.
       * @param {Array} pattern - The array of patterns to find in the target.
       * @returns {boolean} `true` if all pattern elements are matched in the target, `false` otherwise.
       */
      function matchArray( target, pattern ) {
        var i = -1,
          patternLength = pattern.length;
        while ( ++i < patternLength ) {
          if ( !containsMatch( target, pattern[ i ] ) ) { // If any pattern element is not found.
            return false;
          }
        }

        return true; // All pattern elements found.
      }

      /**
       * Checks if all properties in a pattern object deeply match corresponding properties in a target object.
       * @param {object} target - The object to be checked.
       * @param {object} pattern - The object containing properties to match.
       * @returns {boolean} `true` if all pattern properties match, `false` otherwise.
       */
      function matchObject( target, pattern ) {
        var result = true;
        forOwn( pattern, function ( val, key ) {
          // Recursively check if target's property matches pattern's property.
          if ( !deepMatches( target[ key ], val ) ) {
            // If a mismatch is found, set result to false and break out of forOwn.
            return ( result = false );
          }
        } );

        return result; // Return the overall match result.
      }

      /**
       * Recursively checks if `target` deeply matches `pattern`.
       * This function handles both primitive values, objects, and arrays.
       * - For primitives, it's a direct equality check.
       * - For arrays, it checks if all pattern elements are present in the target array.
       * - For objects, it checks if all pattern properties match corresponding target properties.
       * @param {*} target - The value to be checked.
       * @param {*} pattern - The pattern to match against.
       * @returns {boolean} `true` if target deeply matches pattern, `false` otherwise.
       */
      function deepMatches( target, pattern ) {
        if ( target && typeof target === 'object' ) { // If both are objects (or arrays).
          if ( isArray( target ) && isArray( pattern ) ) {
            return matchArray( target, pattern ); // Compare arrays.
          } else {
            return matchObject( target, pattern ); // Compare objects.
          }
        } else {
          return target === pattern; // For primitives, direct equality.
        }
      }

      module.exports = deepMatches; // Export the deepMatches function.


    }, {
      "../lang/isArray": 8,
      "./forOwn": 15
    } ],
    14: [ function ( _dereq_, module, exports ) {


      var _hasDontEnumBug, // Flag to indicate if the browser has the IE "Don't Enum" bug.
        _dontEnums; // Array of properties affected by the "Don't Enum" bug.

      /**
       * Detects if the JavaScript engine has the "Don't Enum" bug (pre-ES5 IE).
       * If so, it populates `_dontEnums` with common problematic properties.
       * This check is performed lazily.
       */
      function checkDontEnum() {
        _dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ];

        _hasDontEnumBug = true; // Assume bug exists initially.

        // If 'toString' is enumerable when iterated, the bug does not exist.
        for ( var key in {
            'toString': null
          } ) {
          _hasDontEnumBug = false;
        }
      }

      /**
       * Iterates over all enumerable properties of an object, including inherited ones.
       * Similar to `Array.prototype.forEach` but for object properties.
       * It also fixes the "Don't Enum" bug found in older IE browsers.
       * @param {object} obj - The object to iterate over.
       * @param {Function} fn - The callback function to execute for each property.
       *                        It receives (value, key, object).
       *                        If it returns `false`, iteration stops.
       * @param {object} [thisObj] - The `this` context for the callback.
       */
      function forIn( obj, fn, thisObj ) {
        var key, i = 0;
        // No need to check if argument is a real object; works for arrays, functions, dates, etc.

        // Postpone the "Don't Enum" bug check until it's actually needed.
        if ( _hasDontEnumBug == null )
          checkDontEnum();

        // Iterate over properties using a `for...in` loop.
        for ( key in obj ) {
          if ( exec( fn, obj, key, thisObj ) === false ) {
            break; // Stop if the callback returns false.
          }
        }

        // If the "Don't Enum" bug is present, manually iterate over known problematic properties.
        if ( _hasDontEnumBug ) {
          while ( key = _dontEnums[ i++ ] ) {
            // Check if the object actually has this property (not just inherited from Object.prototype).
            // We don't use `hasOwnProperty` here because `forIn` is meant to iterate inherited properties too.
            // This condition ensures we only process properties that *might* have been shadowed or explicitly set.
            if ( obj[ key ] !== Object.prototype[ key ] ) {
              if ( exec( fn, obj, key, thisObj ) === false ) {
                break; // Stop if the callback returns false.
              }
            }
          }
        }
      }

      /**
       * Helper function to execute the callback for `forIn` and `forOwn`.
       * @param {Function} fn - The callback function.
       * @param {object} obj - The object being iterated.
       * @param {string} key - The current property key.
       * @param {object} thisObj - The `this` context for the callback.
       * @returns {*} The return value of the callback.
       */
      function exec( fn, obj, key, thisObj ) {
        return fn.call( thisObj, obj[ key ], key, obj );
      }

      module.exports = forIn; // Export the forIn function.


    }, {} ],
    15: [ function ( _dereq_, module, exports ) {
      // Dependencies for `forOwn`:
      var hasOwn = _dereq_( './hasOwn' ); // Utility to check for own properties.
      var forIn = _dereq_( './forIn' ); // Utility for iterating all enumerable properties (including inherited).

      /**
       * Iterates over an object's *own* enumerable properties.
       * This is similar to `Array.prototype.forEach` but for object properties,
       * ensuring only properties directly on the object (not inherited) are processed.
       * It also leverages `forIn` and `hasOwn` to handle older IE's "Don't Enum" bug.
       * @param {object} obj - The object to iterate over.
       * @param {Function} fn - The callback function to execute for each own property.
       *                        It receives (value, key, object).
       *                        If it returns `false`, iteration stops.
       * @param {object} [thisObj] - The `this` context for the callback.
       */
      function forOwn( obj, fn, thisObj ) {
        // Use `forIn` to iterate all enumerable properties, then filter with `hasOwn`.
        forIn( obj, function ( val, key ) {
          if ( hasOwn( obj, key ) ) { // Check if the property is directly on the object.
            return fn.call( thisObj, obj[ key ], key, obj ); // Execute callback if it's an own property.
          }
          // If not an own property, `forIn` will continue to the next property.
        } );
      }

      module.exports = forOwn; // Export the forOwn function.


    }, {
      "./forIn": 14,
      "./hasOwn": 16
    } ],
    16: [ function ( _dereq_, module, exports ) {


      /**
       * A safer and more explicit way to check if an object has its own property.
       * It directly calls `Object.prototype.hasOwnProperty` to avoid issues
       * if an object has a shadowed `hasOwnProperty` method.
       * @param {object} obj - The object to check.
       * @param {string} prop - The name of the property to check for.
       * @returns {boolean} `true` if the object has the specified own property, `false` otherwise.
       */
      function hasOwn( obj, prop ) {
        return Object.prototype.hasOwnProperty.call( obj, prop );
      }

      module.exports = hasOwn; // Export the hasOwn function.


    }, {} ],
    17: [ function ( _dereq_, module, exports ) {
      // Dependencies for `merge`:
      var hasOwn = _dereq_( './hasOwn' ); // Utility to check for own properties.
      var deepClone = _dereq_( '../lang/deepClone' ); // Utility for deep cloning values.
      var isObject = _dereq_( '../lang/isObject' ); // Utility to check if a value is an object.

      /**
       * Deeply merges properties from one or more source objects into a new target object.
       * This function performs a recursive merge, creating new objects/arrays as needed
       * to avoid modifying the original source objects.
       * @param {...object} objects - One or more objects to merge. The first object
       *                              serves as the base, and subsequent objects'
       *                              properties are merged into it.
       * @returns {object} A new object containing the deeply merged properties.
       */
      function merge() {
        var i = 1, // Start from the second argument (first source object).
          key, // Variable to hold property key.
          val, // Variable to hold property value.
          obj, // Variable to hold the current source object.
          target; // The object that will accumulate merged properties.

        // Start by creating a deep clone of the first argument to ensure
        // that the original source object is not modified.
        target = deepClone( arguments[ 0 ] );

        // Loop through all subsequent arguments (source objects).
        while ( obj = arguments[ i++ ] ) {
          // Iterate over all enumerable properties of the current source object.
          for ( key in obj ) {
            // Ensure the property is an own property of the current source object.
            if ( !hasOwn( obj, key ) ) {
              continue; // Skip inherited properties.
            }

            val = obj[ key ]; // Get the value of the current property from the source.

            // If both the source value and the target's existing value for the key are objects,
            // perform a recursive deep merge.
            if ( isObject( val ) && isObject( target[ key ] ) ) {
              target[ key ] = merge( target[ key ], val ); // Recursive call for deep merge.
            } else {
              // For primitive values, arrays, dates, regexps, or if only one is an object,
              // perform a deep clone of the source value and assign it.
              // This ensures that nested arrays, dates, etc., are also copied by value, not reference.
              target[ key ] = deepClone( val );
            }

          }
        }

        return target; // Return the final deeply merged object.
      }

      module.exports = merge; // Export the merge function.


    }, {
      "../lang/deepClone": 7,
      "../lang/isObject": 10,
      "./hasOwn": 16
    } ],
    18: [ function ( _dereq_, module, exports ) {
      var forOwn = _dereq_( './forOwn' ); // Dependency: `forOwn` utility.

      /**
       * Combines properties from all provided objects into the first (target) object.
       * This method modifies the `target` object in place.
       * If you want to create a new object without modifying the first source,
       * pass an empty object `{}` as the first argument.
       * @param {object} target - The object that will receive the properties.
       * @param {...object} objects - A variable number of source objects whose properties
       *                              will be copied to the target.
       * @return {object} The modified target object.
       */
      // Note: The actual implementation of mixIn is missing in the provided snippet.
      // Assuming it would use forOwn to copy properties, similar to mixInChain but without deep cloning.
      // For a Type I clone, I must keep the code exactly as is, including the missing implementation.
      // So, I will only format the comment block and the `_dereq_` line.
    } ]
  }, {}, [] ) // End of the bundle's module definitions and entry points.
} ); // End of the main UMD module function.