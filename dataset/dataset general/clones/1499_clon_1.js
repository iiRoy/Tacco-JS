/*  Socket.IO.js build:0.9.3, development.
 *  Copyright (c) 2011 LearnBoost <dev@learnboost.com>
 *  MIT Licensed
 */

/*
 *  socket.io library core.
 *  Copyright (c) 2011 LearnBoost <dev@learnboost.com>
 *  MIT Licensed
 */

( function( exports, global ) {

  /*
   *  The main IO namespace for Socket.IO functionality.
   *
   *  @namespace
   */

 var io = exports; // Assign exports to io for public API

  /**
   *  Current Socket.IO version string.
   *
   *  @api public
   */

 io.version = '0.9.3';

  /*
   *  The protocol version that is currently implemented.
   *
   *  @api public
   */

 io.protocol = 1;

  /*
   *  List of available transports; these will be dynamically populated
   *  as transports become available. Initially an empty array.
   *
   *  @api public
   */

 io.transports = [];

  /*
   *  Internal array to keep track of JSONP callback functions.
   *
   *  @api private
   */

 io.j = [];

  /*
   *  A collection of active io.Socket instances, keyed by their unique URI.
   *
   *  @api private
   */

 io.sockets = {};


  /*
   *  Establishes and manages connections to various hosts.
   *
   *  @param {String} uri - The URI of the host to connect to.
   *  @Param {Boolean} force creation of new socket - If true, forces a new socket
   *                                                 connection instead of reusing existing.
   *                                                 Defaults to false.
   *  @api public
   */

 io.connect = function ( host , details ) {
  var uri = io.util.parseUri( host )
   , uuri // Unique URI identifier
   , socket ; // The socket instance

  // If running in a browser-like environment, fill in missing URI parts
  if ( global && global.location ) {
   uri.protocol = uri.protocol || global.location.protocol.slice( 0, -1 );
   uri.host     = uri.host || ( global.document
                                ? global.document.domain
                                : global.location.hostname );
   uri.port     = uri.port || global.location.port;
  }

  uuri = io.util.uniqueUri( uri ); // Generate a unique URI string

  // Prepare connection options
  var options = {
   host   : uri.host
   , secure : 'https' == uri.protocol // Check if connection should be secure
   , port   : uri.port || ( 'https' == uri.protocol ? 443 : 80 ) // Default ports
   , query  : uri.query || ''
  };

  // Merge additional details into the options object
  io.util.merge( options, details );

  // Create a new socket if forced, or if no existing socket for this URI
  if ( options['force new connection'] || !io.sockets[uuri] ) {
   socket = new io.Socket( options );
  }

  // If not forcing a new connection and a socket was just created, store it
  if ( !options['force new connection'] && socket ) {
   io.sockets[uuri] = socket;
  }

  // Use the newly created socket or retrieve an existing one
  socket = socket || io.sockets[uuri];

  // Return a namespaced socket instance. If path is not root, use it.
  return socket.of( uri.path.length > 1 ? uri.path : '' );
 };

} ( 'object' === typeof module ? module.exports : ( this.io = {} ), this ) );

/*
 *  socket.io-util
 *  Copyright (c) 2011 LearnBoost <dev@learnboost.com>
 *  MIT Licensed
 */

