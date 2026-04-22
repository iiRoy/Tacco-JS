/*
 * This JavaScript file processes a single integer input from stdin.
 * It computes a specific mathematical expression based on that integer.
 * The result of the calculation is then printed to the console.
 * This is a Type I clone, ensuring logical and structural identity
 * while introducing extensive variations in whitespace and comments.
 */

"use strict" ; // Enforces strict parsing and error handling for cleaner code.

// Define the primary function that encapsulates the core logic of the program.
const    main    =    (    arg    )    =>
{
    // Step 1: Pre-process the raw input string.
    // Remove any leading or trailing whitespace, then split the string
    // into an array of lines based on the newline character.
    arg     =     arg . trim ( ) . split ( "\n" ) ;

    // Step 2: Extract the relevant data.
    // Parse the first element of the processed argument array as an integer.
    // This assumes the first line of input contains the number we need.
    const    N    =    parseInt (    arg [ 0 ]    )    ;

    // Step 3: Perform the core calculation and output the result.
    // Calculate N divided by 2, then round the result up to the nearest integer,
    // and finally subtract 1 from that rounded value.
    // The final computed value is then written to standard output.
    console . log (    Math . ceil (    N    /    2    )    -    1    )    ;
}

// Entry point of the program:
// Read the entire content of standard input synchronously.
// The input is expected to be UTF-8 encoded.
// Pass this read content to our main processing function.
main (    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' )    )    ;