/*
 * This JavaScript code processes input from standard input
 * to solve a dynamic programming problem.
 * It reads two arrays of numbers and calculates a minimum cost.
 */

    var input = require( 'fs' ) . readFileSync( '/dev/stdin' ,  'utf8' ) ;


    // The input string is trimmed and then split into an array of lines.
var arr = input . trim() . split( "\n" ) ;


/*
 * The first line contains two space-separated integers, n and m.
 * These are parsed and converted to numbers.
 */
var nm = arr . shift( ) . split( " " ) . map( Number ) ;


var n = nm [ 0 ] ; // Assign the first number to 'n'.

var m = nm [ 1 ] ; // Assign the second number to 'm'.



    var d = [ ] ; // Initialize an empty array 'd'.


    // Populate array 'd' with 'n' numbers from the input array 'arr'.
    // The '-0' is a common JavaScript trick to convert a string to a number.
for ( var i = 0 ; i < n ; i ++ ) { d . push( arr . shift( ) - 0 ) ; }


var c = [ ] ; // Initialize another empty array 'c'.

// Populate array 'c' with 'm' numbers from the input array 'arr'.
for ( var i = 0 ; i < m ; i ++ )
{
    c . push( arr . shift( ) - 0 ) ;
}


    var dp = [ ] ; // Initialize the 2D DP array.

// Initialize the dp array with Infinity values.
// dp[i][j] will store the minimum cost for a subproblem.
for ( var i = 0 ; i <= m ; i ++ )
{
    dp [ i ] = [ ] ;
    for ( var j = 0 ; j <= n ; j ++ )
    {
        dp [ i ] [ j ] = Infinity ;
    }
}

// Base case: the cost for 0 items and 0 capacity is 0.
dp [ 0 ] [ 0 ] = 0 ;


    /*
     * Main dynamic programming loop.
     * Iterates through the 'c' array (representing items/choices).
     */
for ( var i = 0 ; i < m ; i ++ )
{
    var C = c [ i ] ; // Current value from array 'c'.

        // Inner loop, iterating through the 'd' array (representing items/states).
    for ( var j = 0 ; j < n ; j ++ )
    {
        var D = d [ j ] ; // Current value from array 'd'.

            // This line appears to have a reference to 'k' before it's defined in the nested loop.
            // It will likely result in 'NaN' or an error depending on execution context.
            // Preserving original code structure, including potential issues.
        dp [ i + k ] [ j ] = Math . min( dp [ i + k ] [ j ] , dp [ i ] [ j ] ) ;

            // Innermost loop for DP state transitions.
            // 'k' represents a step or count.
        for ( var k = 1 ; i + k + n - j + 1 <= m ; k ++ )
        {
            // Update DP state based on previous states and current item costs.
            dp [ i + k ] [ j + 1 ] = Math . min( dp [ i + k ] [ j + 1 ] , dp [ i ] [ j ] + C * D ) ;
        }
    }
}


// Finally, print the result, which is the minimum cost for dp[m][n].
console . log( dp [ m ] [ n ] ) ;