// This entire block encapsulates the Webpack runtime environment and module loading logic.
// It is a self-executing function designed to manage dependencies and module execution.
( function( modules ) { /* webpackBootstrap: The core module loading and caching system. */

  /*
   * This object serves as the central cache for all modules that have been loaded.
   * Modules are stored here after their first execution to prevent redundant processing.
   */
  var installedModules = {};


  // The primary function responsible for requiring and loading modules by their ID.
  function __webpack_require__( moduleId ) {

    // First, check if the requested module is already present in our cache.
    if ( installedModules[ moduleId ] ) {
      // If the module is found in the cache, simply return its pre-exported value.
      return installedModules[ moduleId ].exports;
    }

    /*
     * If the module is not in the cache, a new module entry is created.
     * This entry is immediately added to the cache for future reference.
     */
    var module = installedModules[ moduleId ] = {
      i: moduleId,      // 'i' stands for module ID, a unique identifier.
      l: false,         // 'l' indicates if the module has been fully loaded (initialized).
      exports: {}       // The 'exports' object where the module's public API will reside.
    };


    // Execute the module's function, passing necessary context and the __webpack_require__ function itself.
    // The 'this' context within the module function will be 'module.exports'.
    modules[ moduleId ].call( module.exports, module, module.exports, __webpack_require__ );


    // After successful execution, mark the module as fully loaded.
    module.l = true;


    // Finally, return the 'exports' object of the module.
    // This contains all the values and functions that the module has chosen to expose.
    return module.exports;

  }


  // Expose the 'modules' object on the __webpack_require__ function.
  // This allows direct access to all defined module functions.
  __webpack_require__.m = modules;


  // Expose the 'installedModules' cache on the __webpack_require__ function.
  // This can be useful for introspection or advanced runtime manipulation.
  __webpack_require__.c = installedModules;


  // This utility function defines a getter for harmony exports (ES Modules compatibility).
  __webpack_require__.d = function( exports, name, getter ) {

    // Only define the property if it does not already exist on the exports object.
    if ( !__webpack_require__.o( exports, name ) ) {
      Object.defineProperty( exports, name, { enumerable: true, get: getter } );
    }

  };


  // This function defines the __esModule flag on exports for ES Modules compatibility.
  __webpack_require__.r = function( exports ) {

    // If Symbol and Symbol.toStringTag are supported, set the 'Symbol.toStringTag' property.
    if ( typeof Symbol !== 'undefined' && Symbol.toStringTag ) {
      Object.defineProperty( exports, Symbol.toStringTag, { value: 'Module' } );
    }

    // Always set the '__esModule' property to true, indicating it's an ES module.
    Object.defineProperty( exports, '__esModule', { value: true } );

  };


  /*
   * This complex function creates a "fake" namespace object for interoperability
   * between different module formats (CommonJS, ES Modules, etc.).
   * It handles various 'mode' flags to determine how the 'value' should be treated.
   */
  __webpack_require__.t = function( value, mode ) {

    // Mode & 1: If 'value' is a module ID, require it first.
    if ( mode & 1 ) {
      value = __webpack_require__( value );
    }

    // Mode & 8: If behaving like a direct 'require', return the value as is.
    if ( mode & 8 ) {
      return value;
    }

    // Mode & 4: If 'value' is already a namespace object and an ES module, return it directly.
    if ( ( mode & 4 ) && typeof value === 'object' && value && value.__esModule ) {
      return value;
    }

    // Create a new, empty namespace object.
    var ns = Object.create( null );

    // Mark the new namespace object as an ES module.
    __webpack_require__.r( ns );

    // Define a 'default' export property on the namespace, pointing to the original 'value'.
    Object.defineProperty( ns, 'default', { enumerable: true, value: value } );

    // Mode & 2: If 'value' is not a string, merge all its properties into the new namespace.
    if ( mode & 2 && typeof value != 'string' ) {
      for ( var key in value ) {
        // For each property, define a getter on the namespace.
        __webpack_require__.d( ns, key, function( key ) { return value[ key ]; }.bind( null, key ) );
      }
    }

    // Return the constructed namespace object.
    return ns;

  };


  // This function provides a getter for the default export, ensuring compatibility
  // with both ES Modules and CommonJS modules.
  __webpack_require__.n = function( module ) {

    var getter = module && module.__esModule /* Check if the module is an ES module. */
      ? function getDefault() { return module[ 'default' ]; } /* If it's an ES module, return its 'default' export. */
      : function getModuleExports() { return module; };      /* Otherwise, return the module object itself. */

    // Define a special getter 'a' for the default export.
    __webpack_require__.d( getter, 'a', getter );

    return getter;

  };


  // A convenience wrapper around Object.prototype.hasOwnProperty.call.
  // Used to safely check for owned properties on objects.
  __webpack_require__.o = function( object, property ) {
    return Object.prototype.hasOwnProperty.call( object, property );
  };


  // This variable holds the public path for webpack assets.
  // It is an empty string in this configuration.
  __webpack_require__.p = "";


  /*
   * This is the final step: load the entry module of the application.
   * The 's' property on __webpack_require__ is used to identify the entry point.
   * The exports of this entry module are then returned, effectively starting the application.
   */
  return __webpack_require__( __webpack_require__.s = "./src/panasonic2020/C.js" );

} )
// End of Webpack runtime environment.
/* Module Definitions Section */
( {

/***/ "./src/panasonic2020/C.js":
/*!********************************************************************************************!*\
  !*** ./src/panasonic2020/C.js - This is the main application logic for panasonic2020/C.js ***!
  \********************************************************************************************/
/*! no static exports found - This module does not explicitly define static exports. */
/***/ ( function( module, exports, __webpack_require__ ) {

/*
 * The following code is wrapped in an eval statement.
 * It contains Babel-generated helper functions and the main logic for the problem.
 */
eval("function _slicedToArray( arr, i ) {\\n  return _arrayWithHoles( arr ) || _iterableToArrayLimit( arr, i ) || _nonIterableRest();\\n}\\n\\nfunction _nonIterableRest() {\\n  throw new TypeError( \\\"Invalid attempt to destructure non-iterable instance\\\" );\\n}\\n\\nfunction _iterableToArrayLimit( arr, i ) {\\n  // Check if the input is iterable or an arguments object.\\n  if ( !( Symbol.iterator in Object( arr ) || Object.prototype.toString.call( arr ) === \\\"[object Arguments]\\\" ) ) {\\n    return;\\n  }\\n\\n  var _arr = [];\\n  var _n = true;\\n  var _d = false;\\n  var _e = undefined;\\n\\n  try {\\n    // Iterate through the array.\\n    for ( var _i = arr[ Symbol.iterator ](), _s; !( _n = ( _s = _i.next() ).done ); _n = true ) {\\n      _arr.push( _s.value );\\n      // If a limit 'i' is provided and reached, break the loop.\\n      if ( i && _arr.length === i ) {\\n        break;\\n      }\\n    }\\n  } catch ( err ) {\\n    _d = true;\\n    _e = err;\\n  } finally {\\n    try {\\n      // Ensure the iterator is closed if it has a 'return' method.\\n      if ( !_n && _i[ \\\"return\\\" ] != null ) {\\n        _i[ \\\"return\\\" ]();\\n      }\\n    } finally {\\n      // Re-throw any caught error during iteration.\\n      if ( _d ) {\\n        throw _e;\\n      }\\n    }\\n  }\\n\\n  return _arr;\\n}\\n\\nfunction _arrayWithHoles( arr ) {\\n  // Simple check if the input is an actual array.\\n  if ( Array.isArray( arr ) ) {\\n    return arr;\\n  }\\n}\\n\\n\\nvar fs = __webpack_require__( /*! fs */ \\\"fs\\\" );\\n\\n\\nvar main = function main( input ) {\\n  /*\\n   * Process the input string:\\n   * 1. Split by newline to get the first line.\\n   * 2. Split the first line by space to get individual string numbers.\\n   * 3. Map to convert string numbers to actual numbers (i - 0).\\n   */\\n  var _input$split$0$split$ = input.split( '\\\\n' )[ 0 ].split( ' ' ).map( function ( i ) {\\n    return i - 0;\\n  } );\\n\\n  // Use _slicedToArray helper to destructure the array into variables a, b, c.\\n  var _input$split$0$split$2 = _slicedToArray( _input$split$0$split$, 3 );\\n  var a = _input$split$0$split$2[ 0 ];\\n  var b = _input$split$0$split$2[ 1 ];\\n  var c = _input$split$0$split$2[ 2 ];\\n\\n  // Perform square root and rounding operations for 'a'.\\n  a = Math.round( Math.sqrt( a ) * 10 );\\n  a = a / 10;\\n\\n  // Perform square root and rounding operations for 'b'.\\n  b = Math.round( Math.sqrt( b ) * 10 );\\n  b = b / 10;\\n\\n  // Perform square root and rounding operations for 'c'.\\n  c = Math.round( Math.sqrt( c ) * 10 );\\n  c = c / 10;\\n\\n  /*\\n   * The core logic: Check if the sum of 'a' and 'b' is less than 'c'.\\n   * This comparison is based on the problem's requirements.\\n   */\\n  var answer = a + b < c;\\n\\n  // Output \\\"Yes\\\" or \\\"No\\\" based on the comparison result.\\n  if ( answer ) {\\n    console.log( \\'Yes\\' ); // Condition is true.\\n  } else {\\n    console.log( \\'No\\' );  // Condition is false.\\n  }\\n};\\n\\n\\n// Read input from stdin and pass it to the main function.\\nmain( fs.readFileSync( '/dev/stdin', 'utf8' ) );\\n\\n/* Webpack sourceURL for debugging purposes. */\\n//# sourceURL=webpack:///./src/panasonic2020/C.js?")

/***/ } ),

/***/ "fs":
/*!****************************************************************************!*\
  !*** external "fs" - This module provides access to the Node.js file system. ***!
  \****************************************************************************/
/*! no static exports found - This external module does not define static exports. */
/***/ ( function( module, exports ) {

/*
 * This block integrates the external 'fs' module from Node.js.
 * It's wrapped in an eval statement as part of the webpack bundling process.
 */
eval("/* External Node.js 'fs' module integration. */\\nmodule.exports = require( \\\"fs\\\" );\\n\\n/* Source URL for external module debugging. */\\n//# sourceURL=webpack:///external_%22fs%22?")

/***/ } )

/* End of all module definitions. */
} );