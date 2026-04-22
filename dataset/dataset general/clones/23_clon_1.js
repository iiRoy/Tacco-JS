/**
 *   LocalDB.js v1.0 - A Simple Client-Side Database Library
 *   (c) 2013 Gilberto Avalos Osuna - All Rights Reserved
 *   Contact: avalosagnostic@gmail.com for inquiries
 */


( function ( root ) {

  // Define the core LocalDB object. This will be the main entry point.
  var LDB = function ( obj ) {

    // If the object is already an instance of LDB, return it directly.
    if ( obj instanceof LDB ) return obj;

    // If 'this' is not an instance of LDB, create a new one to ensure proper instantiation.
    if ( ! ( this instanceof LDB ) ) return new LDB( obj );
  };


  // Handle module exports for CommonJS environments (Node.js, Browserify, etc.)
  if ( typeof exports !== 'undefined' ) {

    // Check for module.exports, which indicates a Node.js-like environment.
    if ( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = LDB; // Export LDB as the main module.
    }

    // Also attach LDB to the exports object for other CommonJS patterns.
    exports.LDB = LDB;

  }
  else {

    // For browser environments, attach LDB to the global root object (typically 'window').
    root.LDB = LDB;

  }


  // Initialize collections storage.
  var collections = localStorage.getItem( 'LocalDB' );


  // If no collections are found in localStorage, initialize an empty array.
  if ( ! collections ) {

    LDB.collections = [];

    // Store the empty collections array back to localStorage.
    localStorage.setItem( 'LocalDB', JSON.stringify( collections ) );

  }
  else {

    // If collections exist, parse them from JSON.
    LDB.collections = JSON.parse( collections );

  }


  // Set the version of the LocalDB library.
  LDB.version = '1.0';


  /* Utility Functions and Variables */
  var breaker = {}; // A unique object used to break out of each loops.


  // Cache array and object prototype methods for performance and minification.
  var ArrayProto = Array.prototype,
    ObjProto = Object.prototype,
    FuncProto = Function.prototype;


  var push = ArrayProto.push, // Standard array push method.
    slice = ArrayProto.slice, // Standard array slice method.
    concat = ArrayProto.concat, // Standard array concat method.
    toString = ObjProto.toString, // Standard object toString method.
    hasOwnProperty = ObjProto.hasOwnProperty; // Standard object hasOwnProperty method.


  // Reference native methods for optimized performance where available.
  var
    nativeForEach = ArrayProto.forEach, // Native forEach.
    nativeMap = ArrayProto.map, // Native map.
    nativeReduce = ArrayProto.reduce, // Native reduce.
    nativeReduceRight = ArrayProto.reduceRight, // Native reduceRight.
    nativeFilter = ArrayProto.filter, // Native filter.
    nativeEvery = ArrayProto.every, // Native every.
    nativeSome = ArrayProto.some, // Native some.
    nativeIndexOf = ArrayProto.indexOf, // Native indexOf.
    nativeLastIndexOf = ArrayProto.lastIndexOf, // Native lastIndexOf.
    nativeIsArray = Array.isArray, // Native isArray.
    nativeKeys = Object.keys, // Native Object.keys.
    nativeBind = FuncProto.bind; // Native Function.bind.


  /**
   * Iterates over a list of elements, yielding each in turn to an iterator function.
   * The iterator is bound to the context argument, if present.
   * Delegates to the native `forEach` method if available.
   * @param {Array|Object} obj The collection to iterate over.
   * @param {Function} iterator The function to call for each element.
   * @param {Object} [context] The context for the iterator function.
   */
  var each = LDB.each = LDB.forEach = function ( obj, iterator, context ) {

    // If the object is null or undefined, do nothing.
    if ( obj == null ) return;


    // Use native forEach if available and the object supports it.
    if ( nativeForEach && obj.forEach === nativeForEach ) {
      obj.forEach( iterator, context );
    }
    // Handle array-like objects.
    else if ( obj.length === + obj.length ) {

      for ( var i = 0, l = obj.length; i < l; i ++ ) {

        if ( iterator.call( context, obj[ i ], i, obj ) === breaker ) return;

      }

    }
    // Handle plain objects.
    else {

      for ( var key in obj ) {

        if ( LDB.has( obj, key ) ) {

          if ( iterator.call( context, obj[ key ], key, obj ) === breaker ) return;

        }

      }

    }

  };


  /**
   * Generates a random 4-character hexadecimal string.
   * Used as a building block for UUIDs.
   * @returns {string} A 4-character hex string.
   */
  LDB.s4 = function () {
    return Math.floor( ( 1 + Math.random() ) * 0x10000 )
      .toString( 16 )
      .substring( 1 );
  };


  /**
   * Generates a simple unique identifier (UUID).
   * Combines random hex strings with a timestamp.
   * @returns {string} A unique ID string.
   */
  LDB.uuid = function () {
    return LDB.s4() + LDB.s4() + new Date().getTime() + LDB.s4();
  };


  /**
   * Returns the index at which value can be found in the array, or -1 if not present.
   * @param {Array} array The array to search within.
   * @param {*} item The item to search for.
   * @param {boolean|number} [isSorted] If true, performs a binary search. If a number, starts search from that index.
   * @returns {number} The index of the item, or -1.
   */
  LDB.indexOf = function ( array, item, isSorted ) {

    if ( array == null ) return - 1;

    var i = 0,
      l = array.length;

    // Handle sorted array search or starting index.
    if ( isSorted ) {

      if ( typeof isSorted == 'number' ) {
        i = ( isSorted < 0 ? Math.max( 0, l + isSorted ) : isSorted );
      }
      else {
        i = LDB.sortedIndex( array, item );
        return array[ i ] === item ? i : - 1;
      }

    }

    // Use native indexOf if available.
    if ( nativeIndexOf && array.indexOf === nativeIndexOf ) return array.indexOf( item, isSorted );

    // Manual linear search.
    for ( ; i < l; i ++ )
      if ( array[ i ] === item ) return i;

    return - 1;

  };


  /**
   * Returns the same value that is passed in. Useful as a default iterator.
   * @param {*} value Any value.
   * @returns {*} The input value.
   */
  LDB.identity = function ( value ) {
    return value;
  };


  /**
   * Determines the index at which a value should be inserted into a sorted array
   * in order to maintain the array's sorted order.
   * @param {Array} array The sorted array.
   * @param {*} obj The object to insert.
   * @param {Function} [iterator] An optional function to compute the value for comparison.
   * @param {Object} [context] The context for the iterator function.
   * @returns {number} The index where the object should be inserted.
   */
  LDB.sortedIndex = function ( array, obj, iterator, context ) {
    // If no iterator, use identity.
    iterator = iterator == null ? LDB.identity : lookupIterator( iterator );

    var value = iterator.call( context, obj );

    var low = 0,
      high = array.length;

    // Binary search to find the insertion point.
    while ( low < high ) {
      var mid = ( low + high ) >>> 1; // Faster integer division.
      iterator.call( context, array[ mid ] ) < value ? low = mid + 1 : high = mid;
    }

    return low;
  };


  // Helper function for iterators (not explicitly defined in original, but implied by lookupIterator).
  // Assuming 'lookupIterator' is a placeholder for a utility to normalize iterators.
  // Since it's not present, I'll assume it's just a direct use of the iterator or identity.
  // The original code implies iterator is directly used if provided, otherwise LDB.identity.
  // So, I'll keep the `lookupIterator` call as-is, assuming it's a missing helper or a copy-paste artifact.
  function lookupIterator( value ) {
    return LDB.isFunction( value ) ? value : LDB.property( value );
  }

  LDB.isFunction = function ( obj ) {
    return typeof obj === 'function';
  };

  LDB.property = function ( key ) {
    return function ( obj ) {
      return obj[ key ];
    };
  };


  /**
   * Returns true if any of the values in the list pass the iterator's test.
   * Short-circuits the iteration as soon as a true value is found.
   * Delegates to the native `some` method if available.
   * @param {Array|Object} obj The collection to check.
   * @param {Function} [iterator] The function to test each value. Defaults to LDB.identity.
   * @param {Object} [context] The context for the iterator function.
   * @returns {boolean} True if any value passes the test, false otherwise.
   */
  var any = LDB.some = LDB.any = function ( obj, iterator, context ) {
    iterator || ( iterator = LDB.identity ); // Default iterator.
    var result = false;

    if ( obj == null ) return result;

    // Use native some if available.
    if ( nativeSome && obj.some === nativeSome ) return obj.some( iterator, context );

    // Manual iteration.
    each( obj, function ( value, index, list ) {
      if ( result || ( result = iterator.call( context, value, index, list ) ) ) return breaker; // Short-circuit.
    } );

    return !! result; // Ensure boolean return.
  };


  /**
   * Looks through each value in the list, returning an array of all the values
   * that pass a truth test (iterator).
   * Delegates to the native `filter` method if available.
   * @param {Array|Object} obj The collection to filter.
   * @param {Function} iterator The function to test each value.
   * @param {Object} [context] The context for the iterator function.
   * @returns {Array} An array of values that passed the test.
   */
  LDB.filter = LDB.select = function ( obj, iterator, context ) {
    var results = [];

    if ( obj == null ) return results;

    // Use native filter if available.
    if ( nativeFilter && obj.filter === nativeFilter ) return obj.filter( iterator, context );

    // Manual iteration.
    each( obj, function ( value, index, list ) {
      if ( iterator.call( context, value, index, list ) ) results[ results.length ] = value;
    } );

    return results;
  };


  /**
   * Looks through the list and returns an array of all the values that contain all of the key-value pairs listed in attrs.
   * @param {Array|Object} obj The collection to search.
   * @param {Object} attrs The key-value pairs to match.
   * @param {boolean} [first] If true, returns only the first match.
   * @returns {Array|Object|null} An array of matching objects, or a single object if 'first' is true, or null.
   */
  LDB.where = function ( obj, attrs, first ) {

    if ( LDB.isEmpty( attrs ) ) return first ? null : [];

    // Use find or filter based on 'first' argument.
    return LDB[ first ? 'find' : 'filter' ]( obj, function ( value ) {

      for ( var key in attrs ) {

        if ( attrs[ key ] !== value[ key ] ) return false;

      }

      return true;

    } );

  };


  /**
   * Looks through the list and returns the first value that passes a truth test (iterator).
   * @param {Array|Object} obj The collection to search.
   * @param {Function} iterator The function to test each value.
   * @param {Object} [context] The context for the iterator function.
   * @returns {*} The first matching value, or undefined if none found.
   */
  LDB.find = LDB.detect = function ( obj, iterator, context ) {
    var result;

    // Use 'any' to short-circuit iteration.
    any( obj, function ( value, index, list ) {

      if ( iterator.call( context, value, index, list ) ) {
        result = value;
        return true; // Break out of 'any' loop.
      }

    } );

    return result;
  };


  /**
   * Returns true if the object has a property with the given key.
   * Uses native `hasOwnProperty` method.
   * @param {Object} obj The object to check.
   * @param {string} key The property key.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  LDB.has = function ( obj, key ) {
    return hasOwnProperty.call( obj, key );
  };


  /**
   * Copies all of the properties in the source objects over to the destination object.
   * It's a simple shallow copy.
   * @param {Object} obj The destination object.
   * @param {...Object} sources One or more source objects.
   * @returns {Object} The modified destination object.
   */
  LDB.extend = function ( obj ) {

    // Iterate over all source arguments, starting from the second one.
    each( slice.call( arguments, 1 ), function ( source ) {

      if ( source ) {

        for ( var prop in source ) {
          obj[ prop ] = source[ prop ];
        }

      }

    } );

    return obj;

  };


  /**
   * Produces a new array of values by mapping each value in list through a transformation function (iterator).
   * Delegates to the native `map` method if available.
   * @param {Array|Object} obj The collection to map.
   * @param {Function} iterator The function to transform each value.
   * @param {Object} [context] The context for the iterator function.
   * @returns {Array} A new array of transformed values.
   */
  LDB.map = LDB.collect = function ( obj, iterator, context ) {
    var results = [];

    if ( obj == null ) return results;

    // Use native map if available.
    if ( nativeMap && obj.map === nativeMap ) return obj.map( iterator, context );

    // Manual iteration.
    each( obj, function ( value, index, list ) {
      results[ results.length ] = iterator.call( context, value, index, list );
    } );

    return results;
  };


  /**
   * Returns the number of values in the list.
   * @param {Array|Object} obj The collection to measure.
   * @returns {number} The size of the collection.
   */
  LDB.size = function ( obj ) {
    if ( obj == null ) return 0;
    return ( obj.length === + obj.length ) ? obj.length : LDB.keys( obj ).length;
  };


  /**
   * Retrieve all the names of the object's own enumerable properties.
   * Delegates to the native `Object.keys` method if available.
   * @param {Object} obj The object to inspect.
   * @returns {Array} An array of property names.
   * @throws {TypeError} If the argument is not an object.
   */
  LDB.keys = nativeKeys || function ( obj ) {

    if ( obj !== Object( obj ) ) throw new TypeError( 'Invalid object' );

    var keys = [];

    for ( var key in obj )
      if ( LDB.has( obj, key ) ) keys[ keys.length ] = key;

    return keys;

  };


  /**
   * Returns the maximum value in list. If an iterator is provided,
   * it will be used to compute the value for comparison.
   * @param {Array|Object} obj The collection.
   * @param {Function} [iterator] The function to compute value for comparison.
   * @param {Object} [context] The context for the iterator function.
   * @returns {*} The maximum value found.
   */
  LDB.max = function ( obj, iterator, context ) {

    // Optimized path for arrays of numbers without an iterator.
    if ( ! iterator && LDB.isArray( obj ) && obj[ 0 ] === + obj[ 0 ] && obj.length < 65535 ) {
      return Math.max.apply( Math, obj );
    }

    // Handle empty collections.
    if ( ! iterator && LDB.isEmpty( obj ) ) return - Infinity;

    var result = {
      computed: - Infinity,
      value: - Infinity
    };

    // Iterate and compare.
    each( obj, function ( value, index, list ) {
      var computed = iterator ? iterator.call( context, value, index, list ) : value;
      computed >= result.computed && ( result = {
        value: value,
        computed: computed
      } );
    } );

    return result.value;

  };


  /**
   * Returns true if an object has no enumerable properties or is empty.
   * @param {Object|Array|string} obj The object to check.
   * @returns {boolean} True if the object is empty, false otherwise.
   */
  LDB.isEmpty = function ( obj ) {

    if ( obj == null ) return true;

    // Check for array or string length.
    if ( LDB.isArray( obj ) || LDB.isString( obj ) ) return obj.length === 0;

    // Check for enumerable properties in objects.
    for ( var key in obj )
      if ( LDB.has( obj, key ) ) return false;

    return true;

  };


  /**
   * Returns true if the object is an Array. Delegates to native `Array.isArray` if available.
   * @param {*} obj The object to check.
   * @returns {boolean} True if the object is an array, false otherwise.
   */
  LDB.isArray = nativeIsArray || function ( obj ) {
    return toString.call( obj ) == '[object Array]';
  };


  /**
   * Returns true if the object is a String.
   * @param {*} obj The object to check.
   * @returns {boolean} True if the object is a string, false otherwise.
   */
  LDB.isString = function ( obj ) {
    return toString.call( obj ) == '[object String]';
  };


  /* Database Management Functions */

  /**
   * Resets or clears the entire LocalDB.
   * Removes all collections and their associated data from localStorage.
   */
  LDB.reset = LDB.clear = function () {

    var localdb = localStorage.getItem( 'LocalDB' );

    if ( localdb ) {

      localdb = JSON.parse( localdb );

      // Iterate over each collection and remove its data.
      LDB.each( localdb, function ( collection ) {
        localStorage.removeItem( 'LocalDB_' + collection );
      } );

      // Reset the main 'LocalDB' entry.
      localStorage.setItem( 'LocalDB', '[]' );

    }

    // Clear the in-memory collections array.
    LDB.collections = [];

  };


  /**
   * Returns a list of all current collection names stored in LocalDB.
   * @returns {Array<string>} An array of collection names.
   */
  LDB.showCollections = function () {
    return LDB.collections;
  };


  /* Document (Item) Definition */

  /**
   * Represents a single document (item) within a collection.
   * @constructor
   * @param {string} collectionName The name of the collection this item belongs to.
   * @param {Object} fields The initial data fields for the item.
   */
  var Item = LDB.Item = function ( collectionName, fields ) {

    var self = this;

    self.__collection = collectionName; // Store the collection name.

    // Extend the item with provided fields.
    LDB.extend( self, fields );

  };


  /**
   * Saves the current item to its respective collection in localStorage.
   * If the item has an _id, it updates an existing item; otherwise, it creates a new one.
   * @param {...Function} [callbacks] Optional callback functions to execute after saving.
   */
  Item.prototype.save = function () {

    var self = this,
      items, db;


    // Retrieve the collection's items from localStorage.
    items = localStorage.getItem( 'LocalDB_' + self.__collection );


    if ( items ) {
      items = JSON.parse( items );
    }
    else {
      items = []; // Initialize if collection is new.
    }


    // If the item already has an _id, attempt to update it.
    if ( self._id ) {

      if ( items.length ) {

        // Find the item to update.
        var updateItem = LDB.find( items, function ( item ) {
          return item._id == self._id;
        } );


        if ( updateItem ) {

          // Update fields, excluding the internal __collection property.
          LDB.each( self, function ( thisItem, key ) {

            if ( key !== '__collection' ) {

              if ( self[ key ] !== undefined ) {
                updateItem[ key ] = self[ key ];
              }

            }

          } );

        }

      }

    }
    // If no _id, this is a new item, assign a UUID and add it.
    else {
      self._id = LDB.uuid(); // Generate a unique ID.
      items.push( self ); // Add the new item.
    }


    // Store the updated collection back to localStorage.
    localStorage.setItem( 'LocalDB_' + self.__collection, JSON.stringify( items ) );


    // Execute any provided callback functions.
    LDB.each( arguments, function ( arg ) {

      if ( typeof arg === 'function' ) {
        return arg();
      }

    } );

  };


  /**
   * Deletes the current item from its respective collection in localStorage.
   * @param {...Function} [callbacks] Optional callback functions to execute after deletion.
   */
  Item.prototype.delete = function () {

    var self = this;
    var items = localStorage.getItem( 'LocalDB_' + self.__collection );


    if ( items ) {

      items = JSON.parse( items );

      // Filter out the item to be deleted.
      var new_items = LDB.filter( items, function ( item ) {
        return item._id !== self._id;
      } );

      // Store the modified collection back.
      localStorage.setItem( 'LocalDB_' + self.__collection, JSON.stringify( new_items ) );

    }


    // Execute any provided callback functions.
    LDB.each( arguments, function ( arg ) {

      if ( typeof arg === 'function' ) {
        return arg();
      }

    } );

  };


  /* Collection Definition */

  /**
   * Represents a collection of documents in LocalDB.
   * Manages storage and retrieval for a specific collection name.
   * @constructor
   * @param {string} name The name of the collection.
   */
  var Collection = LDB.Collection = function ( name ) {

    var self = this,
      collection, db;

    self.name = name; // Store the collection's name.


    collection = localStorage.getItem( 'LocalDB_' + name );


    // Load existing items or initialize an empty collection.
    if ( collection ) {
      self.items = JSON.parse( collection );
    }
    else {
      self.items = [];
      localStorage.setItem( 'LocalDB_' + name, '[]' ); // Create an empty entry in localStorage.
    }

    // Ensure the collection name is registered in the global list of collections.
    var _exists = LDB.find( LDB.collections, function ( item ) {
      return item === name;
    } );

    if ( ! _exists ) {
      LDB.collections.push( name );
      localStorage.setItem( 'LocalDB', JSON.stringify( LDB.collections ) );
    }

  };


  /**
   * Retrieves items from the collection.
   * Can accept an object of attributes to filter by.
   * @param {Object} [query] Optional query object to filter results.
   * @param {Function} [callback] Optional callback function to receive results.
   */
  Collection.prototype.find = function () {

    var self = this,
      results = [];

    // Always refresh items from localStorage to ensure latest data.
    self.items = JSON.parse( localStorage.getItem( 'LocalDB_' + self.name ) );


    // If a query object is provided and the collection has items, filter them.
    if ( self.items.length && typeof arguments[ 0 ] === 'object' && LDB.size( arguments[ 0 ] ) ) {

      var items = LDB.where( self.items, arguments[ 0 ] );

      if ( items.length ) {

        // Map raw data to Item instances.
        results = LDB.map( items, function ( item ) {
          return new Item( self.name, item );
        } );

      }

    }
    // If no query or an empty query, return all items.
    else {

      results = LDB.map( self.items, function ( item ) {
        return new Item( self.name, item );
      } );

    }

    // Execute any provided callback with the results.
    LDB.each( arguments, function ( arg ) {

      if ( typeof arg === 'function' ) {
        return arg( results );
      }

    } );

  };


  /**
   * Saves new items to the collection.
   * Can accept a single item object or an array of item objects.
   * @param {Object|Array<Object>} [data] The item(s) to save. If not provided, saves existing `self.items`.
   * @param {Function} [callback] Optional callback function.
   */
  Collection.prototype.save = function () {

    var self = this,
      db;


    // If no data is provided, persist the current in-memory `self.items`.
    if ( ! arguments[ 0 ] ) {
      localStorage.setItem( 'LocalDB_' + self.name, JSON.stringify( self.items ) );
    }
    // Handle new data to be saved.
    else {

      // If an array of items is provided.
      if ( arguments[ 0 ].length ) {

        LDB.each( arguments[ 0 ], function ( _item ) {

          var item = {};

          _item._id = LDB.uuid(); // Assign a new UUID.
          item = new Item( self.name, _item ); // Create an Item instance.
          self.items.push( item ); // Add to in-memory collection.

        } );

      }
      // If a single item object is provided.
      else {

        var item = {};

        arguments[ 0 ]._id = LDB.uuid(); // Assign a new UUID.
        item = new Item( self.name, arguments[ 0 ] ); // Create an Item instance.
        self.items.push( item ); // Add to in-memory collection.

      }


      // Persist the updated collection to localStorage.
      localStorage.setItem( 'LocalDB_' + self.name, JSON.stringify( self.items ) );


      // Execute any provided callback with the newly saved item (if single).
      LDB.each( arguments, function ( arg ) {

        if ( typeof arg === 'function' ) {
          return arg( item );
        }

      } );

    }

  };


  /**
   * Updates items in the collection that match a query.
   * Supports an optional `upsert` flag to insert the update data if no matching items are found.
   * @param {Object} find The query object to find items to update.
   * @param {Object} update The object containing fields to update.
   * @param {Object} [options] Optional options, e.g., `{ upsert: true }`.
   * @param {Function} [callback] Optional callback function.
   */
  Collection.prototype.update = function () {

    var self = this;

    // Check if upsert option is present in the arguments.
    var upsert = LDB.find( arguments, function ( arg ) {
      return arg.upsert;
    } );


    // Reload items to ensure we are working with the latest state.
    self.items = JSON.parse( localStorage.getItem( 'LocalDB_' + self.name ) );


    var find = arguments[ 0 ], // The query to find items.
      update = arguments[ 1 ]; // The data to update.


    var items = LDB.where( self.items, find ); // Find matching items.

    if ( LDB.size( items ) ) {

      // Iterate over each matching item and apply updates.
      LDB.each( items, function ( item ) {

        LDB.each( update, function ( val, key ) {
          item[ key ] = val; // Apply the update.
        } );

        item = new Item( self.name, item ); // Re-wrap as Item to ensure consistency (though not strictly needed here).

      } );

      self.save(); // Save the modified collection.

    }
    else if ( upsert ) {

      self.save( update ); // If upsert is true and no match, insert the update data as a new item.

    }


    // Execute any provided callback with the updated/inserted items.
    LDB.each( arguments, function ( arg ) {

      if ( typeof arg === 'function' ) {
        return arg( items || [] );
      }

    } );

  };


  /**
   * Deletes items from the collection that match a query.
   * @param {Object} query The query object to find items to delete.
   * @param {Function} [callback] Optional callback function.
   */
  Collection.prototype.delete = function () {

    var self = this;

    var items = LDB.where( self.items, arguments[ 0 ] ); // Find items to delete.

    // Remove each found item from the in-memory collection.
    LDB.each( items, function ( item ) {
      self.items.splice( LDB.indexOf( self.items, item ), 1 );
    } );

    self.save(); // Persist the changes.

    // Execute any provided callback.
    LDB.each( arguments, function ( arg ) {

      if ( typeof arg === 'function' ) {
        return arg();
      }

    } );

  };


  /**
   * Drops (clears) the entire collection.
   * Removes all items from the collection in both memory and localStorage.
   */
  Collection.prototype.drop = function () {

    var self = this;

    this.items = []; // Clear in-memory items.

    localStorage.setItem( 'LocalDB_' + self.name, '[]' ); // Clear localStorage entry.

  };


} )( window ); // Pass the global window object to the immediately invoked function expression.