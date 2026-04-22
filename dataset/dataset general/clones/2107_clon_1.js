/*
 * This is a Type I clone generated from the original source code.
 * It maintains exact logical and structural identity to the original.
 * Differences are solely in whitespace, including indentation, line breaks,
 * and spacing, as well as the addition, removal, or modification of comments.
 * The core functionality and variable names remain absolutely identical.
 * This file aims to demonstrate extensive visual rearrangement without
 * altering the underlying JavaScript semantics.
 */

// Define 'core_require' to store the original 'require' function.
// This is done to prevent conflicts and allow the module system
// to override the global 'require' safely within its scope.
var core_require = require;



// The primary 'require' function definition.
// This function is responsible for resolving and loading modules
// within the custom module system. It mimics Node.js's 'require' behavior.
var require = function ( file , cwd ) {

  // Resolve the module path based on the file name and current working directory.
  // If 'cwd' is not provided, it defaults to the root directory '/'.
  var resolved = require.resolve ( file , cwd || '/' );

  // Retrieve the module definition from the internal 'modules' cache.
  var mod      = require.modules [ resolved ];

  // If the module is not found after resolution, throw an error.
  if ( ! mod ) {
    throw new Error (
      'Failed to resolve module ' + file + ', tried ' + resolved
    );
  }

  // Check if the module has already been cached.
  // If it has, return the cached export; otherwise, execute the module function
  // to get its exports and potentially cache them.
  var res = mod._cached ? mod._cached : mod ( ) ;

  // Return the resolved module exports.
  return res ;

}



// Initialize internal properties of the 'require' function.

// 'paths' is an array that could potentially be used for module search paths,
// though it's often left empty or managed internally by the resolver logic.
require.paths    =    [ ] ;

// 'modules' is an object acting as a cache for all defined modules.
// Keys are resolved module paths, values are module functions or their exports.
require.modules  =    { } ;

// 'extensions' specifies file extensions that 'require' should try
// when resolving modules without an explicit extension.
require.extensions = [ ".js" , ".coffee" ] ;



/*
 * Defines a set of core Node.js modules that are considered "built-in"
 * or handled specially by this module system.
 * These modules typically do not need path resolution and are directly
 * mapped to their names.
 */
require._core = {
  'assert' : true ,
  'events' : true ,
  'fs'     : true ,
  'path'   : true ,
  'vm'     : true
};



