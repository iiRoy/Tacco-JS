/*
 *  This is a Type I clone of the original Faye JavaScript library code.
 *  It preserves all original identifiers, operators, and expressions.
 *  Only whitespace and comments have been altered for visual differentiation.
 *
 *  Original project: Faye
 *  Version: 0.8.9
 *  Source: https://faye.jcoglan.com/
 */

'use strict'
; /* Enforce strict mode for better code quality */


var Faye =
{

  // Library version identifier
  VERSION:          '0.8.9',


  // Bayeux protocol version
  BAYEUX_VERSION:   '1.0',


  // Default length for generated IDs
  ID_LENGTH:        160,


  // Callback name for JSONP requests
  JSONP_CALLBACK:   'jsonpcallback',


  // Supported connection types
  CONNECTION_TYPES:
  [
    'long-polling',
    'cross-origin-long-polling',
    'callback-polling',
    'websocket',
    'eventsource',
    'in-process'
  ],


  // Mandatory connection types for basic functionality
  MANDATORY_CONNECTION_TYPES:
  [
    'long-polling',
    'callback-polling',
    'in-process'
  ],


  // Determine the global environment (browser or Node.js)
  ENV: (typeof global === 'undefined') ? window : global,


  /**
   *  Extends an object with properties from another object.
   *  @param {object} dest - The destination object.
   *  @param {object} source - The source object.
   *  @param {boolean} overwrite - Whether to overwrite existing properties.
   *  @returns {object} The extended destination object.
   */
  extend: function ( dest, source, overwrite )
  {
    if ( !source ) return dest; // If no source, return destination as is

    for ( var key in source )
    {
      // Ensure property belongs to source, not its prototype chain
      if ( !source.hasOwnProperty( key ) ) continue;

      // Skip if destination already has the property and overwrite is false
      if ( dest.hasOwnProperty( key ) && overwrite === false ) continue;

      // Only assign if the values are different
      if ( dest[ key ] !== source[ key ] )
        dest[ key ] = source[ key ]
      ;
    }
    return dest
    ;
  },


  /**
   *  Generates a random string of a specified bitlength.
   *  @param {number} bitlength - The desired bit length of the random string.
   *  @returns {string} A random string.
   */
  random: function ( bitlength )
  {
    bitlength = bitlength || this.ID_LENGTH
    ; // Use default ID_LENGTH if not provided

    if ( bitlength > 32 )
    {
      // For larger bitlengths, concatenate multiple 32-bit random strings
      var parts  = Math.ceil( bitlength / 32 ),
          string = ''
      ;
      while ( parts-- ) string += this.random( 32 )
      ;

      // Reverse the string for better distribution (optional but done in original)
      var chars = string.split( '' ),
          result = ''
      ;
      while ( chars.length > 0 ) result += chars.pop()
      ;
      return result
      ;
    }

    // For 32-bit or less, generate directly
    var limit   = Math.pow( 2, bitlength ) - 1,
        maxSize = limit.toString( 36 ).length,
        string  = Math.floor( Math.random() * limit ).toString( 36 )
    ;

    // Pad with leading zeros if necessary
    while ( string.length < maxSize ) string = '0' + string
    ;
    return string
    ;
  },


  /**
   *  Extracts the client ID from an array of messages.
   *  @param {Array<object>} messages - An array of Bayeux messages.
   *  @returns {string|null} The client ID or null if not found.
   */
  clientIdFromMessages: function ( messages )
  {
    var first = [].concat( messages )[0]
    ; // Get the first message, safely handle non-array input

    return first && first.clientId
    ;
  },


  /**
   *  Performs a deep copy of an object or array.
   *  @param {*} object - The object or array to copy.
   *  @returns {*} A deep copy of the input.
   */
  copyObject: function ( object )
  {
    var clone, i, key
    ;

    if ( object instanceof Array )
    {
      clone = []
      ;
      i = object.length
      ;
      while ( i-- ) clone[ i ] = Faye.copyObject( object[ i ] )
      ; // Recursively copy array elements
      return clone
      ;
    }
    else if ( typeof object === 'object' )
    {
      // Handle null explicitly, otherwise create a new object
      clone = ( object === null ) ? null : {}
      ;
      for ( key in object ) clone[ key ] = Faye.copyObject( object[ key ] )
      ; // Recursively copy object properties
      return clone
      ;
    }
    else
    {
      return object
      ; // Return primitives as is
    }
  },


  /**
   *  Finds the first common element between two lists.
   *  @param {Array} lista - The first list.
   *  @param {Array} listb - The second list.
   *  @returns {*} The first common element, or null if none.
   */
  commonElement: function ( lista, listb )
  {
    for ( var i = 0, n = lista.length; i < n; i++ )
    {
      if ( this.indexOf( listb, lista[ i ] ) !== -1 )
        return lista[ i ]
      ;
    }
    return null
    ;
  },


  /**
   *  Custom indexOf implementation for arrays, falls back to native if available.
   *  @param {Array} list - The array to search.
   *  @param {*} needle - The element to find.
   *  @returns {number} The index of the element, or -1 if not found.
   */
  indexOf: function ( list, needle )
  {
    if ( list.indexOf ) return list.indexOf( needle )
    ; // Use native indexOf if available

    for ( var i = 0, n = list.length; i < n; i++ )
    {
      if ( list[ i ] === needle ) return i
      ;
    }
    return -1
    ;
  },


  /**
   *  Maps an object or array to a new array using a callback function.
   *  @param {Array|object} object - The collection to map.
   *  @param {function} callback - The function to call for each element.
   *  @param {object} context - The `this` context for the callback.
   *  @returns {Array} A new array containing the results of the callback.
   */
  map: function ( object, callback, context )
  {
    if ( object.map ) return object.map( callback, context )
    ; // Use native map if available

    var result = []
    ;

    if ( object instanceof Array )
    {
      for ( var i = 0, n = object.length; i < n; i++ )
      {
        result.push( callback.call( context || null, object[ i ], i ) )
        ;
      }
    }
    else
    {
      for ( var key in object )
      {
        if ( !object.hasOwnProperty( key ) ) continue
        ;
        result.push( callback.call( context || null, key, object[ key ] ) )
        ;
      }
    }
    return result
    ;
  },


  /**
   *  Filters an array based on a callback function.
   *  @param {Array} array - The array to filter.
   *  @param {function} callback - The function to test each element.
   *  @param {object} context - The `this` context for the callback.
   *  @returns {Array} A new array containing only elements for which the callback returned true.
   */
  filter: function ( array, callback, context )
  {
    var result = []
    ;
    for ( var i = 0, n = array.length; i < n; i++ )
    {
      if ( callback.call( context || null, array[ i ], i ) )
        result.push( array[ i ] )
      ;
    }
    return result
    ;
  },


  /**
   *  Executes an iterator function for each item in a list asynchronously.
   *  @param {Array} list - The list of items.
   *  @param {function} iterator - The function to call for each item.
   *  @param {function} callback - The function to call when all items are processed.
   *  @param {object} context - The `this` context for callbacks.
   */
  asyncEach: function ( list, iterator, callback, context )
  {
    var n       = list.length,
        i       = -1,
        calls   = 0,
        looping = false
    ;

    var iterate = function ()
    {
      calls -= 1
      ;
      i += 1
      ;
      if ( i === n ) return callback && callback.call( context )
      ;
      iterator( list[ i ], resume )
      ;
    }
    ;

    var loop = function ()
    {
      if ( looping ) return
      ;
      looping = true
      ;
      while ( calls > 0 ) iterate()
      ;
      looping = false
      ;
    }
    ;

    var resume = function ()
    {
      calls += 1
      ;
      loop()
      ;
    }
    ;
    resume()
    ;
  },


  // Reference: http://assanka.net/content/tech/2009/09/02/json2-js-vs-prototype/
  /**
   *  Converts a JavaScript object or value to a JSON string.
   *  Uses native JSON.stringify if available, otherwise a custom implementation.
   *  @param {*} object - The value to convert to a JSON string.
   *  @returns {string} A JSON string.
   */
  toJSON: function ( object )
  {
    if ( this.stringify )
      return this.stringify( object, function ( key, value )
      {
        return ( this[ key ] instanceof Array )
            ? this[ key ]
            : value
        ;
      } )
    ;

    return JSON.stringify( object )
    ;
  },


  /**
   *  Logs a message to the console if available.
   *  @param {*} message - The message to log.
   */
  logger: function ( message )
  {
    if ( typeof console !== 'undefined' ) console.log( message )
    ;
  },


  /**
   *  Generates a formatted timestamp string.
   *  @returns {string} The formatted timestamp.
   */
  timestamp: function ()
  {
    var date   = new Date(),
        year   = date.getFullYear(),
        month  = date.getMonth() + 1, // Month is 0-indexed
        day    = date.getDate(),
        hour   = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds()
    ;

    // Helper function to pad numbers with a leading zero
    var pad = function ( n )
    {
      return n < 10 ? '0' + n : String( n )
      ;
    }
    ;

    return pad( year ) + '-' + pad( month ) + '-' + pad( day ) + ' ' +
           pad( hour ) + ':' + pad( minute ) + ':' + pad( second )
    ;
  }
}
;

