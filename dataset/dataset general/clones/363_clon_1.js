/*
 * -----------------------------------------------------------------------------
 * MooTools: The JavaScript Framework - Core Library
 *
 * This file contains the foundational components of the MooTools library.
 *
 * Web Build Reference:
 *   - http://mootools.net/core/7c56cfef9dddcf170a5d68e3fb61cfd7
 *
 * Packager Build Details:
 *   - packager build Core/Core Core/Array Core/String Core/Number Core/Function
 *     Core/Object Core/Event Core/Browser Core/Class Core/Class.Extras
 *     Core/Slick.Parser Core/Slick.Finder Core/Element Core/Element.Style
 *     Core/Element.Event Core/Element.Dimensions Core/Fx Core/Fx.CSS Core/Fx.Tween
 *     Core/Fx.Morph Core/Fx.Transitions Core/Request Core/Request.HTML
 *     Core/Request.JSON Core/Cookie Core/JSON Core/DOMReady Core/Swiff
 *
 * Project Name: Core
 * Description: The fundamental building blocks and heart of MooTools.
 * License: MIT-style license.
 * Copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).
 * Authors: The MooTools production team (http://mootools.net/developers/)
 *
 * Inspiration & Acknowledgments:
 *   - Class implementation influenced by [Base.js]
 *     (http://dean.edwards.name/weblog/2006/03/base/)
 *     Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License]
 *     (http://opensource.org/licenses/lgpl-license.php)
 *   - Certain functionalities inspired by [Prototype.js]
 *     (http://prototypejs.org)
 *     Copyright (c) 2005-2007 Sam Stephenson, [MIT License]
 *     (http://opensource.org/licenses/mit-license.php)
 *
 * Provides:
 *   - Core, MooTools, Type, typeOf, instanceOf, Native
 *
 * -----------------------------------------------------------------------------
 */

