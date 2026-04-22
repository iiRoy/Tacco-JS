/*
 * jQuery Storage API Plugin - Enhanced Version
 *
 * This file is a Type I clone of the original jQuery Storage API Plugin.
 *
 * Copyright (c) 2013 Julien Maurel - All rights reserved.
 *
 * Licensed under the MIT license;
 * For more details, see: http://www.opensource.org/licenses/mit-license.php
 *
 * Project home on GitHub:
 * https://github.com/julien-maurel/jQuery-Storage-API
 *
 * Current Version: 1.7.3 - Minor updates and refactoring for clarity.
 *
 */
( function ( factory ) {

  // Check for AMD (Asynchronous Module Definition) environment
  if ( typeof define === 'function' && define.amd ) {

    // AMD loader detected, define the module with 'jquery' as a dependency.
    define( [ 'jquery' ] , factory ) ;

  } else if ( typeof exports === 'object' ) {

    // CommonJS environment (e.g., Node.js) detected.
    // Export the module by requiring 'jquery'.
    factory( require( 'jquery' ) ) ;

  } else {

    // Browser globals environment (no module loader).
    // Pass the global jQuery object to the factory function.
    factory( jQuery ) ;

  }

} ( function ( $ ) {

  // Define prefixes for cookie fallback storage keys.
  // These are used when native localStorage/sessionStorage are not available.
  var cookie_local_prefix = "ls_" ;
  var cookie_session_prefix = "ss_" ;


  /**
   * Internal function to retrieve items from a specified storage.
   * Supports nested keys and retrieval of multiple items.
   *
   * @param {string} storage - The name of the storage (e.g., 'localStorage', 'sessionStorage').
   * @returns {*} The retrieved value(s) or throws an error.
   */
  function _get ( storage ) {

    // Initialize variables for arguments, storage object, and return value.
    var l = arguments.length ,
        s = window[ storage ] ,
        a = arguments ,
        a1 = a[ 1 ] ,
        vi ,
        ret ,
        tmp ;

    // Ensure at least 2 arguments are provided.
    if ( l < 2 ) {
      throw new Error( 'Minimum 2 arguments must be given' ) ;
    }
    // If the second argument is an array, retrieve values for each item in the array.
    else if ( $.isArray( a1 ) ) {

      ret = {} ; // Initialize an object to store results.
      for ( var i in a1 ) {
        vi = a1[ i ] ;
        try {
          // Attempt to parse JSON, otherwise get raw string.
          ret[ vi ] = JSON.parse( s.getItem( vi ) ) ;
        } catch ( e ) {
          ret[ vi ] = s.getItem( vi ) ;
        }
      }
      return ret ;

    }
    // If only 2 arguments, return the value directly.
    else if ( l == 2 ) {

      try {
        // Attempt JSON parsing first.
        return JSON.parse( s.getItem( a1 ) ) ;
      } catch ( e ) {
        // If parsing fails, return the raw item.
        return s.getItem( a1 ) ;
      }

    }
    // If more than 2 arguments, navigate through nested properties.
    else {

      // Get the first level item.
      try {
        ret = JSON.parse( s.getItem( a1 ) ) ;
      } catch ( e ) {
        // If the first level doesn't exist or isn't valid JSON, throw an error.
        throw new ReferenceError( a1 + ' is not defined in this storage' ) ;
      }

      // Traverse through subsequent levels to find the target value.
      for ( var i = 2 ; i < l - 1 ; i ++ ) {
        ret = ret[ a[ i ] ] ;
        if ( ret === undefined ) {
          // If any intermediate level is undefined, throw a reference error.
          throw new ReferenceError( [].slice.call( a , 1 , i + 1 ).join( '.' ) + ' is not defined in this storage' ) ;
        }
      }

      // Check if the last argument is an array to retrieve multiple sub-properties.
      if ( $.isArray( a[ i ] ) ) {
        tmp = ret ; // Store the current level.
        ret = {} ; // Prepare an object for multiple returns.
        for ( var j in a[ i ] ) {
          ret[ a[ i ][ j ] ] = tmp[ a[ i ][ j ] ] ;
        }
        return ret ;
      }
      // Otherwise, return the single target value.
      else {
        return ret[ a[ i ] ] ;
      }
    }
  }


  /**
   * Internal function to set items in a specified storage.
   * Supports setting single items, multiple items from an object,
   * and setting nested properties.
   *
   * @param {string} storage - The name of the storage.
   * @returns {*} The value(s) that were set.
   */
  function _set ( storage ) {

    var l = arguments.length ,
        s = window[ storage ] ,
        a = arguments ,
        a1 = a[ 1 ] ,
        a2 = a[ 2 ] ,
        vi ,
        to_store = {} ,
        tmp ;

    // Validate arguments: requires at least 3, or 2 if the second is a plain object.
    if ( l < 2 || ( ! $.isPlainObject( a1 ) && l < 3 ) ) {
      throw new Error( 'Minimum 3 arguments must be given or second parameter must be an object' ) ;
    }
    // If the second argument is a plain object, set all its properties individually.
    else if ( $.isPlainObject( a1 ) ) {

      for ( var i in a1 ) {
        vi = a1[ i ] ;
        // If the value is not a plain object, store it as is, otherwise stringify.
        if ( ! $.isPlainObject( vi ) ) {
          s.setItem( i , vi ) ;
        } else {
          s.setItem( i , JSON.stringify( vi ) ) ;
        }
      }
      return a1 ; // Return the object that was set.

    }
    // If only 3 arguments, set a single key-value pair directly.
    else if ( l == 3 ) {

      // If the value is an object, stringify it before storing.
      if ( typeof a2 === 'object' ) {
        s.setItem( a1 , JSON.stringify( a2 ) ) ;
      } else {
        s.setItem( a1 , a2 ) ;
      }
      return a2 ; // Return the value that was set.

    }
    // If more than 3 arguments, set a nested property.
    else {

      // Retrieve the initial item to modify its nested structure.
      try {
        tmp = s.getItem( a1 ) ;
        if ( tmp != null ) {
          to_store = JSON.parse( tmp ) ;
        }
      } catch ( e ) {
        // If parsing fails or item doesn't exist, start with an empty object.
        to_store = {} ;
      }
      tmp = to_store ; // Use 'tmp' to navigate the object.

      // Traverse to the correct nesting level.
      for ( var i = 2 ; i < l - 2 ; i ++ ) {
        vi = a[ i ] ;
        // If a level doesn't exist or isn't an object, initialize it as an empty object.
        if ( ! tmp[ vi ] || ! $.isPlainObject( tmp[ vi ] ) ) {
          tmp[ vi ] = {} ;
        }
        tmp = tmp[ vi ] ; // Move deeper into the object.
      }

      // Set the final value at the target nested key.
      tmp[ a[ i ] ] = a[ i + 1 ] ;
      // Store the modified top-level object back into storage.
      s.setItem( a1 , JSON.stringify( to_store ) ) ;
      return to_store ; // Return the updated top-level object.

    }
  }


  /**
   * Internal function to remove items from a specified storage.
   * Supports removing single items, multiple items from an array,
   * and removing nested properties.
   *
   * @param {string} storage - The name of the storage.
   * @returns {boolean} True if removal was attempted successfully.
   */
  function _remove ( storage ) {

    var l = arguments.length ,
        s = window[ storage ] ,
        a = arguments ,
        a1 = a[ 1 ] ,
        to_store ,
        tmp ;

    // Ensure at least 2 arguments are provided.
    if ( l < 2 ) {
      throw new Error( 'Minimum 2 arguments must be given' ) ;
    }
    // If the second argument is an array, remove each item specified.
    else if ( $.isArray( a1 ) ) {

      for ( var i in a1 ) {
        s.removeItem( a1[ i ] ) ;
      }
      return true ;

    }
    // If only 2 arguments, remove a single item directly.
    else if ( l == 2 ) {

      s.removeItem( a1 ) ;
      return true ;

    }
    // If more than 2 arguments, remove a nested property.
    else {

      // Retrieve the top-level item.
      try {
        to_store = tmp = JSON.parse( s.getItem( a1 ) ) ;
      } catch ( e ) {
        // If the item doesn't exist or is invalid JSON, throw an error.
        throw new ReferenceError( a1 + ' is not defined in this storage' ) ;
      }

      // Traverse to the parent of the item to be removed.
      for ( var i = 2 ; i < l - 1 ; i ++ ) {
        tmp = tmp[ a[ i ] ] ;
        if ( tmp === undefined ) {
          // If an intermediate path is undefined, throw an error.
          throw new ReferenceError( [].slice.call( a , 1 , i ).join( '.' ) + ' is not defined in this storage' ) ;
        }
      }

      // If the last argument is an array, delete multiple sub-properties.
      if ( $.isArray( a[ i ] ) ) {
        for ( var j in a[ i ] ) {
          delete tmp[ a[ i ][ j ] ] ;
        }
      }
      // Otherwise, delete the single target property.
      else {
        delete tmp[ a[ i ] ] ;
      }

      // Store the modified top-level object back.
      s.setItem( a1 , JSON.stringify( to_store ) ) ;
      return true ;

    }
  }


  /**
   * Internal function to remove all items from a specified storage.
   *
   * @param {string} storage - The name of the storage.
   * @param {boolean} reinit_ns - Flag to reinitialize namespace storages.
   */
  function _removeAll ( storage , reinit_ns ) {

    // Get all keys currently in the storage.
    var keys = _keys( storage ) ;
    for ( var i in keys ) {
      // Remove each item one by one.
      _remove( storage , keys[ i ] ) ;
    }

    // If 'reinit_ns' is true, reinitialize all existing namespace storages.
    if ( reinit_ns ) {
      for ( var i in $.namespaceStorages ) {
        _createNamespace( i ) ;
      }
    }

  }


  /**
   * Internal function to check if items in a storage are empty.
   * An item is considered empty if it's an empty object, an empty array, or falsy.
   *
   * @param {string} storage - The name of the storage.
   * @returns {boolean} True if the item(s) are empty, false otherwise.
   */
  function _isEmpty ( storage ) {

    var l = arguments.length ,
        a = arguments ,
        s = window[ storage ] ,
        a1 = a[ 1 ] ;

    // If only one argument, check if the entire storage is empty.
    if ( l == 1 ) {
      return ( _keys( storage ).length == 0 ) ;
    }
    // If the second argument is an array, check if ALL items in the array are empty.
    else if ( $.isArray( a1 ) ) {

      for ( var i = 0 ; i < a1.length ; i ++ ) {
        if ( ! _isEmpty( storage , a1[ i ] ) ) {
          return false ;
        }
      }
      return true ;

    }
    // For other cases, retrieve the value and check its emptiness.
    else {

      try {
        var v = _get.apply( this , arguments ) ;
        // If the last argument wasn't an array, wrap the result in an object for consistent iteration.
        if ( ! $.isArray( a[ l - 1 ] ) ) {
          v = { 'totest' : v } ;
        }

        // Iterate through the value(s) and check for emptiness criteria.
        for ( var i in v ) {
          if ( ! (
              ( $.isPlainObject( v[ i ] ) && $.isEmptyObject( v[ i ] ) ) || // Empty plain object
              ( $.isArray( v[ i ] ) && ! v[ i ].length ) || // Empty array
              ( ! v[ i ] ) // Falsy value (null, undefined, 0, false, '')
          ) ) {
            return false ;
          }
        }
        return true ;

      } catch ( e ) {
        // If _get throws an error (e.g., item not found), it's considered empty.
        return true ;
      }

    }
  }


  /**
   * Internal function to check if items in a storage exist (are set and not null/undefined).
   *
   * @param {string} storage - The name of the storage.
   * @returns {boolean} True if the item(s) exist, false otherwise.
   */
  function _isSet ( storage ) {

    var l = arguments.length ,
        a = arguments ,
        s = window[ storage ] ,
        a1 = a[ 1 ] ;

    // Ensure at least 2 arguments are provided.
    if ( l < 2 ) {
      throw new Error( 'Minimum 2 arguments must be given' ) ;
    }
    // If the second argument is an array, check if ALL items in the array exist.
    if ( $.isArray( a1 ) ) {

      for ( var i = 0 ; i < a1.length ; i ++ ) {
        if ( ! _isSet( storage , a1[ i ] ) ) {
          return false ;
        }
      }
      return true ;

    }
    // For other cases, retrieve the value and check if it's set.
    else {

      try {
        var v = _get.apply( this , arguments ) ;
        // If the last argument wasn't an array, wrap the result in an object for consistent iteration.
        if ( ! $.isArray( a[ l - 1 ] ) ) {
          v = { 'totest' : v } ;
        }

        // Iterate through the value(s) and check if they are not undefined and not null.
        for ( var i in v ) {
          if ( ! ( v[ i ] !== undefined && v[ i ] !== null ) ) {
            return false ;
          }
        }
        return true ;

      } catch ( e ) {
        // If _get throws an error (e.g., item not found), it's not set.
        return false ;
      }

    }
  }


  /**
   * Internal function to get all keys from a storage or a specific item within it.
   *
   * @param {string} storage - The name of the storage.
   * @returns {Array<string>} An array of keys.
   */
  function _keys ( storage ) {

    var l = arguments.length ,
        s = window[ storage ] ,
        a = arguments ,
        a1 = a[ 1 ] ,
        keys = [] ,
        o = {} ;

    // If more than 1 argument, get the specific item to retrieve its keys.
    if ( l > 1 ) {
      o = _get.apply( this , a ) ;
    }
    // Else, use the entire storage object to retrieve keys.
    else {
      o = s ;
    }

    // Special handling for cookie storage, which might use a different key retrieval mechanism.
    if ( o._cookie ) {
      for ( var key in $.cookie() ) {
        if ( key != '' ) {
          // Remove the cookie prefix to get the actual key.
          keys.push( key.replace( o._prefix , '' ) ) ;
        }
      }
    }
    // For native storage or parsed JSON objects, iterate over properties.
    else {
      for ( var i in o ) {
        keys.push( i ) ;
      }
    }
    return keys ;

  }


  /**
   * Internal function to create a new namespace storage.
   * Initializes both localStorage and sessionStorage for the given namespace.
   *
   * @param {string} name - The name of the namespace.
   * @returns {object} An object containing localStorage and sessionStorage APIs for the new namespace.
   */
  function _createNamespace ( name ) {

    // Validate the namespace name.
    if ( ! name || typeof name != "string" ) {
      throw new Error( 'First parameter must be a string' ) ;
    }

    // Initialize the namespace in native/cookie storage.
    if ( storage_available ) {
      if ( ! window.localStorage.getItem( name ) ) {
        window.localStorage.setItem( name , '{}' ) ;
      }
      if ( ! window.sessionStorage.getItem( name ) ) {
        window.sessionStorage.setItem( name , '{}' ) ;
      }
    } else {
      // Fallback to cookie storage if native is not available.
      if ( ! window.localCookieStorage.getItem( name ) ) {
        window.localCookieStorage.setItem( name , '{}' ) ;
      }
      if ( ! window.sessionCookieStorage.getItem( name ) ) {
        window.sessionCookieStorage.setItem( name , '{}' ) ;
      }
    }

    // Create a new API object for the namespace.
    var ns = {
      localStorage : $.extend( {} , $.localStorage , { _ns : name } ) ,
      sessionStorage : $.extend( {} , $.sessionStorage , { _ns : name } )
    } ;

    // If jQuery.cookie is available, also create a cookieStorage API for the namespace.
    if ( $.cookie ) {
      if ( ! window.cookieStorage.getItem( name ) ) {
        window.cookieStorage.setItem( name , '{}' ) ;
      }
      ns.cookieStorage = $.extend( {} , $.cookieStorage , { _ns : name } ) ;
    }

    // Store the new namespace API globally.
    $.namespaceStorages[ name ] = ns ;
    return ns ; // Return the created namespace API.

  }


  /**
   * Internal function to test if a given storage type is natively available in the browser.
   *
   * @param {string} name - The name of the storage type (e.g., 'localStorage', 'sessionStorage').
   * @returns {boolean} True if the storage is available and functional, false otherwise.
   */
  function _testStorage ( name ) {

    var foo = 'jsapi' ; // A temporary key to test storage.
    try {
      // Check if the storage object exists on window.
      if ( ! window[ name ] ) {
        return false ;
      }
      // Attempt to set and remove an item to confirm functionality.
      window[ name ].setItem( foo , foo ) ;
      window[ name ].removeItem( foo ) ;
      return true ;
    } catch ( e ) {
      // If any error occurs (e.g., storage quota exceeded, security error), storage is not usable.
      return false ;
    }

  }

  // Determine if native localStorage is available. This also implies sessionStorage availability.
  var storage_available = _testStorage( 'localStorage' ) ;


  /**
   * Base storage object providing common methods and internal call handling.
   * This object is extended to create specific storage APIs (localStorage, sessionStorage, cookieStorage).
   */
  var storage = {
    _type : '' , // Placeholder for the storage type (e.g., 'localStorage').
    _ns : '' ,   // Placeholder for the namespace, if applicable.

    /**
     * Internal helper to call the core storage functions (`_get`, `_set`, etc.)
     * with appropriate arguments, handling namespaces and dot notation.
     *
     * @param {function} f - The core storage function to call.
     * @param {IArguments} a - The arguments object from the public method call.
     * @returns {*} The result of the core function call.
     */
    _callMethod : function ( f , a ) {

      var p = [ this._type ] , // Start with the storage type.
          a = Array.prototype.slice.call( a ) , // Convert arguments to a real array.
          a0 = a[ 0 ] ; // Get the first argument.

      // If a namespace is defined, add it as the second argument.
      if ( this._ns ) {
        p.push( this._ns ) ;
      }

      // If the first argument is a string containing a dot, split it into multiple arguments.
      // This allows for nested key access (e.g., 'user.profile.name').
      if ( typeof a0 === 'string' && a0.indexOf( '.' ) !== - 1 ) {
        a.shift() ; // Remove the original dotted string.
        [].unshift.apply( a , a0.split( '.' ) ) ; // Prepend the split parts.
      }

      // Append the remaining arguments to the parameter list.
      [].push.apply( p , a ) ;
      // Call the core function with the prepared parameters.
      return f.apply( this , p ) ;

    } ,

    /**
     * Public method to get items from the storage.
     * If no parameters and the storage has a namespace, returns the entire namespace object.
     *
     * @returns {*} The retrieved value(s).
     */
    get : function () {
      return this._callMethod( _get , arguments ) ;
    } ,

    /**
     * Public method to set items in the storage.
     *
     * @returns {*} The value(s) that were set.
     */
    set : function () {

      var l = arguments.length ,
          a = arguments ,
          a0 = a[ 0 ] ;

      // Validate arguments for the set operation.
      if ( l < 1 || ( ! $.isPlainObject( a0 ) && l < 2 ) ) {
        throw new Error( 'Minimum 2 arguments must be given or first parameter must be an object' ) ;
      }

      // If the first argument is an object and this is a namespace storage,
      // set each property individually within the namespace.
      if ( $.isPlainObject( a0 ) && this._ns ) {
        for ( var i in a0 ) {
          _set( this._type , this._ns , i , a0[ i ] ) ;
        }
        return a0 ;
      }
      // Otherwise, call the internal _set method.
      else {
        var r = this._callMethod( _set , a ) ;
        // If it's a namespace storage, return the relevant part of the result.
        if ( this._ns ) {
          return r[ a0.split( '.' )[ 0 ] ] ;
        } else {
          return r ;
        }
      }

    } ,

    /**
     * Public method to remove items from the storage.
     *
     * @returns {boolean} True if removal was attempted successfully.
     */
    remove : function () {
      if ( arguments.length < 1 ) {
        throw new Error( 'Minimum 1 argument must be given' ) ;
      }
      return this._callMethod( _remove , arguments ) ;
    } ,

    /**
     * Public method to remove all items from the storage.
     *
     * @param {boolean} reinit_ns - Flag to reinitialize namespace storages.
     * @returns {boolean} True.
     */
    removeAll : function ( reinit_ns ) {
      // If this is a namespace storage, clear its content by setting it to an empty object.
      if ( this._ns ) {
        _set( this._type , this._ns , {} ) ;
        return true ;
      }
      // Otherwise, call the global _removeAll function.
      else {
        return _removeAll( this._type , reinit_ns ) ;
      }
    } ,

    /**
     * Public method to check if items in the storage are empty.
     *
     * @returns {boolean} True if empty, false otherwise.
     */
    isEmpty : function () {
      return this._callMethod( _isEmpty , arguments ) ;
    } ,

    /**
     * Public method to check if items in the storage exist.
     *
     * @returns {boolean} True if set, false otherwise.
     */
    isSet : function () {
      if ( arguments.length < 1 ) {
        throw new Error( 'Minimum 1 argument must be given' ) ;
      }
      return this._callMethod( _isSet , arguments ) ;
    } ,

    /**
     * Public method to get keys of items in the storage.
     *
     * @returns {Array<string>} An array of keys.
     */
    keys : function () {
      return this._callMethod( _keys , arguments ) ;
    }

  } ;


  // Integrate jQuery.cookie for older browser compatibility and cookieStorage API.
  if ( $.cookie ) {

    // For session cookie simulation, a unique window name is used.
    if ( ! window.name ) {
      window.name = Math.floor( Math.random() * 100000000 ) ;
    }

    // Base cookie storage object.
    var cookie_storage = {
      _cookie : true ,     // Flag indicating it's a cookie-based storage.
      _prefix : '' ,       // Prefix for cookie names.
      _expires : null ,    // Expiration for cookies.
      _path : null ,       // Path for cookies.
      _domain : null ,     // Domain for cookies.

      /**
       * Sets a cookie item.
       * @param {string} n - Name of the item.
       * @param {*} v - Value of the item.
       */
      setItem : function ( n , v ) {
        $.cookie( this._prefix + n , v , { expires : this._expires , path : this._path , domain : this._domain } ) ;
      } ,

      /**
       * Gets a cookie item.
       * @param {string} n - Name of the item.
       * @returns {*} The value of the item.
       */
      getItem : function ( n ) {
        return $.cookie( this._prefix + n ) ;
      } ,

      /**
       * Removes a cookie item.
       * @param {string} n - Name of the item.
       * @returns {boolean} Result of the removal operation.
       */
      removeItem : function ( n ) {
        return $.removeCookie( this._prefix + n ) ;
      } ,

      /**
       * Clears all cookies managed by this storage instance.
       */
      clear : function () {
        for ( var key in $.cookie() ) {
          if ( key != '' ) {
            // Check if the cookie key belongs to this storage instance or is a general one.
            if ( ( ! this._prefix && key.indexOf( cookie_local_prefix ) === - 1 && key.indexOf( cookie_session_prefix ) === - 1 ) ||
                 ( this._prefix && key.indexOf( this._prefix ) === 0 ) ) {
              $.removeCookie( key ) ;
            }
          }
        }
      } ,

      /**
       * Sets the expiration for cookies.
       * @param {number} e - Expiration in days.
       * @returns {object} The cookie_storage object for chaining.
       */
      setExpires : function ( e ) {
        this._expires = e ;
        return this ;
      } ,

      /**
       * Sets the path for cookies.
       * @param {string} p - Path string.
       * @returns {object} The cookie_storage object for chaining.
       */
      setPath : function ( p ) {
        this._path = p ;
        return this ;
      } ,

      /**
       * Sets the domain for cookies.
       * @param {string} d - Domain string.
       * @returns {object} The cookie_storage object for chaining.
       */
      setDomain : function ( d ) {
        this._domain = d ;
        return this ;
      } ,

      /**
       * Sets multiple configuration options for cookies.
       * @param {object} c - Configuration object with path, domain, expires properties.
       * @returns {object} The cookie_storage object for chaining.
       */
      setConf : function ( c ) {
        if ( c.path ) {
          this._path = c.path ;
        }
        if ( c.domain ) {
          this._domain = c.domain ;
        }
        if ( c.expires ) {
          this._expires = c.expires ;
        }
        return this ;
      } ,

      /**
       * Resets cookie configuration to default values.
       */
      setDefaultConf : function () {
        this._path = this._domain = this._expires = null ;
      }
    } ;

    // If native storage is NOT available, set up cookie-based fallbacks.
    if ( ! storage_available ) {
      // localStorage fallback using cookies (long expiration).
      window.localCookieStorage = $.extend( {} , cookie_storage , { _prefix : cookie_local_prefix , _expires : 365 * 10 } ) ;
      // sessionStorage fallback using cookies (session-specific prefix).
      window.sessionCookieStorage = $.extend( {} , cookie_storage , { _prefix : cookie_session_prefix + window.name + '_' } ) ;
    }

    // Global cookieStorage object.
    window.cookieStorage = $.extend( {} , cookie_storage ) ;

    // Expose cookieStorage API through jQuery.
    $.cookieStorage = $.extend( {} , storage , {
      _type : 'cookieStorage' ,
      setExpires : function ( e ) { window.cookieStorage.setExpires( e ) ; return this ; } ,
      setPath : function ( p ) { window.cookieStorage.setPath( p ) ; return this ; } ,
      setDomain : function ( d ) { window.cookieStorage.setDomain( d ) ; return this ; } ,
      setConf : function ( c ) { window.cookieStorage.setConf( c ) ; return this ; } ,
      setDefaultConf : function () { window.cookieStorage.setDefaultConf() ; return this ; }
    } ) ;

  }


  // Public method to initialize a new namespace storage.
  $.initNamespaceStorage = function ( ns ) { return _createNamespace( ns ) ; } ;

  // Expose localStorage and sessionStorage APIs based on availability.
  if ( storage_available ) {
    // Native localStorage API.
    $.localStorage = $.extend( {} , storage , { _type : 'localStorage' } ) ;
    // Native sessionStorage API.
    $.sessionStorage = $.extend( {} , storage , { _type : 'sessionStorage' } ) ;
  } else {
    // Fallback to cookie-based localStorage API.
    $.localStorage = $.extend( {} , storage , { _type : 'localCookieStorage' } ) ;
    // Fallback to cookie-based sessionStorage API.
    $.sessionStorage = $.extend( {} , storage , { _type : 'sessionCookieStorage' } ) ;
  }

  // Object to hold all created namespace storages.
  $.namespaceStorages = {} ;

  // Public method to remove all items from all storage types.
  $.removeAllStorages = function ( reinit_ns ) {
    $.localStorage.removeAll( reinit_ns ) ;
    $.sessionStorage.removeAll( reinit_ns ) ;
    // If cookieStorage is available, remove its items too.
    if ( $.cookieStorage ) {
      $.cookieStorage.removeAll( reinit_ns ) ;
    }
    // If not reinitializing namespaces, clear the namespaceStorages object.
    if ( ! reinit_ns ) {
      $.namespaceStorages = {} ;
    }
  }

} ) ) ;