// Expose Faye globally if running in a browser environment
if ( typeof window !== 'undefined' )
  window.Faye = Faye
;


/**
 *  Faye.Class provides a simple inheritance mechanism.
 *  @param {function} parent - The parent constructor (optional).
 *  @param {object} methods - An object containing methods and properties for the new class.
 *  @returns {function} The new class constructor.
 */
Faye.Class = function ( parent, methods )
{
  // If parent is not a function, it means methods is the first argument
  if ( typeof parent !== 'function' )
  {
    methods = parent
    ;
    parent  = Object
    ; // Default parent to Object
  }

  // The new class constructor
  var klass = function ()
  {
    // Call the initialize method if it exists
    if ( !this.initialize ) return this
    ;
    return this.initialize.apply( this, arguments ) || this
    ;
  }
  ;

  // Bridge function to set up prototype chain without calling parent constructor
  var bridge = function () {}
  ;
  bridge.prototype = parent.prototype
  ;

  // Set the prototype of the new class
  klass.prototype = new bridge()
  ;
  // Extend the prototype with provided methods
  Faye.extend( klass.prototype, methods )
  ;

  return klass
  ;
}
;


/**
 *  Faye.Namespace manages unique identifiers.
 *  It's a class that extends from a generic object.
 */
Faye.Namespace = Faye.Class(
{
  /**
   *  Initializes the Namespace instance.
   *  @private
   */
  initialize: function ()
  {
    this._used = {}
    ; // Stores used IDs
  },


  /**
   *  Checks if an ID already exists in the namespace.
   *  @param {string} id - The ID to check.
   *  @returns {boolean} True if the ID exists, false otherwise.
   */
  exists: function ( id )
  {
    return this._used.hasOwnProperty( id )
    ;
  },


  /**
   *  Generates a new unique ID and adds it to the namespace.
   *  @returns {string} The newly generated unique ID.
   */
  generate: function ()
  {
    var name = Faye.random()
    ;
    // Keep generating until a unique name is found
    while ( this._used.hasOwnProperty( name ) )
      name = Faye.random()
    ;
    return this._used[ name ] = name
    ; // Store and return the unique name
  },


  /**
   *  Releases an ID, making it available again.
   *  @param {string} id - The ID to release.
   */
  release: function ( id )
  {
    delete this._used[ id ]
    ;
  }
} )
;


