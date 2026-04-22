/*
 * This JavaScript code defines a main function to process numerical input.
 * It reads from standard input, performs calculations, and prints the result.
 */

// The primary function that encapsulates the logic for processing the input.
function   Main   (   input   )
{

    // First step: Remove any leading or trailing whitespace from the input string.
    input   =   input   .   trim   (   )   ;

    // Second step: Split the cleaned string by spaces, then convert each resulting substring into a number.
    // This transforms the input string into an array of numbers.
    input   =   input   .   split   (   " "   )   .   map   (   Number   )   ;


    /*
     * Core logic:
     * 1. Sum the first three elements of the numerical array.
     * 2. Find the maximum value among all elements in the array.
     * 3. Subtract the maximum value from the sum of the first three elements.
     * 4. Output the final calculated result to the console.
     */
    console   .   log   (   input   [   0   ]   +   input   [   1   ]   +   input   [   2   ]   -   Math   .   max   .   apply   (   null   ,   input   )   )   ;

} // End of the Main function definition.


// Immediately invoke the Main function upon script execution.
// It reads the entire content of the standard input stream as a UTF-8 string.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;