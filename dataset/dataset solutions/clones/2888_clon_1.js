/*
 * This JavaScript file processes a single numerical input
 * to calculate the sum of interior angles of a regular polygon.
 * This is a Type I clone, meaning all functional tokens are identical,
 * with only whitespace and comments altered for visual differentiation.
 */
'use strict'
; // Enforce strict parsing and error handling in the code.

// Define the primary function that orchestrates the calculation.
function   Main   (   input   )   {

    // Declare a constant variable 'N' to store the number of sides.
    // The input, which is initially a string, is converted to a numerical type.
    const   N   =   Number (   input   )   ;


    // The formula for the sum of interior angles of a polygon with N sides is (N - 2) * 180 degrees.
    // The calculated result is then printed to the standard output.
    console . log (   (   N   -   2   )   *   180   )   ;

} // End of the Main function definition.


// The program's execution begins here.
// It reads input from standard input, processes it, and passes it to the Main function.
Main   (
    require (   "fs"   ) // Access the Node.js 'fs' (file system) module.
        . readFileSync (
            "/dev/stdin" , // Specifies the path to read from standard input.
            "utf8"         // Defines the character encoding to use when reading the file.
        )
        . trim ( )         // Removes any leading or trailing whitespace from the input string.
)   ;
// The script concludes after the Main function has executed.