/**
 *  Faye.Error is a custom error class for Bayeux protocol errors.
 */
Faye.Error = Faye.Class(
{
  /**
   *  Initializes a new Faye.Error instance.
   *  @param {number} code - The error code.
   *  @param {Array} params - An array of parameters related to the error.
   *  @param {string} message - The error message.
   */
  initialize: function ( code, params, message )
  {
    this.code    = code
    ;
    this.params  = Array.prototype.slice.call( params )
    ; // Convert arguments to an array
    this.message = message
    ;
  },


  /**
   *  Returns a string representation of the error, formatted as "code:params:message".
   *  @returns {string} The error string.
   */
  toString: function ()
  {
    return this.code + ':' +
           this.params.join( ',' ) + ':' +
           this.message
    ;
  }
} )
;

/**
 *  Parses an error string into a Faye.Error object.
 *  @param {string} message - The error string to parse.
 *  @returns {Faye.Error} A new Faye.Error instance.
 */
Faye.Error.parse = function ( message )
{
  message = message || ''
  ;
  // If the message doesn't match the expected error format, return a generic error
  if ( !Faye.Grammar.ERROR.test( message ) ) return new this( null, [], message )
  ;

  var parts   = message.split( ':' ),
      code    = parseInt( parts[0] ),
      params  = parts[1].split( ',' ),
      message = parts[2]
  ;

  return new this( code, params, message )
  ;
}
;


// Define various static error methods for common Bayeux errors.
// Each returns the string representation of the error.

Faye.Error.versionMismatch = function ()
{
  return new this( 300, arguments, "Version mismatch" ).toString()
  ;
}
;

Faye.Error.conntypeMismatch = function ()
{
  return new this( 301, arguments, "Connection types not supported" ).toString()
  ;
}
;

Faye.Error.extMismatch = function ()
{
  return new this( 302, arguments, "Extension mismatch" ).toString()
  ;
}
;

Faye.Error.badRequest = function ()
{
  return new this( 400, arguments, "Bad request" ).toString()
  ;
}
;

Faye.Error.clientUnknown = function ()
{
  return new this( 401, arguments, "Unknown client" ).toString()
  ;
}
;

Faye.Error.parameterMissing = function ()
{
  return new this( 402, arguments, "Missing required parameter" ).toString()
  ;
}
;

Faye.Error.channelForbidden = function ()
{
  return new this( 403, arguments, "Forbidden channel" ).toString()
  ;
}
;

Faye.Error.channelUnknown = function ()
{
  return new this( 404, arguments, "Unknown channel" ).toString()
  ;
}
;

Faye.Error.channelInvalid = function ()
{
  return new this( 405, arguments, "Invalid channel" ).toString()
  ;
}
;

Faye.Error.extUnknown = function ()
{
  return new this( 406, arguments, "Unknown extension" ).toString()
  ;
}
;

Faye.Error.publishFailed = function ()
{
  return new this( 407, arguments, "Failed to publish" ).toString()
  ;
}
;

Faye.Error.serverError = function ()
{
  return new this( 500, arguments, "Internal server error" ).toString()
  ;
}
;


/**
 *  Faye.Deferrable mixin provides deferred execution capabilities (promises-like).
 */
Faye.Deferrable =
{
  /**
   *  Registers a success callback. If the deferred is already succeeded, it's called immediately.
   *  @param {function} callback - The function to call on success.
   *  @param {object} context - The `this` context for the callback.
   */
  callback: function ( callback, context )
  {
    if ( !callback ) return
    ;

    if ( this._deferredStatus === 'succeeded' )
      return callback.apply( context, this._deferredArgs )
    ;

    this._callbacks = this._callbacks || []
    ;
    this._callbacks.push( [ callback, context ] )
    ;
  },


  /**
   *  Sets a timeout for the deferred operation. If the timeout expires, the deferred fails.
   *  @param {number} seconds - The timeout duration in seconds.
   *  @param {string} message - The error message for timeout failure.
   */
  timeout: function ( seconds, message )
  {
    var _this = this
    ;
    var timer = Faye.ENV.setTimeout( function ()
    {
      _this.setDeferredStatus( 'failed', message )
      ;
    }, seconds * 1000 )
    ;
    this._timer = timer
    ;
  },


  /**
   *  Registers a failure callback. If the deferred is already failed, it's called immediately.
   *  @param {function} callback - The function to call on failure.
   *  @param {object} context - The `this` context for the callback.
   */
  errback: function ( callback, context )
  {
    if ( !callback ) return
    ;

    if ( this._deferredStatus === 'failed' )
      return callback.apply( context, this._deferredArgs )
    ;

    this._errbacks = this._errbacks || []
    ;
    this._errbacks.push( [ callback, context ] )
    ;
  },


  /**
   *  Sets the status of the deferred operation (succeeded or failed) and triggers appropriate callbacks.
   *  @param {string} status - 'succeeded' or 'failed'.
   *  @param {...*} args - Arguments to pass to the callbacks.
   */
  setDeferredStatus: function ()
  {
    if ( this._timer )
      Faye.ENV.clearTimeout( this._timer )
    ;

    var args   = Array.prototype.slice.call( arguments ),
        status = args.shift(),
        callbacks
    ;

    this._deferredStatus = status
    ;
    this._deferredArgs = args
    ;

    if ( status === 'succeeded' )
      callbacks = this._callbacks
    ;
    else if ( status === 'failed' )
      callbacks = this._errbacks
    ;

    if ( !callbacks ) return
    ;

    var callback
    ;
    while ( callback = callbacks.shift() )
      callback[0].apply( callback[1], this._deferredArgs )
    ;
  }
}
;


/**
 *  Faye.Publisher mixin provides event publishing and subscription capabilities.
 */
Faye.Publisher =
{
  /**
   *  Counts the number of listeners for a specific event type.
   *  @param {string} eventType - The type of event.
   *  @returns {number} The number of listeners.
   */
  countListeners: function ( eventType )
  {
    if ( !this._subscribers || !this._subscribers[ eventType ] ) return 0
    ;
    return this._subscribers[ eventType ].length
    ;
  },


  /**
   *  Binds a listener function to an event type.
   *  @param {string} eventType - The type of event.
   *  @param {function} listener - The function to call when the event is triggered.
   *  @param {object} context - The `this` context for the listener.
   */
  bind: function ( eventType, listener, context )
  {
    this._subscribers = this._subscribers || {}
    ;
    var list = this._subscribers[ eventType ] = this._subscribers[ eventType ] || []
    ;
    list.push( [ listener, context ] )
    ;
  },


  /**
   *  Unbinds a listener from an event type.
   *  If no listener is provided, all listeners for that event type are removed.
   *  @param {string} eventType - The type of event.
   *  @param {function} listener - The specific listener to remove (optional).
   *  @param {object} context - The specific context of the listener to remove (optional).
   */
  unbind: function ( eventType, listener, context )
  {
    if ( !this._subscribers || !this._subscribers[ eventType ] ) return
    ;

    if ( !listener )
    {
      delete this._subscribers[ eventType ]
      ;
      return
      ;
    }
    var list = this._subscribers[ eventType ],
        i    = list.length
    ;

    while ( i-- )
    {
      if ( listener !== list[ i ][0] ) continue
      ;
      if ( context && list[ i ][1] !== context ) continue
      ;
      list.splice( i,1 )
      ;
    }
  },


  /**
   *  Triggers an event, calling all bound listeners.
   *  @param {string} eventType - The type of event to trigger.
   *  @param {...*} args - Arguments to pass to the listeners.
   */
  trigger: function ()
  {
    var args = Array.prototype.slice.call( arguments ),
        eventType = args.shift()
    ;

    if ( !this._subscribers || !this._subscribers[ eventType ] ) return
    ;

    // Create a copy of the listeners array to prevent issues if listeners are removed during iteration
    var listeners = this._subscribers[ eventType ].slice(),
        listener
    ;

    for ( var i = 0, n = listeners.length; i < n; i++ )
    {
      listener = listeners[ i ]
      ;
      listener[0].apply( listener[1], args )
      ;
    }
  }
}
;


/**
 *  Faye.Timeouts mixin provides a mechanism for managing named timeouts.
 */
Faye.Timeouts =
{
  /**
   *  Adds a named timeout. If a timeout with the same name already exists, it's ignored.
   *  @param {string} name - The unique name for the timeout.
   *  @param {number} delay - The delay in seconds before the callback is executed.
   *  @param {function} callback - The function to execute when the timeout expires.
   *  @param {object} context - The `this` context for the callback.
   */
  addTimeout: function ( name, delay, callback, context )
  {
    this._timeouts = this._timeouts || {}
    ;
    if ( this._timeouts.hasOwnProperty( name ) ) return
    ; // Prevent duplicate timeouts with the same name
    var self = this
    ;
    this._timeouts[ name ] = Faye.ENV.setTimeout( function ()
    {
      delete self._timeouts[ name ]
      ; // Clear the timeout after execution
      callback.call( context )
      ;
    }, 1000 * delay )
    ; // Convert seconds to milliseconds
  },


  /**
   *  Removes a named timeout, preventing its callback from being executed.
   *  @param {string} name - The name of the timeout to remove.
   */
  removeTimeout: function ( name )
  {
    this._timeouts = this._timeouts || {}
    ;
    var timeout = this._timeouts[ name ]
    ;
    if ( !timeout ) return
    ;
    clearTimeout( timeout )
    ; // Clear the actual browser/Node.js timeout
    delete this._timeouts[ name ]
    ; // Remove from internal tracking
  }
}
;


/**
 *  Faye.Logging mixin provides structured logging capabilities with different levels.
 */
