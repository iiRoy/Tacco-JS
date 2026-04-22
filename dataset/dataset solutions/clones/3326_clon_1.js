/*
 * This JavaScript code calculates the expected value of a certain process.
 * It uses dynamic programming to solve the problem.
 * The input is read from standard input, processed, and the result is printed to standard output.
 */

'use strict'; // Enforce strict mode for cleaner code and fewer errors.

// Define an immediately invoked function expression (IIFE)
// to encapsulate the logic and prevent global variable pollution.
(
    function ( input )
    {

        // --- Input Processing Section ---

        // Trim whitespace, split by any whitespace, and convert each part to a number.
        // The `x-0` trick is a concise way to convert string to number.
        input = input . trim ( ) . split ( / \s + / ) . map ( x => x - 0 ) ;

        // The first number in the input array is 'N', representing the total number of items.
        const N = input . shift ( ) ;

        // Initialize an array to count the occurrences of dishes.
        // dish[0] is unused ('zero'), dish[1] counts 1s, dish[2] counts 2s, dish[3] counts 3s.
        const dish = [ 'zero' , 0 , 0 , 0 ] ;


        // Iterate over the remaining input numbers to populate the 'dish' counts.
        input . forEach (
            function ( x )
            {
                // Increment the count for the corresponding dish type.
                dish [ x ] ++ ;
            }
        ) ;


        // --- Dynamic Programming Table Initialization ---

        // Create a 3D DP table.
        // dp[i][j][k] will store the expected number of operations
        // when there are 'i' dishes of type 1, 'j' dishes of type 2, and 'k' dishes of type 3.
        const dp = new Array ( N + 2 ) ;

        // Initialize the DP table with appropriate dimensions and default values.
        // The loops go up to N+1 to handle boundary conditions gracefully,
        // and also allow for indices like -1 as used in the logic.
        for ( let i = -1 ; i < N + 2 ; i ++ )
        {
            // Each element dp[i] is an array.
            dp [ i ] = new Array ( N + 2 - i ) ;

            for ( let j = -1 ; j < N + 2 - i ; j ++ )
            {
                // Each element dp[i][j] is an array, filled with 0s initially.
                dp [ i ] [ j ] = new Array ( N + 2 - i - j ) . fill ( 0 ) ;

                // Special handling for index -1 (which might be used for boundary conditions).
                // This seems to initialize a non-standard array index, often used in competitive programming
                // to simplify boundary checks in the main DP loops.
                dp [ i ] [ j ] [ -1 ] = 0 ;
            }
        }


        // --- Dynamic Programming Calculation ---

        // The DP state represents (count of 1s, count of 2s, count of 3s).
        // The loops iterate from 1 up to N for the 'i' (count of 1s) dimension.
        for ( let i = 1 ; i <= N ; i ++ )
        {
            // Base case for dp[i][0][0]: expected value when only 'i' dishes of type 1 exist.
            // This formula adds N/i (expected number of draws to get a '1' when there are 'i' ones)
            // to the previous state.
            dp [ i ] [ 0 ] [ 0 ] = dp [ i - 1 ] [ 0 ] [ 0 ] + ( N / i ) ;

            // Iterate for 'j' (count of 2s) dimension.
            for ( let j = 1 ; j <= i ; j ++ )
            {
                // Calculate dp[i-j][j][0]: expected value with (i-j) ones, j twos, 0 threes.
                // This involves transitions from states where a '1' was drawn, or a '2' was drawn.
                // N/i: Expected number of draws to pick one of the 'i' remaining items.
                // dp[i-j+1][j-1][0]*(j/i): Probability of drawing a '2' (j/i) and moving from state (i-j+1, j-1, 0).
                // dp[i-j-1][j][0]*((i-j)/i): Probability of drawing a '1' ((i-j)/i) and moving from state (i-j-1, j, 0).
                dp [ i - j ] [ j ] [ 0 ] = N / i + dp [ i - j + 1 ] [ j - 1 ] [ 0 ] * ( j / i ) + dp [ i - j - 1 ] [ j ] [ 0 ] * ( ( i - j ) / i ) ;

                // Iterate for 'k' (count of 3s) dimension.
                for ( let k = 1 ; k <= j ; k ++ )
                {
                    // Calculate dp[i-j][j-k][k]: expected value with (i-j) ones, (j-k) twos, k threes.
                    // This is the most complex transition, considering drawing a '1', '2', or '3'.
                    // N/i: Expected number of draws to pick one of the 'i' remaining items.
                    // dp[i-j][j-k+1][k-1]*(k/i): Probability of drawing a '3' (k/i) from state (i-j, j-k+1, k-1).
                    // dp[i-j+1][j-1-k][k]*((j-k)/i): Probability of drawing a '2' ((j-k)/i) from state (i-j+1, j-1-k, k).
                    // dp[i-j-1][j-k][k]*((i-j)/i): Probability of drawing a '1' ((i-j)/i) from state (i-j-1, j-k, k).
                    dp [ i - j ] [ j - k ] [ k ] = N / i + dp [ i - j ] [ j - k + 1 ] [ k - 1 ] * ( k / i ) + dp [ i - j + 1 ] [ j - 1 - k ] [ k ] * ( ( j - k ) / i ) + dp [ i - j - 1 ] [ j - k ] [ k ] * ( ( i - j ) / i ) ;
                }
            }
        }


        // --- Output Result ---

        // Print the final calculated expected value for the initial dish configuration.
        console . log ( dp [ dish [ 1 ] ] [ dish [ 2 ] ] [ dish [ 3 ] ] ) ;

    }
)
(
    // Read input from standard input synchronously using Node.js 'fs' module.
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
)
; // End of IIFE and its invocation.