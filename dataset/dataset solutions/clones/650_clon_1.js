/*
 * This file processes some numerical input.
 * It's a Type I clone, focusing on extensive variations in whitespace and comments.
 */

// We begin by importing the 'fs' (file system) module to read from stdin.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;


/*
 * Next, we parse the input string.
 * The input is expected to be three space-separated numbers,
 * which are then converted to numerical types.
 */
var [ a , b , c ] = input . trim ( ) . split ( " " ) . map ( Number ) ;

// Initialize the 'time' variable using Math.ceil for ceiling division.
// This calculates the initial number of "time units" based on 'c' and 'a'.
var time = Math . ceil ( c / a ) ;

        /*
         * Initialize a variable 'sum' to zero.
         * This variable will accumulate a specific value (7) in each iteration
         * of the subsequent loop, as long as the loop condition is met.
         */
        var sum = 0 ;


    // The core logic resides within this while loop.
    // It continues to execute as long as the 'time' variable is strictly greater than 6.
    while ( time > 6 )
    {

        // Inside the loop: Increment 'sum' by 7 in each iteration.
        // This is a direct accumulation step.
        sum = sum + 7 ;

        // Update the value of 'c'. This calculation involves 'b', 'a', and a fixed multiplier (7).
        // This effectively reduces 'c' based on a combined cost.
        c = c - ( b + 7 * a ) ;

        // Recalculate 'time' using the updated 'c' value and 'a'.
        // The ceiling division ensures that any remainder contributes to an additional time unit.
        time = Math . ceil ( c / a ) ; // Re-evaluate time for the next iteration's condition check.

    } // End of the while loop block.


// After the loop terminates, we prepare to print the final result to the console.
// This involves adding the accumulated 'sum' to a final 'time' value.
// A ternary operator is used to ensure that if 'time' is zero or negative, it's treated as zero
// for the final addition, preventing negative contributions from 'time'.
console . log ( sum + ( time > 0 ? time : 0 ) ) ; // Output the final calculated value.
/* End of file. */