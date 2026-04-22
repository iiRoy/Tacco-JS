/*
 * This is a Type I clone example.
 * The original code calculates a value based on input.
 * All identifiers and expressions remain identical.
 */
'use strict'
// This line declares strict mode for the JavaScript code.

// Define the primary function that processes the input received.
function   main (   input   )
{
    // Coerce the 'input' value into an integer using a double bitwise NOT operation.
    // This is an efficient, albeit potentially less explicit, way to achieve integer conversion.
    input   =   ~~   input

    /*
     * Perform the core calculation:
     * 1. Divide the integer 'input' by the constant 111.
     * 2. Round the result upwards to the nearest whole number using 'Math.ceil()'.
     * 3. Multiply this rounded-up value by 111 to find the next highest multiple of 111.
     * 4. Output the final calculated result to the standard console.
     */
    console   .   log   (   Math   .   ceil   (   input   /   111   )   *   111   )

} // End of the 'main' function definition.


/*
 * This section handles the initial execution flow of the script.
 * It reads the entire content of '/dev/stdin' as a UTF-8 string,
 * then passes this string as an argument to the 'main' function.
 * The 'require('fs')' call loads the Node.js file system module.
 */
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )

// End of this JavaScript file.