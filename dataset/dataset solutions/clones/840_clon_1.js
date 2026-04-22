function A ( ) {


  // Initialize maximum number of pieces that can be flipped by this move
  var max = 0;
  // Initialize an array to store the coordinates of the best move found so far
  var ary = [ ] ;


  // Outer loop: iterate through rows of the game board (from index 1 to 8, inclusive)
  for ( var i = 1 ; i <= 8 ; i ++ ) {

    // Inner loop: iterate through columns of the game board (from index 1 to 8, inclusive)
    for ( var j = 1 ; j <= 8 ; j ++ ) {


      // Check if the current cell (i, j) is an empty spot (represented by ".")
      if ( yx [ i ] [ j ] != "." ) {
        continue ; // If the cell is not empty, skip to the next iteration
      }


      // Call the 'seach' function to calculate how many opponent pieces ('o')
      // would be flipped if player 'x' places a piece at (i, j).
      var cnt = seach ( i , j , "x" , "o" ) ;


      // If the current move's flip count ('cnt') is greater than
      // the maximum flips recorded so far ('max')
      if ( cnt > max ) {
        ary = [ i , j ] ; // Update 'ary' with the coordinates of this new best move
        max = cnt ;       // Update 'max' with the new maximum flip count
      }

    } // End of inner loop (columns)

  }   // End of outer loop (rows)


  // Return the coordinates of the move that results in the most flips
  return ary ;
} // End of function A()


/*
 * Function B: Determines the optimal move for player 'o'.
 * Similar logic to function A, but iterates in reverse order
 * and considers 'o' as the current player and 'x' as the opponent.
 */
function B ( )
{
  var max = 0 ; // Stores the maximum number of pieces flippable for player 'o'.
  var ary = [ ] ; // Stores the coordinates of the best move for player 'o'.

  // Loop through rows in reverse order, from 8 down to 1.
  for ( var i = 8 ; i >= 1 ; i -- )
  {
    // Loop through columns in reverse order, from 8 down to 1.
    for ( var j = 8 ; j >= 1 ; j -- )
    {
      // If the current cell is not empty, it's not a valid move; skip it.
      if ( yx [ i ] [ j ] != "." )
      {
        continue ;
      }

      // Calculate the number of pieces player 'o' would flip by placing a piece at (i, j).
      // Here, 'o' is the current player, and 'x' is the opponent.
      var cnt = seach ( i , j , "o" , "x" ) ;

      // If the current move yields more flips than the previously recorded maximum:
      if ( cnt > max )
      {
        ary = [ i , j ] ; // Update the best move coordinates.
        max = cnt ;       // Update the maximum flip count.
      }
    } // End of inner 'for' loop (columns).
  }   // End of outer 'for' loop (rows).

  return ary ; // Return the coordinates of the optimal move for player 'o'.
} // End of function B()


/*
 *  seach(y, x, a, b):
 *    Calculates the total number of opponent pieces that would be flipped
 *    if a piece of type 'b' is placed at (y, x), targeting pieces of type 'a'.
 *    - y: row index
 *    - x: column index
 *    - a: opponent's piece type (e.g., "x" or "o")
 *    - b: current player's piece type (e.g., "o" or "x")
 */
function seach ( y , x , a , b ) {

    // Arrays defining the 8 possible directions of movement (delta y, delta x)
    var dy = [ -1 , -1 , -1 , 0 , 0 , 1 , 1 , 1 ] ; // Change in y-coordinate
    var dx = [ -1 , 0 , 1 , -1 , 1 , -1 , 0 , 1 ] ; // Change in x-coordinate

    var sum = 0 ; // Accumulator for the total number of pieces to be flipped

    // Loop through each of the 8 directions
    for ( var i = 0 ; i < 8 ; i ++ ) {

        var DY = dy [ i ] ; // Get the y-component of the current direction vector
        var DX = dx [ i ] ; // Get the x-component of the current direction vector
        var cnt = 0 ;       // Counter for opponent pieces found in the current direction
        var k = 1 ;         // Step multiplier: starts at 1 (adjacent cell)

        // Traverse in the current direction until a boundary, empty cell, or player's own piece is found
        while ( true ) {

            // Check if the current cell is a boundary ('f') or an empty spot ('.')
            if ( yx [ y + DY * k ] [ x + DX * k ] == "f" || yx [ y + DY * k ] [ x + DX * k ] == "." ) {
                break ; // If so, this direction does not form a valid capture line; stop.
            }
            // Check if the current cell contains an opponent's piece ('a')
            else if ( yx [ y + DY * k ] [ x + DX * k ] == a ) {
                cnt ++ ; // Increment the count of opponent pieces in this line.
            }
            // Check if the current cell contains the current player's piece ('b')
            else if ( yx [ y + DY * k ] [ x + DX * k ] == b ) {
                sum += cnt ; // A valid capture line is found; add counted opponent pieces to total sum.
                break ;      // Stop searching in this direction.
            }
            k ++ ; // Move to the next cell in the current direction (increment step multiplier).
        } // End of while loop for current direction

    }     // End of for loop for all 8 directions

    return sum ; // Return the total count of flippable pieces.
} // End of function seach()


