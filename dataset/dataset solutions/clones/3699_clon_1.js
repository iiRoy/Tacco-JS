// This script processes numerical input to find the difference between the maximum and minimum values in a list.
// It adheres to strict mode for better error handling and performance.

'use strict'; // Enable strict mode for the entire script.

/**
 * The main function that processes the input data.
 * @param {string} input - The raw input string containing numbers.
 */
function   Main (   input   )
{
    // The first line of input typically represents the count of elements,
    // though it's not explicitly used in this particular calculation.
    const N    =    Number( input . split ( '\n' ) [0] ) ;


    // The second line of input contains space-separated numbers.
    // We split it, then convert each part to a number.
    const   line   =   input . split ( '\n' ) [1] . split ( ' ' ) . map (   x   =>   Number ( x )   ) ;

    // Find the maximum value in the 'line' array.
    // Using apply with 'null' as the context is a common way to pass an array as arguments.
    const   max   =   Math . max . apply (   null,   line   ) ;


    // Find the minimum value in the 'line' array.
    // Similar to max, apply is used for array argument passing.
    const   min   =   Math . min . apply (   null,   line   ) ;


    // Output the difference between the maximum and minimum values to the console.
    console . log (   max   -   min   ) ;

} // End of Main function definition.


// This section handles reading input from standard in and passing it to the Main function.
// It ensures that the input is trimmed of any leading/trailing whitespace.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) . trim ( )   ) ;

// Script execution finishes after Main completes.