( function() {

  // Global MooTools object and version information
  this.MooTools = {
    version: '1.3.1',
    build: 'af48c8d589f43f32212f9bb8ff68a127e6a3ba6c'
  };

  // --- Type Checking Utilities: typeOf and instanceOf ---

  // Determines the type of an item.
  var typeOf = this.typeOf = function( item ) {
    // Handle null and undefined values
    if ( item == null ) return 'null';

    // Check for MooTools' internal family property
    if ( item.$family ) return item.$family();

    // Check for DOM nodes
    if ( item.nodeName ) {
      if ( item.nodeType == 1 ) return 'element'; // Element node
      if ( item.nodeType == 3 ) return ( /\S/ ).test( item.nodeValue ) ? 'textnode' : 'whitespace'; // Text or whitespace node
    }
    // Check for array-like objects
    else if ( typeof item.length == 'number' ) {
      if ( item.callee ) return 'arguments'; // Arguments object
      if ( 'item' in item ) return 'collection'; // HTMLCollection or NodeList
    }

    // Default JavaScript type
    return typeof item;
  };


  // Checks if an item is an instance of a given object/class,
  // including MooTools' custom class hierarchy.
  var instanceOf = this.instanceOf = function( item, object ) {
    // Null or undefined items are never instances
    if ( item == null ) return false;

    // Get the constructor of the item
    var constructor = item.$constructor || item.constructor;

    // Traverse the prototype chain via MooTools' 'parent' property
    while ( constructor ) {
      if ( constructor === object ) return true;
      constructor = constructor.parent;
    }

    // Fallback to native instanceof operator
    return item instanceof object;
  };


  // --- Function Overloading Helpers ---

  var Function = this.Function; // Reference to the native Function object

  // Detects if 'toString' and other native Object properties are enumerable
  var enumerables = true;
  for ( var i in { toString: 1 } ) enumerables = null; // If 'toString' is found, enumerables are not the default set
  if ( enumerables ) {
    enumerables = [
      'hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable',
      'toLocaleString', 'toString', 'constructor'
    ];
  }


  // Extends Function.prototype to enable setter overloading.
  // Useful for methods that can accept either a key-value pair or an object.
  Function.prototype.overloadSetter = function( usePlural ) {
    var self = this; // Capture the original function
    return function( a, b ) {
      if ( a == null ) return this; // If 'a' is null, return the context

      // If usePlural is true, or 'a' is not a string (implies an object)
      if ( usePlural || typeof a != 'string' ) {
        // Iterate over properties of 'a'
        for ( var k in a ) self.call( this, k, a[ k ] );
        // Handle non-enumerable properties if necessary
        if ( enumerables ) {
          for ( var i = enumerables.length; i--; ) {
            k = enumerables[ i ];
            if ( a.hasOwnProperty( k ) ) self.call( this, k, a[ k ] );
          }
        }
      }
      // Otherwise, assume 'a' is a key and 'b' is a value
      else {
        self.call( this, a, b );
      }
      return this; // Return the context for chaining
    };
  };


  // Extends Function.prototype to enable getter overloading.
  // Useful for methods that can retrieve a single value or multiple values.
  Function.prototype.overloadGetter = function( usePlural ) {
    var self = this; // Capture the original function
    return function( a ) {
      var args, result;

      // If usePlural is true, or 'a' is not a string (implies an array of keys)
      if ( usePlural || typeof a != 'string' ) args = a;
      // If multiple arguments are passed, treat them as keys
      else if ( arguments.length > 1 ) args = arguments;

      if ( args ) {
        result = {}; // Initialize result as an object
        // Call the original function for each argument/key
        for ( var i = 0; i < args.length; i++ ) result[ args[ i ] ] = self.call( this, args[ i ] );
      }
      // Otherwise, call the original function with 'a' as a single key
      else {
        result = self.call( this, a );
      }
      return result; // Return the result(s)
    };
  };


  // Adds an 'extend' method to functions, allowing them to add static properties.
  Function.prototype.extend = function( key, value ) {
    this[ key ] = value;
  }.overloadSetter(); // Use overloadSetter for flexibility


  // Adds an 'implement' method to functions, allowing them to add prototype properties.
  Function.prototype.implement = function( key, value ) {
    this.prototype[ key ] = value;
  }.overloadSetter(); // Use overloadSetter for flexibility


  // --- Type Conversion Utilities (From) ---

  var slice = Array.prototype.slice; // Cache Array.prototype.slice for performance


  // Converts an item into a function. If it's already a function, returns it.
  // Otherwise, returns a function that always returns the item.
  Function.from = function( item ) {
    return ( typeOf( item ) == 'function' ) ? item : function() {
      return item;
    };
  };


  // Converts an item into an array.
  Array.from = function( item ) {
    if ( item == null ) return []; // Null or undefined items become empty arrays

    // If it's enumerable and not a string, and not already an array, convert it
    return ( Type.isEnumerable( item ) && typeof item != 'string' ) ? ( typeOf( item ) == 'array' ) ? item : slice.call( item ) : [ item ];
  };


  // Converts an item into a number. Returns null if conversion fails.
  Number.from = function( item ) {
    var number = parseFloat( item );
    return isFinite( number ) ? number : null;
  };


  // Converts an item into a string.
  String.from = function( item ) {
    return item + ''; // Simple string concatenation for type conversion
  };


  // --- Hiding and Protecting Methods ---

  Function.implement( {

    // Marks a function as hidden, preventing it from being copied or overwritten easily.
    hide: function() {
      this.$hidden = true;
      return this;
    },

    // Marks a function as protected, preventing it from being overwritten by subsequent implementations.
    protect: function() {
      this.$protected = true;
      return this;
    }

  } );


  // --- Type System ---

  // The Type constructor. Creates a new MooTools Type.
  var Type = this.Type = function( name, object ) {
    if ( name ) {
      var lower = name.toLowerCase(); // Lowercase name for internal typeOf check

      // Creates a type-checking function, e.g., Type.isString
      var typeCheck = function( item ) {
        return ( typeOf( item ) == lower );
      };

      Type[ 'is' + name ] = typeCheck; // Assign the type checker

      // If an object is provided, link it to the new Type
      if ( object != null ) {
        object.prototype.$family = ( function() {
          return lower;
        } ).hide(); // Assign internal family name, hidden from enumeration

        // <1.2compat> Backward compatibility for old type property
        object.type = typeCheck;
        // </1.2compat>
      }
    }

    if ( object == null ) return null; // If no object, return null

    object.extend( this ); // Extend the object with Type's static methods
    object.$constructor = Type; // Set the internal constructor reference
    object.prototype.$constructor = object; // Set the prototype's constructor reference

    return object; // Return the enhanced object
  };

  var toString = Object.prototype.toString; // Cache Object.prototype.toString


  // Checks if an item is enumerable (array-like, but not a function).
  Type.isEnumerable = function( item ) {
    return ( item != null && typeof item.length == 'number' && toString.call( item ) != '[object Function]' );
  };


  var hooks = {}; // Stores hooks for mirroring methods


  // Retrieves or creates the array of hooks for a given object's type.
  var hooksOf = function( object ) {
    var type = typeOf( object.prototype );
    return hooks[ type ] || ( hooks[ type ] = [] );
  };


  // Implements a method onto a Type's prototype. Handles protection and mirroring.
  var implement = function( name, method ) {
    if ( method && method.$hidden ) return; // Do not implement hidden methods

    var hooks = hooksOf( this ); // Get hooks for this Type

    // Execute hooks for this implementation
    for ( var i = 0; i < hooks.length; i++ ) {
      var hook = hooks[ i ];
      if ( typeOf( hook ) == 'type' ) implement.call( hook, name, method ); // If hook is a Type, implement on it
      else hook.call( this, name, method ); // Otherwise, call the hook function
    }

    // Store the previous method if it exists and is not protected
    var previous = this.prototype[ name ];
    if ( previous == null || !previous.$protected ) this.prototype[ name ] = method;

    // If there's no static method with this name, create one that calls the prototype method
    if ( this[ name ] == null && typeOf( method ) == 'function' ) extend.call( this, name, function( item ) {
      return method.apply( item, slice.call( arguments, 1 ) );
    } );
  };


  // Extends a Type with a static method. Handles protection.
  var extend = function( name, method ) {
    if ( method && method.$hidden ) return; // Do not extend with hidden methods
    var previous = this[ name ];
    if ( previous == null || !previous.$protected ) this[ name ] = method; // Only extend if not protected
  };


  // Implement `implement`, `extend`, `alias`, and `mirror` methods on the Type prototype.
  Type.implement( {

    // Allows a Type to add methods to its prototype.
    implement: implement.overloadSetter(),

    // Allows a Type to add static methods.
    extend: extend.overloadSetter(),

    // Creates an alias for an existing prototype method.
    alias: function( name, existing ) {
      implement.call( this, name, this.prototype[ existing ] );
    }.overloadSetter(),

    // Adds a hook to this Type, which will be executed when new methods are implemented.
    mirror: function( hook ) {
      hooksOf( this ).push( hook );
      return this;
    }

  } );

  // Initialize the 'Type' Type itself
  new Type( 'Type', Type );


  // --- Default Native Types Integration ---

  // Helper function to force-integrate native types with MooTools' Type system.
  var force = function( name, object, methods ) {
    var isType = ( object != Object ), // Check if it's a specific Type (not generic Object)
      prototype = object.prototype;

    if ( isType ) object = new Type( name, object ); // Create a new Type if it's not Object

    // Iterate over provided methods
    for ( var i = 0, l = methods.length; i < l; i++ ) {
      var key = methods[ i ],
        generic = object[ key ], // Static method
        proto = prototype[ key ]; // Prototype method

      if ( generic ) generic.protect(); // Protect static method

      if ( isType && proto ) {
        delete prototype[ key ]; // Remove original prototype method
        prototype[ key ] = proto.protect(); // Re-add and protect it
      }
    }

    if ( isType ) object.implement( prototype ); // Implement protected prototype methods

    return force; // Allow chaining
  };


  // Apply force integration to common native JavaScript types.
  force( 'String', String, [
    'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search',
    'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase'
  ] )( 'Array', Array, [
    'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
    'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
  ] )( 'Number', Number, [
    'toExponential', 'toFixed', 'toLocaleString', 'toPrecision'
  ] )( 'Function', Function, [
    'apply', 'call', 'bind'
  ] )( 'RegExp', RegExp, [
    'exec', 'test'
  ] )( 'Object', Object, [
    'create', 'defineProperty', 'defineProperties', 'keys',
    'getPrototypeOf', 'getOwnPropertyDescriptor', 'getOwnPropertyNames',
    'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen'
  ] )( 'Date', Date, [ 'now' ] );


  // Allow `Object.extend` to add static methods to Object.
  Object.extend = extend.overloadSetter();


  // Add a static 'now' method to Date for getting current timestamp.
  Date.extend( 'now', function() {
    return +( new Date );
  } );


  // Create a Type for Boolean.
  new Type( 'Boolean', Boolean );


  // --- Fixes and Enhancements for Native Types ---

  // Fixes `typeOf(NaN)` to return 'null' instead of 'number'.
  Number.prototype.$family = function() {
    return isFinite( this ) ? 'number' : 'null';
  }.hide();


  // Adds a static 'random' method to Number for generating random integers.
  Number.extend( 'random', function( min, max ) {
    return Math.floor( Math.random() * ( max - min + 1 ) + min );
  } );


  // --- Iteration Utilities: forEach, each ---

  var hasOwnProperty = Object.prototype.hasOwnProperty; // Cache hasOwnProperty for object iteration


  // Adds a static 'forEach' method to Object for iterating over object properties.
  Object.extend( 'forEach', function( object, fn, bind ) {
    for ( var key in object ) {
      if ( hasOwnProperty.call( object, key ) ) fn.call( bind, object[ key ], key, object );
    }
  } );


  // Alias 'forEach' as 'each' for Object.
  Object.each = Object.forEach;


  // Implements 'forEach' and 'each' methods for Array prototype.
  Array.implement( {

    // Iterates over array elements, skipping sparse elements.
    forEach: function( fn, bind ) {
      for ( var i = 0, l = this.length; i < l; i++ ) {
        if ( i in this ) fn.call( bind, this[ i ], i, this );
      }
    },

    // Iterates over array elements using Object.forEach (for consistency), returns the array.
    each: function( fn, bind ) {
      Array.forEach( this, fn, bind );
      return this;
    }

  } );


  // --- Array & Object Cloning, Object Merging and Appending ---

  // Recursively clones an item based on its type.
  var cloneOf = function( item ) {
    switch ( typeOf( item ) ) {
      case 'array':
        return item.clone();
      case 'object':
        return Object.clone( item );
      default:
        return item; // Primitives are returned as-is
    }
  };


  // Implements a 'clone' method for Array prototype for deep cloning.
  Array.implement( 'clone', function() {
    var i = this.length,
      clone = new Array( i );
    while ( i-- ) clone[ i ] = cloneOf( this[ i ] ); // Recursively clone elements
    return clone;
  } );


  // Helper function for merging a single key-value pair into a source object.
  var mergeOne = function( source, key, current ) {
    switch ( typeOf( current ) ) {
      case 'object':
        // If source[key] is also an object, deep merge; otherwise, clone 'current'
        if ( typeOf( source[ key ] ) == 'object' ) Object.merge( source[ key ], current );
        else source[ key ] = Object.clone( current );
        break;
      case 'array':
        source[ key ] = current.clone(); // Clone arrays
        break;
      default:
        source[ key ] = current; // Assign primitives directly
    }
    return source;
  };


  // Adds static methods for object manipulation: merge, clone, append.
  Object.extend( {

    // Deeply merges multiple objects into a source object.
    merge: function( source, k, v ) {
      // If k is a string, assume it's a single key-value merge
      if ( typeOf( k ) == 'string' ) return mergeOne( source, k, v );

      // Iterate over subsequent arguments (objects to merge)
      for ( var i = 1, l = arguments.length; i < l; i++ ) {
        var object = arguments[ i ];
        for ( var key in object ) mergeOne( source, key, object[ key ] ); // Merge each property
      }
      return source;
    },

    // Deeply clones an object.
    clone: function( object ) {
      var clone = {};
      for ( var key in object ) clone[ key ] = cloneOf( object[ key ] ); // Recursively clone properties
      return clone;
    },

    // Appends properties from extended objects to the original object (shallow merge).
    append: function( original ) {
      for ( var i = 1, l = arguments.length; i < l; i++ ) {
        var extended = arguments[ i ] || {}; // Ensure extended is an object
        for ( var key in extended ) original[ key ] = extended[ key ];
      }
      return original;
    }

  } );


  // --- Object-less Types (for typeOf only) ---

  // Create Types for concepts that don't have corresponding JavaScript objects.
  [ 'Object', 'WhiteSpace', 'TextNode', 'Collection', 'Arguments' ].each( function( name ) {
    new Type( name );
  } );


  // --- Unique ID Generation ---

  var UID = Date.now(); // Initialize Unique ID counter with current timestamp


  // Adds a static 'uniqueID' method to String for generating unique IDs.
  String.extend( 'uniqueID', function() {
    return ( UID++ ).toString( 36 ); // Increment and convert to base 36
  } );


  // --- <1.2compat> Backward Compatibility for MooTools 1.2 ---

  // Hash Class: A wrapper for plain JavaScript objects, providing utility methods.
  var Hash = this.Hash = new Type( 'Hash', function( object ) {
    if ( typeOf( object ) == 'hash' ) object = Object.clone( object.getClean() ); // Clone existing Hash
    for ( var key in object ) this[ key ] = object[ key ]; // Copy properties
    return this;
  } );

  // Implement methods for the Hash prototype.
  Hash.implement( {

    // Iterates over hash properties.
    forEach: function( fn, bind ) {
      Object.forEach( this, fn, bind );
    },

    // Returns a clean object containing only own enumerable properties.
    getClean: function() {
      var clean = {};
      for ( var key in this ) {
        if ( this.hasOwnProperty( key ) ) clean[ key ] = this[ key ];
      }
      return clean;
    },

    // Returns the number of own enumerable properties in the hash.
    getLength: function() {
      var length = 0;
      for ( var key in this ) {
        if ( this.hasOwnProperty( key ) ) length++;
      }
      return length;
    }

  } );

  // Alias 'forEach' as 'each' for Hash.
  Hash.alias( 'each', 'forEach' );


  // Backward compatibility: Object.type property.
  Object.type = Type.isObject;


  // Native Class: A utility to define and extend native types.
  var Native = this.Native = function( properties ) {
    return new Type( properties.name, properties.initialize );
  };

  // Backward compatibility: Native.type property.
  Native.type = Type.type;


  // Extends multiple native objects with a set of methods.
  Native.implement = function( objects, methods ) {
    for ( var i = 0; i < objects.length; i++ ) objects[ i ].implement( methods );
    return Native;
  };


  // Override Array.type for better instanceOf compatibility.
  var arrayType = Array.type;
  Array.type = function( item ) {
    return instanceOf( item, Array ) || arrayType( item );
  };


  // Global shorthand for Array.from().slice().
  this.$A = function( item ) {
    return Array.from( item ).slice();
  };


  // Global shorthand for creating a function that returns its i-th argument.
  this.$arguments = function( i ) {
    return function() {
      return arguments[ i ];
    };
  };


  // Global shorthand for checking if an object is truthy or exactly 0.
  this.$chk = function( obj ) {
    return !!( obj || obj === 0 );
  };


  // Global shorthand for clearing both timeouts and intervals.
  this.$clear = function( timer ) {
    clearTimeout( timer );
    clearInterval( timer );
    return null;
  };


  // Global shorthand for checking if an object is not null or undefined.
  this.$defined = function( obj ) {
    return ( obj != null );
  };


  // Global shorthand for iterating over arrays, collections, or objects.
  this.$each = function( iterable, fn, bind ) {
    var type = typeOf( iterable );
    ( ( type == 'arguments' || type == 'collection' || type == 'array' || type == 'elements' ) ? Array : Object ).each( iterable, fn, bind );
  };


  // Global shorthand for an empty function.
  this.$empty = function() {};


  // Global shorthand for Object.append (shallow merge).
  this.$extend = function( original, extended ) {
    return Object.append( original, extended );
  };


  // Global shorthand for creating a new Hash instance.
  this.$H = function( object ) {
    return new Hash( object );
  };


  // Global shorthand for Object.merge (deep merge).
  this.$merge = function() {
    var args = Array.slice( arguments );
    args.unshift( {} ); // Prepend an empty object to merge into
    return Object.merge.apply( null, args );
  };


  // Global shorthand for Function.from.
  this.$lambda = Function.from;


  // Global shorthand for Object.merge (alias).
  this.$mixin = Object.merge;


  // Global shorthand for Number.random.
  this.$random = Number.random;

}() );