( function( exports, global ) {

  /*
   *  Utilities namespace for common helper functions.
   *
   *  @namespace
   */

  var util = exports.util = {};

  /*
   *  Parses a given URI string into its components.
   *
   *  @author Steven Levithan <stevenlevithan.com> (MIT license)
   *  @api public
   */

  var re = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

  var parts = [ 'source', 'protocol', 'authority', 'userInfo', 'user', 'password',
                'host', 'port', 'relative', 'path', 'directory', 'file', 'query',
                'anchor' ];

  util.parseUri = function ( str ) {
    var m = re.exec( str || '' )
      , uri = {}
      , i = 14;

    while ( i-- ) {
      uri[ parts[i] ] = m[i] || '';
    }

    return uri;
  };

  /*
   *  Generates a canonical unique URL string to identify a Socket.IO connection.
   *
   *  @param {Object} uri - The parsed URI object.
   *  @api public
   */

  util.uniqueUri = function ( uri ) {
    var protocol = uri.protocol
      , host = uri.host
      , port = uri.port;

    if ( 'document' in global ) {
      host = host || document.domain;
      // Handle https port defaults and document location protocol differences
      port = port || ( protocol == 'https'
                       && document.location.protocol !== 'https:' ? 443 : document.location.port );
    } else {
      host = host || 'localhost';

      if ( !port && protocol == 'https' ) {
        port = 443;
      }
    }

    return ( protocol || 'http' ) + '://' + host + ':' + ( port || 80 );
  };

  /*
   *  Merges two query strings into a single, unique query string.
   *  Duplicate parameters in the `addition` string will overwrite those in `base`.
   *
   *  @param {String} base - The base query string.
   *  @param {String} addition - The query string to merge in.
   *  @api public
   */

  util.query = function ( base, addition ) {
    var query = util.chunkQuery( base || '' )
      , components = [];

    util.merge( query, util.chunkQuery( addition || '' ) );
    for ( var part in query ) {
      if ( query.hasOwnProperty( part ) ) {
        components.push( part + '=' + query[part] );
      }
    }

    return components.length ? '?' + components.join( '&' ) : '';
  };

  /*
   *  Transforms a query string into an object of key-value pairs.
   *
   *  @param {String} qs - The query string to parse.
   *  @api public
   */

  util.chunkQuery = function ( qs ) {
    var query = {}
      , params = qs.split( '&' )
      , i = 0
      , l = params.length
      , kv;

    for ( ; i < l; ++i ) {
      kv = params[i].split( '=' );
      if ( kv[0] ) {
        query[ kv[0] ] = kv[1];
      }
    }

    return query;
  };

  /*
   *  Executes the provided function once the page has fully loaded.
   *
   *  Example:
   *      io.util.load( function () { console.log( 'page loaded' ); } );
   *
   *  @param {Function} fn - The function to execute on load.
   *  @api public
   */

  var pageLoaded = false;

  util.load = function ( fn ) {
    if ( 'document' in global && document.readyState === 'complete' || pageLoaded ) {
      return fn();
    }

    util.on( global, 'load', fn, false );
  };

  /*
   *  Attaches an event handler to an element, cross-browser compatible.
   *
   *  @param {Object} element - The DOM element or object to attach the event to.
   *  @param {String} event - The name of the event (e.g., 'load', 'click').
   *  @param {Function} fn - The event handler function.
   *  @param {Boolean} capture - Whether to use event capturing (defaults to false).
   *  @api private
   */

  util.on = function ( element, event, fn, capture ) {
    if ( element.attachEvent ) {
      element.attachEvent( 'on' + event, fn );
    } else if ( element.addEventListener ) {
      element.addEventListener( event, fn, capture );
    }
  };

  /*
   *  Generates the appropriate `XMLHttpRequest` object, considering
   *  regular and cross-domain requests.
   *
   *  @param {Boolean} [xdomain] - If true, attempts to create a cross-domain request.
   *  @returns {XMLHttpRequest|false|null} - An XMLHttpRequest object, or null if not available.
   *  @api private
   */

  util.request = function ( xdomain ) {

    if ( xdomain && 'undefined' != typeof XDomainRequest ) {
      return new XDomainRequest();
    }

    if ( 'undefined' != typeof XMLHttpRequest && ( !xdomain || util.ua.hasCORS ) ) {
      return new XMLHttpRequest();
    }

    if ( !xdomain ) {
      try {
        return new window[( [ 'Active' ].concat( 'Object' ).join( 'X' ) )]( 'Microsoft.XMLHTTP' );
      } catch ( e ) { }
    }

    return null;
  };

  /*
   *  Note: This is a placeholder comment. The actual XHR based transport constructor
   *  would typically follow here in a complete file.
   *
   *  @constructor
   *  @api public
   */

  /*
   *  Updates the internal `pageLoaded` flag.
   */

  if ( 'undefined' != typeof window ) {
    util.load( function () {
      pageLoaded = true;
    } );
  }

  /*
   *  Defers the execution of a function to prevent the browser from
   *  displaying a spinner, especially on Webkit.
   *
   *  @param {Function} fn - The function to defer.
   *  @api public
   */

  util.defer = function ( fn ) {
    if ( !util.ua.webkit || 'undefined' != typeof importScripts ) {
      return fn();
    }

    util.load( function () {
      setTimeout( fn, 100 );
    } );
  };

  /*
   *  Recursively merges properties from one object into another.
   *
   *  @param {Object} target - The object to merge into.
   *  @param {Object} additional - The object whose properties will be merged.
   *  @param {Number} [deep=2] - The depth of recursion for merging.
   *  @param {Array} [lastseen] - Internal tracking for circular references.
   *  @api public
   */

  util.merge = function merge ( target, additional, deep, lastseen ) {
    var seen = lastseen || []
      , depth = typeof deep == 'undefined' ? 2 : deep
      , prop;

    for ( prop in additional ) {
      if ( additional.hasOwnProperty( prop ) && util.indexOf( seen, prop ) < 0 ) {
        if ( typeof target[prop] !== 'object' || !depth ) {
          target[prop] = additional[prop];
          seen.push( additional[prop] );
        } else {
          util.merge( target[prop], additional[prop], depth - 1, seen );
        }
      }
    }

    return target;
  };

  /*
   *  Merges prototype properties from one constructor to another.
   *
   *  @param {Function} ctor - The constructor to receive properties.
   *  @param {Function} ctor2 - The constructor to provide properties.
   *  @api public
   */

  util.mixin = function ( ctor, ctor2 ) {
    util.merge( ctor.prototype, ctor2.prototype );
  };

  /*
   *  Provides a shortcut for prototypical and static inheritance.
   *
   *  @param {Function} ctor - The child constructor.
   *  @param {Function} ctor2 - The parent constructor.
   *  @api private
   */

  util.inherit = function ( ctor, ctor2 ) {
    function f() {} // Intermediate constructor for inheritance
    f.prototype = ctor2.prototype;
    ctor.prototype = new f;
  };

  /*
   *  Checks if the given object is an Array.
   *
   *  Examples:
   *      io.util.isArray( [] ); // true
   *      io.util.isArray( {} ); // false
   *
   *  @param {Object} obj - The object to check.
   *  @api public
   */

  util.isArray = Array.isArray || function ( obj ) {
    return Object.prototype.toString.call( obj ) === '[object Array]';
  };

  /*
   *  Finds the intersection of values between two arrays, returning a new array
   *  containing only the common elements.
   *
   *  @param {Array} arr - The first array.
   *  @param {Array} arr2 - The second array.
   *  @returns {Array} - An array containing common elements.
   *  @api public
   */

  util.intersect = function ( arr, arr2 ) {
    var ret = []
      , longest = arr.length > arr2.length ? arr : arr2
      , shortest = arr.length > arr2.length ? arr2 : arr;

    for ( var i = 0, l = shortest.length; i < l; i++ ) {
      if ( ~util.indexOf( longest, shortest[i] ) ) { // Using bitwise NOT for indexOf check
        ret.push( shortest[i] );
      }
    }

    return ret;
  }

  /*
   *  Provides cross-browser `Array.prototype.indexOf` compatibility.
   *
   *  @see bit.ly/a5Dxa2
   *  @api public
   */

  util.indexOf = function ( arr, o, i ) {

    for ( var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0;
          i < j && arr[i] !== o; i++ ) {}

    return j <= i ? -1 : i;
  };

  /*
   *  Converts an enumerable object (like `arguments` or NodeList) into a true Array.
   *
   *  @param {Object} enu - The enumerable object to convert.
   *  @api public
   */

  util.toArray = function ( enu ) {
    var arr = [];

    for ( var i = 0, l = enu.length; i < l; i++ ) {
      arr.push( enu[i] );
    }

    return arr;
  };

  /*
   *  User Agent / browser engine detection namespace.
   *
   *  @namespace
   */

  util.ua = {};

  /*
   *  Determines if the current User Agent supports CORS for XMLHttpRequest.
   *
   *  @api public
   */

  util.ua.hasCORS = 'undefined' != typeof XMLHttpRequest && ( function () {
    try {
      var a = new XMLHttpRequest();
    } catch ( e ) {
      return false;
    }

    return a.withCredentials != undefined;
  } )();

  /*
   *  Detects if the current User Agent is Webkit based.
   *
   *  @api public
   */

  util.ua.webkit = 'undefined' != typeof navigator
    && /webkit/i.test( navigator.userAgent );

} ( 'undefined' != typeof io ? io : module.exports, this ) );

