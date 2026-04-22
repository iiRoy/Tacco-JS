"use strict"; // Enable strict mode for better code quality.

/*
 * This script processes three integer inputs to compute a specific result.
 * It demonstrates conditional logic and basic arithmetic operations.
 *
 * Input format: Three space-separated integers on a single line.
 * Output: A single integer representing the calculated answer.
 *
 * Clone Type: Type I (Whitespace and Comments variation)
 */


const main = arg => { // Define the primary function that accepts a single argument string.

    // Parse the input string into three integer variables.
    // The input is expected to be space-separated.
    let a = parseInt( arg.split( " " )[ 0 ] );   // First integer input.
    let b = parseInt( arg.split( " " )[ 1 ] );   /* Second integer input. */
    let c = parseInt( arg.split( " " )[ 2 ] );   // Third integer input.


    let ans = 0; // Initialize the answer variable to zero.


    // Apply the first set of conditional logic based on 'b' and 'c'.
    if ( b >= c ) { // If 'b' is greater than or equal to 'c'.

        ans += c + b; // Add the sum of 'c' and 'b' to 'ans'.
        c = 0;        // Reset 'c' to zero after its value has been used.

    } else {          // Otherwise (if 'b' is less than 'c').

        ans += b * 2; // Add twice the value of 'b' to 'ans'.
        c -= b, b = 0; /* Subtract 'b' from 'c', then reset 'b' to zero. */

    }



    // Apply the second set of conditional logic, if 'c' is still positive.
    if ( c > 0 ) { // Check if 'c' has a positive value remaining.

        let tmp = Math.min( c, a ); // Determine the minimum value between 'c' and 'a'.
        c -= tmp;                   // Decrease 'c' by the 'tmp' amount.
        ans += tmp;                 // Add the 'tmp' amount to 'ans'.

    }



    // Final check and adjustment to the answer.
    if ( c > 0 ) { // If 'c' is still positive after previous operations.

        ans ++;    // Increment 'ans' by one.

    }


    // Output the final calculated answer to the standard console.
    console.log( ans );
}; // End of the 'main' function definition.


/*
 * This section handles reading input from the standard input stream
 * and invoking the 'main' function with the retrieved data.
 * It's typical for competitive programming environments.
 */
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ); // Read, decode, and process input.

// End of JavaScript file.