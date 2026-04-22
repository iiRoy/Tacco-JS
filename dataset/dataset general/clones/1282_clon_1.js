var COMPILED = !0; /* This flag indicates whether the code has undergone a compilation process, e.g., by Closure Compiler.
                            A value of '!0' is equivalent to 'true'. */
var goog = goog || {};  // The primary namespace for Closure Library.
                        // It is initialized here, or reused if it already exists in the global scope.

goog.global = this;     // Assigns the global object (e.g., 'window' in browsers, 'global' in Node.js)
                        // to 'goog.global' for easy access.

goog.DEBUG = !0;        // A boolean flag indicating if debug features should be enabled.
                        // Setting this to '!0' (true) enables debug-specific code paths.
goog.LOCALE = "en";     // Specifies the default locale for the application, typically used for internationalization.
goog.TRUSTED_SITE = !0; // A flag to indicate if the current execution environment is considered trusted.
                        // This might influence the use of certain browser APIs or optimizations.

/**
 * Provides a namespace for the given name. If the namespace already exists,
 * it throws an error unless COMPILED is true. It also implicitly creates
 * parent namespaces as needed.
 * @param {string} a The namespace string, e.g., "my.app.utilities".
 */
goog.provide = function( a )
{
  /* If the code is not compiled, perform checks and setup for development mode. */
  if ( !COMPILED ) {
      /* Check if the namespace has already been provided to prevent redeclarations. */
      if ( goog.isProvided_( a ) ) {
          throw Error( 'Namespace "' + a + '" already declared.' );
      }

      /* Delete the namespace from implicitNamespaces_ if it was marked as such. */
      delete goog.implicitNamespaces_[ a ];

      /* Traverse up the namespace hierarchy to mark parent namespaces as implicitly provided. */
      for ( var b = a; ( b = b.substring( 0, b.lastIndexOf( "." ) ) ) && !goog.getObjectByName( b ); ) {
          goog.implicitNamespaces_[ b ] = !0;
      }
  }

  /* Ensure the full object path for the namespace exists in the global scope. */
  goog.exportPath_( a );
};


/**
 * Marks the current file as containing test-only code.
 * In a compiled, non-debug environment, attempting to import such code
 * will result in an error.
 * @param {string=} a Optional message to append to the error if thrown.
 */
goog.setTestOnly = function( a )
{
  /* Check if compiled code is running in a non-debug environment. */
  if ( COMPILED && !goog.DEBUG )
  {
      /* If so, throw an error, optionally including the provided message. */
      throw a = a || "", Error( "Importing test-only code into non-debug environment" + ( a ? ": " + a : "." ) );
  }
};


/* This block defines helper functions and objects used for dependency management
 * when the code is not compiled. It's conditionally executed. */
COMPILED || (
  /* Checks if a given namespace 'a' has already been provided. */
  goog.isProvided_ = function( a ) {
    return !goog.implicitNamespaces_[ a ] && !!goog.getObjectByName( a );
  },
  /* An object to keep track of implicitly created namespaces during goog.provide calls. */
  goog.implicitNamespaces_ = {}
);


/**
 * Ensures that the given object path exists in the global scope (or specified root).
 * For example, `goog.exportPath_("my.app.Foo", myAppFooObject)` would create
 * `window.my`, `window.my.app`, and assign `myAppFooObject` to `window.my.app.Foo`.
 * @param {string} a The dot-separated path string.
 * @param {*} b The value to be assigned to the final property in the path.
 * @param {Object=} c The root object where the path should be created; defaults to goog.global.
 */
goog.exportPath_ = function( a , b , c )
{
  /* Split the path string into an array of segments. */
  a = a.split( "." );
  /* Determine the root object for export. */
  c = c || goog.global;

  /* For Internet Explorer, ensure the first segment is declared as a global variable
   * to avoid issues with `eval` and global scope. */
  a[0] in c || !c.execScript || c.execScript( "var " + a[0] );

  var d; // Temporary variable to hold the current segment.
  /* Iterate through the path segments to build the object structure. */
  for ( ; a.length && ( d = a.shift() ) ; ) {
      /* If this is the last segment and a value 'b' is provided, assign it. */
      if ( !a.length && goog.isDef( b ) ) {
          c[d] = b;
      }
      /* Otherwise, create the next object in the path if it doesn't exist. */
      else {
          c = c[d] ? c[d] : ( c[d] = {} );
      }
  }
};


/**
 * Retrieves an object by its fully qualified name from the global scope
 * or a specified root object.
 * @param {string} a The dot-separated name string, e.g., "my.app.Component".
 * @param {Object=} b Optional: The root object to search within. Defaults to goog.global.
 * @return {*} The object found at the specified path, or null if any part of the path is missing.
 */
goog.getObjectByName = function( a , b )
{
  var c = a.split( "." ); // Split the name into individual parts.
  var d = b || goog.global; // Determine the starting object for the search.
  var e; // Variable to hold the current segment during iteration.

  /* Iterate through the segments, navigating the object hierarchy. */
  while ( e = c.shift() ) {
      /* If the current segment exists and is defined and not null, continue. */
      if ( goog.isDefAndNotNull( d[e] ) ) {
          d = d[e];
      }
      /* Otherwise, the object path is broken, so return null. */
      else {
          return null;
      }
  }
  return d; /* Return the found object. */
};


/**
 * Copies all enumerable properties from a source object to a target object.
 * If no target object is specified, properties are copied to `goog.global`.
 * @param {Object} a The source object whose properties will be copied.
 * @param {Object=} b The target object to which properties will be copied.
 */
goog.globalize = function( a , b )
{
  var c = b || goog.global; // Determine the target object.
  var d; // Loop variable for property names.

  /* Iterate over all properties in the source object. */
  for ( d in a ) {
    /* Copy each property to the target object. */
    c[d] = a[d];
  }
};


/**
 * Adds a dependency to the Closure dependency management system.
 * This function is only active when COMPILED is false.
 * @param {string} a The path to the JavaScript file (e.g., "path/to/my_file.js").
 * @param {Array<string>} b An array of symbols (namespaces/classes) provided by this file.
 * @param {Array<string>} c An array of symbols required by this file.
 */
goog.addDependency = function( a , b , c )
{
  /* This function operates only in non-compiled mode for dependency tracking. */
  if ( !COMPILED ) {
    var d; /* Temporary variable for iterating through symbol arrays. */
    a = a.replace( /\\/g , "/" ); // Normalize path separators to forward slashes.

    var e = goog.dependencies_; // Reference to the global dependency object.

    /* Map each provided symbol to its file path. */
    for ( var f = 0 ; ( d = b[f] ) ; f++ ) {
      e.nameToPath[d] = a; // Map symbol name to file path.
      if ( !( a in e.pathToNames ) ) {
        e.pathToNames[a] = {}; // Initialize if path not seen before.
      }
      e.pathToNames[a][d] = !0; // Mark this symbol as provided by this path.
    }

    /* Map each file path to the symbols it requires. */
    for ( d = 0 ; ( b = c[d] ) ; d++ ) {
      if ( !( a in e.requires ) ) {
        e.requires[a] = {}; // Initialize if path not seen before.
      }
      e.requires[a][b] = !0; // Mark this symbol as required by this path.
    }
  }
};


goog.ENABLE_DEBUG_LOADER = !0; // Enables or disables the debug script loader.
                               // When true, `goog.require` will dynamically load scripts.


/**
 * Ensures that a given namespace or class is available.
 * If not compiled and the symbol is not provided, it attempts to load the
 * corresponding script using the debug loader.
 * @param {string} a The namespace or class name to require.
 */
goog.require = function( a )
{
  /* Only activate in non-compiled mode if the symbol is not already provided. */
  if ( !COMPILED && !goog.isProvided_( a ) ) {
    /* If the debug loader is enabled, attempt to find and load the script. */
    if ( goog.ENABLE_DEBUG_LOADER ) {
      var b = goog.getPathFromDeps_( a ); // Get the file path for the required symbol.
      if ( b ) {
        goog.included_[ b ] = !0; // Mark the file as included.
        goog.writeScripts_();     // Trigger script writing for dependencies.
        return;                   // Exit if successfully loaded.
      }
    }
    /* If the symbol cannot be found or loaded, log an error and throw an exception. */
    a = "goog.require could not find: " + a;
    goog.global.console && goog.global.console.error( a );
    throw Error( a );
  }
};


goog.basePath = ""; // The base URL path for loading Closure Library scripts.
                    // This is usually determined automatically or can be set manually.


/**
 * A no-operation function. Useful as a default callback or placeholder.
 */
goog.nullFunction = function() {
  /* This function intentionally does nothing. */
};


/**
 * An identity function that simply returns its first argument.
 * @param {T} a The value to return.
 * @param {*=} b Optional second argument (ignored).
 * @return {T} The first argument.
 * @template T
 */
goog.identityFunction = function( a , b ) {
  return a;
};


/**
 * A function that always throws an error, indicating an unimplemented abstract method.
 * Used in abstract base classes.
 */
goog.abstractMethod = function() {
  throw Error( "unimplemented abstract method" );
};


/**
 * Adds a static `getInstance` method to a constructor function,
 * implementing the singleton pattern.
 * @param {function(new:Object)} a The constructor function for which to create a singleton.
 */
goog.addSingletonGetter = function( a )
{
  a.getInstance = function() {
    /* If an instance already exists, return it. */
    if ( a.instance_ ) {
      return a.instance_;
    }
    /* In debug mode, track instantiated singletons for debugging purposes. */
    goog.DEBUG && ( goog.instantiatedSingletons_[ goog.instantiatedSingletons_.length ] = a );
    /* Create and store the new instance, then return it. */
    return a.instance_ = new a;
  };
};


goog.instantiatedSingletons_ = []; // An array to hold references to instantiated singleton classes,
                                   // used primarily for debugging in non-compiled builds.


/* This extensive block of code handles the core functionality of the Closure Library's
 * debug script loader. It's only executed when `COMPILED` is false and `ENABLE_DEBUG_LOADER` is true.
 * It manages script loading, dependency resolution, and script injection into the HTML document. */
