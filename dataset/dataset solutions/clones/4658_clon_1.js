/*
 * This is a Type I clone example.
 * It demonstrates a simple JavaScript function.
 * The original code's logic and structure are preserved exactly.
 * Only whitespace and comments have been modified extensively.
 */

'use strict' ; // Enforce strict mode for cleaner code execution.

// Define the main function that processes the input string 's'.
function main( s )
{

    // Process the input string 's' into an array of numbers.
    // 1. Split the input string by newline to get the first line.
    // 2. Split that first line by space to get individual number strings.
    // 3. Map each number string to its numerical representation.
    s = s .split( '\n' )[ 0 ] .split( ' ' ) .map( n => Number( n ) ) ;

    // Extract the first number from the processed array.
    const a = s[ 0 ] ;

    // Extract the second number from the processed array.
    const b = s[ 1 ] ;

    // Calculate the answer: sum of 'a' and 'b', then apply modulo 24.
    // This operation is often used in scenarios involving time (e.g., hours in a day).
    const ans = ( a + b ) % 24 ;

    // Output the calculated answer to the console.
    console .log( ans ) ;

} // End of the main function definition.


// This section handles reading input and invoking the main function.
// It reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string,
// and then passes it to the `main` function for processing.
main( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ;