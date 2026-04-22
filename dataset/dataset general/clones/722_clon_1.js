/*
 * @license AngularJS v1.0.0rc6 - A JavaScript MV* Framework
 * (c) 2010-2012 Google, Inc. http://angularjs.org
 *
 * License: MIT - see the LICENSE file for more details.
 * This file is part of the AngularJS project.
 */
( function( window, document, undefined ) {

  // Enforce strict mode for better error handling and cleaner code.
  'use strict';

  ////////////////////////////////////////////////////////////////////////////////////////////////
  // Core Utilities
  ////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * @ngdoc function
   * @name angular.lowercase
   * @function
   *
   * @description
   * Converts the specified string to lowercase.
   *
   * @param {string} string The string to be converted to lowercase.
   * @returns {string} The lowercased string.
   */
  var lowercase = function( string ) {
    return isString( string )
      ? string.toLowerCase() // If it's a string, convert it.
      : string;             // Otherwise, return as is.
  };


  /**
   * @ngdoc function
   * @name angular.uppercase
   * @function
   *
   * @description
   * Converts the specified string to uppercase.
   *
   * @param {string} string The string to be converted to uppercase.
   * @returns {string} The uppercased string.
   */
  var uppercase = function( string ) {
    return isString( string )
      ? string.toUpperCase() // If it's a string, convert it.
      : string;             // Otherwise, return as is.
  };


  // Manual lowercase conversion, used for specific locale issues (e.g., Turkish 'i').
  var manualLowercase = function( s ) {
    return isString( s )
      ? s.replace( /[A-Z]/g, function( ch ) {
          // Convert character to lowercase using bitwise OR 32
          return fromCharCode( ch.charCodeAt( 0 ) | 32 );
        } )
      : s; // Not a string, return original value
  };

  // Manual uppercase conversion, used for specific locale issues (e.g., Turkish 'i').
  var manualUppercase = function( s ) {
    return isString( s )
      ? s.replace( /[a-z]/g, function( ch ) {
          // Convert character to uppercase using bitwise AND NOT 32
          return fromCharCode( ch.charCodeAt( 0 ) & ~32 );
        } )
      : s; // Not a string, return original value
  };


  // String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
  // locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
  // with correct but slower alternatives.
  if ( 'i' !== 'I'.toLowerCase() ) {
    lowercase = manualLowercase; // Override with manual implementation
    uppercase = manualUppercase; // Override with manual implementation
  }

  // Utility function to get a character from its Unicode code.
  function fromCharCode( code ) {
    return String.fromCharCode( code );
  }


  var Error_ref           = window.Error; // Store a reference to the global Error object.
  /**
   * @private
   * @description Holds major version number for IE or NaN for real browsers.
   */
  var msie                = int( ( /msie (\d+)/.exec( lowercase( navigator.userAgent ) ) || [] )[ 1 ] );
  var jqLite;             // This will be bound later if jQuery is not loaded, or if it is.
  var jQuery;             // This will hold a reference to jQuery if available.
  var slice               = [].slice; // Optimized slice method for arrays.
  var push                = [].push;  // Optimized push method for arrays.
  var toString            = Object.prototype.toString; // Cached toString for type checking.

  /**
   * @name angular
   * @description The main angular object.
   */
  var angular             = window.angular || ( window.angular = {} ); // Initialize angular global object.
  var angularModule;      // Placeholder for angular.module.
  /**
   * @name angular.module.ng
   * @description Placeholder for the ng module.
   */
  var nodeName_;          // Function to get node name, potentially adjusted for IE.
  var uid                 = [ '0', '0', '0' ]; // Used for generating unique IDs.

  /**
   * @ngdoc function
   * @name angular.forEach
   * @function
   *
   * @description
   * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
   * object or an array. The `iterator` function is invoked with `iterator(value, key)`, where `value`
   * is the value of an object property or an array element and `key` is the object property key or
   * array element index. Specifying a `context` for the function is optional.
   *
   * Note: this function was previously known as `angular.foreach`.
   *
     <pre>
       var values = {name: 'misko', gender: 'male'};
       var log = [];
       angular.forEach(values, function(value, key){
         this.push(key + ': ' + value);
       }, log);
       expect(log).toEqual(['name: misko', 'gender:male']);
     </pre>
   *
   * @param {Object|Array} obj Object to iterate over.
   * @param {Function} iterator Iterator function.
   * @param {Object=} context Object to become context (`this`) for the iterator function.
   * @returns {Object|Array} Reference to `obj`.
   */
  function forEach( obj, iterator, context ) {
    var key; // Declare key variable for loops.

    if ( obj ) { // Ensure obj is not null or undefined.
      if ( isFunction( obj ) ) {
        // Iterate over properties of a function (e.g., static properties).
        for ( key in obj ) {
          // Exclude prototype, length, and name, and only own properties.
          if ( key != 'prototype' && key != 'length' && key != 'name' && obj.hasOwnProperty( key ) ) {
            iterator.call( context, obj[ key ], key );
          }
        }
      } else if ( obj.forEach && obj.forEach !== forEach ) {
        // If obj has its own forEach method (e.g., Array.prototype.forEach), use it.
        obj.forEach( iterator, context );
      } else if ( isObject( obj ) && isNumber( obj.length ) ) {
        // Handle array-like objects (e.g., NodeList, arguments).
        for ( key = 0; key < obj.length; key++ ) {
          iterator.call( context, obj[ key ], key );
        }
      } else {
        // Handle plain objects.
        for ( key in obj ) {
          // Only iterate over own properties.
          if ( obj.hasOwnProperty( key ) ) {
            iterator.call( context, obj[ key ], key );
          }
        }
      }
    }
    return obj; // Return the original object for chaining.
  }

  // Returns an array of sorted keys for an object.
  function sortedKeys( obj ) {
    var keys = [];
    for ( var key in obj ) {
      if ( obj.hasOwnProperty( key ) ) {
        keys.push( key );
      }
    }
    return keys.sort(); // Sort the keys alphabetically.
  }

  // Iterates over an object's properties in a sorted order of keys.
  function forEachSorted( obj, iterator, context ) {
    var keys = sortedKeys( obj ); // Get sorted keys.
    for ( var i = 0; i < keys.length; i++ ) {
      // Call iterator with value and key.
      iterator.call( context, obj[ keys[ i ] ], keys[ i ] );
    }
    return keys; // Return the sorted keys.
  }


  /**
   * @private
   * @description
   * When using forEach the params are value, key, but it is often useful to have key, value.
   * This function reverses the order of arguments for the iterator.
   *
   * @param {function(string, *)} iteratorFn The original iterator function.
   * @returns {function(*, string)} A new function with reversed parameters.
   */
  function reverseParams( iteratorFn ) {
    return function( value, key ) {
      iteratorFn( key, value );
    };
  }

  /**
   * @ngdoc function
   * @name angular.nextUid
   * @function
   *
   * @description
   * A consistent way of creating unique IDs in angular. The ID is a sequence of alpha numeric
   * characters such as '012ABC'. The reason why we are not using simply a number counter is that
   * the number string gets longer over time, and it can also overflow, where as the the nextId
   * will grow much slower, it is a string, and it will never overflow.
   *
   * @returns {string} An unique alpha-numeric string.
   */
  function nextUid() {
    var index = uid.length; // Start from the end of the UID array.
    var digit;              // Variable to hold the current digit.

    while ( index ) { // Loop backwards through the UID.
      index--;
      digit = uid[ index ].charCodeAt( 0 ); // Get ASCII code of the character.

      if ( digit == 57 /*'9'*/ ) {
        uid[ index ] = 'A'; // If '9', reset to 'A'.
        return uid.join( '' ); // Return the new UID.
      }
      if ( digit == 90  /*'Z'*/ ) {
        uid[ index ] = '0'; // If 'Z', reset to '0'.
      } else {
        uid[ index ] = String.fromCharCode( digit + 1 ); // Increment character.
        return uid.join( '' ); // Return the new UID.
      }
    }
    uid.unshift( '0' ); // If all digits were incremented (e.g., 'ZZZ' becomes '0000'), prepend '0'.
    return uid.join( '' );
  }

  /**
   * @ngdoc function
   * @name angular.extend
   * @function
   *
   * @description
   * Extends the destination object `dst` by copying all of the properties from the `src` object(s)
   * to `dst`. You can specify multiple `src` objects.
   *
   * @param {Object} dst Destination object.
   * @param {...Object} src Source object(s).
   * @returns {Object} The extended destination object `dst`.
   */
  function extend( dst ) {
    forEach( arguments, function( obj ) {
      if ( obj !== dst ) { // Don't copy from destination to itself.
        forEach( obj, function( value, key ) {
          dst[ key ] = value; // Copy each property.
        } );
      }
    } );
    return dst; // Return the modified destination object.
  }

  // Simple integer parsing function.
  function int( str ) {
    return parseInt( str, 10 ); // Parse as base 10 integer.
  }


  // Creates a new object that inherits from `parent` and extends it with `extra` properties.
  function inherit( parent, extra ) {
    // Create a temporary constructor, set its prototype to `parent`.
    // Then create an instance of that, and extend it with `extra`.
    return extend( new ( extend( function() {}, { prototype: parent } ) )(), extra );
  }


  /**
   * @ngdoc function
   * @name angular.noop
   * @function
   *
   * @description
   * A function that performs no operations. This function can be useful when writing code in the
   * functional style or as a default callback.
   *
     <pre>
       function foo(callback) {
         var result = calculateResult();
         (callback || angular.noop)(result); // If callback is not provided, use noop.
       }
     </pre>
   */
  function noop() {
    // This function intentionally does nothing.
  }
  noop.$inject = []; // Declare no dependencies.


  /**
   * @ngdoc function
   * @name angular.identity
   * @function
   *
   * @description
   * A function that returns its first argument. This function is useful when writing code in the
   * functional style, often used as a default transformation or selector.
   *
     <pre>
       function transformer(transformationFn, value) {
         return (transformationFn || identity)(value); // If no transformation, return value as is.
       };
     </pre>
   * @param {*} $ The value to be returned.
   * @returns {*} The input value.
   */
  function identity( $ ) {
    return $; // Simply returns the argument passed to it.
  }
  identity.$inject = []; // Declare no dependencies.


  // Returns a function that always returns the given value.
  function valueFn( value ) {
    return function() {
      return value;
    };
  }

  /**
   * @ngdoc function
   * @name angular.isUndefined
   * @function
   *
   * @description
   * Determines if a reference is undefined.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is undefined.
   */
  function isUndefined( value ) {
    return typeof value == 'undefined'; // Check type directly.
  }


  /**
   * @ngdoc function
   * @name angular.isDefined
   * @function
   *
   * @description
   * Determines if a reference is defined.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is defined.
   */
  function isDefined( value ) {
    return typeof value != 'undefined'; // Check type directly.
  }


  /**
   * @ngdoc function
   * @name angular.isObject
   * @function
   *
   * @description
   * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
   * considered to be objects by this function.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is an `Object` but not `null`.
   */
  function isObject( value ) {
    return value != null && typeof value == 'object'; // Check for non-null object type.
  }


  /**
   * @ngdoc function
   * @name angular.isString
   * @function
   *
   * @description
   * Determines if a reference is a `String`.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is a `String`.
   */
  function isString( value ) {
    return typeof value == 'string'; // Check type directly.
  }


  /**
   * @ngdoc function
   * @name angular.isNumber
   * @function
   *
   * @description
   * Determines if a reference is a `Number`.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is a `Number`.
   */
  function isNumber( value ) {
    return typeof value == 'number'; // Check type directly.
  }


  /**
   * @ngdoc function
   * @name angular.isDate
   * @function
   *
   * @description
   * Determines if a value is a date object.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is an instance of `Date`.
   */
  function isDate( value ) {
    return toString.apply( value ) == '[object Date]'; // Use Object.prototype.toString for reliable check.
  }


  /**
   * @ngdoc function
   * @name angular.isArray
   * @function
   *
   * @description
   * Determines if a reference is an `Array`.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is an `Array`.
   */
  function isArray( value ) {
    return toString.apply( value ) == '[object Array]'; // Use Object.prototype.toString for reliable check.
  }


  /**
   * @ngdoc function
   * @name angular.isFunction
   * @function
   *
   * @description
   * Determines if a reference is a `Function`.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is a `Function`.
   */
  function isFunction( value ) {
    return typeof value == 'function'; // Check type directly.
  }


  /**
   * @private
   * @description
   * Checks if `obj` is a window object.
   *
   * @param {*} obj Object to check.
   * @returns {boolean} True if `obj` is a window object.
   */
  function isWindow( obj ) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval; // Duck typing for window object.
  }


  // Checks if an object is an AngularJS scope.
  function isScope( obj ) {
    return obj && obj.$evalAsync && obj.$watch; // Duck typing for scope object.
  }


  // Checks if an object is a File object.
  function isFile( obj ) {
    return toString.apply( obj ) === '[object File]'; // Use Object.prototype.toString.
  }


  // Checks if a value is a boolean.
  function isBoolean( value ) {
    return typeof value == 'boolean'; // Check type directly.
  }


  // Trims leading and trailing whitespace from a string.
  function trim( value ) {
    // Only trim if it's a string, otherwise return as is.
    return isString( value )
      ? value.replace( /^\s*/, '' ).replace( /\s*$/, '' ) // Regex for leading/trailing whitespace.
      : value;
  }

  /**
   * @ngdoc function
   * @name angular.isElement
   * @function
   *
   * @description
   * Determines if a reference is a DOM element (or wrapped jQuery element).
   *
   * @param {*} node Reference to check.
   * @returns {boolean} True if `node` is a DOM element (or wrapped jQuery element).
   */
  function isElement( node ) {
    return node &&
      ( node.nodeName  // It's a direct DOM element if it has nodeName.
      || ( node.bind && node.find ) ); // It's a jQuery-like wrapped element if it has bind and find methods.
  }

  /**
   * @private
   * @description
   * Creates a map object from a comma-separated string of keys.
   *
   * @param {string} str A comma-separated string, e.g., 'key1,key2,...'.
   * @returns {object} An object in the form of `{key1:true, key2:true, ...}`.
   */
  function makeMap( str ) {
    var obj = {};         // Initialize empty object.
    var items = str.split( "," ); // Split string by comma.
    var i;                // Loop counter.

    for ( i = 0; i < items.length; i++ ) {
      obj[ items[ i ] ] = true; // Set each item as a key with value true.
    }
    return obj; // Return the created map.
  }


  // Determine the correct way to get a node's name, accounting for IE's scopeName.
  if ( msie < 9 ) {
    nodeName_ = function( element ) {
      element = element.nodeName ? element : element[ 0 ]; // Ensure it's a DOM element.
      // For IE, handle scopeName for elements like <svg:rect>.
      return ( element.scopeName && element.scopeName != 'HTML' )
        ? uppercase( element.scopeName + ':' + element.nodeName )
        : element.nodeName;
    };
  } else {
    nodeName_ = function( element ) {
      // For modern browsers, simply return nodeName.
      return element.nodeName ? element.nodeName : element[ 0 ].nodeName;
    };
  }


  // Maps an object or array to a new array by applying an iterator function.
  function map( obj, iterator, context ) {
    var results = []; // Initialize an empty array for results.
    forEach( obj, function( value, index, list ) {
      // Push the result of the iterator call to the results array.
      results.push( iterator.call( context, value, index, list ) );
    } );
    return results; // Return the new array.
  }


  /**
   * @ngdoc function
   * @name angular.size
   * @function
   *
   * @description
   * Determines the number of elements in an array, the number of properties an object has, or
   * the length of a string.
   *
   * Note: This function is used to augment the Object type in Angular expressions. See
   * {@link angular.Object} for more information about Angular arrays.
   *
   * @param {Object|Array|string} obj Object, array, or string to inspect.
   * @param {boolean} [ownPropsOnly=false] Count only "own" properties in an object.
   * @returns {number} The size of `obj` or `0` if `obj` is neither an object nor an array.
   */
  function size( obj, ownPropsOnly ) {
    var size = 0; // Initialize size counter.
    var key;      // Loop variable for object keys.

    if ( isArray( obj ) || isString( obj ) ) {
      return obj.length; // For arrays and strings, return length.
    } else if ( isObject( obj ) ) {
      // For objects, iterate through properties.
      for ( key in obj ) {
        // Count if not ownPropsOnly, or if it's an own property.
        if ( !ownPropsOnly || obj.hasOwnProperty( key ) ) {
          size++;
        }
      }
    }
    // Return 0 if not an array, string, or object, or the calculated size.
    return size;
  }


  // Checks if an array includes a specific object.
  function includes( array, obj ) {
    return indexOf( array, obj ) != -1; // Uses indexOf internally.
  }

  // Finds the index of an object in an array.
  function indexOf( array, obj ) {
    if ( array.indexOf ) {
      return array.indexOf( obj ); // Use native indexOf if available.
    }

    // Manual search if native indexOf is not present.
    for ( var i = 0; i < array.length; i++ ) {
      if ( obj === array[ i ] ) {
        return i; // Found at index i.
      }
    }
    return -1; // Not found.
  }

  // Removes a specific value from an array.
  function arrayRemove( array, value ) {
    var index = indexOf( array, value ); // Find the index of the value.
    if ( index >= 0 ) {
      array.splice( index, 1 ); // Remove one element at that index.
    }
    return value; // Return the removed value.
  }

} )( window, document, undefined ); // Immediately Invoked Function Expression (IIFE) closure.