// The 'resolve' function is responsible for determining the full path
// to a module given its name and a current working directory.
require.resolve = ( function ( ) {

  /*
   * This inner function performs the actual resolution logic.
   * It handles various module resolution patterns: core modules,
   * absolute/relative paths, and 'node_modules' lookups.
   */
  return function ( x , cwd ) {

    // If no 'cwd' is provided, default to the root directory.
    if ( ! cwd )
      cwd = '/' ;

    // First, check if the module is a recognized core module.
    // If it is, return its name directly as it doesn't require further path resolution.
    if ( require._core [ x ] )
      return x ;

    // Load the 'path' module dynamically, as it's needed for path manipulation.
    // This assumes 'path' itself is defined in 'require.modules'.
    var path = require.modules.path ( ) ;

    // Resolve the current working directory to an absolute path.
    cwd = path.resolve ( '/' , cwd ) ;

    // Initialize 'y' with the current working directory or the root.
    var y = cwd || '/' ;


    /*
     * Check if the module path 'x' starts with a relative or absolute indicator.
     * (e.g., './', '../', '/')
     * If so, it's treated as a file or directory path relative to 'y'.
     */
    if ( x.match ( /^(?:\.\.?\/|\/)/ ) ) {

      // Attempt to load 'x' as a file, then as a directory.
      var m = loadAsFileSync ( path.resolve ( y , x ) )
        || loadAsDirectorySync ( path.resolve ( y , x ) ) ;

      // If a module is found, return its resolved path.
      if ( m )
        return m ;

    }


    // If not resolved by absolute/relative paths, try loading from 'node_modules'.
    var n = loadNodeModulesSync ( x , y ) ;

    // If found in 'node_modules', return its path.
    if ( n )
      return n ;


    // If no resolution method succeeded, throw an error indicating the module wasn't found.
    throw new Error ( "Cannot find module '" + x + "'" ) ;


    /*
     * Helper function: Attempts to load a module as a file.
     * It checks for an exact match in 'require.modules' and then
     * tries appending known extensions.
     */
    function loadAsFileSync ( x ) {

      // Check for an exact match of 'x' in the modules cache.
      if ( require.modules [ x ] ) {
        return x ;
      }

      // Iterate through registered extensions to find a matching file.
      for ( var i = 0 ; i < require.extensions.length ; i ++ ) {

        var ext = require.extensions [ i ] ;

        // If 'x' with the current extension exists, return its path.
        if ( require.modules [ x + ext ] )
          return x + ext ;

      }

    }


    /*
     * Helper function: Attempts to load a module as a directory.
     * This involves looking for 'package.json' with 'main' or 'browserify' fields,
     * or a default 'index.js' (or 'index' + extension) file.
     */
    function loadAsDirectorySync ( x ) {

      // Remove trailing slashes from the path for consistent processing.
      x = x.replace ( /\/+$/ , '' ) ;

      // Construct the path to 'package.json' within the directory.
      var pkgfile = x + '/package.json' ;

      // If a 'package.json' file exists for this directory.
      if ( require.modules [ pkgfile ] ) {

        // Load and parse the package.json content.
        var pkg = require.modules [ pkgfile ] ( ) ;

        // Get the 'browserify' field, which takes precedence in browser environments.
        var b = pkg.browserify ;

        // If 'browserify' is an object and specifies a 'main' field.
        if ( typeof b === 'object' && b.main ) {

          // Resolve the main file relative to the directory.
          var m = loadAsFileSync ( path.resolve ( x , b.main ) ) ;

          // If found, return its path.
          if ( m )
            return m ;

        }
        // If 'browserify' is a string, it directly specifies the main file.
        else if ( typeof b === 'string' ) {

          // Resolve the main file relative to the directory.
          var m = loadAsFileSync ( path.resolve ( x , b ) ) ;

          // If found, return its path.
          if ( m )
            return m ;

        }
        // If 'browserify' isn't used or doesn't resolve, try the standard 'main' field.
        else if ( pkg.main ) {

          // Resolve the main file relative to the directory.
          var m = loadAsFileSync ( path.resolve ( x , pkg.main ) ) ;

          // If found, return its path.
          if ( m )
            return m ;

        }

      }

      // If no 'package.json' or its fields led to a module,
      // try loading 'index' (e.g., 'index.js') inside the directory.
      return loadAsFileSync ( x + '/index' ) ;

    }


    /*
     * Helper function: Attempts to load a module from 'node_modules' directories.
     * It searches up the directory tree from the 'start' path.
     */
    function loadNodeModulesSync ( x , start ) {

      // Get a list of potential 'node_modules' paths to search.
      var dirs = nodeModulesPathsSync ( start ) ;

      // Iterate through each 'node_modules' directory.
      for ( var i = 0 ; i < dirs.length ; i ++ ) {

        var dir = dirs [ i ] ;

        // Try loading 'x' as a file directly within the 'node_modules' directory.
        var m = loadAsFileSync ( dir + '/' + x ) ;

        // If found, return its path.
        if ( m )
          return m ;

        // If not found as a file, try loading 'x' as a directory within 'node_modules'.
        var n = loadAsDirectorySync ( dir + '/' + x ) ;

        // If found, return its path.
        if ( n )
          return n ;

      }

      // As a fallback, try to load 'x' directly as a file without any path prefix.
      // This might catch cases where a module is globally available or a very short alias.
      var m = loadAsFileSync ( x ) ;

      // If found, return its path.
      if ( m )
        return m ;

    }


    /*
     * Helper function: Generates a list of 'node_modules' directories
     * by traversing up the directory tree from the 'start' path.
     */
    function nodeModulesPathsSync ( start ) {

      var parts ;

      // Handle the root directory as a special case.
      if ( start === '/' )
        parts = [ '' ] ;
      else
        // Normalize the path and split it into segments.
        parts = path.normalize ( start ).split ( '/' ) ;

      var dirs = [ ] ;

      // Iterate backwards from the current directory up to the root.
      for ( var i = parts.length - 1 ; i >= 0 ; i -- ) {

        // Skip 'node_modules' segments themselves when constructing paths.
        if ( parts [ i ] === 'node_modules' )
          continue ;

        // Construct the 'node_modules' path for the current level.
        var dir = parts.slice ( 0 , i + 1 ).join ( '/' ) + '/node_modules' ;

        // Add the constructed path to the list.
        dirs.push ( dir ) ;

      }

      // Return the array of potential 'node_modules' directories.
      return dirs ;

    }

  } ;

} ) ( ) ;



