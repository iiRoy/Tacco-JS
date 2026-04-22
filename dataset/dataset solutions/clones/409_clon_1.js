/*
 * This script reads input from /dev/stdin, processes it,
 * and prints a result to the console.
 * It appears to be solving a problem related to maximizing a ratio
 * involving certain items, possibly a variation of the knapsack problem
 * or a similar optimization challenge.
 */

//  Import the 'fs' (file system) module to handle file operations.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;

// Process the raw input: trim whitespace and split by newline characters
// to get an array of lines.
var arr = input . trim( ) . split( "\n" ) ;


// Main processing loop: continues until a specific termination condition is met.
while ( true )
{
    // Read the first line of the current problem set, convert it to a number.
    // The '- 0' ensures explicit numeric conversion.
    var n = arr . shift( ) - 0 ;

    // If 'n' is 0, it signifies the end of input or problem sets.
    if ( n == 0 )
    {
        break ; // Exit the main loop.
    }

    // Initialize an array to store processed item data.
    var nww = [ ] ;

    // Loop 'n' times to read 'n' items for the current problem set.
    for ( var i = 0 ; i < n ; i++ )
    {
        // Read an item line, split it by space, and store it.
        nww[ i ] = arr . shift( ) . split( " " ) ;
    }

    // Map and transform the 'nww' array:
    // Convert the second and third elements of each sub-array to numbers.
    nww = nww . map( v => [ v[ 0 ] , v[ 1 ] - 0 , v[ 2 ] - 0 ] ) ;

    // Sort the 'nww' array in descending order based on the second element (v[1]).
    nww . sort( ( a , b ) => {
        // Comparison function for sorting.
        return b[ 1 ] - a[ 1 ] ;
    } ) ;


    // Initialize 'max' to store the maximum ratio found so far.
    var max = 0 ;
    // Initialize 'ans' to store the string representation of the best combination found.
    var ans = "" ;

    /*
     * Recursive function 'bomb' to explore combinations of items.
     * It aims to find the sequence of items that maximizes g / sum.
     *
     * @param {string} str   - Current string of selected item indices.
     * @param {Array<number>} arrB - Array of remaining item indices to consider.
     * @param {number} sum   - Current accumulated sum of item values (nww[v][1]).
     * @param {number} g     - Current accumulated weighted sum (nww[v][1] * (str.length + 1)).
     */
    var bomb = function ( str , arrB , sum , g )
    {
        // Base case: if no more items are left to consider.
        if ( arrB . length == 0 )
        {
            // Check if the current ratio (g / sum) is greater than the maximum found.
            if ( max < g / sum )
            {
                // Update the best answer string.
                ans = str ;
                // Update the maximum ratio.
                max = g / sum ;
            }
            return ; // End of this recursive path.
        }

        // Iterate through the remaining items.
        for ( var i = 0 ; i < arrB . length ; i++ )
        {
            var v = arrB[ i ] ; // Get the current item index from arrB.

            // Check if adding the current item 'v' does not exceed its capacity 'nww[v][2]'.
            if ( sum <= nww[ v ][ 2 ] )
            {
                // Construct the new string of selected items.
                var a = str + v ;
                // Create a new array of remaining items, excluding the current item 'v'.
                var b = arrB . filter( n => v != n ) ;

                // Recursively call 'bomb' with updated parameters.
                bomb(
                    a , // Updated item string.
                    b , // Updated array of remaining items.
                    sum + nww[ v ][ 1 ] , // Updated sum by adding current item's value.
                    g + nww[ v ][ 1 ] * ( str . length + 1 ) // Updated weighted sum.
                ) ;
            }
        }
    } ;

    // Initialize an array containing indices from 0 to n-1.
    // This represents all available items initially.
    var bombArr = [ ] ;
    for ( var i = 0 ; i < n ; i++ )
    {
        bombArr . push( i ) ;
    }

    // Start the recursive search with an empty string, all items, and initial sums of 0.
    bomb( "" , bombArr , 0 , 0 ) ;

    // After finding the optimal combination, process and print the result.
    // 1. Split the 'ans' string (which contains item indices) into an array of characters.
    // 2. Map each character (index) back to its original item name (nww[index][0]).
    //    The '-0' ensures the character is treated as a number.
    // 3. Reverse the order of the resulting item names.
    // 4. Join them with newline characters to form the final output string.
    console . log( ans . split( "" ) . map( v => nww[ v - 0 ][ 0 ] ) . reverse( ) . join( "\n" ) ) ;
}