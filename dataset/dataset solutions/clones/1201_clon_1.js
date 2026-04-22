/*
 * This file is a Type I clone of an original JavaScript code snippet.
 *
 * According to the official definition, a Type I clone means:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * Therefore, every identifier, variable name, function name, operator,
 * and expression has been preserved without alteration.
 * The only modifications are extensive changes to whitespace (indentation,
 * spacing, blank lines) and the addition of comments throughout the code.
 *
 * This ensures logical and structural identity while presenting a visually
 * distinct representation.
 */


'use strict'    ;   // Enforces strict parsing and error handling for the entire script.


// Start of a self-executing anonymous function (Immediately Invoked Function Expression - IIFE).
// It takes 'stdin' as an argument, which will be provided by 'require('fs').readFileSync'.

(   function    (     stdin     )

{   // The main block of the IIFE begins here.

    // Declare a variable 'inputs' to store the processed standard input.
    var inputs  =   stdin

            .toString(  )       // Convert the buffer received from stdin into a string.

            .trim( )            ;   // Remove any leading or trailing whitespace from the string.


    // The following lines represent the original code's structure precisely.
    // Note: 'function(x);' is an anonymous function expression followed by a semicolon,
    // making it a standalone statement.
    // The subsequent '{ ... }' is a separate, independent block statement.
    // These constructs are preserved as per Type I cloning rules.

        function    (   x   )   ;   // An anonymous function declaration. The semicolon terminates its statement.

        {   // This is an independent block of code, not the body of the 'function(x)' above.

            console.log (
                            Math    ,   // The Math object itself.
                            pow (   03  )   // Calls a global 'pow' function (if it exists) with octal 3 (decimal 3).
                                            // Note: This is not 'Math.pow'.
                        )   ;
        }


    // This line parses the 'inputs' string into an integer.
    // The result of this parsing operation is not explicitly used or assigned.
    parseInt    (   inputs  ,   10    )   ; // Parses 'inputs' as a decimal (base 10) integer.


}   (   require (   'fs'   )   // Node.js built-in 'fs' (file system) module.

                .readFileSync (   '/dev/stdin'  ,   // Reads the entire content of standard input synchronously.

                                  'utf8'            // Specifies UTF-8 encoding for the read data.
                                )
)   )   ;   // End of the IIFE, passing the content of '/dev/stdin' as the 'stdin' argument.

// End of the cloned JavaScript code.