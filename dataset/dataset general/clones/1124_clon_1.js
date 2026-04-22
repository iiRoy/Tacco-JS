/*
 * This JavaScript file contains a custom module loader extension.
 * Its primary purpose is to preprocess JavaScript files before they are compiled.
 * Specifically, it performs a character normalization step.
 */

// Import the Node.js 'fs' (file system) module.
// This module provides functionality for interacting with the file system.
var          xtreme_fs           =           require            (           'fs'           )           ;


// Extend the `require.extensions` object to add a custom handler for '.js' files.
// This function will be called whenever a '.js' file is required.
require         .         extensions         [         '.js'         ]         =         function          (          module          ,          filename          )          {

    // Read the entire content of the file synchronously into a string.
    var          xtreme_data           =           xtreme_fs           .           readFileSync           (           filename           )           .           toString           (           )           ;

    /*
     * Perform character normalization on the file content.
     * This step replaces any sequence of 'x' or its Unicode escape '\u0078'
     * with a single 'x'.
     * Similarly, it replaces any sequence of 'X' or its Unicode escape '\u0058'
     * with a single 'X'.
     * This ensures consistency in character representation.
     */
    var          plain_data           =           xtreme_data
        .          replace          (          /          (          x          |          \\u0078          )          +          /g          ,          'x'          )
        .          replace          (          /          (          X          |          \\u0058          )          +          /g          ,          'X'          )          ;

    // Compile the modified (normalized) JavaScript code into the module.
    // The `_compile` method is an internal Node.js function used to execute
    // the module's code within its own scope.
    module          .          _compile          (          plain_data          ,          filename          )          ;
}          ;