/*
 * This file contains a JavaScript program.
 * It's designed to read an integer K from standard input
 * and then print the (K-1)-th element of a predefined array A.
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original.
 */

"use strict"; // Enforce strict mode for cleaner code.


// Define the main function to encapsulate the program logic.
// It takes one argument, which is expected to be the raw input string.
const main =  ( arg )  =>   {

    // Pre-process the input argument:
    // 1. Remove leading/trailing whitespace.
    // 2. Split the string into an array of lines.
    arg = arg . trim() . split ( "\n" ) ;


    // Extract the integer K from the first line of input.
    // The first line is expected to contain space-separated values,
    // and K is the first one.
    const K  =  parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ;


    // Define the constant array 'A' as specified in the problem.
    // This array holds a sequence of predefined integer values.
    const A = [
        1,  1,  1,  2,  1,  2,  1,  5,
        2,  2,  1,  5,  1,  2,  1,  14,
        1,  5,  1,  5,  2,  2,  1,  15,
        2,  2,  5,  4,  1,  4,  1,  51
    ] ; // End of array A definition.


    // Output the element at index (K - 1) from array A to the console.
    // K is 1-indexed, so we subtract 1 to get the 0-indexed position.
    console . log ( A [ K - 1 ] ) ;

} ; // End of the main function definition.


// --- Program Execution Start ---

// Read the entire content of standard input synchronously.
// The 'utf8' encoding is used for text processing.
// Then, pass the read content to the 'main' function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
// --- Program Execution End ---