// The 'alias' function allows mapping one module path to another.
// This is useful for providing alternative implementations or renaming modules.
require.alias = function ( from , to ) {

  // Load the 'path' module for path manipulation.
  var path = require.modules.path ( ) ;

  var res = null ;

  // Attempt to resolve the 'from' module, first checking for a 'package.json'
  // to get the base directory of a package.
  try {
    res = require.resolve ( from + '/package.json' , '/' ) ;
  }
  // If resolving 'package.json' fails, try resolving the module directly.
  catch ( err ) {
    res = require.resolve ( from , '/' ) ;
  }

  // Determine the base directory of the resolved 'from' module.
  var basedir = path.dirname ( res ) ;


  // Get the keys (module paths) from 'require.modules'.
  // Provides a fallback for `Object.keys` if not available (e.g., older environments).
  var keys = ( Object.keys || function ( obj ) {

    var res = [ ] ;

    for ( var key in obj )
      res.push ( key ) ;

    return res ;

  } ) ( require.modules ) ;


  // Iterate through all existing modules.
  for ( var i = 0 ; i < keys.length ; i ++ ) {

    var key = keys [ i ] ;

    // If the module key starts with the 'basedir' of the 'from' module,
    // it means it's a file within that module's directory.
    if ( key.slice ( 0 , basedir.length + 1 ) === basedir + '/' ) {

      // Extract the relative file path from the 'basedir'.
      var f = key.slice ( basedir.length ) ;

      // Create an alias by mapping the original module to the 'to' path + relative file path.
      require.modules [ to + f ] = require.modules [ basedir + f ] ;

    }
    // If the module key is exactly the 'basedir', it means it's the main module itself.
    else if ( key === basedir ) {

      // Create an alias for the main module.
      require.modules [ to ] = require.modules [ basedir ] ;

    }

  }

} ;



// The 'define' function is used to register a module with the system.
// It takes a filename (module ID) and a factory function for the module.
require.define = function ( filename , fn ) {

  // Determine the dirname for the module.
  // Core modules have an empty dirname. For others, use the path module.
  var dirname = require._core [ filename ]
    ? ''
    : require.modules.path ( ) . dirname ( filename )
  ;


  // Create a module-specific 'require' function.
  // This 'require_' function will resolve modules relative to the current module's 'dirname'.
  var require_ = function ( file ) {
    return require ( file , dirname ) ;
  } ;

  // Add a 'resolve' method to the module-specific 'require_' function.
  require_.resolve = function ( name ) {
    return require.resolve ( name , dirname ) ;
  } ;

  // Expose the global 'modules' object and 'define' function to the module-specific 'require_'.
  require_.modules = require.modules ;
  require_.define  = require.define  ;

  // Initialize a 'module_' object with an 'exports' property,
  // which will hold the module's public interface.
  var module_ = { exports : { } } ;


  // Store the module factory function in 'require.modules' under its 'filename'.
  // This factory function will be executed the first time the module is required.
  require.modules [ filename ] = function ( ) {

    // Cache the module's exports before calling the factory function.
    // This handles circular dependencies by providing an empty object initially.
    require.modules [ filename ] . _cached = module_.exports ;

    // Execute the module's factory function.
    // It is called with Node.js-style parameters: require, module, exports, __dirname, __filename.
    fn.call (
      module_.exports ,
      require_ ,
      module_ ,
      module_.exports ,
      dirname ,
      filename
    ) ;

    // After the factory function executes, update the cached exports.
    // This ensures that any modifications to 'module_.exports' within the factory
    // are preserved for subsequent 'require' calls.
    require.modules [ filename ] . _cached = module_.exports ;

    // Return the final exports of the module.
    return module_.exports ;

  } ;

} ;



// Polyfill for 'process' object in browser environments.
// If 'process' is undefined, initialize it as an empty object.
if ( typeof process === 'undefined' )
  process = { } ;


