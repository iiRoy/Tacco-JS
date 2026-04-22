/*
 * This JavaScript code implements a dynamic programming approach
 * to solve a combinatorics problem. It calculates the number of
 * ways to form a specific sum 's' using 'n' distinct digits (0-9),
 * where each digit's contribution to the sum is its value multiplied
 * by its position (1-indexed).
 *
 * The solution precomputes all possible states into a DP table
 * using a recursive backtracking function.
 */


// Initialize the 2D dynamic programming table 'dp'.
// dp[count][sum] will store the number of ways to achieve 'sum'
// using 'count' distinct digits.
var dp = [ ] ;

// The outer loop iterates for the number of digits (count),
// from 0 up to a maximum of 10.
for ( var i = 0 ; i <= 10 ; i ++ )
{
    // Initialize the inner array for the current 'count'.
    dp[ i ] = [ ] ;

    // The inner loop iterates for the possible sum values,
    // from 0 up to a maximum of 330.
    for ( var j = 0 ; j <= 330 ; j ++ )
    {
        // Initialize each cell of the DP table to 0.
        dp[ i ][ j ] = 0 ;
    }
}


// A boolean array 'used' to keep track of which digits (0-9)
// have already been selected in the current combination being built.
var used = [ ] ;

// Initialize all digits as not used at the start.
for ( var i = 0 ; i <= 9 ; i ++ )
{
    used[ i ] = false ;
}


/**
 * Recursive backtracking function to fill the 'dp' table.
 * It explores combinations of distinct digits to form sums.
 *
 * @param {number} sum - The current accumulated sum for the combination.
 * @param {number} cnt - The current count (position) of the digit being placed.
 */
function bomb ( sum , cnt )
{
    // Increment the count for the current state (cnt, sum) in the DP table.
    // This marks one valid combination found for this state.
    dp[ cnt ][ sum ] ++ ;

    // Move to the next digit position.
    cnt ++ ;

    // Base case for recursion: If 11 digits have been considered (cnt reaches 11),
    // it means we have formed a combination of 10 digits (positions 1 through 10).
    // No more digits can be added, so return.
    if ( cnt == 11 )
    {
        return ;
    }

    // Iterate through all possible digits from 0 to 9.
    for ( var i = 0 ; i <= 9 ; i ++ )
    {
        // If the current digit 'i' has already been used in this combination path,
        // skip it to ensure distinct digits are chosen.
        if ( used[ i ] )
        {
            continue ;
        }

        // Mark the current digit 'i' as used.
        used[ i ] = true ;

        // Recursively call 'bomb' with the updated sum and count.
        // The sum is updated by adding the digit 'i' multiplied by its current position 'cnt'.
        bomb ( sum + i * cnt , cnt ) ;

        // Backtrack: Unmark the digit 'i' as used.
        // This allows 'i' to be used in other combination paths.
        used[ i ] = false ;
    }
}


// Initiate the recursive process to populate the DP table.
// Start with an initial sum of 0 and a digit count (position) of 0.
bomb ( 0 , 0 ) ;


// Read input from standard input.
// The 'fs' module is used for file system operations, specifically reading from /dev/stdin.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input: trim any leading/trailing whitespace and split it into an
// array of lines, where each line represents a test case.
var arr = input . trim ( ) . split ( "\n" ) ;


// Iterate over each line (test case) in the input array.
arr . forEach ( function ( v )
{
    // For each line 'v', split it by space and convert the resulting
    // string parts into numbers.
    var ns = v . split ( " " ) . map ( Number ) ;

    // Extract the 'n' value (number of digits) from the parsed line.
    var n = ns[ 0 ] ;

    // Extract the 's' value (target sum) from the parsed line.
    var s = ns[ 1 ] ;

    // Output the precomputed result from the DP table.
    // Note: The input 'n' is 0-indexed for number of digits,
    // but our 'cnt' in the dp table is 1-indexed (position of digit).
    // Therefore, we access dp[n+1][s] to get the result for 'n' digits.
    console . log ( dp[ n + 1 ][ s ] ) ;
} ) ;