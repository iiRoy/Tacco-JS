// This is a simple JavaScript program demonstrating string templating.
// It leverages a module named 'rssi' for efficient string formatting.

// Declare and initialize variables using a single 'var' statement
// to manage the lifecycle of our template and its output.

var fmt = require( '../rssi' ), // Initialize 'fmt' by loading the 'rssi' module.
                                  // This module is crucial for our templating functionality.

    hello = fmt( 'hello, #{thing}' ), // Compile a template string using 'fmt'.
                                      // The '#{thing}' serves as a placeholder for dynamic content.

    msg = hello( { thing : 'shawarma' } )
                                      ; /* Format the compiled template with actual data.
                                        * Here, 'shawarma' replaces '#{thing}'.
                                        * The result is stored in the 'msg' variable.
                                        */


// After all processing, the final message is ready.

// Output the generated message to the console for verification.
// This will display the formatted string.
console.log( msg )
;