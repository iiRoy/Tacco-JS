/*
 * This is a Type I clone of an existing JavaScript program.
 * It strictly adheres to the definition:
 * - All identifiers, variable names, function names, operators, and expressions are identical.
 * - Only whitespace and comments have been altered.
 * The purpose is to demonstrate visual difference while maintaining logical equivalence.
 */

'use strict' ; // Enforce strict mode for better error handling and cleaner code.


/**
 * The main function to process input and calculate the result.
 * @param {string} inp - The raw input string read from stdin.
 */
function  main ( inp )
{

    // Step 1: Pre-process the input string.
    // Trim whitespace, split by space, and convert each part to a number.
    inp  =  inp . trim ( ) . split ( ' ' ) . map ( x  =>  x * 1 ) ;


    // Step 2: Calculate the answer based on the processed input array.
    // The problem likely involves calculating the area of a grid divided by 2,
    // and rounding up to the nearest whole number (e.g., for tiles).
    let  ans  =  Math . ceil ( ( inp [ 0 ]  *  inp [ 1 ] )  / 2 ) ; // Calculate and round up.


    // Step 3: Output the final answer to the console.
    console . log ( ans ) ;
    // End of main function logic.

} // Closing bracket for the main function.


// This section handles the execution of the main function.
// It reads input from standard input and passes it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;
// The program finishes after main() completes.