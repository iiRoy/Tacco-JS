// This program processes numerical input based on specific conditions.
// It serves as an example of a Type I code clone, focusing on whitespace and comments.
"use strict"
/*
 * The 'Main' function is the entry point for the logic.
 * It takes a string 'input' and performs calculations.
 */
const Main = ( input ) => {
    // First, process the input string: trim whitespace, split by spaces, and parse numbers.
    let xs = input.trim().split(' ').map( v => parseInt(v, 10) );

    // Extract the first two parsed numbers into variables 'a' and 'b'.
    let a = xs[0];
    let b = xs[1];

    let ans = 0; // Initialize the answer variable to zero.

    // Check a primary condition: if 'a' is greater than or equal to 'b'.
    if ( a >= b ) {
        // If the condition is met, the answer is directly set to 1.
        ans = 1;
    }
    else {
        /*
         * If 'a' is less than 'b', an iterative calculation is required.
         * The loop counts how many times the expression (a-1)*i+1 is less than 'b'.
         */
        for ( let i = 0; (a - 1) * i + 1 < b; i++ ) {
            ans += 1; // Increment the answer for each iteration.
        }
    }

    // Finally, print the calculated answer to the console.
    console.log( ans );
}; // End of the Main function definition.

/*
 * This part of the script handles reading the input from standard input.
 * It uses Node.js's 'fs' module to synchronously read the file.
 */
Main( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );
// The 'Main' function is invoked with the content of /dev/stdin.