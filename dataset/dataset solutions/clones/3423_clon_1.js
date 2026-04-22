/* This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are kept exactly the same.
 * Only whitespace and comments have been altered extensively to make it
 * visually distinct from the original while maintaining identical functionality.
 */

// Enforce strict parsing and error handling in the script.
"use strict"
    ; // Semicolon for the strict mode directive

// Declare a constant variable to store the parsed numerical input.
/*
 * The input is read from standard input, which is typically
 * /dev/stdin in environments like competitive programming.
 */
const    input     =
        Number(
            require("fs")  // Import the Node.js file system module.
                .  readFileSync  (
                    "/dev/stdin"  , // Path to read from standard input.
                    "UTF-8"       // Specify the character encoding.
                )
                .  trim  ( )      // Remove leading/trailing whitespace from the read string.
        )
; // End of input variable declaration and assignment

// Start of conditional logic to check the value of 'input'.
/*
 * This block determines whether the input number is one of the
 * "lucky" prime numbers: 3, 5, or 7.
 */
if  (
        input   ===   3     // Check if the input is exactly 3.
        ||                  // Logical OR operator.
        input   ===   5     // Check if the input is exactly 5.
        ||                  // Logical OR operator.
        input   ===   7     // Check if the input is exactly 7.
    )
{
    // If any of the conditions above are true, log "YES" to the console.
    console . log ( "YES" ) ;
}
else // If none of the conditions in the 'if' block are met.
{
    // Log "NO" to the console for any other input value.
    console . log ( "NO" ) ;
}

// End of the JavaScript program.
// This comment is just for demonstrating extensive comment usage.