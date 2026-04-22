"no use strict";
// This is a Type I clone generated to demonstrate whitespace and comment variations.
// The original code's functionality remains absolutely identical.

; ( function ( window ) { // Immediately invoked function expression wrapper
  // Check if window.window and window.document are already defined.
  // If they are, it means this script has already run or is in an environment
  // where these are preset, so we exit early.
  if ( typeof window.window != "undefined" && window.document ) {
    return ; // Exit function if already initialized or in a browser context.
  }

  /*
   * Initialize a basic console logging mechanism for environments
   * where `console` might not be fully available, like Web Workers.
   * Messages are sent via `postMessage`.
   */
  window.console = function ( ) {
    // Convert arguments object to a real array.
    var msgs = Array.prototype.slice.call( arguments , 0 ) ;
    // Post the message to the main thread or host environment.
    postMessage( { type : "log" , data : msgs } ) ;
  } ;

  /*
   * Alias various console methods to the main console function.
   * This ensures that `console.error`, `console.warn`, etc.,
   * all funnel through the same `postMessage` mechanism.
   */
  window.console.error =
    window.console.warn =
      window.console.log =
        window.console.trace = window.console ; // All point to the same handler.


  // Self-reference window global.
  window.window = window ;

  // Alias `ace` to `window` for global access.
  window.ace = window ;

  // Set up a global error handler.
  window.onerror = function ( message , file , line , col , err ) {
    // Log errors using the custom console.
    console.error( "Worker " + ( err ? err.stack : message ) ) ;
  } ;

  /**
   * Normalizes module paths, handling relative paths and bang (!) syntax.
   * @param {string} parentId - The ID of the parent module.
   * @param {string} moduleName - The name of the module to normalize.
   * @returns {string} The normalized module ID.
   */
  window.normalizeModule = function ( parentId , moduleName ) {
    // Handle '!' (bang) syntax for plugin-like modules.
    if ( moduleName.indexOf( "!" ) !== -1 ) {
      var chunks = moduleName.split( "!" ) ;
      return window.normalizeModule( parentId , chunks[ 0 ] ) + "!" + window.normalizeModule( parentId , chunks[ 1 ] ) ;
    }

    // Handle relative paths.
    if ( moduleName.charAt( 0 ) == "." ) {
      var base = parentId.split( "/" ).slice( 0 , -1 ).join( "/" ) ;
      moduleName = ( base ? base + "/" : "" ) + moduleName ;

      // Resolve '.' and '..' in paths.
      while ( moduleName.indexOf( "." ) !== -1 && previous != moduleName ) {
        var previous = moduleName ; // Keep track to detect infinite loops.
        moduleName = moduleName.replace( /^\.\// , "" ).replace( /\/\.\// , "/" ).replace( /[^\/]+\/\.\.\// , "" ) ;
      }
    }

    // Return the processed module name.
    return moduleName ;
  } ;

  // The main require function for loading modules.
  window.require = function ( parentId , id ) {
    // If only one argument, assume it's the id and parentId is null.
    if ( !id ) {
      id = parentId ;
      parentId = null ;
    }

    // Basic validation for the 'id' argument.
    if ( !id.charAt )
      throw new Error( "worker.js require() accepts only (parentId, id) as arguments" ) ;

    // Normalize the module ID.
    id = window.normalizeModule( parentId , id ) ;

    // Check if the module is already loaded.
    var module = window.require.modules[ id ] ;
    if ( module ) {
      // If found, ensure it's initialized.
      if ( !module.initialized ) {
        module.initialized = true ;
        module.exports = module.factory( ).exports ; // Execute factory to get exports.
      }
      return module.exports ; // Return existing exports.
    }

    // If not loaded, attempt to load it.
    var chunks = id.split( "/" ) ;
    if ( !window.require.tlns )
      return console.log( "unable to load " + id ) ; // Log error if top-level namespaces not set.

    // Resolve top-level namespace.
    chunks[ 0 ] = window.require.tlns[ chunks[ 0 ] ] || chunks[ 0 ] ;
    var path = chunks.join( "/" ) + ".js" ; // Construct the script path.

    window.require.id = id ; // Store current module ID for 'define' to use.
    importScripts( path ) ; // Load the script in the worker.
    return window.require( parentId , id ) ; // Recursively call require to get the now-loaded module.
  } ;

  // Storage for loaded modules.
  window.require.modules = { } ;

  // Storage for top-level namespaces.
  window.require.tlns = { } ;

  // The AMD-style define function.
  window.define = function ( id , deps , factory ) {
    // Handle overloaded function signatures.
    if ( arguments.length == 2 ) {
      factory = deps ;
      if ( typeof id != "string" ) {
        deps = id ;
        id = window.require.id ; // Use the ID from the current require call.
      }
    } else if ( arguments.length == 1 ) {
      factory = id ;
      deps = [ ] ;
      id = window.require.id ; // Use the ID from the current require call.
    }

    // Default dependencies if none provided.
    if ( !deps.length )
      deps = [ 'require' , 'exports' , 'module' ] ;

    // Skip 'text!' modules for now.
    if ( id.indexOf( "text!" ) === 0 )
      return ;

    // Local require function for the module's factory.
    var req = function ( childId ) {
      return window.require( id , childId ) ;
    } ;

    // Store the module definition.
    window.require.modules[ id ] = {
      exports : { } ,
      factory : function ( ) {
        var module = this ;
        // Execute the factory with resolved dependencies.
        var returnExports = factory.apply( this , deps.map( function ( dep ) {
          switch ( dep ) {
            case 'require' :
              return req ;
            case 'exports' :
              return module.exports ;
            case 'module' :
              return module ;
            default :
              return req( dep ) ;
          }
        } ) ) ;
        // If the factory returns a value, use it as exports.
        if ( returnExports )
          module.exports = returnExports ;
        return module ; // Return the module object.
      }
    } ;
  } ;

  // Mark as an AMD-compatible define.
  window.define.amd = { } ;

  // Function to set up base URLs for require.
  window.initBaseUrls = function initBaseUrls ( topLevelNamespaces ) {
    require.tlns = topLevelNamespaces ;
  } ;

  // Function to initialize the sender object for worker communication.
  window.initSender = function initSender ( ) {

    // Require necessary modules.
    var EventEmitter = window.require( "ace/lib/event_emitter" ).EventEmitter ;
    var oop = window.require( "ace/lib/oop" ) ;

    // Define the Sender constructor.
    var Sender = function ( ) {
    } ;

    // Implement methods on Sender's prototype.
    ( function ( ) {

      oop.implement( this , EventEmitter ) ; // Inherit from EventEmitter.

      // Method to send a callback response.
      this.callback = function ( data , callbackId ) {
        postMessage( {
          type : "call" ,
          id : callbackId ,
          data : data
        } ) ;
      } ;

      // Method to emit an event.
      this.emit = function ( name , data ) {
        postMessage( {
          type : "event" ,
          name : name ,
          data : data
        } ) ;
      } ;

    } ).call( Sender.prototype ) ; // Apply to Sender's prototype.

    return new Sender( ) ; // Return a new Sender instance.
  } ;

  // Global variables for the main worker logic and sender.
  var main = window.main = null ;
  var sender = window.sender = null ;

  // Main message handler for the Web Worker.
  window.onmessage = function ( e ) {
    var msg = e.data ; // Extract message data.

    // Handle commands.
    if ( msg.command ) {
      if ( main[ msg.command ] )
        main[ msg.command ].apply( main , msg.args ) ; // Call command method on main object.
      else
        throw new Error( "Unknown command:" + msg.command ) ; // Unknown command.
    }
    // Handle initialization.
    else if ( msg.init ) {
      initBaseUrls( msg.tlns ) ; // Set up base URLs.
      require( "ace/lib/es5-shim" ) ; // Load ES5 shims.
      sender = window.sender = initSender( ) ; // Initialize sender.
      var clazz = require( msg.module )[ msg.classname ] ; // Get the main class.
      main = window.main = new clazz( sender ) ; // Instantiate the main worker object.
    }
    // Handle events from the main thread.
    else if ( msg.event && sender ) {
      sender._signal( msg.event , msg.data ) ; // Signal event using sender's internal method.
    }
  } ;
} ) ( this ) ; // Pass 'this' (which is 'window' in a browser, or global scope in worker)

// ACE Module Definition: 'ace/mode/html_worker'
ace.define( 'ace/mode/html_worker' , [ 'require' , 'exports' , 'module' , 'ace/lib/oop' , 'ace/lib/lang' , 'ace/worker/mirror' , 'ace/mode/html/saxparser' ] , function ( require , exports , module ) {


  var oop = require( "../lib/oop" ) ; // Object-oriented programming utilities.
  var lang = require( "../lib/lang" ) ; // Language utilities.
  var Mirror = require( "../worker/mirror" ).Mirror ; // Mirror base class for workers.
  var SAXParser = require( "./html/saxparser" ).SAXParser ; // SAX parser for HTML.

  // Mapping of SAX parser error codes to ACE editor error types.
  var errorTypes = {
    "expected-doctype-but-got-start-tag" : "info" ,
    "expected-doctype-but-got-chars" : "info" ,
    "non-html-root" : "info" ,
  }

  // Worker constructor for HTML mode.
  var Worker = exports.Worker = function ( sender ) {
    Mirror.call( this , sender ) ; // Call parent constructor.
    this.setTimeout( 400 ) ; // Set update timeout.
    this.context = null ; // Initialize context.
  } ;

  oop.inherits( Worker , Mirror ) ; // Inherit from Mirror.

  // Worker prototype methods.
  ( function ( ) {

    // Set options for the worker.
    this.setOptions = function ( options ) {
      this.context = options.context ;
    } ;

    // Called when the document content is updated.
    this.onUpdate = function ( ) {
      var value = this.doc.getValue( ) ; // Get current document value.
      if ( !value )
        return ; // If no value, do nothing.

      var parser = new SAXParser( ) ; // Create a new SAX parser instance.
      var errors = [ ] ; // Array to store parsing errors.
      var noop = function ( ) {
      } ; // Empty function for content handlers.

      // Assign no-op content handlers as we are only interested in errors.
      parser.contentHandler = {
        startDocument : noop ,
        endDocument : noop ,
        startElement : noop ,
        endElement : noop ,
        characters : noop
      } ;

      // Error handler for the SAX parser.
      parser.errorHandler = {
        error : function ( message , location , code ) {
          // Push error details into the errors array.
          errors.push( {
            row : location.line ,
            column : location.column ,
            text : message ,
            type : errorTypes[ code ] || "error" // Map error code to type, default to "error".
          } ) ;
        }
      } ;

      // Parse the document, either as a fragment or a full document.
      if ( this.context )
        parser.parseFragment( value , this.context ) ;
      else
        parser.parse( value ) ;

      // Emit the collected errors to the sender.
      this.sender.emit( "error" , errors ) ;
    } ;

  } ).call( Worker.prototype ) ; // Apply methods to Worker's prototype.

} ) ; // End of ace.define for 'ace/mode/html_worker'

// ACE Module Definition: 'ace/lib/oop'
ace.define( 'ace/lib/oop' , [ 'require' , 'exports' , 'module' ] , function ( require , exports , module ) {


  // Function to establish prototypal inheritance.
  exports.inherits = function ( ctor , superCtor ) {
    ctor.super_ = superCtor ; // Store a reference to the super constructor.
    ctor.prototype = Object.create( superCtor.prototype , { // Create prototype chain.
      constructor : { // Define constructor property.
        value : ctor ,
        enumerable : false ,
        writable : true ,
        configurable : true
      }
    } ) ;
  } ;

  // Function to mix properties from one object into another.
  exports.mixin = function ( obj , mixin ) {
    for ( var key in mixin ) {
      obj[ key ] = mixin[ key ] ; // Copy each property.
    }
    return obj ;
  } ;

  // Function to implement mixin on a prototype.
  exports.implement = function ( proto , mixin ) {
    exports.mixin( proto , mixin ) ;
  } ;

} ) ; // End of ace.define for 'ace/lib/oop'

// ACE Module Definition: 'ace/lib/lang'
ace.define( 'ace/lib/lang' , [ 'require' , 'exports' , 'module' ] , function ( require , exports , module ) {


  // Get the last element of an array.
  exports.last = function ( a ) {
    return a[ a.length - 1 ] ;
  } ;

  // Reverse a string.
  exports.stringReverse = function ( string ) {
    return string.split( "" ).reverse( ).join( "" ) ;
  } ;

  // Repeat a string N times.
  exports.stringRepeat = function ( string , count ) {
    var result = '' ;
    while ( count > 0 ) {
      if ( count & 1 ) // If count is odd.
        result += string ;

      if ( count >>= 1 ) // Divide count by 2 (bit shift).
        string += string ; // Double the string.
    }
    return result ;
  } ;

  // Regular expressions for trimming whitespace.
  var trimBeginRegexp = /^\s\s*/ ;
  var trimEndRegexp = /\s\s*$/ ;

  // Trim whitespace from the beginning of a string.
  exports.stringTrimLeft = function ( string ) {
    return string.replace( trimBeginRegexp , '' ) ;
  } ;

  // Trim whitespace from the end of a string.
  exports.stringTrimRight = function ( string ) {
    return string.replace( trimEndRegexp , '' ) ;
  } ;

  // Create a shallow copy of an object.
  exports.copyObject = function ( obj ) {
    var copy = { } ;
    for ( var key in obj ) {
      copy[ key ] = obj[ key ] ;
    }
    return copy ;
  } ;

  // Create a shallow copy of an array, deeply copying nested objects.
  exports.copyArray = function ( array ) {
    var copy = [ ] ;
    for ( var i = 0 , l = array.length ; i < l ; i++ ) {
      if ( array[ i ] && typeof array[ i ] == "object" )
        copy[ i ] = this.copyObject( array[ i ] ) ; // Shallow copy nested objects.
      else
        copy[ i ] = array[ i ] ;
    }
    return copy ;
  } ;

  // Create a deep copy of an object.
  exports.deepCopy = function ( obj ) {
    if ( typeof obj !== "object" || !obj )
      return obj ; // Return primitives or null as is.

    var cons = obj.constructor ;
    if ( cons === RegExp )
      return obj ; // Don't deep copy RegExps.

    var copy = cons( ) ; // Create new object of same constructor.
    for ( var key in obj ) {
      if ( typeof obj[ key ] === "object" ) {
        copy[ key ] = exports.deepCopy( obj[ key ] ) ; // Recursively deep copy.
      } else {
        copy[ key ] = obj[ key ] ; // Copy primitive values directly.
      }
    }
    return copy ;
  } ;

  // Convert an array of strings to a map with values of 1.
  exports.arrayToMap = function ( arr ) {
    var map = { } ;
    for ( var i = 0 ; i < arr.length ; i++ ) {
      map[ arr[ i ] ] = 1 ;
    }
    return map ;

  } ;

  // Create an object with null prototype and given properties.
  exports.createMap = function ( props ) {
    var map = Object.create( null ) ; // Create object with no prototype.
    for ( var i in props ) {
      map[ i ] = props[ i ] ; // Assign properties.
    }
    return map ;
  } ;

  // Remove a specific value from an array.
  exports.arrayRemove = function ( array , value ) {
    for ( var i = 0 ; i <= array.length ; i++ ) {
      if ( value === array[ i ] ) {
        array.splice( i , 1 ) ; // Remove the element.
      }
    }
  } ;

  // Escape special characters in a string for use in a regular expression.
  exports.escapeRegExp = function ( str ) {
    return str.replace( /([.*+?^${}()|[\]\/\\])/g , '\\$1' ) ;
  } ;

  // Escape HTML entities in a string.
  exports.escapeHTML = function ( str ) {
    return str.replace( /&/g , "&#38;" ).replace( /"/g , "&#34;" ).replace( /'/g , "&#39;" ).replace( /</g , "&#60;" ) ;
  } ;

  // Get offsets and lengths of all matches for a regex in a string.
  exports.getMatchOffsets = function ( string , regExp ) {
    var matches = [ ] ;

    string.replace( regExp , function ( str ) {
      matches.push( {
        offset : arguments[ arguments.length - 2 ] , // The index of the match.
        length : str.length
      } ) ;
    } ) ;

    return matches ;
  } ;

  // Creates a deferred call function.
  exports.deferredCall = function ( fcn ) {

    var timer = null ;
    var callback = function ( ) {
      timer = null ;
      fcn( ) ; // Execute the original function.
    } ;

    // Schedule the call.
    var deferred = function ( timeout ) {
      deferred.cancel( ) ; // Cancel any existing scheduled call.
      timer = setTimeout( callback , timeout || 0 ) ; // Schedule a new call.
      return deferred ;
    } ;

    deferred.schedule = deferred ; // Alias schedule to deferred.

    // Immediately call the function.
    deferred.call = function ( ) {
      this.cancel( ) ;
      fcn( ) ;
      return deferred ;
    } ;

    // Cancel the scheduled call.
    deferred.cancel = function ( ) {
      clearTimeout( timer ) ;
      timer = null ;
      return deferred ;
    } ;

    // Check if a call is pending.
    deferred.isPending = function ( ) {
      return timer ;
    } ;

    return deferred ;
  } ;

  // Creates a delayed call function with a default timeout.
  exports.delayedCall = function ( fcn , defaultTimeout ) {
    var timer = null ;
    var callback = function ( ) {
      timer = null ;
      fcn( ) ; // Execute the original function.
    } ;

    var _self = function ( timeout ) {
      if ( timer == null )
        timer = setTimeout( callback , timeout || defaultTimeout ) ; // Schedule if not already scheduled.
    } ;

    // Delay or reschedule the call.
    _self.delay = function ( timeout ) {
      timer && clearTimeout( timer ) ; // Clear existing timer if any.
      timer = setTimeout( callback , timeout || defaultTimeout ) ; // Schedule new call.
    } ;
    _self.schedule = _self ; // Alias schedule to _self.

    // Immediately call the function.
    _self.call = function ( ) {
      this.cancel( ) ;
      fcn( ) ;
    } ;

    // Cancel the scheduled call.
    _self.cancel = function ( ) {
      timer && clearTimeout( timer ) ;
      timer = null ;
    } ;

    // Check if a call is pending.
    _self.isPending = function ( ) {
      return timer ;
    } ;

    return _self ;
  } ;
} ) ; // End of ace.define for 'ace/lib/lang'

// ACE Module Definition: 'ace/lib/es5-shim'
ace.define( 'ace/lib/es5-shim' , [ 'require' , 'exports' , 'module' ] , function ( require , exports , module ) {

  function Empty ( ) {
  } // Empty constructor for bind shim.

  // Implement Function.prototype.bind if not natively available.
  if ( !Function.prototype.bind ) {
    Function.prototype.bind = function bind ( that ) { // .length is 1
      var target = this ;
      if ( typeof target != "function" ) {
        throw new TypeError( "Function.prototype.bind called on incompatible " + target ) ;
      }
      var args = slice.call( arguments , 1 ) ; // For normal call.
      var bound = function ( ) {

        // Handle 'new' operator.
        if ( this instanceof bound ) {

          var result = target.apply(
            this ,
            args.concat( slice.call( arguments ) )
          ) ;
          if ( Object( result ) === result ) {
            return result ;
          }
          return this ;

        } else {
          // Handle regular function call.
          return target.apply(
            that ,
            args.concat( slice.call( arguments ) )
          ) ;

        }

      } ;
      // Set up prototype chain for bound function.
      if ( target.prototype ) {
        Empty.prototype = target.prototype ;
        bound.prototype = new Empty( ) ;
        Empty.prototype = null ;
      }
      return bound ;
    } ;
  }
  var call = Function.prototype.call ; // Reference to Function.prototype.call.
  var prototypeOfArray = Array.prototype ; // Reference to Array.prototype.
  var prototypeOfObject = Object.prototype ; // Reference to Object.prototype.
  var slice = prototypeOfArray.slice ; // Reference to Array.prototype.slice.
  var _toString = call.bind( prototypeOfObject.toString ) ; // Bound toString for objects.
  var owns = call.bind( prototypeOfObject.hasOwnProperty ) ; // Bound hasOwnProperty for objects.
} ) ; // End of ace.define for 'ace/lib/es5-shim'