// Polyfill for 'process.nextTick' for asynchronous execution.
// It uses 'window.postMessage' for efficiency in browsers, falling back to 'setTimeout(fn, 0)'.
if ( ! process.nextTick ) {
  process.nextTick = ( function ( ) {

    // Queue to hold functions to be executed in the next tick.
    var queue = [ ] ;

    // Check if 'window.postMessage' and 'window.addEventListener' are available,
    // which are preferred for efficient microtask scheduling in browsers.
    var canPost = typeof window !== 'undefined'
      && window.postMessage && window.addEventListener
    ;


    // If 'postMessage' is available, set up an event listener.
    if ( canPost ) {
      window.addEventListener ( 'message' , function ( ev ) {

        // Only process messages originating from the same window with a specific data payload.
        if ( ev.source === window && ev.data === 'browserify-tick' ) {

          // Prevent default browser actions for this message.
          ev.stopPropagation ( ) ;

          // If there are functions in the queue, execute the first one.
          if ( queue.length > 0 ) {
            var fn = queue.shift ( ) ;
            fn ( ) ;
          }

        }

      } , true ) ; // Use 'true' for capture phase to ensure it's handled early.
    }


    // Return the 'nextTick' function itself.
    return function ( fn ) {

      // If 'postMessage' is available, add the function to the queue and send a message.
      if ( canPost ) {
        queue.push ( fn ) ;
        window.postMessage ( 'browserify-tick' , '*' ) ;
      }
      // Otherwise, fall back to 'setTimeout' with a delay of 0.
      else {
        setTimeout ( fn , 0 ) ;
      }

    } ;

  } ) ( ) ; // Immediately invoke the function to set up 'process.nextTick'.
}


// Polyfill for 'process.title'.
// Sets a default title for browser environments.
if ( ! process.title )
  process.title = 'browser' ;


// Polyfill for 'process.binding'.
// In a browser, this typically only supports 'evals' (mapping to 'vm' module).
if ( ! process.binding ) {
  process.binding = function ( name ) {
    if ( name === 'evals' )
      return require ( 'vm' ) ;
    else
      throw new Error ( 'No such module' ) ;
  } ;
}


// Polyfill for 'process.cwd' (current working directory).
// In a browser, this typically returns a placeholder.
if ( ! process.cwd ) {
  process.cwd = function ( ) {
    return '.' ;
  } ;
}


// Polyfill for 'process.env' (environment variables).
// Initializes as an empty object in browsers.
if ( ! process.env )
  process.env = { } ;

// Polyfill for 'process.argv' (command-line arguments).
// Initializes as an empty array in browsers.
if ( ! process.argv )
  process.argv = [ ] ;



/*
 * Defines the 'path' module, which provides utilities for working with file and directory paths.
 * This implementation is a POSIX-like path module for browser environments.
 */
