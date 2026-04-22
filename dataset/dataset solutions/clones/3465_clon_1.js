/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly.
 * The core functionality remains absolutely identical.
 */

'use strict'; // Enforce strict mode for the entire script, promoting cleaner code.


// Define the main function that processes the input data.
// It takes a single string 'INPUT' as its argument.
const main = ( INPUT ) => {

    // First, split the raw input string by newline characters.
    // This separates the input into an array of individual lines.
    const input = INPUT .split( '\n' );

    // The problem statement implies that the string 'S' is provided
    // on the first line of the input.
    const S = input[ 0 ]; // Extract the first line from the input array.

    // Now, we evaluate the length of the string 'S'.
    if ( S.length === 2 )
    {
        // If the string 'S' has exactly two characters,
        // we print it to the console without any modification.
        console.log( S );
    }
    else
    {
        // If the string 'S' does not have a length of two (i.e., it's
        // either shorter or longer than two characters),
        // we need to reverse it before printing.
        // The process involves:
        // 1. Splitting the string into an array of individual characters.
        // 2. Reversing the order of elements in that character array.
        // 3. Joining the characters back together to form a new string.
        console.log( S .split( '' ) .reverse() .join( '' ) );
    }

}; // End of the main function definition.


// This line is responsible for reading the input from standard input
// and then invoking the 'main' function with that input.
// 'require('fs')' imports the Node.js file system module.
// '.readFileSync('/dev/stdin', 'utf8')' reads the entire content
// of standard input as a UTF-8 encoded string.
main( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) );

// --- End of Program ---