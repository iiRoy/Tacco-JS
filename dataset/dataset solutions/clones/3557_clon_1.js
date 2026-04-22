/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, keywords, operators, and expressions are identical.
 * Only whitespace and comments have been altered significantly.
 *
 * The primary goal is to make the code look visually different
 * while maintaining its exact logical and structural equivalence.
 */
function   main(  input  ) {
  // Declare and initialize a variable 'H' for height.
  // It parses the first element of the first input line as an integer.
  var H = input[ 0 ] . split( " " )[ 0 ] - 0; /*  Explicitly converting to number  */

  /*
   * Declare and initialize 'W' for width.
   * Similar parsing logic as for 'H'.
   */
  var W=input[0] . split(" ")[1] - 0;

  // Initialize an empty array to store coordinates of 'even' (odd-valued) cells.
  var evenlist = [];


  // Loop through rows, starting from 1 up to H.
  for( var i = 1; i <= H; i++ )
  {
    /*
     * Check if the current row index 'i' is odd.
     * This determines the processing direction for the row.
     */
    if (i % 2 == 1) { // If row is odd...
      // Process the row from left to right.
      input[i].split(" ").forEach( ( v, j ) => {
        // If cell value 'v' is odd, add its coordinates to 'evenlist'.
        if (v % 2 == 1) { // Check for odd value
          evenlist.push([i, j + 1]); // Store 1-based coordinates
        }
      } );
    } else { // If row is even...
      // Process the row from right to left (reversed).
      input[i] . split(" ") . reverse() . forEach( ( v, j ) => {
        // If cell value 'v' is odd, add its coordinates to 'evenlist'.
        if ( v % 2 == 1 ) {
          evenlist.push( [ i, W - j ] ); // Adjust column index for reversed order
        }
      } );
    }
  } // End of first main loop.

  // Initialize an array to store the sequence of moves.
  var anslist = [];


  // Loop through the 'evenlist' to pair up odd-valued cells.
  // The loop runs for half the length of 'evenlist', effectively pairing elements.
  for ( var i = 0; i < Math.floor(evenlist.length / 2); i++ ) {
    var start = evenlist[ i * 2 ]; // Get the starting cell for a path.
    var end = evenlist[ i * 2 + 1 ]; // Get the ending cell for a path.

    // If there's no 'end' cell (odd number of odd cells), break.
    if ( end == null ) break; // Safety check for unpaired last element

    /*
     * Convert the 'end' array to string for comparison.
     * This is a specific way the original code compared arrays.
     */
    var endj = end.toString();

    // While the 'start' cell has not reached the 'end' cell...
    while ( start.toString() != endj ) {
      /*
       * Check if the column indices are different.
       * This means horizontal movement is required.
       */
      if ( start[ 1 ] != end[ 1 ] ) {
        if ( start[ 1 ] < end[ 1 ] ) { // Move right
          anslist.push( [ start[ 0 ], start[ 1 ], start[ 0 ], ++start[ 1 ] ] );
        } else { // Move left
          anslist.push( [ start[ 0 ], start[ 1 ], start[ 0 ], --start[ 1 ] ] );
        }
      } else { // Column indices are the same, vertical movement is required.
        // Move down (increment row index).
        anslist.push( [ start[ 0 ], start[ 1 ], ++start[ 0 ], start[ 1 ] ] );
      }
    }
  } // End of second main loop.


  // Output the total number of moves.
  console.log( anslist.length );
  // Output each move on a new line, joined by newline characters.
  console.log( anslist.join( "\n" ) );

} // End of function 'main'

// This section handles reading input from stdin and passing it to the main function.
/* It reads the entire file, converts it to UTF-8, trims whitespace,
 * and splits it into an array of lines, which then becomes the 'input' for main. */
main(require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) . trim() . split( "\n" ) ) ;