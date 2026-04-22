/*
 * This program reads input from standard input, processes it, and prints a result.
 * It simulates a dynamic programming problem involving states and transitions.
 */

var input = require('fs') . readFileSync(
    '/dev/stdin',
    'utf8'
); // Read all input from /dev/stdin as a UTF-8 string.

// Process the raw input string: trim whitespace and split into an array of lines.
var arr = input . trim() . split("\n") ;


// Main processing loop: continues until a specific termination condition is met.
while (true)
{

    // Extract the first line, split by space, and convert elements to numbers.
    var xyz = arr . shift() . split(" ") . map(Number) ;

    // Check for the termination condition: "0 0 0"
    if ( xyz . join(" ") == "0 0 0" ) {
        /*
         * If the current line is "0 0 0", it signifies the end of input.
         * Break out of the infinite loop.
         */
        break ;
    }

    // Assign values from the parsed array 'xyz' to individual variables.
    var x = xyz[0] ; /* Represents a dimension or count. */
    var y = xyz[1] ; /* Another dimension or limit.    */
    var z = xyz[2] ; /* Number of special 'nea' entries. */


    // Read the next line, split by space, and convert elements to numbers.
    var v = arr . shift() . split(" ") . map(Number) ;

    /*
     * 'nea' will store special events/actions.
     * It's an array where indices correspond to certain states.
     */
    var nea = [] ;

    // Loop 'z' times to populate the 'nea' array.
    for ( var i = 0 ; i < z ; i ++ )
    {
        // Read a line for 'nea' entry, split, and convert to numbers.
        var Z = arr . shift() . split(" ") . map(Number) ;

        /*
         * Store the event type and action value.
         * Z[0] is the index/state where the event occurs.
         * Z[1] is the event type (e.g., 1, 2, 3).
         * Z[2] is the action value associated with the event.
         */
        nea[Z[0]] = [Z[1], Z[2]] ;
    }


    /*
     * Initialize a 2D dynamic programming array 'dp'.
     * dp[i][j] will store probabilities or counts for state 'i' with accumulated value 'j'.
     */
    var dp = [] ;

    // Outer loop for initializing rows of 'dp'.
    for ( var i = 0 ; i <= y ; i ++ )
    {
        dp[i] = [] ; // Initialize current row as an empty array.

        // Inner loop for initializing columns of 'dp' to 0.
        for ( var j = 0 ; j <= 5000 ; j ++ )
        {
            dp[i][j] = 0 ;
        }
    }

    // Base case for dynamic programming: starting state has a probability/count of 1.
    dp[0][0] = 1 ;

    // Main DP calculation loops.
    // 'i' iterates through states up to 'y'.
    for ( var i = 0 ; i < y ; i ++ )
    {
        // 'j' iterates through possible transitions/actions from current state 'i'.
        for ( var j = 0 ; j < x ; j ++ )
        {
            // Calculate the 'after' state based on current state 'i' and transition 'v[j]'.
            var after = i + v[j] ;

            // Ensure 'after' state does not exceed the maximum 'y'.
            if ( after > y ) {
                after = y ;
            }

            // 'k' iterates through all possible accumulated values.
            for ( var k = 0 ; k <= 5000 ; k ++ )
            {
                // Check if there's a special 'nea' event at the 'after' state.
                if ( nea[after] != undefined )
                {
                    // Extract event type 'e' and action value 'a'.
                    var e = nea[after][0] ;
                    var a = nea[after][1] ;

                    // Apply actions based on event type.
                    if ( e == 1 ) {
                        // Event type 1: move to a new state (after + a).
                        // The probability/count is divided by 'x' (number of possible transitions).
                        dp[after + a][k] += dp[i][k] / x ;
                    }
                    else if ( e == 2 ) {
                        // Event type 2: modify accumulated value (k + a) in the same 'after' state.
                        dp[after][k + a] += dp[i][k] / x ;
                    }
                    else if ( e == 3 ) {
                        // Event type 3: modify accumulated value (k - a) in the same 'after' state.
                        dp[after][k - a] += dp[i][k] / x ;
                    }
                }
                else
                {
                    // No special event: just transition to 'after' state with same 'k'.
                    dp[after][k] += dp[i][k] / x ;
                }
            }
        }
    }

    // Calculate the final sum based on the probabilities/counts in the last state 'y'.
    var sum = 0 ;

    // Iterate through all accumulated values 'i' in the final state 'y'.
    for ( var i = 0 ; i <= 5000 ; i ++ )
    {
        // Add (accumulated value * probability/count) to the total sum.
        sum += i * dp[y][i] ;
    }

    // Print the floor of the calculated sum to the console.
    console . log( Math . floor(sum) ) ;
}
// End of the main processing loop.