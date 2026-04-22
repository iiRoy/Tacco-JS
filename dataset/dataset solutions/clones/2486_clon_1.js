/*
 * This JavaScript file processes a simple calculation based on two input numbers.
 * It demonstrates reading from standard input and performing a conditional output.
 *
 * Please note: The use of `eval()` is generally discouraged due to security and performance concerns.
 * It is retained here to adhere strictly to the Type I clone definition, which requires
 * preserving all expressions exactly as they are in the original source.
 */

'use strict'
; // Enforces strict parsing and error handling for cleaner code.

// Definition of the main program function that takes an input string.
function   main   (   input   )
{
    // Splits the input string by space to get two numeric string values.
    // These are then assigned to 'houseW' and 'curtainW' respectively.
    const   [   houseW ,   curtainW   ]   =   input .   split   (   ' '   ) ;

    // Performs a calculation and prints the result to the console.
    // The calculation determines if the "remaining width" (houseW - 2 * curtainW) is positive.
    // If it's positive, that value is printed; otherwise, 0 is printed.
    // The `eval()` function is used exactly as it was in the original code for string-to-number conversion
    // and calculation within the expression.
    console .   log   (   eval   (   houseW   -   eval   (   curtainW   *   2   )   )   >   0   ?   eval   (   houseW   -   (   curtainW   *   2   )   )   :   0   ) ;
}

// Calls the main function, providing input read from standard input.
// This uses Node.js's 'fs' module to synchronously read the entire content
// of '/dev/stdin' as a UTF-8 encoded string.
main   (   require   (   'fs'   ) .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ) ;