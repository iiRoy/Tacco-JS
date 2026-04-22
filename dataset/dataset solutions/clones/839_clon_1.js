function A ( ) {
    // This function calculates the best move for player 'x'
    var max = 0 ; // Initialize maximum score found so far
    var ary = [ ] ; // Array to store coordinates of the best move

    /*
     * Iterate through the game board to find possible moves.
     * Board dimensions are assumed to be 8x8.
     */
    for ( var i = 1 ; i <= 8 ; i ++ ) {
        for ( var j = 1 ; j <= 8 ; j ++ ) {

            // If the current cell is not empty, skip it
            if ( yx [ i ] [ j ] != "." ) continue ;

            // Calculate the score for placing 'x' at (i, j)
            var cnt = seach ( i , j , "x" , "o" ) ;

            // If this move yields a higher score, update max and ary
            if ( cnt > max ) {
                ary = [ i , j ] ;
                max = cnt ;
            }
        }
    }
    // Return the coordinates of the best move found
    return ary ;
}


function B ( ) {
    // This function determines the optimal move for player 'o'
    var max = 0 ; // Keeps track of the highest score
    var ary = [ ] ; // Stores the coordinates for the best move

    // Loop through the board, iterating downwards and leftwards
    for ( var i = 8 ; i >= 1 ; i -- ) {
        for ( var j = 8 ; j >= 1 ; j -- ) {

            // Search for potential flips if 'o' is placed at (i, j)
            var cnt = seach ( i , j , "o" , "x" ) ;

            // If the current cell is not empty, move to the next
            if ( yx [ i ] [ j ] != "." )
                continue ;

            // Update the best move if 'cnt' is greater than current 'max'
            if ( cnt > max ) {
                ary = [ i , j ] ;
                max = cnt ;
            }
        }
    }
    return ary ; // Return the chosen move coordinates
}

// ----------------------------------------------------------------------
// This function calculates the number of opponent's pieces that would be
// flipped if a piece of type 'a' is placed at (y, x) against opponent 'b'.
function seach ( y , x , a , b ) {

    // Direction vectors for Y-axis (8 directions: up, down, left, right, diagonals)
    var dy = [ -1 , -1 , -1 , 0 , 0 , 1 , 1 , 1 ] ;
    // Direction vectors for X-axis
    var dx = [ -1 , 0 , 1 , -1 , 1 , -1 , 0 , 1 ] ;

    var sum = 0 ; // Total count of flippable pieces

    // Iterate over all 8 directions
    for ( var i = 0 ; i < 8 ; i ++ ) {
        var DY = dy [ i ] ; // Current Y direction
        var DX = dx [ i ] ; // Current X direction
        var cnt = 0 ;       // Counter for pieces of type 'a' in current direction
        var k = 1 ;         // Step multiplier for distance from (y, x)

        // Loop indefinitely until a break condition is met
        while ( true ) {
            // Check for out-of-bounds ('f') or empty cell ('.')
            if ( yx [ y + DY * k ] [ x + DX * k ] == "f" || yx [ y + DY * k ] [ x + DX * k ] == "." ) {
                break ; // Stop searching in this direction
            }
            // If an 'a' piece is found, increment its counter
            else if ( yx [ y + DY * k ] [ x + DX * k ] == a ) {
                cnt ++ ;
            }
            // If a 'b' piece is found, and there were 'a' pieces before it, add to sum
            else if ( yx [ y + DY * k ] [ x + DX * k ] == b ) {
                sum += cnt ; // Add the count of 'a' pieces to the total
                break ;      // Stop searching in this direction
            }
            k ++ ; // Move to the next cell in the current direction
        }
    }
    return sum ; // Return the total number of flippable pieces
}