require.define ( "path" , function ( require , module , exports , __dirname , __filename ) {

  /*
   * Helper function to filter elements from an array based on a predicate function.
   * Similar to Array.prototype.filter but implemented manually.
   */
  function filter ( xs , fn ) {

    var res = [ ] ;

    for ( var i = 0 ; i < xs.length ; i ++ ) {
      if ( fn ( xs [ i ] , i , xs ) )
        res.push ( xs [ i ] ) ;
    }

    return res ;

  }

  /*
   * Helper function: normalizes an array of path parts.
   * It handles '.' and '..' segments, removing them or collapsing them as appropriate.
   * `allowAboveRoot` determines if '..' segments can go above the logical root.
   */
  function normalizeArray ( parts , allowAboveRoot ) {

    // `up` tracks how many '..' segments need to be resolved.
    var up = 0 ;

    // Iterate backwards through the path parts.
    for ( var i = parts.length - 1 ; i >= 0 ; i -- ) {

      var last = parts [ i ] ;

      // If the part is '.', remove it.
      if ( last == '.' ) {
        parts.splice ( i , 1 ) ;
      }
      // If the part is '..', remove it and increment 'up'.
      else if ( last === '..' ) {
        parts.splice ( i , 1 ) ;
        up ++ ;
      }
      // If 'up' is greater than 0, it means the current part is consumed by a '..'.
      else if ( up ) {
        parts.splice ( i , 1 ) ;
        up -- ;
      }

    }

    // If 'allowAboveRoot' is true, and there are remaining '..' segments,
    // prepend them back to the array.
    if ( allowAboveRoot ) {
      for ( ; up -- ; up ) {
        parts.unshift ( '..' ) ;
      }
    }

    return parts ;

  }

  // Regular expression to split a filename into its components:
  // [ full_match, dir, basename, ext ]
  // This is the POSIX version.
  var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/ ;


  /*
   * `path.resolve([from ...], to)`
   * Resolves a sequence of paths or path segments into an absolute path.
   * This is the POSIX version.
   */
  exports.resolve = function ( ) {

    var resolvedPath = '' ,
      resolvedAbsolute = false ;

    // Iterate backwards through the arguments, starting from the last path segment.
    for ( var i = arguments.length - 1 ; i >= -1 && ! resolvedAbsolute ; i -- ) {

      // Get the current path segment, or `process.cwd()` if no more arguments.
      var path = ( i >= 0 )
        ? arguments [ i ]
        : process.cwd ( ) ;

      // Skip empty or invalid path entries.
      if ( typeof path !== 'string' || ! path ) {
        continue ;
      }

      // Prepend the current path segment to the resolved path.
      resolvedPath = path + '/' + resolvedPath ;

      // Check if the current path segment is absolute.
      resolvedAbsolute = path.charAt ( 0 ) === '/' ;

    }

    // Normalize the combined path.
    resolvedPath = normalizeArray ( filter ( resolvedPath.split ( '/' ) , function ( p ) {
      return !! p ;
    } ) , ! resolvedAbsolute ) . join ( '/' ) ;

    // Add a leading '/' if the path is absolute, and return '.' if the path is empty.
    return ( ( resolvedAbsolute ? '/' : '' ) + resolvedPath ) || '.' ;

  } ;


  /*
   * `path.normalize(path)`
   * Normalizes the given path, resolving '..' and '.' segments and removing extra slashes.
   * This is the POSIX version.
   */
  exports.normalize = function ( path ) {

    // Check if the path is absolute (starts with '/').
    var isAbsolute    = path.charAt ( 0 ) === '/' ,
      // Check if the path has a trailing slash.
      trailingSlash = path.slice ( -1 ) === '/' ;

    // Normalize the path array.
    path = normalizeArray ( filter ( path.split ( '/' ) , function ( p ) {
      return !! p ;
    } ) , ! isAbsolute ) . join ( '/' ) ;

    // If the path became empty and it wasn't absolute, return '.'.
    if ( ! path && ! isAbsolute ) {
      path = '.' ;
    }
    // If the path was not empty and had a trailing slash, re-add it.
    if ( path && trailingSlash ) {
      path += '/' ;
    }

    // Add a leading '/' if the path was originally absolute.
    return ( isAbsolute ? '/' : '' ) + path ;

  } ;


  /*
   * `path.join([path1][, path2][, ...])`
   * Joins all given path segments together, then normalizes the resulting path.
   * This is the POSIX version.
   */
  exports.join = function ( ) {

    // Convert arguments to an array.
    var paths = Array.prototype.slice.call ( arguments , 0 ) ;

    // Filter out non-string or empty paths, join them with '/', then normalize.
    return exports.normalize ( filter ( paths , function ( p , index ) {
      return p && typeof p === 'string' ;
    } ) . join ( '/' ) ) ;

  } ;


  /*
   * `path.dirname(path)`
   * Returns the directory name of a path.
   * This is the POSIX version.
   */
  exports.dirname = function ( path ) {

    // Use the splitPathRe regex to extract the directory part.
    var dir = splitPathRe.exec ( path ) [ 1 ] || '' ;

    var isWindows = false ; // Placeholder for Windows-specific logic, not used in POSIX.

    // If no directory part is found.
    if ( ! dir ) {
      return '.' ;
    }
    // If it's just a slash or a drive letter with a slash (Windows-specific).
    else if ( dir.length === 1 ||
      ( isWindows && dir.length <= 3 && dir.charAt ( 1 ) === ':' ) ) {
      return dir ;
    }
    // Otherwise, it's a full dirname; strip the trailing slash.
    else {
      return dir.substring ( 0 , dir.length - 1 ) ;
    }

  } ;


  /*
   * `path.basename(path[, ext])`
   * Returns the last portion of a path.
   * This is the POSIX version.
   */
  exports.basename = function ( path , ext ) {

    // Use the splitPathRe regex to extract the basename part.
    var f = splitPathRe.exec ( path ) [ 2 ] || '' ;

    // If an extension is provided and matches the end of the basename, remove it.
    if ( ext && f.substr ( -1 * ext.length ) === ext ) {
      f = f.substr ( 0 , f.length - ext.length ) ;
    }

    return f ;

  } ;


  /*
   * `path.extname(path)`
   * Returns the extension of the path, from the last '.' to the end of string.
   * This is the POSIX version.
   */
  exports.extname = function ( path ) {

    // Use the splitPathRe regex to extract the extension part.
    return splitPathRe.exec ( path ) [ 3 ] || '' ;

  } ;

} ) ;



