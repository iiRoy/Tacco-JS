/*
 * This function recursively explores a path in a grid-like structure,
 * calculating sums and updating a maximum value.
 * It's designed to traverse a triangular or diamond-shaped grid.
 *
 * @param {number} y - The current row index.
 * @param {number} x - The current column index.
 * @param {number} sum - The accumulated sum up to the current position.
 */
function bomb( y , x , sum ) {
    // Store the current sum at the current grid position in the tracking array YX.
    YX [ y ] [ x ] = sum ;

    // Check if we have reached the last row of the grid.
    if ( y == yx.length - 1 ) {
        // If it's the last row, update the global maximum sum found so far.
        max = Math.max ( max , sum ) ;
    }
    // Check if we are in the upper half of the diamond/triangle (or the middle row, if length is odd).
    else if ( ( yx.length - 1 ) / 2 > y ) {
        // For the upper half, we can move diagonally right or straight down.

        // Check if moving straight down (y+1, x) yields a better path.
        if ( YX [ y + 1 ] [ x ] < sum + yx [ y + 1 ] [ x ] ) {
            // Recursively call bomb for the straight-down path.
            bomb ( y + 1 , x , sum + yx [ y + 1 ] [ x ] ) ;
        }

        // Check if moving diagonally right (y+1, x+1) yields a better path.
        if ( YX [ y + 1 ] [ x + 1 ] < sum + yx [ y + 1 ] [ x + 1 ] ) {
            // Recursively call bomb for the diagonal-right path.
            bomb ( y + 1 , x + 1 , sum + yx [ y + 1 ] [ x + 1 ] ) ;
        }
    }
    // This block handles the lower half of the diamond/triangle,
    // including the middle row if the length is even.
    else if ( ( yx.length - 1 ) / 2 <= y ) {
        // For the lower half, we can move diagonally left or straight down.

        // Check bounds for moving diagonally left (y+1, x-1).
        if ( x - 1 >= 0 ) {
            // If valid, check if this path yields a better sum.
            if ( YX [ y + 1 ] [ x - 1 ] < sum + yx [ y + 1 ] [ x - 1 ] ) {
                // Recursively call bomb for the diagonal-left path.
                bomb ( y + 1 , x - 1 , sum + yx [ y + 1 ] [ x - 1 ] ) ;
            }
        }

        // Check bounds for moving straight down (y+1, x).
        // This also ensures we don't go out of bounds on the right.
        if ( x < yx [ y ] .length - 1 ) {
            // If valid, check if this path yields a better sum.
            if ( YX [ y + 1 ] [ x ] < sum + yx [ y + 1 ] [ x ] ) {
                // Recursively call bomb for the straight-down path.
                bomb ( y + 1 , x , sum + yx [ y + 1 ] [ x ] ) ;
            }
        }
    }
}


// --- Main Program Execution ---

// Read input from standard input, assuming UTF-8 encoding.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace from the input and split it into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// Initialize an empty array to store the parsed numerical grid data.
var yx = [ ] ;

// Initialize another empty array, YX, to store dynamic programming state (maximum sums to reach a cell).
var YX = [ ] ;

// Process each line from the input array.
Arr . forEach ( function ( v ) {
    // Split the line by commas, then convert each part to a number.
    var x = v . split ( "," ) . map ( Number ) ;

    // Create a corresponding array X for the YX grid, initialized with zeros.
    // This will store the maximum sum to reach each cell.
    var X = x . map ( function ( v ) {
        return 0 ;
    } ) ;

    // Add the parsed numerical row to the yx grid.
    yx . push ( x ) ;

    // Add the initialized row to the YX DP state grid.
    YX . push ( X ) ;
} ) ;

// Initialize the global maximum sum found to 0.
var max = 0 ;

// Start the recursive 'bomb' function from the top-left corner (0,0),
// with the initial sum being the value at that cell.
bomb ( 0 , 0 , yx [ 0 ] [ 0 ] ) ;

// Print the final maximum sum found to the console.
console . log ( max ) ;