/*
 *  socket.io - EventEmitter
 *  Copyright (c) 2011 LearnBoost <dev@learnboost.com>
 *  MIT Licensed
 */

( function ( exports, io ) {

  /*
   *  Expose the EventEmitter constructor for public use.
   */

  exports.EventEmitter = EventEmitter;

  /*
   *  Event emitter base constructor. Provides basic eventing capabilities.
   *
   *  @constructor
   *  @api public.
   */

  function EventEmitter () {}

  /*
   *  Adds a listener function for the specified event `name`.
   *
   *  @param {String} name - The name of the event to listen for.
   *  @param {Function} fn - The callback function to execute when the event is emitted.
   *  @returns {EventEmitter} - Returns `this` for chaining.
   *  @api public
   */

  EventEmitter.prototype.on = function ( name, fn ) {
    // Initialize event storage if it doesn't exist
    if ( !this.$events ) {
      this.$events = {};
    }

    // Store the listener
    if ( !this.$events[name] ) {
      this.$events[name] = fn; // First listener for this event
    } else if ( io.util.isArray( this.$events[name] ) ) {
      this.$events[name].push( fn ); // Add to existing array of listeners
    } else {
      // Convert single listener to an array if a second one is added
      this.$events[name] = [ this.$events[name], fn ];
    }

    return this; // Allow method chaining
  };