Faye.Logging =
{
  // Define log levels with numerical priority (lower number = higher priority to show)
  LOG_LEVELS:
  {
    error:  3,
    warn:   2,
    info:   1,
    debug:  0
  },

  // Default log level
  logLevel: 'error',

  /**
   *  Logs a message if its level is greater than or equal to the configured log level.
   *  @param {Array} messageArgs - An array-like object of message parts, where the first is a format string.
   *  @param {string} level - The log level ('error', 'warn', 'info', 'debug').
   */
  log: function ( messageArgs, level )
  {
    if ( !Faye.logger ) return
    ; // If no logger is configured, do nothing

    var levels = Faye.Logging.LOG_LEVELS
    ;
    // Check if the message's level is high enough to be displayed
    if ( levels[ Faye.Logging.logLevel ] > levels[ level ] ) return
    ;

    var messageArgs = Array.prototype.slice.apply( messageArgs ),
        banner = ' [' + level.toUpperCase() + '] [Faye', // Start banner with level and Faye
        klass  = this.className, // Attempt to get class name from instance

        // Format the message, replacing '?' with stringified arguments
        message = messageArgs.shift().replace( /\?/g, function ()
        {
          try
          {
            return Faye.toJSON( messageArgs.shift() )
            ;
          }
          catch ( e )
          {
            return '[Object]'
            ; // Fallback for objects that cannot be stringified
          }
        } )
    ;

    // Infer class name if not explicitly set
    for ( var key in Faye )
    {
      if ( klass ) continue
      ;
      if ( typeof Faye[ key ] !== 'function' ) continue
      ;
      if ( this instanceof Faye[ key ] ) klass = key
      ;
    }
    if ( klass ) banner += '.' + klass
    ; // Add class name to banner if found
    banner += '] '
    ;

    // Output the final formatted log message
    Faye.logger( Faye.timestamp() + banner + message )
    ;
  }
}
;

// Dynamically create logging methods (e.g., Faye.Logging.debug, Faye.Logging.info)
( function ()
{
  for ( var key in Faye.Logging.LOG_LEVELS )
    ( function ( level, value )
    {
      Faye.Logging[ level ] = function ()
      {
        this.log( arguments, level )
        ;
      }
      ;
    } )( key, Faye.Logging.LOG_LEVELS[ key ] )
  ;
} )()
;


/**
 *  Faye.Grammar defines regular expressions for validating Bayeux protocol elements.
 *  These are used for parsing and validation.
 */
Faye.Grammar =
{

  LOWALPHA:     /^[a-z]$/, // Lowercase alphabetic characters

  UPALPHA:     /^[A-Z]$/, // Uppercase alphabetic characters

  ALPHA:     /^([a-z]|[A-Z])$/, // Any alphabetic character

  DIGIT:     /^[0-9]$/, // Numeric digits

  ALPHANUM:     /^(([a-z]|[A-Z])|[0-9])$/, // Alphanumeric characters

  MARK:     /^(\-|\_|\!|\~|\(|\)|\$|\@)$/, // Special characters allowed in tokens

  STRING:     /^(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*$/, // General string pattern

  TOKEN:     /^(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+$/, // Token characters (alphanumeric + marks)

  INTEGER:     /^([0-9])+$/, // Integer numbers

  CHANNEL_SEGMENT:     /^(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+$/, // Single segment of a channel name

  CHANNEL_SEGMENTS:     /^(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*$/, // Multiple channel segments joined by '/'

  CHANNEL_NAME:     /^\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*$/, // Full channel name, starting with '/'

  WILD_CARD:     /^\*{1,2}$/, // Wildcard characters: '*' or '**'

  CHANNEL_PATTERN:     /^(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*\/\*{1,2}$/, // Channel pattern ending with a wildcard

  VERSION_ELEMENT:     /^(([a-z]|[A-Z])|[0-9])(((([a-z]|[A-Z])|[0-9])|\-|\_))*$/, // Single element of a version string

  VERSION:     /^([0-9])+(\.(([a-z]|[A-Z])|[0-9])(((([a-z]|[A-Z])|[0-9])|\-|\_))*)*$/, // Full version string (e.g., "1.0", "1.2.alpha-1")

  CLIENT_ID:     /^((([a-z]|[A-Z])|[0-9]))+$/, // Client ID format (alphanumeric)

  ID:     /^((([a-z]|[A-Z])|[0-9]))+$/, // General ID format (alphanumeric)

  // Custom error message format for parsing
  ERROR:     /^([0-9]{3}):(([^:]+,)*[^:]*):(.*)$/
}
;