// --------------------------------------------------------------------------
// Function to execute a move: place a piece 'b' at (y,x) and flip opponent's 'a' pieces
function change ( y , x , a , b ) {

    yx [ y ] [ x ] = b ; // Place the current player's piece at the given coordinates

    // Direction arrays for 8 possible directions
    var dy = [ -1 , -1 , -1 , 0 , 0 , 1 , 1 , 1 ] ;
    var dx = [ -1 , 0 , 1 , -1 , 1 , -1 , 0 , 1 ] ;

    var cnt = 0 ; // This variable is declared but unused in this scope, will be re-declared inside loop

    // Loop through each of the 8 directions
    for ( var i = 0 ; i < 8 ; i ++ ) {
        var DY = dy [ i ] ; // Y-direction vector
        var DX = dx [ i ] ; // X-direction vector
        var cnt = 0 ;       // Counter for consecutive opponent pieces in this direction
        var k = 1 ;         // Distance multiplier
        var flag = false ;  // Flag to indicate if opponent pieces have been encountered

        // Traverse in the current direction
        while ( true ) {
            // If we hit a boundary ('f') or an empty spot ('.'), stop
            if ( yx [ y + DY * k ] [ x + DX * k ] == "f" || yx [ y + DY * k ] [ x + DX * k ] == "." ) {
                break ;
            }
            // If we find an opponent's piece ('a')
            else if ( yx [ y + DY * k ] [ x + DX * k ] == a ) {
                flag = true ; // Set flag to true, indicating potential flips
            }
            // If we find our own piece ('b')
            else if ( yx [ y + DY * k ] [ x + DX * k ] == b ) {
                if ( flag ) { // If opponent pieces were encountered before this 'b' piece
                    // Flip all intermediate opponent pieces
                    while ( k -- ) {
                        yx [ y + DY * k ] [ x + DX * k ] = b ;
                    }
                }
                break ; // Stop in this direction
            }
            k ++ ; // Increment distance
        }
    }
}


// var input = require('fs').readFileSync('/dev/stdin', 'utf8'); // Original input source, commented out
input = '........\n........\n........\n...ox...\n...xo...\n........\n........\n........' ; // Hardcoded input for demonstration

var arr = input . trim ( ) . split ( "\n" ) ; // Split input string into an array of rows
var yx = [ ] ;                               // Initialize the game board array

// Add a border of 'f' (fence) characters at the top
yx . push ( "ffffffffff" . split ( "" ) ) ;

// Process each row from the input array
arr . forEach ( function ( v ) {
    v = "f" + v + "f" ; // Add 'f' borders to the left and right of each row
    yx . push ( v . split ( "" ) ) ; // Add the bordered row to the game board
} ) ;

// Add a border of 'f' characters at the bottom
yx . push ( "ffffffffff" . split ( "" ) ) ;

var pass = 0 ; // Counter for consecutive passes (no valid moves)

// Main game loop
while ( true ) {

    // Player A's turn (find best move for 'x')
    var ansA = A ( ) ;
    if ( ansA . length == 0 ) {
        pass ++ ; // No valid move for A, increment pass counter
    } else {
        pass = 0 ; // A made a move, reset pass counter
        change ( ansA [ 0 ] , ansA [ 1 ] , "x" , "o" ) ; // Execute A's move
    }

    // If both players have passed consecutively, end the game
    if ( pass == 2 ) {
        break ;
    }


    // Player B's turn (find best move for 'o')
    var ansB = B ( ) ;
    if ( ansB . length == 0 ) {
        pass ++ ; // No valid move for B, increment pass counter
    } else {
        pass = 0 ; // B made a move, reset pass counter
        change ( ansB [ 0 ] , ansB [ 1 ] , "o" , "x" ) ; // Execute B's move
    }

    // If both players have passed consecutively, end the game
    if ( pass == 2 ) {
        break ;
    }

}

yx . shift ( ) ; // Remove the top 'f' border row
yx . pop ( ) ;   // Remove the bottom 'f' border row

// Output the final board state, removing commas and 'f' characters
console . log ( yx . join ( "\n" ) . replace ( /\,|f/g , "" ) ) ;