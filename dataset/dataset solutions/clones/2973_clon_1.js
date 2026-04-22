/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition:
 * - All identifiers, variable names, function names, operators, and expressions are identical.
 * - Only whitespace and comments have been altered.
 */
"use strict"
; // Enforce strict mode for cleaner code practices.


const   main    =   (   arg )   =>  {  // Define the main function to process input.
    // Process the input argument.
    arg     =   arg.trim(   )   .   split (   "\n" ) ; // Remove leading/trailing whitespace and split by newline.

    /*
     * Extract numerical values N and K from the first line of the processed input.
     * The '~~' operator is used for a quick floor/integer conversion.
     */
    const   N   =   ~~  arg[   0   ]   .   split (   " "   )   [   0   ]   ; // First number.
    const   K   =   ~~  arg[   0   ]   .   split (   " "   )   [   1   ]   ; // Second number.


    // Calculate and print the result.
    console .   log   (   (   N   -   K   )   +   1   )   ; // Output the computed value.
}
// Call the main function with data read from standard input.
main    (   require (   'fs'    )   .   readFileSync   (   '/dev/stdin'    ,   'utf8'  )   )   ;