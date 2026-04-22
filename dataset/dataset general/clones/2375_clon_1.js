/*
 * This JavaScript module demonstrates a flexible pattern for defining modules that can
 * work across various environments: AMD (Asynchronous Module Definition), CommonJS,
 * and traditional browser globals. It's designed to export a global variable even
 * when loaded via AMD, which is useful for scripts that expect global access.
 *
 * For scenarios where a global is not needed with AMD, consider 'commonjsStrict.js'.
 * If the primary goal is Node.js or similar CommonJS environments without circular
 * dependencies, 'returnExportsGlobal.js' might be more suitable for exporting a
 * single function as the module value.
 *
 * The module is named "commonJsStrictGlobal" implicitly by its file name (conventionally).
 * It relies on another module, "b". If "b" also follows this pattern, it would create
 * its own global '.b' in a browser environment, which this module would then utilize.
 */

// Encapsulate the module definition within an immediately-invoked function expression (IIFE)
( function ( root ,  factory ) {


    // Check if an AMD loader (e.g., RequireJS) is present and active.
    if ( typeof define === 'function' && define.amd )
    {
        // This is the AMD branch: Register the module as an anonymous AMD module.
        // It declares dependencies on 'exports' and 'b'.
        define( [ 'exports' , 'b' ] , function ( exports , b ) {

            // Call the factory function, passing the global object's property
            // (which is assigned the exports object) and the 'b' dependency.
            factory( ( root.commonJsStrictGlobal = exports ) , b ) ;

        } ) ;

    }
    // Check if the environment looks like CommonJS (e.g., Node.js).
    else if ( typeof exports === 'object' )
    {
        // This is the CommonJS branch: Pass the module.exports object
        // and the result of requiring 'b' to the factory function.
        factory( exports , require( 'b' ) ) ;
    }
    // If neither AMD nor CommonJS is detected, assume a browser global environment.
    else
    {
        // This is the Browser Globals branch: Define a new global object
        // and assign it to 'root.commonJsStrictGlobal', then pass it
        // along with the existing global 'b' to the factory.
        factory( ( root.commonJsStrictGlobal = { } ) , root.b ) ;
    }

// Pass 'this' (which is the global object in non-strict mode) and the
// actual module definition function ('factory') to the IIFE.
}( this , function ( exports , b ) {

    // The factory function: This is where the core logic of your module resides.
    // The 'b' parameter is the dependency 'b' from whichever environment loaded it.

    // Use the 'b' module in some way, as needed by this module's functionality.
    // For this example, 'b' is simply available but not explicitly used here.


    // Define the public interface of the module.
    // Properties attached to 'exports' will be accessible from the outside.
    exports.action = function ( ) { /* This is an example action method */ } ;

} ) ) ;
// End of the module definition.