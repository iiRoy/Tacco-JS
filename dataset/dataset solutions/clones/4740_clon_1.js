/*
 * This JavaScript file demonstrates a simple conditional logic.
 * It processes a numerical input and prints a calculated value.
 * The 'use strict' directive is applied globally for better code quality.
 */
'use strict' // Enforces strict parsing and error handling for the entire script.

// This is the primary function that handles the application logic.
function   main   (   input   )
{
    // Begin conditional block: check if the input is perfectly divisible by 6.
    if   (   input   %   6   ==   0   )
    {
        // If the remainder of input divided by 6 is 0,
        // it means input is a multiple of 6.
        // In this case, we simply output the result of input divided by 6.
        console.log   (   input   /   6   )   ;
    } // End of the 'if' block.
    else
    {
        // If the input is not perfectly divisible by 6,
        // we calculate the integer part of (input / 6) and add 1.
        // This effectively provides a "ceiling" like behavior for positive numbers.
        console.log   (   parseInt   (   input   /   6   )   +   1   )   ;
    } // End of the 'else' block.

} // End of the 'main' function definition.


// --- Program Initialization and Execution ---

// The main function is called immediately with input from standard input.
// The 'fs' module is used to read the file, and 'readFileSync' reads synchronously.
// "/dev/stdin" is a common Unix-like path for standard input.
// The encoding "utf8" is specified for text interpretation.
main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// --- End of Script ---