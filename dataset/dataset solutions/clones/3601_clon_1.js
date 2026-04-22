// This file contains a Type I clone of a JavaScript program.
// All original identifiers, operators, and expressions are preserved.
// Only whitespace and comments have been extensively modified.

    'use strict'
; // Activates strict parsing and error handling for the entire script.

/**
 * Main application entry point.
 * This function processes the input string to perform a specific calculation.
 *
 * @param   {string}   INPUT   The raw input string, typically from stdin.
 *                             Expected format: "NUMBER1 NUMBER2"
 */
function    Main  (  INPUT  )
{
                                        // Declare a constant 'N' to store processed numbers.
                                        // First, split the input string by spaces.
                                        // Then, map each resulting string part to its numerical representation.
        const   N    =    INPUT . split ( " " ) . map (   n   =>   Number (   n   )   )   ;


                                                                // Calculate the result: (first_number - 1) * (second_number - 1).
                                                                // The 'console.log' function prints this result to standard output.
        console . log (    (    N [ 0 ] - 1    )    *    (    N [ 1 ] - 1    )    )    ;

} // -- End of Main function --

// Call the Main function.
// The input is obtained by reading the content of '/dev/stdin' using Node.js's 'fs' module.
// The 'utf8' encoding is specified for the input stream.
Main (    require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )    )    ;