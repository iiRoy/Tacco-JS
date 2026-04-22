/*
 * This JavaScript program calculates the number of paths
 * from the top-left corner to the bottom-right corner
 * of a grid, avoiding specified obstacles.
 * It employs a dynamic programming approach to efficiently
 * compute the total number of distinct paths.
 */
function Main(  input  )
{

    // Pre-process the raw input string.
    // First, remove any leading/trailing whitespace.
    // Then, split the string into an array of lines.
    // Finally, map each line to an array of strings by splitting it by spaces.
    input = input
        .trim()
        .split( "\n" )
        .map(
            function( x )
            {
                return x.split( " " )
            }
        )
    ;

    // Define a constant C, which is a large prime number (10^9 + 7).
    // This constant is used for modulo operations to prevent integer overflow
    // when calculating the number of paths, as results can become very large.
    let C = 1e9 + 7
    ;

    // Parse the grid dimensions H (height) and W (width)
    // from the first element of the processed input array.
    // `input[0][0]` is the height, `input[0][1]` is the width.
    let H = parseInt( input[0][0], 10 )
    ;
    let W = parseInt( input[0][1], 10 )
    ;

    // Initialize the Dynamic Programming (DP) table.
    // DP[row][col] will store the number of ways to reach cell (row, col).
    let DP = []
    ;

    // Populate the DP table with H rows.
    // Each row is initialized as an array of W zeros.
    for ( let i = 0 ; i < H ; i++ )
    {
        DP.push( Array.from( { length: W }, ( ) => 0 ) )
        ;
    }

    // Set the base case for the DP table:
    // There is exactly one way to reach the starting cell (0, 0).
    DP[0][0] = 1
    ;


    // Iterate through the grid diagonally.
    // The variable 'i' represents the sum of the row and column indices (r + c).
    // This sum ranges from 1 (for cells like (0,1), (1,0))
    // up to (H-1) + (W-1), which is the sum for the bottom-right cell.
    for ( let i = 1 ; i < H + W - 1 ; i ++ )
    {

        // For each diagonal 'i', iterate through possible row indices 'j'.
        // The column index for a given 'j' will be `i - j`.
        // The bounds for 'j' are carefully calculated to ensure
        // both 'j' (row) and 'i - j' (column) remain within the grid boundaries [0, H-1] and [0, W-1].
        for ( let j = Math.max( 0, i - H ) ; j <= Math.min( i, H - 1 ) ; j++ )
        {
            // Original code had a commented-out debug print:
            // console.log(i, j);

            // Check if the current cell (j, i-j) is an obstacle.
            // The grid content is stored in `input` starting from `input[1]`.
            // `input[row_index + 1][0][column_index]` gives the character at (row_index, column_index).
            if ( input[ j + 1 ][ 0 ][ i - j ] === '#' )
            {
                // If the cell contains an obstacle ('#'), no paths can pass through it.
                // Therefore, we skip this cell and move to the next iteration.
                continue
                ;
            }

            // Calculate the number of paths to the current cell (j, i-j).
            // A cell can be reached either from the cell directly above it (j-1, i-j)
            // or from the cell directly to its left (j, i-j-1).

            // Case 1: If both the cell above and the cell to the left are valid (i.e., not out of bounds).
            if ( j > 0 && i - j > 0 )
            {
                // The number of paths is the sum of paths from above and from left, modulo C.
                DP[ j ][ i - j ] = ( DP[ j - 1 ][ i - j ] + DP[ j ][ i - j - 1 ] ) % C
                ;
            }
            // Case 2: If only the cell above is valid (i.e., we are in the first column, i-j is 0).
            else if ( j > 0 )
            {
                // The number of paths is simply the number of paths from the cell above.
                DP[ j ][ i - j ] = DP[ j - 1 ][ i - j ]
                ;
            }
            // Case 3: If only the cell to the left is valid (i.e., we are in the first row, j is 0).
            else
            {
                // The number of paths is simply the number of paths from the cell to the left.
                DP[ j ][ i - j ] = DP[ j ][ i - j - 1 ]
                ;
            }

            // Another commented-out debug print from the original code:
            // console.log(DP);
        }
    }

    // Final commented-out debug print from the original code:
    // console.log(DP);

    // After filling the DP table, the result is the number of paths
    // to the bottom-right corner of the grid, which is DP[H-1][W-1].
    // The `pop().pop()` method is used here to retrieve this value:
    // `DP.pop()` gets the last row (row H-1).
    // `(DP.pop()).pop()` then gets the last element of that row (column W-1).
    console.log( DP.pop( ).pop( ) )
    ;

} // End of the Main function definition.


// This line calls the Main function.
// It reads input from standard input (/dev/stdin) using Node.js's 'fs' module.
// The input is read synchronously as a UTF-8 string.
Main(
    require( "fs" )
        .readFileSync( "/dev/stdin", "utf8" )
)
;