/*
 * function change(y, x, a, b):
 *   Executes a move by placing a piece of type 'b' at (y, x)
 *   and flipping all opponent pieces ('a') that are part of a valid capture line.
 *   - y: row coordinate of the move
 *   - x: column coordinate of the move
 *   - a: opponent's piece type (e.g., "x")
 *   - b: current player's piece type (e.g., "o")
 */
function change ( y , x , a , b ) {

    // Place the current player's piece ('b') at the specified coordinates (y, x).
    yx [ y ] [ x ] = b ;

    // Define the 8 directional vectors (delta y, delta x).
    var dy = [ -1 , -1 , -1 , 0 , 0 , 1 , 1 , 1 ] ;
    var dx = [ -1 , 0 , 1 , -1 , 1 , -1 , 0 , 1 ] ;

    // This 'cnt' variable is declared but immediately shadowed by another 'cnt' inside the loop.
    // It has no functional effect here.
    var cnt = 0 ;

    // Iterate through each of the 8 possible directions.
    for ( var i = 0 ; i < 8 ; i ++ ) {

        var DY = dy [ i ] ; // Get the y-component of the current direction.
        var DX = dx [ i ] ; // Get the x-component of the current direction.

        var cnt = 0 ;     // Re-declare and initialize 'cnt' for counting pieces in the current line (unused).
        var k = 1 ;       // Step multiplier, starting from the adjacent cell.
        var flag = false ; // Flag to indicate if opponent pieces ('a') have been encountered in this line.

        // Traverse cells in the current direction.
        while ( true ) {

            // Check if the current cell is a boundary marker ('f') or an empty spot ('.').
            if ( yx [ y + DY * k ] [ x + DX * k ] == "f" || yx [ y + DY * k ] [ x + DX * k ] == "." ) {
                break ; // If so, stop searching in this direction (no valid capture line).
            }
            // If an opponent's piece ('a') is found.
            else if ( yx [ y + DY * k ] [ x + DX * k ] == a ) {
                flag = true ; // Set the flag to true, indicating a potential capture line.
            }
            // If the current player's piece ('b') is found.
            else if ( yx [ y + DY * k ] [ x + DX * k ] == b ) {
                // If a capture line was established (i.e., opponent pieces were found between the placed piece and this 'b').
                if ( flag ) {
                    // Flip all the opponent's pieces in this line back towards the starting point.
                    while ( k -- ) {
                        yx [ y + DY * k ] [ x + DX * k ] = b ;
                    }
                }
                break ; // Stop searching in this direction.
            }
            k ++ ; // Move to the next cell in the current direction.
        } // End of while loop for current direction.
    }     // End of for loop for all 8 directions.
}         // End of function change()


// --- Main Program Logic Starts Here ---

// Read the entire content of standard input synchronously as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
// Trim leading/trailing whitespace from the input and split it into an array of lines.
var arr = input . trim ( ) . split ( "\n" ) ;

// Initialize the 2D array (game board) with padding characters.
var yx = [ ] ;
// Add a top padding row of 'f' characters to simplify boundary checks.
yx . push ( "ffffffffff" . split ( "" ) ) ;

// Iterate over each line (row) from the input.
arr . forEach ( function ( v ) {
   // Add 'f' padding characters to the left and right of each row.
   v = "f" + v + "f" ;
   // Split the padded row string into an array of characters and add it to the game board.
   yx . push ( v . split ( "" ) ) ;
} ) ;

// Add a bottom padding row of 'f' characters.
yx . push ( "ffffffffff" . split ( "" ) ) ;

var pass = 0 ; // Counter to track consecutive passes (no valid moves).

// Main game loop: continues until a specific break condition is met.
while ( true ) {

   // --- Player A's Turn ---
   var ansA = A ( ) ; // Determine the best move for player A.
   if ( ansA . length == 0 ) {
     pass ++ ; // If no valid move for A, increment the pass counter.
   } else {
     pass = 0 ; // If a valid move is found, reset the pass counter.
     // Execute player A's move: place 'o' and flip 'x' pieces.
     change ( ansA [ 0 ] , ansA [ 1 ] , "x" , "o" ) ;
   }


   // --- Player B's Turn ---
   var ansB = B ( ) ; // Determine the best move for player B.
   if ( ansB . length == 0 ) {
     pass ++ ; // If no valid move for B, increment the pass counter.
   } else {
     pass = 0 ; // If a valid move is found, reset the pass counter.
     // Execute player B's move: place 'x' and flip 'o' pieces.
     change ( ansB [ 0 ] , ansB [ 1 ] , "o" , "x" ) ;
   }

   // Check for game termination condition: if two consecutive passes have occurred.
   if ( pass >= 2 ) {
     break ; // Exit the game loop.
   }

} // End of while (true) game loop.


// --- Post-Game Processing and Output ---

// Remove the top padding row from the game board.
yx . shift ( ) ;
// Remove the bottom padding row from the game board.
yx . pop ( ) ;

// Join the remaining rows into a single string, separated by newlines.
// Then, remove any commas (introduced by .split("")) and the 'f' padding characters.
console . log ( yx . join ( "\n" ) . replace ( /\ , | f / g , "" ) ) ;