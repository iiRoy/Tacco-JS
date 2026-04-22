/*
 * This is a recursive function named 'bomb'
 * It handles the logic for placing numbers in a grid based on specific rules.
 * Parameters:
 *   y: current row index
 *   x: current column index
 */
function bomb ( y , x ) {
    // Check if the current number N has reached the maximum allowed value.
    if ( N == max ) {
        return ;
    }

    // Handle wrapping around the grid for x-coordinate
    if ( x < 0 ) {
        x = n - 1 ;
    }
    if ( y < 0 ) {
        y = n - 1 ;
    }
    if ( x >= n ) {
        x = 0 ;
    }
    if ( y >= n ) {
        y = 0 ;
    }

    // Check if the current grid cell is already occupied
    if ( yx[ y ][ x ] != -1 ) {
        // If occupied, move diagonally up-left and call bomb again
        bomb ( y + 1 , x - 1 ) ;
    } else {
        // If not occupied, place the current number N, increment N, and move diagonally down-right
        yx[ y ][ x ] = ( "   " + N ) . slice ( -4 ) ;
        N ++ ;
        bomb ( y + 1 , x + 1 ) ;
    }
}


// --- Main Program Execution Start ---

// Read input from stdin
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input: trim whitespace, split by newlines, and convert to numbers
var Arr = ( input . trim ( ) ) . split ( "\n" ) . map ( Number ) ;

// Iterate through each number in the processed input array
for ( var i = 0 ; i < Arr . length ; i ++ ) {

    // Get the grid size from the current array element
    var n = Arr[ i ] ;

    // Calculate the maximum number to be placed in the grid (n*n + 1 is likely for a sentinel or off-by-one max check)
    var max = n * n + 1 ;

    // If n is 0, terminate the program as it's an invalid grid size
    if ( n == 0 ) {
        break ;
    }

    // Initialize an empty 2D array (grid)
    var yx = [ ] ;

    // Populate the 2D array with -1 (representing empty cells)
    for ( var j = 0 ; j < n ; j ++ ) {
        yx[ j ] = [ ] ; // Initialize inner array for row j
        for ( var k = 0 ; k < n ; k ++ ) {
            yx[ j ][ k ] = -1 ; // Set cell (j, k) to -1
        }
    }

    // Determine the starting position for the first number (center column, one row below center)
    var x = Math . floor ( n / 2 ) ;
    var y = x + 1 ;

    // Place the first number '1' at the calculated starting position
    yx[ y ][ x ] = "   " + 1 ;

    // Initialize the counter for the next number to be placed
    var N = 2 ;

    // Start the recursive 'bomb' function to fill the grid
    bomb ( y + 1 , x + 1 ) ;

    // Print the final grid to the console
    // Join rows with newlines and remove all commas for a clean output
    console . log ( yx . join ( "\n" ) . replace ( /\ , /g , "" ) ) ;
}

// --- Main Program Execution End ---