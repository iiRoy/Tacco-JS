/*
 * This JavaScript code processes input data to calculate a
 * dynamic programming solution. It simulates a process
 * with states, transitions, and events.
 *
 * The input is read from standard input, parsed, and then
 * used to populate various data structures like `nea` and `dp`.
 *
 * The core logic involves iterating through possible states
 * and applying transition rules, including special events.
 * Finally, it calculates a weighted sum based on the final
 * state probabilities.
 */

// Import the 'fs' module to handle file system operations,
// specifically for reading input from /dev/stdin.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' );


// Process the raw input string:
// 1. Trim any leading/trailing whitespace.
// 2. Split the string into an array of lines based on the newline character.
var arr = input . trim() . split ( "\n" );


// Main processing loop: continues indefinitely until a specific
// termination condition is met inside the loop.
while ( true ) {

    // Read the first line of the current input block.
    // - `arr.shift()` removes and returns the first element (a line string).
    // - `split(" ")` divides the string into an array of substrings by space.
    // - `map(Number)` converts each substring to a numeric type.
    var xyz = arr . shift() . split ( " " ) . map ( Number );


    // Check for the termination condition: if the processed line is "0 0 0".
    if ( xyz . join ( " " ) == "0 0 0" ) {
        // If the condition is met, break out of the infinite 'while' loop.
        break ;
    }


    // Deconstruct the 'xyz' array into individual variables for clarity.
    var x = xyz [ 0 ] ; // Represents a count or divisor.
    var y = xyz [ 1 ] ; // Represents a target level or maximum index for 'dp'.
    var z = xyz [ 2 ] ; // Represents the number of special event definitions.


    // Read the next line, which contains an array of values 'v'.
    // These values likely represent possible step sizes or increments.
    var v = arr . shift() . split ( " " ) . map ( Number );


    // Initialize an empty array 'nea' (likely "near" or "event array").
    // This array will store special event definitions indexed by a specific value.
    var nea = [ ] ;


    // Loop 'z' times to populate the 'nea' array with event details.
    // Each iteration reads a line containing event data.
    for ( var i = 0 ; i < z ; i ++ ) {

        // Read and parse the event definition line.
        // Z[0] is the index, Z[1] is event type, Z[2] is event amount.
        var Z = arr . shift() . split ( " " ) . map ( Number );

        // Store the event type and amount at the specified index.
        nea [ Z [ 0 ] ] = [ Z [ 1 ] , Z [ 2 ] ] ;

    } // End of loop for populating 'nea'.


    // Initialize the dynamic programming table 'dp'.
    // 'dp' will store probabilities or counts for reaching specific states.
    // It's a 2D array, where dp[i][j] might represent probability of being
    // at level 'i' with a score/state 'j'.
    var dp = [ ] ;


    // Loop to initialize rows of the 'dp' table.
    // The number of rows is 'y + 1'.
    for ( var i = 0 ; i <= y ; i ++ ) {

        // Initialize each row as an empty array.
        dp [ i ] = [ ] ;

        // Loop to initialize columns for the current row.
        // The maximum column index is 5000.
        for ( var j = 0 ; j <= 5000 ; j ++ ) {

            // Set initial value for all cells to 0.
            dp [ i ] [ j ] = 0 ;

        } // End of inner loop for column initialization.

    } // End of outer loop for row initialization.


    // Set the base case for the DP table:
    // Probability of being at level 0 with score 0 is 1 (100%).
    dp [ 0 ] [ 0 ] = 1 ;


    // Main dynamic programming calculation loops.
    // 'i' iterates through levels/time steps from 0 to y-1.
    for ( var i = 0 ; i < y ; i ++ ) {

        // 'k' iterates through possible scores/states at the current level 'i'.
        for ( var k = 0 ; k <= 5000 ; k ++ ) {

            // 'j' iterates through possible actions/choices defined by 'v'.
            // There are 'x' number of choices.
            for ( var j = 0 ; j < x ; j ++ ) {

                // Calculate the 'after' level, which is the current level 'i'
                // plus the step 'v[j]', capped at 'y'.
                var after = Math . min ( y , i + v [ j ] ) ;

                // Check if there is a special event defined for the 'after' level.
                if ( nea [ after ] != undefined ) {

                    // Extract event type 'e' and event amount 'a'.
                    var e = nea [ after ] [ 0 ] ; // Event type.
                    var a = nea [ after ] [ 1 ] ; // Event amount.

                    // Apply event-specific logic based on 'e'.
                    if ( e == 1 ) {
                        // Event type 1: Adjust 'after' level by 'a'.
                        // Add probability from current state to the new state.
                        dp [ Math . min ( y , after + a ) ] [ k ] += dp [ i ] [ k ] / x ;
                    }
                    else if ( e == 2 ) {
                        // Event type 2: Adjust 'k' score by 'a'.
                        // Add probability from current state to the new state.
                        dp [ after ] [ Math . min ( 5000 , k + a ) ] += dp [ i ] [ k ] / x ;
                    }
                    else if ( e == 3 ) {
                        // Event type 3: Adjust 'k' score by '-a'.
                        // Note: The original code uses Math.min(0, k-a), which
                        // allows scores to go below 0 if k-a is negative.
                        dp [ after ] [ Math . min ( 0 , k - a ) ] += dp [ i ] [ k ] / x ;
                    }

                } else {
                    // No special event for 'after' level:
                    // Simply add probability from current state to the 'after' level.
                    dp [ after ] [ k ] += dp [ i ] [ k ] / x ;
                }

            } // End of innermost loop (choices 'j').

        } // End of middle loop (scores 'k').

    } // End of outermost loop (levels 'i').


    // Calculate the final expected value (sum).
    // This is a weighted sum of scores at the final level 'y'.
    var sum = 0 ;

    // Iterate through all possible scores at the final level 'y'.
    for ( var i = 0 ; i <= 5000 ; i ++ ) {
        // Add the product of score 'i' and its probability 'dp[y][i]' to the sum.
        sum += i * dp [ y ] [ i ] ;
    } // End of sum calculation loop.

    // Print the floor of the calculated sum to the console.
    console . log ( Math . floor ( sum ) ) ;

} // End of main 'while(true)' loop.