!COMPILED && goog.ENABLE_DEBUG_LOADER && (
  goog.included_ = {}, // Tracks which files have been marked for inclusion.
  goog.dependencies_ = {
    pathToNames: {}, // Maps file paths to the symbols they provide.
    nameToPath: {},  // Maps provided symbols to their file paths.
    requires: {},    // Maps file paths to the symbols they require.
    visited: {},     // Tracks files visited during the current dependency resolution pass.
    written: {}      // Tracks files that have already been written to the document.
  },

  /**
   * Checks if the current execution environment is an HTML document.
   * This is crucial for determining if script tags can be written.
   * @return {boolean} True if in an HTML document, false otherwise.
   */
  goog.inHtmlDocument_ = function() {
    var a = goog.global.document; // Get a reference to the document object.
    return "undefined" != typeof a && "write" in a; // Check if document exists and supports 'write'.
  },

  /**
   * Automatically determines the base path for Closure Library scripts.
   * It looks for a script tag whose source ends with "base.js".
   * If `CLOSURE_BASE_PATH` is globally defined, it takes precedence.
   */
  goog.findBasePath_ = function() {
    if ( goog.global.CLOSURE_BASE_PATH ) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
    } else {
      if ( goog.inHtmlDocument_() ) {
        // Iterate through all script tags in reverse order.
        for (
          var a = goog.global.document.getElementsByTagName( "script" ),
              b = a.length - 1;
          0 <= b;
          --b
        ) {
          var c = a[b].src; // Get the 'src' attribute of the script tag.
          var d = c.lastIndexOf( "?" ); // Find the query string start.
          d = -1 == d ? c.length : d; // If no query string, use full length.
          // Check if the script src ends with "base.js" (before any query string).
          if ( "base.js" == c.substr( d - 7 , 7 ) ) {
            goog.basePath = c.substr( 0 , d - 7 ); // Extract the base path.
            break; // Found it, no need to check further.
          }
        }
      }
    }
  },

  /**
   * Imports a JavaScript file. It uses `CLOSURE_IMPORT_SCRIPT` if defined,
   * otherwise falls back to `goog.writeScriptTag_`.
   * @param {string} a The URL of the script to import.
   */
  goog.importScript_ = function( a ) {
    var b = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_; // Select the import function.
    // Only import if not already written and the import function succeeds.
    !goog.dependencies_.written[a] && b(a) && ( goog.dependencies_.written[a] = !0 );
  },

  /**
   * Dynamically writes a script tag to the current HTML document.
   * This function has restrictions regarding when it can be called (not after document load).
   * @param {string} a The URL of the script to write.
   * @return {boolean} True if the script tag was successfully written, false otherwise.
   */
  goog.writeScriptTag_ = function( a ) {
    if ( goog.inHtmlDocument_() ) {
      var b = goog.global.document; // Reference to the document.
      if ( "complete" == b.readyState ) {
        // Prevent writing scripts after document load, except for deps.js (which is special).
        if ( /\bdeps.js$/.test( a ) ) {
          return !1;
        }
        throw Error( 'Cannot write "' + a + '" after document load' );
      }
      // Write the script tag to the document.
      b.write( '\x3cscript type\x3d"text/javascript" src\x3d"' + a + '"\x3e\x3c/script\x3e' );
      return !0;
    }
    return !1; // Cannot write script if not in an HTML document.
  },

  /**
   * Resolves and writes all required scripts to the document based on
   * the `goog.included_` files and their dependencies.
   * This function implements the core dependency loading logic.
   */
  goog.writeScripts_ = function() {
    /**
     * Recursive helper function to resolve dependencies for a given script file.
     * It adds files to a list in the correct loading order.
     * @param {string} e The path of the script file to process.
     * @private
     */
    function a( e ) {
      if ( !( e in d.written ) ) { // If this script has not been physically written yet.
        if ( !( e in d.visited ) ) { // If this script hasn't been visited in the current resolution pass.
          d.visited[e] = !0; // Mark as visited.
          if ( e in d.requires ) { // If this script has explicit requirements.
            // Recursively resolve all requirements.
            for ( var g in d.requires[e] ) {
              if ( !goog.isProvided_( g ) ) { // If the required symbol is not yet provided.
                if ( g in d.nameToPath ) {
                  a( d.nameToPath[g] ); // Recursively add the file that provides the requirement.
                } else {
                  throw Error( "Undefined nameToPath for " + g ); // Error if a required symbol has no known path.
                }
              }
            }
          }
        }
        // If the script is not yet in the list to be written, add it.
        if ( !( e in c ) ) {
          c[e] = !0;
          b.push( e );
        }
      }
    }

    var b = []; // Array to store script paths in the order they should be written.
    var c = {}; // A set-like object to quickly check if a script is already in 'b'.
    var d = goog.dependencies_; // Reference to the dependency tracking object.
    var e; // Loop variable.

    /* Start the dependency resolution process for all currently included files. */
    for ( e in goog.included_ ) {
      d.written[e] || a( e ); // If not already written, resolve its dependencies and add it.
    }

    /* Iterate through the ordered list of scripts and import them. */
    for ( e = 0 ; e < b.length ; e++ ) {
      if ( b[e] ) {
        goog.importScript_( goog.basePath + b[e] ); // Import each script.
      } else {
        throw Error( "Undefined script input" ); // Should not happen if dependency data is consistent.
      }
    }
  },

  /**
   * Retrieves the file path associated with a given symbol name from the
   * dependency information.
   * @param {string} a The symbol name (e.g., "goog.array").
   * @return {?string} The file path, or null if not found.
   */
  goog.getPathFromDeps_ = function( a ) {
    return a in goog.dependencies_.nameToPath ? goog.dependencies_.nameToPath[a] : null;
  },

  /* Initialize the base path and then import the 'deps.js' file,
   * which contains all dependency information for the Closure Library. */
  goog.findBasePath_(),
  goog.global.CLOSURE_NO_DEPS || goog.importScript_( goog.basePath + "deps.js" )
);


/**
 * Determines the precise type of a variable, returning a string representation.
 * It handles common JavaScript types and distinguishes between arrays, objects,
 * and functions more accurately than `typeof`.
 * @param {*} a The variable whose type is to be determined.
 * @return {string} A string representing the type (e.g., "array", "object", "function", "string", "number", "boolean", "null", "undefined").
 */
goog.typeOf = function( a )
{
  var b = typeof a; // Get the basic typeof result.

  if ( "object" == b ) {
    if ( a ) {
      /* Specific checks for arrays, objects, and functions using instanceof and toString. */
      if ( a instanceof Array ) {
        return "array";
      }
      if ( a instanceof Object ) {
        return b; /* Still "object" for plain objects. */
      }
      var c = Object.prototype.toString.call( a ); // Get the internal [[Class]] property.
      if ( "[object Window]" == c ) {
        return "object"; /* Special handling for window object. */
      }
      /* Check for array-like objects (e.g., NodeList) that might not be true Arrays. */
      if ( "[object Array]" == c || ( "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable( "splice" ) ) ) {
        return "array";
      }
      /* Check for function-like objects (e.g., some host objects) that might not be true Functions. */
      if ( "[object Function]" == c || ( "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable( "call" ) ) ) {
        return "function";
      }
    } else {
      return "null"; /* Null is typeof 'object'. */
    }
  }
  /* Handle specific browser quirks where typeof a function might be 'object'. */
  else if ( "function" == b && "undefined" == typeof a.call ) {
    return "object";
  }
  return b; /* Return the basic typeof result for primitives. */
};


/**
 * Checks if a variable is defined (i.e., not `undefined`).
 * @param {*} a The variable to check.
 * @return {boolean} True if the variable is defined, false otherwise.
 */
goog.isDef = function( a ) {
  return void 0 !== a;
};


/**
 * Checks if a variable is `null`.
 * @param {*} a The variable to check.
 * @return {boolean} True if the variable is `null`, false otherwise.
 */
goog.isNull = function( a ) {
  return null === a;
};


/**
 * Checks if a variable is defined and not `null`.
 * This is equivalent to `a != null` in JavaScript.
 * @param {*} a The variable to check.
 * @return {boolean} True if the variable is defined and not null, false otherwise.
 */
goog.isDefAndNotNull = function( a ) {
  return null != a;
};


/**
 * Checks if a variable is an array.
 * @param {*} a The variable to check.
 * @return {boolean} True if the variable is an array, false otherwise.
 */
goog.isArray = function( a ) {
  return "array" == goog.typeOf( a );
};


/**
 * Checks if a variable is "array-like", meaning it's either an actual array
 * or an object with a numeric `length` property (e.g., `arguments` object, NodeList).
 * @param {*} a The variable to check.
 * @return {boolean} True if array-like, false otherwise.
 */
goog.isArrayLike = function( a )
{
  var b = goog.typeOf( a ); // Get the type of the variable.
  return "array" == b || ( "object" == b && "number" == typeof a.length ); // Check for actual array or object with length.
};


/**
 * Checks if a variable is "date-like", meaning it's an object with a `getFullYear` method.
 * This is a common duck-typing approach for Date objects.
 * @param {*} a The variable to check.
 * @return {boolean} True if date-like, false otherwise.
 */
goog.isDateLike = function( a ) {
  return goog.isObject( a ) && "function" == typeof a.getFullYear;
};


/**
 * Checks if a variable is a string.
 * @param {*} a The variable to check.
 * @return {boolean} True if the variable is a string, false otherwise.
 */
goog.isString = function( a ) {
  return "string" == typeof a;
};


/**
 * Checks if a variable is a boolean.
 * @param {*} a The variable to check.
 * @return {boolean} True if the variable is a boolean, false otherwise.
 */
goog.isBoolean = function( a ) {
  return "boolean" == typeof a;
};


/**
 * Checks if a variable is a number.
 * @param {*} a The variable to check.
 * @return {boolean} True if the variable is a number, false otherwise.
 */
goog.isNumber = function( a ) {
  return "number" == typeof a;
};


/**
 * Checks if a variable is a function.
 * @param {*} a The variable to check.
 * @return {boolean} True if the variable is a function, false otherwise.
 */
goog.isFunction = function( a ) {
  return "function" == goog.typeOf( a );
};


/**
 * Checks if a variable is an object (including functions, but excluding null).
 * @param {*} a The variable to check.
 * @return {boolean} True if the variable is an object, false otherwise.
 */
goog.isObject = function( a )
{
  var b = typeof a; // Get the basic typeof result.
  return ( "object" == b && null != a ) || "function" == b; // Check for object (non-null) or function.
};


/**
 * Assigns and retrieves a unique ID for an object.
 * This is primarily used for internal tracking and hashing.
 * @param {Object} a The object for which to get or assign a UID.
 * @return {number} The unique ID of the object.
 */
goog.getUid = function( a ) {
  /* If the object already has a UID, return it. Otherwise, assign a new one and increment the counter. */
  return a[ goog.UID_PROPERTY_ ] || ( a[ goog.UID_PROPERTY_ ] = ++goog.uidCounter_ );
};


/**
 * Removes the unique ID from an object. This is useful for memory management
 * to allow garbage collection of objects that no longer need tracking.
 * @param {Object} a The object from which to remove the UID.
 */
goog.removeUid = function( a ) {
  /* If the object supports 'removeAttribute' (e.g., DOM elements), use it. */
  "removeAttribute" in a && a.removeAttribute( goog.UID_PROPERTY_ );
  try {
    /* Attempt to delete the property directly. */
    delete a[ goog.UID_PROPERTY_ ];
  } catch ( b ) {
    /* Ignore errors, as some properties might be non-configurable in IE. */
  }
};


goog.UID_PROPERTY_ = "closure_uid_" + ( 1E9 * Math.random() >>> 0 ); // Generates a unique string for the UID property name.
goog.uidCounter_ = 0; // Counter for assigning unique integer IDs.


goog.getHashCode = goog.getUid;     // Alias `goog.getHashCode` to `goog.getUid`.
goog.removeHashCode = goog.removeUid; // Alias `goog.removeHashCode` to `goog.removeUid`.


/**
 * Creates a shallow clone of an object or array. If the object has a `clone()` method,
 * it calls that. Otherwise, it creates a new object/array and copies properties.
 * This is a deep clone for nested objects.
 * @param {*} a The object or array to clone.
 * @return {*} A cloned copy of the input.
 */
goog.cloneObject = function( a )
{
  var b = goog.typeOf( a ); // Get the type of the input.
  if ( "object" == b || "array" == b ) {
    if ( a.clone ) {
      return a.clone(); // If a custom clone method exists, use it.
    }
    /* Create a new empty object or array based on the type. */
    var b = "array" == b ? [] : {};
    var c; // Loop variable for properties.
    /* Recursively clone each property. */
    for ( c in a ) {
      b[c] = goog.cloneObject( a[c] );
    }
    return b;
  }
  return a; // Return primitive values directly.
};


/**
 * Internal helper for `goog.bind` using the native `Function.prototype.bind` method.
 * @param {function(...)} a The function to bind.
 * @param {Object} b The `this` context for the bound function.
 * @param {...*} c Additional arguments to pre-apply.
 * @return {function(...)} The bound function.
 * @private
 */
goog.bindNative_ = function( a , b , c ) {
  return a.call.apply( a.bind , arguments ); // Use Function.prototype.call with Function.prototype.apply.
};


/**
 * Internal helper for `goog.bind` using a JavaScript-based implementation
 * for environments without native `Function.prototype.bind`.
 * @param {function(...)} a The function to bind.
 * @param {Object} b The `this` context for the bound function.
 * @param {...*} c Additional arguments to pre-apply.
 * @return {function(...)} The bound function.
 * @private
 */
goog.bindJs_ = function( a , b , c )
{
  if ( !a ) {
    throw Error(); // Function to bind must be provided.
  }
  if ( 2 < arguments.length ) {
    /* If there are pre-applied arguments, capture them. */
    var d = Array.prototype.slice.call( arguments , 2 );
    return function() {
      /* When the bound function is called, prepend pre-applied arguments. */
      var c = Array.prototype.slice.call( arguments );
      Array.prototype.unshift.apply( c , d );
      return a.apply( b , c ); // Call the original function with new `this` and combined arguments.
    };
  }
  return function() {
    return a.apply( b , arguments ); // Call the original function with new `this` and current arguments.
  };
};


/**
 * Binds a function to a specific `this` context and optionally pre-applies arguments.
 * It feature-detects and uses native `Function.prototype.bind` if available,
 * otherwise falls back to a JavaScript implementation.
 * @param {function(...)} a The function to bind.
 * @param {Object} b The `this` context for the bound function.
 * @param {...*} c Optional additional arguments to pre-apply.
 * @return {function(...)} The bound function.
 */
goog.bind = function( a , b , c )
{
  /* Feature detection for native bind and memoization of the chosen implementation. */
  if ( Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf( "native code" ) ) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  /* Call the selected bind implementation with the original arguments. */
  return goog.bind.apply( null , arguments );
};


/**
 * Creates a new function that, when called, has its first arguments
 * pre-filled with the provided `b` arguments. The `this` context is preserved.
 * @param {function(...)} a The function to partially apply.
 * @param {...*} b Arguments to pre-apply to the function.
 * @return {function(...)} A new function with arguments partially applied.
 */
goog.partial = function( a , b )
{
  var c = Array.prototype.slice.call( arguments , 1 ); // Capture the arguments to pre-apply.
  return function() {
    var b = Array.prototype.slice.call( arguments ); // Capture arguments passed to the new function.
    b.unshift.apply( b , c ); // Prepend the partially applied arguments.
    return a.apply( this , b ); // Call the original function with `this` and combined arguments.
  };
};


/**
 * Mixes properties from a source object (`b`) into a target object (`a`).
 * This performs a shallow copy, overwriting existing properties in `a` if they conflict.
 * @param {Object} a The target object to receive properties.
 * @param {Object} b The source object whose properties will be copied.
 */
goog.mixin = function( a , b )
{
  var c; // Loop variable for property names.
  for ( c in b ) {
    a[c] = b[c]; // Copy each property.
  }
};


/**
 * Returns the current time in milliseconds since the Unix epoch.
 * It prioritizes `Date.now()` for performance if the site is trusted,
 * otherwise falls back to `+new Date()`.
 * @return {number} The current time in milliseconds.
 */
goog.now = goog.TRUSTED_SITE && Date.now || function() {
  return +new Date;
};


/**
 * Evaluates JavaScript code in the global scope.
 * It attempts to use `execScript` (for IE), then `eval` (with checks for global scope issues),
 * and finally a script tag injection fallback.
 * @param {string} a The JavaScript code string to evaluate.
 */
goog.globalEval = function( a )
{
  if ( goog.global.execScript ) {
    goog.global.execScript( a , "JavaScript" ); // IE-specific global evaluation.
  } else {
    if ( goog.global.eval ) {
      /* Check if `eval` correctly creates global variables. Some browsers (e.g., older Firefox)
       * might evaluate in a local scope. */
      if ( null == goog.evalWorksForGlobals_ ) {
        goog.global.eval( "var _et_ \x3d 1;" ); // Test if `var` creates a global.
        if ( "undefined" != typeof goog.global._et_ ) {
          delete goog.global._et_;
          goog.evalWorksForGlobals_ = !0;
        } else {
          goog.evalWorksForGlobals_ = !1;
        }
      }

      if ( goog.evalWorksForGlobals_ ) {
        goog.global.eval( a ); // Use `eval` if it works for globals.
      } else {
        /* Fallback: create a script element, inject code, and append/remove it.
         * This ensures global execution even if `eval` has scope issues. */
        var b = goog.global.document;
        var c = b.createElement( "script" );
        c.type = "text/javascript";
        c.defer = !1;
        c.appendChild( b.createTextNode( a ) );
        b.body.appendChild( c );
        b.body.removeChild( c );
      }
    } else {
      throw Error( "goog.globalEval not available" ); // No global evaluation method found.
    }
  }
};


goog.evalWorksForGlobals_ = null; // Caches the result of the `eval` global scope test.


/**
 * Gets a CSS class name, potentially applying a mapping transformation.
 * This is used for CSS renaming during compilation.
 * @param {string} a The base CSS name (e.g., "button").
 * @param {string=} b Optional suffix (e.g., "hover").
 * @return {string} The transformed CSS class name.
 */
goog.getCssName = function( a , b )
{
  /**
   * Internal helper function to map a single CSS part.
   * @param {string} a The CSS part.
   * @return {string} The mapped CSS part.
   * @private
   */
  var c = function( a ) {
    return goog.cssNameMapping_[a] || a;
  };

  /**
   * Internal helper function to map a CSS name that might contain hyphens.
   * It splits the name by hyphens and maps each part.
   * @param {string} a The CSS name.
   * @return {string} The mapped CSS name.
   * @private
   */
  var d = function( a ) {
    a = a.split( "-" );
    for ( var b = [] , d = 0 ; d < a.length ; d++ ) {
      b.push( c( a[d] ) );
    }
    return b.join( "-" );
  };

  /* Select the appropriate mapping function based on `goog.cssNameMappingStyle_`. */
  d = goog.cssNameMapping_ ? ( "BY_WHOLE" == goog.cssNameMappingStyle_ ? c : d ) : function( a ) {
    return a; /* No mapping if goog.cssNameMapping_ is not set. */
  };

  /* Combine the base name and suffix (if provided), applying the mapping. */
  return b ? a + "-" + d( b ) : d( a );
};


/**
 * Sets the CSS name mapping and mapping style.
 * This function is used by the Closure Compiler to provide CSS renaming information.
 * @param {Object} a The CSS name mapping object.
 * @param {string} b The mapping style ("BY_WHOLE" or "BY_PART").
 */
goog.setCssNameMapping = function( a , b )
{
  goog.cssNameMapping_ = a;
  goog.cssNameMappingStyle_ = b;
};


/* If not compiled and a global CSS name mapping object exists, use it. */
!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING && ( goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING );


/**
 * Formats a message string by replacing placeholders with provided values.
 * Placeholders are of the form `{$key}`.
 * @param {string} a The message string with placeholders.
 * @param {Object=} b An object mapping placeholder keys to their values.
 * @return {string} The formatted message string.
 */
goog.getMsg = function( a , b )
{
  var c = b || {}; // Ensure a map is available, even if empty.
  var d; // Loop variable for keys in the map.

  /* Iterate over each key-value pair in the replacements map. */
  for ( d in c ) {
    var e = ( "" + c[d] ).replace( /\$/g , "$$$$" ); // Escape dollar signs in replacement values.
    /* Replace all occurrences of the placeholder with the escaped value. */
    a = a.replace( RegExp( "\\{\\$" + d + "\\}" , "gi" ) , e );
  }
  return a; // Return the fully formatted message.
};


/**
 * Returns the primary message, effectively ignoring the fallback message.
 * This is used for internationalization, where a primary translation is preferred.
 * @param {string} a The primary message.
 * @param {string} b The fallback message (ignored in this implementation).
 * @return {string} The primary message.
 */
goog.getMsgWithFallback = function( a , b )
{
  return a; // Always returns the first argument.
};


/**
 * Exports a symbol (namespace or class) to the global scope.
 * This is a wrapper around `goog.exportPath_`.
 * @param {string} a The dot-separated symbol name (e.g., "my.namespace.MyClass").
 * @param {*} b The value to export.
 * @param {Object=} c Optional root object to export into; defaults to goog.global.
 */
goog.exportSymbol = function( a , b , c )
{
  goog.exportPath_( a , b , c );
};


/**
 * Exports a property onto an object. This is a direct assignment.
 * @param {Object} a The object on which to define the property.
 * @param {string} b The name of the property.
 * @param {*} c The value to assign to the property.
 */
goog.exportProperty = function( a , b , c )
{
  a[b] = c;
};


/**
 * Implements classical JavaScript inheritance by setting up the prototype chain.
 * The subclass's prototype is set to an instance of an intermediate constructor
 * whose prototype is the superclass's prototype.
 * @param {function(new:Object)} a The subclass constructor.
 * @param {function(new:Object)} b The superclass constructor.
 */
goog.inherits = function( a , b )
{
  /** @constructor */
  function c() {} // An empty intermediate constructor.
  c.prototype = b.prototype; // Set the intermediate constructor's prototype to the superclass's prototype.
  a.superClass_ = b.prototype; // Store a direct reference to the superclass prototype on the subclass constructor.
  a.prototype = new c; // Set the subclass's prototype to an instance of the intermediate constructor.
  a.prototype.constructor = a; // Correctly set the subclass's constructor property.
};


/**
 * Calls a method on the superclass. This is typically used within a subclass
 * method to invoke the corresponding method from its parent class.
 * @param {Object} a The `this` context of the subclass instance.
 * @param {string} b The name of the method to call on the superclass.
 * @param {...*} c Arguments to pass to the superclass method.
 * @return {*} The return value of the superclass method.
 */
goog.base = function( a , b , c )
{
  var d = arguments.callee.caller; // Get the function that called `goog.base`.

  /* If the caller has a `superClass_` property (set by goog.inherits),
   * directly call the superclass constructor or method. */
  if ( d.superClass_ ) {
    return d.superClass_.constructor.apply( a , Array.prototype.slice.call( arguments , 1 ) );
  }

  /* Fallback mechanism: traverse the prototype chain to find the superclass method. */
  for (
    var e = Array.prototype.slice.call( arguments , 2 ), // Arguments for the superclass method.
        f = !1, // Flag to indicate if the caller's method has been found.
        g = a.constructor; // Start from the current object's constructor.
    g;
    g = g.superClass_ && g.superClass_.constructor // Move up the inheritance chain.
  ) {
    if ( g.prototype[b] === d ) {
      f = !0; // Found the calling method in the prototype chain.
    } else if ( f ) {
      return g.prototype[b].apply( a , e ); // Call the next method up the chain.
    }
  }

  /* Handle cases where the method might be directly on the instance (not prototype). */
  if ( a[b] === d ) {
    return a.constructor.prototype[b].apply( a , e );
  }

  throw Error( "goog.base called from a method of one name to a method of a different name" );
};


/**
 * Executes a function with `goog.global` as its `this` context.
 * This is useful for writing Closure-style modules that declare globals.
 * @param {function()} a The function to execute.
 */
goog.scope = function( a )
{
  a.call( goog.global ); // Call the function, explicitly setting `this` to `goog.global`.
};


goog.string = {}; // Namespace for string utility functions.


goog.string.Unicode = {
  NBSP : "\u00a0" // Non-breaking space character.
};


/**
 * Checks if a string `a` starts with another string `b`.
 * @param {string} a The string to check.
 * @param {string} b The prefix string.
 * @return {boolean} True if `a` starts with `b`, false otherwise.
 */
goog.string.startsWith = function( a , b ) {
  return 0 == a.lastIndexOf( b , 0 );
};


/**
 * Checks if a string `a` ends with another string `b`.
 * @param {string} a The string to check.
 * @param {string} b The suffix string.
 * @return {boolean} True if `a` ends with `b`, false otherwise.
 */
goog.string.endsWith = function( a , b )
{
  var c = a.length - b.length; // Calculate the potential starting index of the suffix.
  return 0 <= c && a.indexOf( b , c ) == c; // Check if suffix is found at that exact position.
};


/**
 * Performs a case-insensitive check to see if a string `a` starts with string `b`.
 * @param {string} a The string to check.
 * @param {string} b The prefix string.
 * @return {boolean} True if `a` starts with `b` (case-insensitive), false otherwise.
 */
goog.string.caseInsensitiveStartsWith = function( a , b ) {
  return 0 == goog.string.caseInsensitiveCompare( b , a.substr( 0 , b.length ) );
};


/**
 * Performs a case-insensitive check to see if a string `a` ends with string `b`.
 * @param {string} a The string to check.
 * @param {string} b The suffix string.
 * @return {boolean} True if `a` ends with `b` (case-insensitive), false otherwise.
 */
goog.string.caseInsensitiveEndsWith = function( a , b ) {
  return 0 == goog.string.caseInsensitiveCompare( b , a.substr( a.length - b.length , b.length ) );
};


/**
 * Substitutes placeholders (`%s`) in a string with provided arguments.
 * Each `%s` is replaced by the next argument in order.
 * @param {string} a The format string.
 * @param {...*} b Values to substitute into the string.
 * @return {string} The formatted string.
 */
goog.string.subs = function( a , b )
{
  for ( var c = 1 ; c < arguments.length ; c++ ) {
    var d = String( arguments[c] ).replace( /\$/g , "$$$$" ); // Escape dollar signs in replacement values.
    a = a.replace( /\%s/ , d ); // Replace the first occurrence of %s.
  }
  return a;
};


/**
 * Collapses multiple whitespace characters (including non-breaking spaces)
 * into a single space, and trims leading/trailing whitespace.
 * @param {string} a The string to process.
 * @return {string} The string with collapsed whitespace.
 */
goog.string.collapseWhitespace = function( a ) {
  return a.replace( /[\s\xa0]+/g , " " ).replace( /^\s+|\s+$/g , "" );
};


/**
 * Checks if a string is empty or consists only of whitespace characters.
 * @param {string} a The string to check.
 * @return {boolean} True if empty or whitespace only, false otherwise.
 */
goog.string.isEmpty = function( a ) {
  return /^[\s\xa0]*$/.test( a );
};


/**
 * Checks if a value, after being converted to a string and made "safe",
 * is empty or consists only of whitespace.
 * (Note: `goog.string.makeSafe` is not defined in this snippet but assumed to exist.)
 * @param {*} a The value to check.
 * @return {boolean} True if empty/whitespace after safety conversion.
 */
goog.string.isEmptySafe = function( a ) {
  return goog.string.isEmpty( goog.string.makeSafe( a ) );
};


/**
 * Checks if a string consists only of "breaking" whitespace characters (tab, newline, carriage return, space).
 * @param {string} a The string to check.
 * @return {boolean} True if only breaking whitespace, false otherwise.
 */
goog.string.isBreakingWhitespace = function( a ) {
  return !/[^\t\n\r ]/.test( a );
};


/**
 * Checks if a string consists only of alphabetic characters (a-z, A-Z).
 * @param {string} a The string to check.
 * @return {boolean} True if only alphabetic, false otherwise.
 */
goog.string.isAlpha = function( a ) {
  return !/[^a-zA-Z]/.test( a );
};


/**
 * Checks if a string consists only of numeric characters (0-9).
 * @param {string} a The string to check.
 * @return {boolean} True if only numeric, false otherwise.
 */
goog.string.isNumeric = function( a ) {
  return !/[^0-9]/.test( a );
};


/**
 * Checks if a string consists only of alphanumeric characters (a-z, A-Z, 0-9).
 * @param {string} a The string to check.
 * @return {boolean} True if only alphanumeric, false otherwise.
 */
goog.string.isAlphaNumeric = function( a ) {
  return !/[^a-zA-Z0-9]/.test( a );
};


/**
 * Checks if a string is a single space character.
 * @param {string} a The string to check.
 * @return {boolean} True if it's a single space, false otherwise.
 */
goog.string.isSpace = function( a ) {
  return " " == a;
};


/**
 * Checks if a string is a single Unicode character within certain ranges.
 * This is a somewhat arbitrary definition of "Unicode character" often used
 * for display purposes (ASCII printable or common extended Latin).
 * @param {string} a The string to check.
 * @return {boolean} True if it's a single Unicode character.
 */
goog.string.isUnicodeChar = function( a ) {
  return ( 1 == a.length && " " <= a && "~" >= a ) || ( "\u0080" <= a && "\ufffd" >= a );
};


/**
 * Replaces all newline characters (CRLF, CR, LF) with a single space.
 * @param {string} a The string to process.
 * @return {string} The string with newlines stripped.
 */
goog.string.stripNewlines = function( a ) {
  return a.replace( /(\r\n|\r|\n)+/g , " " );
};


/**
 * Converts all types of newline sequences (CRLF, CR, LF) to a single LF (`\n`).
 * @param {string} a The string to process.
 * @return {string} The string with canonicalized newlines.
 */
goog.string.canonicalizeNewlines = function( a ) {
  return a.replace( /(\r\n|\r|\n)/g , "\n" );
};


/**
 * Normalizes all whitespace characters (including non-breaking spaces) to regular spaces.
 * @param {string} a The string to process.
 * @return {string} The string with normalized whitespace.
 */
goog.string.normalizeWhitespace = function( a ) {
  return a.replace( /\xa0|\s/g , " " );
};


/**
 * Normalizes sequences of spaces and non-breaking spaces to a single space.
 * @param {string} a The string to process.
 * @return {string} The string with normalized spaces.
 */
goog.string.normalizeSpaces = function( a ) {
  return a.replace( /\xa0|[ \t]+/g , " " );
};


/**
 * Collapses sequences of breaking whitespace characters (tab, newline, carriage return, space)
 * into a single space, and also trims leading/trailing breaking whitespace.
 * @param {string} a The string to process.
 * @return {string} The string with collapsed breaking spaces.
 */
goog.string.collapseBreakingSpaces = function( a ) {
  return a.replace( /[\t\r\n ]+/g , " " ).replace( /^[\t\r\n ]+|[\t\r\n ]+$/g , "" );
};


/**
 * Trims leading and trailing whitespace (including non-breaking spaces) from a string.
 * @param {string} a The string to trim.
 * @return {string} The trimmed string.
 */
goog.string.trim = function( a ) {
  return a.replace( /^[\s\xa0]+|[\s\xa0]+$/g , "" );
};


/**
 * Trims leading whitespace (including non-breaking spaces) from a string.
 * @param {string} a The string to trim.
 * @return {string} The string with leading whitespace removed.
 */
goog.string.trimLeft = function( a ) {
  return a.replace( /^[\s\xa0]+/ , "" );
};


/**
 * Trims trailing whitespace (including non-breaking spaces) from a string.
 * @param {string} a The string to trim.
 * @return {string} The string with trailing whitespace removed.
 */
goog.string.trimRight = function( a ) {
  return a.replace( /[\s\xa0]+$/ , "" );
};


/**
 * Performs a case-insensitive comparison of two strings.
 * @param {string} a The first string.
 * @param {string} b The second string.
 * @return {number} -1 if `a` is less than `b`, 0 if they are equal, 1 if `a` is greater than `b`.
 */
goog.string.caseInsensitiveCompare = function( a , b )
{
  var c = String( a ).toLowerCase(); // Convert first string to lowercase.
  var d = String( b ).toLowerCase(); // Convert second string to lowercase.
  return c < d ? -1 : ( c == d ? 0 : 1 ); // Perform comparison.
};


goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g; // Regular expression for numeric string comparison.
                                                            // It captures numbers (with optional decimals) and non-digits.


/**
 * Compares two strings "numerically", meaning sequences of digits are
 * compared as numbers rather than lexicographically (e.g., "a10" > "a2").
 * @param {string} a The first string.
 * @param {string} b The second string.
 * @return {number} -1 if `a` is less than `b`, 0 if they are equal, 1 if `a` is greater than `b`.
 */
goog.string.numerateCompare = function( a , b )
{
  if ( a == b ) {
    return 0; /* Strings are identical. */
  }
  if ( !a ) {
    return -1; /* Empty string is "less" than a non-empty string. */
  }
  if ( !b ) {
    return 1; /* Non-empty string is "greater" than an empty string. */
  }

  var c = a.toLowerCase().match( goog.string.numerateCompareRegExp_ ); // Tokenize first string.
  var d = b.toLowerCase().match( goog.string.numerateCompareRegExp_ ); // Tokenize second string.
  var e = Math.min( c.length , d.length ); // Determine the minimum length of token arrays.

  /* Iterate through the tokens. */
  for ( var f = 0 ; f < e ; f++ ) {
    var g = c[f]; // Current token from first string.
    var h = d[f]; // Current token from second string.
    if ( g != h ) {
      /* If tokens differ, try numeric comparison. */
      c = parseInt( g , 10 );
      if ( !isNaN( c ) ) {
        d = parseInt( h , 10 );
        if ( !isNaN( d ) && c - d ) {
          return c - d; // Numeric difference if both are numbers.
        }
      }
      return g < h ? -1 : 1; // Otherwise, lexicographical comparison.
    }
  }
  /* If one string is a prefix of the other, the longer one is "greater". */
  return c.length != d.length ? c.length - d.length : ( a < b ? -1 : 1 );
};


/**
 * URL-encodes a string using `encodeURIComponent`.
 * @param {string} a The string to encode.
 * @return {string} The URL-encoded string.
 */
goog.string.urlEncode = function( a ) {
  return encodeURIComponent( String( a ) );
};


/**
 * URL-decodes a string using `decodeURIComponent`, also replacing '+' with ' '.
 * @param {string} a The string to decode.
 * @return {string} The URL-decoded string.
 */
goog.string.urlDecode = function( a ) {
  return decodeURIComponent( a.replace( /\+/g , " " ) );
};


/**
 * Replaces newline characters (CRLF, CR, LF) in a string with `<br>` or `<br />` tags.
 * @param {string} a The string to process.
 * @param {boolean=} b Whether to use XHTML-style `<br />` (true) or HTML4-style `<br>` (false).
 * @return {string} The string with newlines replaced by break tags.
 */
goog.string.newLineToBr = function( a , b ) {
  return a.replace( /(\r\n|\r|\n)/g , b ? "\x3cbr /\x3e" : "\x3cbr\x3e" );
};


/**
 * HTML-escapes a string, converting characters like `<`, `>`, `&`, and `"`
 * into their corresponding HTML entities.
 * @param {string} a The string to escape.
 * @param {boolean=} b If true, always escape all entities; otherwise, only escape if the character is present.
 * @return {string} The HTML-escaped string.
 */
goog.string.htmlEscape = function( a , b )
{
  if ( b ) {
    /* If 'always escape' is true, perform all replacements. */
    return a.replace( goog.string.amperRe_ , "\x26amp;" )
            .replace( goog.string.ltRe_ , "\x26lt;" )
            .replace( goog.string.gtRe_ , "\x26gt;" )
            .replace( goog.string.quotRe_ , "\x26quot;" );
  }

  /* If not always escaping, first check if any special characters are present.
   * (Note: goog.string.allRe_ is used but not defined in this snippet. It's assumed to be a regex
   * that matches any of the characters needing escaping: &, <, >, ".) */
  if ( !goog.string.allRe_.test( a ) ) {
    return a;
  }

  /* Perform replacements only if the specific character is found. */
  -1 != a.indexOf( "\x26" ) && ( a = a.replace( goog.string.amperRe_ , "\x26amp;" ) );
  -1 != a.indexOf( "\x3c" ) && ( a = a.replace( goog.string.ltRe_ , "\x26lt;" ) );
  -1 != a.indexOf( "\x3e" ) && ( a = a.replace( goog.string.gtRe_ , "\x26gt;" ) );
  -1 != a.indexOf( '"' ) && ( a = a.replace( goog.string.quotRe_ , "\x26quot;" ) );

  return a;
};


goog.string.amperRe_ = /&/g;  // Regular expression to match ampersand characters globally.
goog.string.ltRe_ = /</g;     // Regular expression to match less-than characters globally.
goog.string.gtRe_ = />/g;     // Regular expression to match greater-than characters globally.
// Note: goog.string.quotRe_ and goog.string.allRe_ are used in htmlEscape but not defined in this snippet.
// They would typically be defined here as well.