/* This is a Type I clone of a JavaScript module bundle. */
/*
 * The following code represents a webpack runtime,
 * responsible for loading and managing modules within the application.
 */
( function ( modules ) {

    // This section is part of the webpackBootstrap mechanism.
    // It sets up the necessary infrastructure for module management.


    // --- Module Cache ---
    // A simple object to store already loaded modules.
    var installedModules = { } ;


    // --- The Require Function ---
    // This function is the heart of the module loading system.
    // It mimics Node.js's 'require' but for bundled modules.
    function __webpack_require__ ( moduleId ) {

        // Step 1: Check if the requested module is already in the cache.
        if ( installedModules[ moduleId ] ) {
            // If found, return its exports immediately.
            return installedModules[ moduleId ].exports ;
        }

        // Step 2: If not in cache, create a new module entry.
        // Initialize it and place it into the cache.
        var module = installedModules[ moduleId ] = {
            i: moduleId ,      // The unique ID of the module.
            l: false ,         // A flag indicating if the module has been loaded.
            exports: { }       // The object that will hold the module's exports.
        } ;


        // Step 3: Execute the module's function.
        // The module function is expected to populate `module.exports`.
        // 'this' context is set to `module.exports`.
        // Arguments are `module`, `module.exports`, and the `__webpack_require__` function itself.
        modules[ moduleId ].call( module.exports , module , module.exports , __webpack_require__ ) ;


        // Step 4: Mark the module as fully loaded.
        module.l = true ;


        // Step 5: Return the exports of the newly loaded module.
        return module.exports ;

    }


    // --- Webpack Specific Properties and Helper Functions ---

    // Expose the 'modules' object, which contains all bundled module functions.
    __webpack_require__.m = modules ;


    // Expose the 'installedModules' cache.
    __webpack_require__.c = installedModules ;


    // Define a getter function for harmony exports (ES Modules).
    // This helps in exposing properties from ES modules.
    __webpack_require__.d = function ( exports , name , getter ) {
        if ( ! __webpack_require__.o( exports , name ) ) {
            Object.defineProperty( exports , name , { enumerable: true , get: getter } ) ;
        }
    } ;


    // Define __esModule on exports for ES Module compatibility.
    __webpack_require__.r = function ( exports ) {
        if ( typeof Symbol !== 'undefined' && Symbol.toStringTag ) {
            Object.defineProperty( exports , Symbol.toStringTag , { value: 'Module' } ) ;
        }
        Object.defineProperty( exports , '__esModule' , { value: true } ) ;
    } ;


    // Create a fake namespace object for module interoperability.
    // This handles various module types (commonjs, esm, etc.).
    __webpack_require__.t = function ( value , mode ) {
        if ( mode & 1 ) value = __webpack_require__( value ) ; // If mode 1, treat value as module ID and require it.
        if ( mode & 8 ) return value ;                          // If mode 8, return value directly.
        if ( ( mode & 4 ) && typeof value === 'object' && value && value.__esModule ) return value ; // If mode 4 and already ES module, return.
        var ns = Object.create( null ) ;                        // Create a new namespace object.
        __webpack_require__.r( ns ) ;                           // Mark as ES module.
        Object.defineProperty( ns , 'default' , { enumerable: true , value: value } ) ; // Set 'default' export.
        if ( mode & 2 && typeof value != 'string' ) {
            // If mode 2 and value is not a string, merge properties.
            for ( var key in value ) {
                __webpack_require__.d( ns , key , function ( key ) { return value[ key ] ; }.bind( null , key ) ) ;
            }
        }
        return ns ;
    } ;


    // getDefaultExport function for compatibility with non-harmony modules.
    // Provides a consistent way to access default exports.
    __webpack_require__.n = function ( module ) {
        var getter = module && module.__esModule ?
            function getDefault ( ) { return module[ 'default' ] ; } :
            function getModuleExports ( ) { return module ; } ;
        __webpack_require__.d( getter , 'a' , getter ) ; // Expose the getter as 'a'.
        return getter ;
    } ;


    // Object.prototype.hasOwnProperty.call wrapper for convenience.
    __webpack_require__.o = function ( object , property ) {
        return Object.prototype.hasOwnProperty.call( object , property ) ;
    } ;


    // The public path for assets (empty in this case).
    __webpack_require__.p = "" ;


    /*
     * This is the final step of the webpack runtime execution.
     * It loads the entry module and returns its exports.
     */
    return __webpack_require__( ( __webpack_require__.s = "./src/ABC157/C.js" ) ) ;

} )
/************************************************************************/
( {

    // --- Module Definitions ---
    // This object contains all the actual application modules, mapped by their paths.

    /***/ "./src/ABC157/C.js" :
    /*!*************************!*\
      !*** ./src/ABC157/C.js ***!
      \*************************/
    /*! no static exports found */
    /***/ ( function ( module , exports , __webpack_require__ ) {

        // The actual code for the application logic.
        // This is typically wrapped in an 'eval' statement by webpack for source mapping or other purposes.
        eval( "/* Helper function for destructuring arrays into a fixed number of elements. */\nfunction _slicedToArray( arr , i ) { return _arrayWithHoles( arr ) || _iterableToArrayLimit( arr , i ) || _nonIterableRest( ) ; }\n\n/* This function is invoked when a non-iterable instance is attempted to be destructured. */\nfunction _nonIterableRest( ) {\n    throw new TypeError( \"Invalid attempt to destructure non-iterable instance\" ) ;\n}\n\n/* Limits an iterable to a specific number of elements. */\nfunction _iterableToArrayLimit( arr , i ) {\n    if ( ! ( Symbol.iterator in Object( arr ) || Object.prototype.toString.call( arr ) === \"[object Arguments]\" ) ) {\n        return ;\n    }\n    var _arr = [ ] ;\n    var _n = true ;\n    var _d = false ;\n    var _e = undefined ;\n    try {\n        for ( var _i = arr[ Symbol.iterator ]( ) , _s ; ! ( _n = ( _s = _i.next( ) ).done ) ; _n = true ) {\n            _arr.push( _s.value ) ;\n            if ( i && _arr.length === i ) break ;\n        }\n    } catch ( err ) {\n        _d = true ;\n        _e = err ;\n    } finally {\n        try {\n            if ( ! _n && _i[ \"return\" ] != null ) _i[ \"return\" ]( ) ;\n        } finally {\n            if ( _d ) throw _e ;\n        }\n    }\n    return _arr ;\n}\n\n/* Checks if the given array has 'holes' or is a sparse array. */\nfunction _arrayWithHoles( arr ) { if ( Array.isArray( arr ) ) return arr ; }\n\n// Import the 'fs' (file system) module, which is an external dependency.\nvar fs = __webpack_require__( /* filesystem module */ \"fs\" ) ;\n\n// Define a constant for an 'incorrect' or invalid result value.\nvar INCORRECT = -1 ;\n\n/*\n * The main function that processes the input and computes the result.\n * It takes the raw input string as an argument.\n */\nvar main = function main( input ) {\n    // Split the input string into an array of lines.\n    var lines = input.split( '\\n' ) ;\n\n    // Parse the first line to extract N (number of digits) and M (number of constraints).\n    var _lines$shift$split$ma = lines.shift( ).split( ' ' ).map( function ( i ) {\n            return i - 0 ; // Convert string parts to numbers.\n        } ) ,\n        _lines$shift$split$ma2 = _slicedToArray( _lines$shift$split$ma , 2 ) ,\n        N = _lines$shift$split$ma2[ 0 ] ,\n        M = _lines$shift$split$ma2[ 1 ] ;\n\n    // Initialize an array 'p' to hold the digits of the number.\n    // Each element is initialized to -1, indicating an unset digit.\n    var p = [ ] ;\n    for ( var i = 0 ; i < N ; i++ ) {\n        p.push( -1 ) ;\n    }\n\n    // Iterate through each of the M constraints provided.\n    for ( var _i2 = 0 ; _i2 < M ; _i2++ ) {\n        // Parse each constraint line to get the position 's' and the digit 'c'.\n        var _lines$shift$split$ma3 = lines.shift( ).split( ' ' ).map( function ( i ) {\n                return i - 0 ; // Convert string parts to numbers.\n            } ) ,\n            _lines$shift$split$ma4 = _slicedToArray( _lines$shift$split$ma3 , 2 ) ,\n            s = _lines$shift$split$ma4[ 0 ] ,\n            c = _lines$shift$split$ma4[ 1 ] ;\n\n        var column = s - 1 ; // Convert 1-indexed position 's' to 0-indexed 'column'.\n\n        /*\n         * Check for conflicts: If the digit at this position 'column' has already been set\n         * and the new constraint 'c' is different from the existing digit 'p[column]',\n         * then a valid number cannot be formed, so print INCORRECT and exit.\n         */\n        if ( p[ column ] !== -1 && p[ column ] !== c ) {\n            console.log( INCORRECT ) ;\n            return ;\n        }\n\n        // Apply the constraint: set the digit at 'column' to 'c'.\n        p[ column ] = c ;\n    }\n\n    // Handle cases based on the number of digits 'N'.\n    if ( N >= 2 ) {\n        // If the number has 2 or more digits, the first digit cannot be 0.\n        // If p[0] is 0, print INCORRECT and exit.\n        if ( p[ 0 ] === 0 ) {\n            console.log( INCORRECT ) ;\n            return ;\n        }\n\n        /*\n         * This condition is crucial for replicating the original code's exact behavior.\n         * If N >= 2 and the first digit (p[0]) is still unset (-1), the original code\n         * considers this an impossible scenario and prints INCORRECT. This implies that\n         * for N >= 2, the first digit MUST be specified by a constraint.\n         */\n        if ( p[ 0 ] === -1 ) {\n            console.log( INCORRECT ) ;\n            return ;\n        }\n\n        // For any remaining unset digits (represented by -1), set them to 0.\n        // This ensures the smallest possible number is formed.\n        for ( var _i3 = 0 ; _i3 < N ; _i3++ ) {\n            if ( p[ _i3 ] === -1 ) {\n                p[ _i3 ] = 0 ;\n            }\n        }\n    } else { // This block handles the case where N === 1 (a single-digit number).\n        // If the single digit is unset (-1), default it to 0.\n        if ( p[ 0 ] === -1 ) {\n            p[ 0 ] = 0 ;\n        }\n    }\n\n    // Join the array of digits into a single string and print the result.\n    console.log( p.join( '' ) ) ;\n} ;\n\n// Read the input from standard input (stdin) and pass it to the main function.\n// The input is read as 'utf8' encoded text.\nmain( fs.readFileSync( '/dev/stdin' , 'utf8' ) ) ;\n\n// # sourceURL=webpack:///./src/ABC157/C.js?\n" ) ;

    } ) ,

    /***/ "fs" :
    /*!*********************!*\
      !*** external "fs" ***!
      \*********************/
    /*! no static exports found */
    /***/ ( function ( module , exports ) {

        // This module handles the external 'fs' dependency.
        // It simply exports the 'fs' module from the Node.js runtime.
        eval( "module.exports = require( \"fs\" ) ; // Export the Node.js 'fs' module.\n\n// # sourceURL=webpack:///external_%22fs%22?\n" ) ;

    } )

} ) ;