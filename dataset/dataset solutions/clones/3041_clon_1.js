'use strict'
/*
 * This JavaScript program solves a combinatorial problem.
 * It uses dynamic programming to count specific arrangements
 * based on a given set of input numbers.
 */

function Main( input ) {

    // Define a large number M, which might be a placeholder or for potential future use.
    // In this specific context, its direct impact on the final answer might be minimal.
    var M = Math.pow( 2 , 50 ) ;

    // K is a modulus constant. All arithmetic operations are performed modulo K
    // to keep numbers within manageable bounds and prevent overflow.
    const K = 998244353 ;

    // Prepare the input:
    // 1. Remove leading/trailing whitespace.
    // 2. Split the string into an array of substrings using any whitespace as a delimiter.
    // 3. Convert each substring to a number.
    input = input.trim().split( /\s+/ ).map( x => x - 0 ) ;

    // The first number in the input array represents N, the count of items.
    var N = input.shift() ;

    // Calculate the total sum of the remaining numbers in the input array.
    var sum = input.reduce( ( a , c ) => a + c ) ;

    // Calculate 'half', which is the floor of sum / 2. This value acts as
    // an upper limit for the sums we track in our dynamic programming tables.
    var half = Math.floor( sum / 2 ) ;


    // Initialize the first dynamic programming table, 'dp'.
    // dp[i][j] will store the number of ways to form a sum 'j'
    // using a subset of elements from input[0] through input[i-1].
    // Each element can be chosen as 'g' or 'b', effectively contributing twice.
    var dp = [] ;

    // Populate the dp table with initial zeros.
    for ( let i = 0 ; i <= N ; i++ ) {

        dp[ i ] = [] ; // Initialize the inner array for row 'i'.

        for ( let j = 0 ; j <= half ; j++ ) {

            dp[ i ][ j ] = 0 ; // Set each cell to zero.
        }
    }

    // Base case: There is one way to achieve a sum of 0 with no elements.
    dp[ 0 ][ 0 ] = 1 ;

    // Fill the dp table using iteration.
    // Iterate through each item in the input array.
    for ( let i = 0 ; i < N ; i++ ) {

        // Iterate through possible sums up to 'half'.
        for ( let j = 0 ; j <= half ; j++ ) {

            // Option 1: Do not include the current item (input[i]).
            // The count of ways to get sum 'j' remains the same as in the previous step.
            dp[ i + 1 ][ j ] += dp[ i ][ j ] ;
            dp[ i + 1 ][ j ] %= K ; // Apply modulo K.

            // Option 2: Include the current item (input[i]).
            // This item contributes to the sum, and since it can be 'g' or 'b',
            // it effectively doubles the ways from the previous state.
            if ( j + input[ i ] <= half ) {

                dp[ i + 1 ][ j + input[ i ] ] += 2 * dp[ i ][ j ] ;
                dp[ i + 1 ][ j + input[ i ] ] %= K ; // Apply modulo K.
            }
        }
    }


    // Initialize the answer variable.
    var ans = 1 ;

    // Calculate an initial part of the answer.
    // This often represents a total number of possibilities before exclusions.
    for ( let i = 0 ; i < N ; i++ ) {

        ans *= 3 ; // Multiply by 3 for N times.
        ans %= K ; // Apply modulo K.
    }

    // Adjust the answer based on the results from the first DP table.
    // This step typically subtracts cases that were overcounted or are invalid.
    dp[ N ].forEach( function ( x , i , arr ) {

        ans -= 3 * x ; // Subtract 3 times the value 'x' from the answer.
    } ) ;


    // Initialize the second dynamic programming table, 'DP'.
    // DP[i][j] will store the number of ways to form a sum 'j'
    // using a subset of elements from input[0] through input[i-1].
    // Each element can be chosen only once (e.g., only as 'g').
    var DP = [] ;

    // Populate the DP table with initial zeros.
    for ( let i = 0 ; i <= N ; i++ ) {

        DP[ i ] = [] ; // Initialize inner array.

        for ( let j = 0 ; j <= half ; j++ ) {

            DP[ i ][ j ] = 0 ; // Set each cell to zero.
        }
    }

    // Base case: One way to achieve sum 0 with no elements.
    DP[ 0 ][ 0 ] = 1 ;

    // Fill the DP table using iteration.
    for ( let i = 0 ; i < N ; i++ ) {

        for ( let j = 0 ; j <= half ; j++ ) {

            // Option 1: Do not include the current item (input[i]).
            DP[ i + 1 ][ j ] += DP[ i ][ j ] ;
            DP[ i + 1 ][ j ] %= K ; // Apply modulo K.

            // Option 2: Include the current item (input[i]).
            // This item contributes to the sum, and it's chosen once.
            if ( j + input[ i ] <= half ) {

                DP[ i + 1 ][ j + input[ i ] ] += DP[ i ][ j ] ;
                DP[ i + 1 ][ j + input[ i ] ] %= K ; // Apply modulo K.
            }
        }
    }


    // Perform final adjustments to the answer based on the second DP table
    // and the parity of the total sum.
    if ( sum % 2 === 0 ) { // If the total sum of input numbers is even.

        ans += 3 * DP[ N ][ half ] ; // Add 3 times the count from DP[N][half].
        ans %= K ; // Apply modulo K.
    }

    // Ensure the final answer is positive by adding K if it's negative, then taking modulo K.
    ans += K ;
    ans %= K ;

    // Output the final calculated answer.
    console.log( ans ) ;

}


// Read input from standard input and pass it to the Main function.
// This setup is common in competitive programming environments.
Main( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ;