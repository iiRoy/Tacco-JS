/*
 * This JavaScript file implements a solution for a combinatorial problem.
 * It calculates the number of possible patterns based on given constraints.
 * The 'use strict' directive enforces stricter parsing and error handling.
 */
'use strict'

/**
 * The main function that processes the input and computes the result.
 * @param {string} input - A string containing space-separated numerical values.
 */
function Main( input ) {

    // Parse the input string to extract various numerical parameters.
    // N represents the total number of items available.
    const N = Number( input . split ( " " ) [ 0 ] ) ;

    // 'red' and 'blue' represent initial quantities or values.
    const red = Number( input . split ( " " ) [ 1 ] ) ;
    const blue = Number( input . split ( " " ) [ 2 ] ) ;

    // 'green' is a derived value, sum of 'red' and 'blue'.
    const green = red + blue ;

    // K is another key parameter for the calculation.
    const K = Number( input . split ( " " ) [ 3 ] ) ;

    // 'second' and 'third' are determined by comparing 'red' and 'blue'.
    const second = Math . max ( red , blue ) ;
    const third = Math . min ( red , blue ) ;

    // 'pat' will store the final count of patterns. Initialize to zero.
    let pat = 0 ;

    /**
     * Helper function to calculate permutations (nPr).
     * @param {number} n - The total number of items.
     * @param {number} r - The number of items to choose.
     * @returns {number} The permutation result.
     */
    function permutation( n , r ) {
        let res = 1 ; // Initialize result to 1 for product calculation.
        // Loop 'r' times to multiply 'n', 'n-1', ..., 'n-r+1'.
        for ( let k = 0 ; k < r ; k ++ ) {
            res = ( res * ( n - k ) ) ; /* Multiply current result by (n - k). */
        }
        return res ; // Return the calculated permutation.
    }

    /**
     * Helper function to calculate combinations (nCr).
     * Uses the permutation function.
     * @param {number} n - The total number of items.
     * @param {number} r - The number of items to choose.
     * @returns {number} The combination result.
     */
    function combination( n , r ) {
        // nCr = nPr / rPr
        return permutation ( n , r ) / permutation ( r , r )
    }

    // Calculate the maximum possible number of 'green' groups.
    // This is based on K and the 'green' value.
    const greenmax = Math . floor ( K / green ) ;

    // Main loop: Iterate through possible counts of 'green' groups.
    // Starts from 'greenmax' down to 0.
    for ( let i = greenmax ; i >= 0 ; i -- ) {

        // Calculate the remaining K value after accounting for 'i' green groups.
        let restg = K - ( i * green ) ;

        // Determine the maximum number of 'second' groups that can fit into 'restg'.
        let secondmax = Math . floor ( restg / second ) ;

        // Nested loop: Iterate through possible counts of 'second' groups.
        // Starts from 'secondmax' down to 0.
        for ( let j = secondmax ; j >= 0 ; j -- ) {

            // Calculate the remaining K after both 'green' and 'second' groups.
            let restgb = K - ( i * green ) - ( j * second ) ;

            // Check if the total count of items (i + j + restgb) does not exceed N.
            if ( i + j + restgb <= N ) {
                // If valid, add the calculated combinatorial patterns to 'pat'.
                // This involves combinations of N items chosen (i+j+restgb) times,
                // multiplied by combinations to distribute them.
                pat = pat + ( combination ( N , i + j + restgb ) * combination ( i + j + restgb , Math . max ( i , j , restgb ) ) ) ;
            }
        }

    }


    // Output the final calculated pattern count to the console.
    console . log ( pat ) ;

}

// Read input from stdin, convert to UTF-8, trim whitespace, and pass to Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;