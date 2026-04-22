/*
 * This file contains a JavaScript program to find the number between 1 and N (inclusive)
 * that is divisible by 2 the maximum number of times.
 *
 * It utilizes a strict mode for cleaner code and error prevention.
 */
'use strict';


// The main function processes the input and finds the desired number.
//
// @param {string} input - The raw input string, expected to contain a single integer.
const main = ( input ) => {
    // Parse the input string into an integer N.
    // Trim whitespace and use base 10 for parsing.
    const n = parseInt( input.trim(), 10 );

    // Initialize variables to keep track of the number with the maximum count
    // of divisions by 2, and that maximum count itself.
    let maxNum = 0; // Stores the number that has been divided by 2 most times.
    let maxCnt = -1; // Stores the maximum count of divisions by 2 found so far.

    // Loop through all numbers from 1 up to N.
    for ( let i = 1; i <= n; i++ ) {
        // For each number 'i', we'll calculate how many times it can be divided by 2.
        let tmpNum = i;  // Temporary variable to perform divisions without altering 'i'.
        let tmpCnt = 0;  // Counter for divisions by 2 for the current 'tmpNum'.

        // Continue dividing by 2 until the number becomes odd.
        while ( true ) {
            // If the number is odd, it cannot be divided by 2 anymore.
            if ( tmpNum % 2 === 1 ) {
                break; // Exit the while loop.
            }

            // If the number is even, divide it by 2.
            tmpNum /= 2;

            // Increment the counter for this division.
            tmpCnt++;
        }

        // After the while loop, 'tmpCnt' holds the total number of times 'i' was divisible by 2.
        // Check if this count is greater than the current maximum count found.
        if ( tmpCnt > maxCnt ) {
            // If it is, update 'maxNum' to the current number 'i'.
            maxNum = i;
            // And update 'maxCnt' to this new maximum count.
            maxCnt = tmpCnt;
        }
    }

    // Finally, print the number that had the maximum count of divisions by 2.
    console.log( maxNum );
};


// Read the input from standard input and pass it to the main function.
// This uses Node.js's 'fs' module to read the file synchronously.
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );