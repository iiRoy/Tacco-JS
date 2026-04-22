/* This file contains a set of functions for a game logic, likely Othello or Reversi.
 * The functions determine possible moves, execute moves, and manage game state.
 *
 * All original identifiers, operators, and expressions are preserved.
 * Only whitespace (spaces, tabs, newlines) and comments have been altered
 * to create a Type I clone.
 */

function A ( ) { // Function A: Determines the best move for player 'x'
    // Initialize maximum count of flipped pieces for the current move.
    var  max   = 0 ;

    // Array to store the coordinates [y, j] of the best move found.
    var  ary   = [ ] ;

    // Iterate through the board rows (1 to 8)
    for ( var i = 1 ; i <= 8 ; i ++ ) {
        // Iterate through the board columns (1 to 8)
        for ( var j = 1 ; j <= 8 ; j ++ ) {

            // Skip if the current cell is not empty ('.')
            if ( yx [ i ] [ j ] != "." ) continue ;

            // Calculate the number of pieces that would be flipped by placing 'x' at (i, j)
            // assuming 'o' is the opponent.
            var cnt = seach ( i , j , "x" , "o" ) ;

            // If this move flips more pieces than the current maximum, update max and ary.
            if ( cnt > max ) {
                ary = [ i , j ] ; // Store the coordinates
                max = cnt ;       // Update the maximum count
            }
        }
    }

    // Return the coordinates of the best move found.
    return ary ;
}


function B ( ) {
    // Function B: Determines the best move for player 'o'
    // This function is similar to A, but searches for 'o's best move.

    var max = 0 ;  // Max flipped pieces for 'o'
    var ary = [ ] ;  // Coordinates for 'o's best move

    // Loop through the board in reverse order (can be forward or reverse, doesn't matter for correctness)
    for ( var i = 8 ; i >= 1 ; i -- ) {
        for ( var j = 8 ; j >= 1 ; j -- ) {

            // Calculate potential flips for player 'o' at (i, j)
            // The roles of 'a' and 'b' are swapped compared to function A
            var cnt = seach ( i , j , "o" , "x" ) ;

            // Only consider empty cells for a move
            if ( yx [ i ] [ j ] != "." ) continue ;

            // Update best move if current move is better
            if ( cnt > max ) {
                ary = [ i , j ] ;
                max = cnt ;
            }
        }
    }

    return ary ; // Return the optimal move for 'o'
}


function seach ( y , x , a , b ) { // Function seach: Counts pieces to be flipped
                                   // y, x: coordinates of the potential move
                                   // a: current player's piece ('x' or 'o')
                                   // b: opponent's piece ('o' or 'x')

    // Direction vectors for y-axis (8 directions)
    var dy = [ -1 , -1 , -1 , 0 , 0 , 1 , 1 , 1 ] ;
    // Direction vectors for x-axis (8 directions)
    var dx = [ -1 , 0 , 1 , -1 , 1 , -1 , 0 , 1 ] ;

    var sum = 0 ; // Total count of pieces that would be flipped

    // Iterate through all 8 directions
    for ( var i = 0 ; i < 8 ; i ++ ) {

        var DY = dy [ i ] ; // Current y-direction component
        var DX = dx [ i ] ; // Current x-direction component

        var cnt = 0 ; // Count of opponent's pieces in the current direction
        var k = 1 ;   // Distance multiplier from the starting point

        // Loop indefinitely until a break condition is met
        while ( true ) {

            // Check if the current cell is out of bounds ('f') or empty ('.')
            if ( yx [ y + DY * k ] [ x + DX * k ] == "f" || yx [ y + DY * k ] [ x + DX * k ] == "." )
                break ; // Cannot flip in this direction

            // If it's the current player's piece, increment count
            else if ( yx [ y + DY * k ] [ x + DX * k ] == a )
                cnt ++ ;

            // If it's the opponent's piece, we've found a line of pieces to flip
            else if ( yx [ y + DY * k ] [ x + DX * k ] == b ) {
                sum += cnt ; // Add the counted pieces to the total sum
                break ;      // Stop searching in this direction
            }

            k ++ ; // Move to the next cell in this direction
        }
    }

    return sum ; // Return the total number of pieces that can be flipped
}


function change ( y , x , a , b ) {
    // Function change: Executes a move and flips pieces
    // y, x: coordinates of the move
    // a: opponent's piece ('x' or 'o')
    // b: current player's piece ('o' or 'x')

    yx [ y ] [ x ] = b ; // Place the current player's piece at the chosen coordinates

    var dy = [ -1 , -1 , -1 , 0 , 0 , 1 , 1 , 1 ] ; // Y-direction vectors
    var dx = [ -1 , 0 , 1 , -1 , 1 , -1 , 0 , 1 ] ; // X-direction vectors

    // Note: 'cnt' here is re-declared and unused, possibly a remnant or mistake in original logic.
    // It does not affect the function's behavior as it's immediately reset in the loop.
    var cnt = 0 ;

    // Iterate through all 8 directions
    for ( var i = 0 ; i < 8 ; i ++ ) {

        var DY = dy [ i ] ; // Current y-direction
        var DX = dx [ i ] ; // Current x-direction

        var cnt = 0 ;      // Count of opponent pieces in this specific direction (reset for each direction)
        var k = 1 ;        // Distance multiplier
        var flag = false ; // Flag to indicate if opponent's pieces have been encountered

        // Search in the current direction
        while ( true ) {

            // If out of bounds ('f') or empty ('.'), stop searching this direction
            if ( yx [ y + DY * k ] [ x + DX * k ] == "f" || yx [ y + DY * k ] [ x + DX * k ] == "." )
                break ;

            // If an opponent's piece is found, set the flag
            else if ( yx [ y + DY * k ] [ x + DX * k ] == a )
                flag = true ;

            // If the current player's piece is found
            else if ( yx [ y + DY * k ] [ x + DX * k ] == b ) {
                if ( flag ) { // If opponent's pieces were encountered before reaching player's piece
                    // Flip the pieces between the current position and the placed piece
                    while ( k -- )
                        yx [ y + DY * k ] [ x + DX * k ] = b ;
                }
                break ; // Stop searching in this direction
            }

            k ++ ; // Move to the next cell
        }
    }
}


// --- Main game logic starts here ---

// Read input from stdin
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process input: trim whitespace and split into lines
var arr = input . trim ( ) . split ( "\n" ) ;

// Initialize the game board (yx)
var yx = [ ] ;

// Add a border of 'f' (fence) characters at the top
yx . push ( "ffffffffff" . split ( "" ) ) ;

// Populate the board with input data, adding 'f' borders to sides
arr . forEach ( function ( v ) {
    v = "f" + v + "f" ; // Add 'f' to start and end of each row
    yx . push ( v . split ( "" ) ) ; // Split row into characters and push to board
} ) ;

// Add a border of 'f' characters at the bottom
yx . push ( "ffffffffff" . split ( "" ) ) ;


var pass = 0 ; // Counter for consecutive passes (no valid moves)

// Main game loop
while ( true ) {

    // Player A's turn (e.g., 'x')
    var ansA = A ( ) ; // Find best move for player A

    if ( ansA . length == 0 ) { // If no valid move for A
        pass ++ ; // Increment pass counter
    } else {
        pass = 0 ; // Reset pass counter
        change ( ansA [ 0 ] , ansA [ 1 ] , "x" , "o" ) ; // Execute A's move
    }

    // Player B's turn (e.g., 'o')
    var ansB = B ( ) ; // Find best move for player B

    if ( ansB . length == 0 ) { // If no valid move for B
        pass ++ ; // Increment pass counter
    } else {
        pass = 0 ; // Reset pass counter
        change ( ansB [ 0 ] , ansB [ 1 ] , "o" , "x" ) ; // Execute B's move
    }

    // If both players have passed consecutively, the game ends
    if ( pass >= 2 )
        break ;
}

// Post-game processing: Remove the 'f' borders
yx . shift ( ) ; // Remove top border
yx . pop ( ) ;   // Remove bottom border

// Print the final board state to console
// Join rows with newline, then remove commas (from split("")) and 'f' characters
console . log ( yx . join ( "\n" ) . replace ( /\ , | f / g , "" ) ) ;