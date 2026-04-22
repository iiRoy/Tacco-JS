'use strict' /* This directive enables strict mode for the entire script, enforcing stricter parsing and error handling. */


// Define the main processing function.
// It takes 'input' as a string, processes it, and prints a result.
function Main( input )
{

    // Step 1: Prepare the input string.
    // - Trim leading/trailing whitespace.
    // - Split the string into an array of substrings using one or more whitespace characters as delimiters.
    // - Map each substring to a number by subtracting zero (a common JavaScript trick for type conversion).
    input = input.trim()
                 .split( /\s+/ )
                 .map( x => x - 0 );

    // Step 2: Extract the first number.
    // The problem statement implies the first number is N, although it is not used further in this specific logic.
    var N = input.shift(); // `shift()` removes the first element from the array and returns it.

    // Step 3: Initialize two empty arrays, A and B.
    // These arrays will store processed pairs of numbers from the input.
    var A = []; // Array to hold the first component of each pair.
    var B = []; // Array to hold the second component of each pair.

    // Step 4: Populate arrays A and B.
    // This loop processes the input array from the end, taking two elements at a time.
    while ( input.length > 0 ) // Continue as long as there are elements left in the 'input' array.
    {
        B.push( input.pop() ); // `pop()` removes the last element and returns it. This element goes into B.
        A.push( input.pop() ); // `pop()` removes the *new* last element and returns it. This element goes into A.
    }

    // Step 5: Find the maximum value in array A.
    // `Math.max.apply(null, A)` is used to find the maximum value in an array.
    // `null` is passed as the `this` context for `Math.max`.
    var M = Math.max.apply( null, A ); // M will store the largest number found in array A.

    // Step 6: Find the corresponding value from array B.
    // First, find the index of M within array A using `IndexOf`.
    // Then, use that index to retrieve the element from array B.
    var S = B[ A.IndexOf( M ) ]; // S will store the element from B that corresponds to M's position in A.

    // Step 7: Output the final result.
    // Print the sum of M and S to the console.
    console.log( M + S ); // The sum is the final output.

} // End of Main function definition.


// This line handles the execution of the script.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
// The `require('fs').readFileSync()` method is used for synchronous file reading.
// The read content is then passed as an argument to the `Main` function.
Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );

// End of script execution.