/*
 * Defines the 'package.json' for the 'shoe' module.
 * This is used by the module resolver to find the main entry point
 * for the 'shoe' package, especially for browser environments.
 */
require.define ( "/node_modules/shoe/package.json" , function ( require , module , exports , __dirname , __filename ) {

  module.exports = { "main" : "index.js" , "browserify" : "browser.js" } ;

} ) ;



/*
 * Defines the 'browser.js' entry point for the 'shoe' module.
 * This module provides a SockJS-based stream implementation for browsers.
 */
require.define ( "/node_modules/shoe/browser.js" , function ( require , module , exports , __dirname , __filename ) {

  // Require necessary modules.
  var Stream   = require ( 'stream' ) ;
  var sockjs   = require ( 'sockjs-client' ) ;
  var resolve  = require ( 'url' ) . resolve ;
  var parse    = require ( 'url' ) . parse ;

  // The main export function, which creates and returns a SockJS stream.
  module.exports = function ( u , cb ) {

    // Resolve the URI; if it's not absolute, resolve it relative to the current window location.
    var uri = parse ( u ) . protocol ? u : resolve ( window.location.href , u ) ;

    // Create a new Stream instance.
    var stream = new Stream ;
    stream.readable = true ; // Mark the stream as readable.
    stream.writable = true ; // Mark the stream as writable.

    var ready  = false ; // Flag to indicate if the SockJS connection is open.
    var buffer = [ ] ;   // Buffer to hold messages before the connection is ready.

    // Create a new SockJS client instance.
    var sock = sockjs ( uri ) ;
    stream.sock = sock ; // Attach the SockJS object to the stream for external access.

    // Define the 'write' method for the stream.
    stream.write = function ( msg ) {
      // If not ready or if there are buffered messages, push the message to the buffer.
      if ( ! ready || buffer.length )
        buffer.push ( msg ) ;
      // Otherwise, send the message directly via SockJS.
      else
        sock.send ( msg ) ;
    } ;

    // Define the 'end' method for the stream.
    stream.end = function ( msg ) {
      // If a message is provided, write it before ending.
      if ( msg !== undefined )
        stream.write ( msg ) ;

      // If the connection is not ready, just mark the stream as ended and return.
      if ( ! ready ) {
        stream._ended = true ;
        return ;
      }

      stream.writable = false ; // Mark the stream as no longer writable.
      sock.close ( ) ;          // Close the underlying SockJS connection.
    } ;

    // Define the 'destroy' method for the stream.
    stream.destroy = function ( ) {
      stream._ended   = true ; // Mark the stream as explicitly destroyed.
      stream.writable = stream.readable = false ; // Mark as neither writable nor readable.
      buffer.length   = 0 ;    // Clear any buffered messages.
      sock.close ( ) ;         // Close the SockJS connection.
    } ;

    // Event handler for when the SockJS connection opens.
    sock.onopen = function ( ) {
      // If a callback was provided, execute it.
      if ( typeof cb === 'function' )
        cb ( ) ;

      ready = true ; // Set the ready flag to true.

      // Send any messages that were buffered before the connection opened.
      for ( var i = 0 ; i < buffer.length ; i ++ ) {
        sock.send ( buffer [ i ] ) ;
      }

      buffer = [ ] ; // Clear the buffer after sending.

      stream.emit ( 'connect' ) ; // Emit a 'connect' event from the stream.

      // If the stream was marked as ended before connection, call 'end' now.
      if ( stream._ended )
        stream.end ( ) ;
    } ;

    // Event handler for incoming messages from SockJS.
    sock.onmessage = function ( e ) {
      stream.emit ( 'data' , e.data ) ; // Emit a 'data' event with the message payload.
    } ;

    // Event handler for when the SockJS connection closes.
    sock.onclose = function ( ) {
      stream.emit ( 'end' ) ; // Emit an 'end' event from the stream.
      stream.writable = false ; // Mark the stream as no longer writable.
      stream.readable = false ; // Mark the stream as no longer readable.
    } ;

    // Return the created stream instance.
    return stream ;

  } ;

} ) ;



/*
 * Defines the 'stream' module, which provides a basic Stream class
 * that inherits from EventEmitter. This is a simplified version suitable for browsers.
 */
require.define ( "stream" , function ( require , module , exports , __dirname , __filename ) {

  // Require the 'events' module for event emitting capabilities.
  var events = require ( 'events' ) ;
  // Require the 'util' module for utility functions like inheritance.
  var util   = require ( 'util' ) ;

  // Define the Stream constructor function.
  function Stream ( ) {
    // Call the EventEmitter constructor to initialize event handling.
    events.EventEmitter.call ( this ) ;
  }

  // Make Stream inherit from EventEmitter.
  util.inherits ( Stream , events.EventEmitter ) ;

  // Export the Stream constructor as the module's main export.
  module.exports = Stream ;

  // Backwards compatibility for Node.js 0.4.x, where Stream.Stream was common.
  Stream.Stream = Stream ;

  // Define the 'pipe' method on the Stream prototype.
  // This method connects this stream (source) to another stream (destination).
  Stream.prototype.pipe = function ( dest , options ) {

    var source = this ; // Reference to the source stream.

    // Function to handle 'data' events from the source stream.
    function ondata ( chunk ) {
      // If the destination stream is writable.
      if ( dest.writable ) {
        // Write the chunk to the destination.
        // If 'dest.write' returns false (indicating backpressure) and source is pausable, pause the source.
        if ( false === dest.write ( chunk ) && source.pause ) {
          source.pause ( ) ;
        }
      }
    }

    // Listen for 'data' events on the source stream.
    source.on ( 'data' , ondata ) ;

    // Function to handle 'drain' events from the destination stream.
    function ondrain ( ) {
      // If the source stream is readable and resumable, resume it.
      if ( source.readable && source.resume ) {
        source.resume ( ) ;
      }
    }

    // Listen for 'drain' events on the destination stream.
    dest.on ( 'drain' , ondrain ) ;

    // If the 'end' option is not supplied or is not explicitly false,
    // ensure dest.end() is called when the source ends or closes.
    // This logic handles multiple pipes to the same destination.
    if ( ! dest._isStdio && ( ! options || options.end !== false ) ) {

      // Initialize or increment a counter for pipes to this destination.
      dest._pipeCount = dest._pipeCount || 0 ;
      dest._pipeCount ++ ;

      // Listen for 'end' and 'close' events on the source stream.
      source.on ( 'end'   , onend   ) ;
      source.on ( 'close' , onclose ) ;

    }

    var didOnEnd = false ; // Flag to ensure 'onend' logic runs only once.

    // Function to handle the 'end' event from the source stream.
    function onend ( ) {

      if ( didOnEnd )
        return ;
      didOnEnd = true ;

      // Decrement the pipe count for the destination.
      dest._pipeCount -- ;

      // Remove all listeners related to this pipe.
      cleanup ( ) ;

      // If there are other incoming streams still piping to dest, do not end yet.
      if ( dest._pipeCount > 0 ) {
        return ;
      }

      // If no other sources are piping, call 'end' on the destination.
      dest.end ( ) ;

    }


    // Function to handle the 'close' event from the source stream.
    function onclose ( ) {

      if ( didOnEnd )
        return ;
      didOnEnd = true ;

      // Decrement the pipe count for the destination.
      dest._pipeCount -- ;

      // Remove all listeners related to this pipe.
      cleanup ( ) ;

      // If there are other incoming streams still piping to dest, do not destroy yet.
      if ( dest._pipeCount > 0 ) {
        return ;
      }

      // If no other sources are piping, call 'destroy' on the destination.
      dest.destroy ( ) ;

    }


    // Helper function to remove all event listeners associated with this pipe.
    function cleanup ( ) {
      source.removeListener ( 'data'  , ondata  ) ;
      dest.removeListener   ( 'drain' , ondrain ) ;

      source.removeListener ( 'end'   , onend   ) ;
      source.removeListener ( 'close' , onclose ) ;
    }

    return dest ; // Return the destination stream to allow chaining.
  } ;

} ) ;