/*
 * This is the main application entry point.
 * It processes input data and performs calculations based on a grid.
 */
function main( )
{

  // Declare a local variable to hold the input data for processing.
  var localInput = input;

  /*
   * Initialize a 2D array 'f' with dimensions 14x14,
   * filled entirely with zeros. This array serves as a grid
   * or a matrix for tracking various counts or states within the application logic.
   */
  var f = [
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 0 of the grid
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 1
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 2
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 3
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 4
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 5
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 6
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 7
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 8
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 9
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 10
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 11
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // Row index 12
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]  // Row index 13
  ];


  // Calculate the length of the input, adjusted by one (possibly for 0-indexing or header).
  var len = localInput.length - 1;

  // Iterate through the input data in reverse order using a decrementing loop.
  // The loop continues as long as 'len' is greater than zero.
  for ( ; len-- ; ) {

    // Get the current line from the input array at the 'len' index.
    var l = localInput[ len ];

    // Parse the x-coordinate from the line, converting it to an integer and adding an offset of 2.
    var ix = parseInt( l[ 0 ] ) + 2;
    // Parse the y-coordinate from the line, converting it to an integer and adding an offset of 2.
    var iy = parseInt( l[ 2 ] ) + 2;

    // A switch statement determines the pattern of increments based on a character in the input line.
    switch ( l[ 4 ] ) {

      case '3': // This case defines a specific pattern of increments and falls through.
        // Increment cells at (iy+2, ix), (iy-2, ix), (iy, ix-2), and (iy, ix+2).
        f[ iy + 2 ][ ix ]++;
        f[ iy - 2 ][ ix ]++;
        f[ iy ][ ix - 2 ]++;
        f[ iy ][ ix + 2 ]++;
        // Fallthrough to case '2' is intentional here.
      case '2': // This case defines another pattern of increments and also falls through.
        // Increment cells at (iy+1, ix-1), (iy+1, ix+1), (iy-1, ix-1), and (iy-1, ix+1).
        f[ iy + 1 ][ ix - 1 ]++;
        f[ iy + 1 ][ ix + 1 ]++;
        f[ iy - 1 ][ ix - 1 ]++;
        f[ iy - 1 ][ ix + 1 ]++;
        // Fallthrough to case '1' is intentional.
      case '1': // This is the final case, defining its own increments and then breaking.
        // Increment cells at (iy+1, ix), (iy, ix-1), (iy, ix), (iy, ix+1), and (iy-1, ix).
        f[ iy + 1 ][ ix ]++;
        f[ iy ][ ix - 1 ]++;
        f[ iy ][ ix ]++;
        f[ iy ][ ix + 1 ]++;
        f[ iy - 1 ][ ix ]++;
        break; // Exit the switch statement after this case.
    }
  }


  // Initialize 'nd' (not dropped count) to 0 and 'md' (most dropped / maximum value) to 0.
  var nd = 0; // Counter for cells with a value of zero (not incremented).
  var md = 0; // Stores the maximum value found in the processed grid cells.

  // Loop through a 10x10 sub-section of the 'f' array, starting from index 2.
  var y = 10;
  for ( ; y-- ; ) {
    var x = 10;
    for ( ; x-- ; ) {
      // If the cell f[y+2][x+2] is zero (falsy), increment 'nd'.
      nd += !( f[ y + 2 ][ x + 2 ] );
      // Update 'md' with the maximum value between its current value and f[y+2][x+2].
      md = mx( f[ y + 2 ][ x + 2 ], md );
    }
  }


  // Output the final calculated values to the console.
  console.log( nd ); // Log the count of 'not dropped' cells.
  console.log( md ); // Log the 'most dropped' (maximum value found).
}


/**
 * Helper function `mx` calculates the maximum of two numbers 'a' and 'b'
 * using a bitwise trick for efficiency.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The larger of the two input numbers.
 */
function mx( a, b )
{
  var t = ( a - b );
  // This expression effectively returns 'a' if 'a >= b', and 'b' if 'a < b'.
  // It leverages the sign bit of 't' (t >> 31) for integer comparisons.
  return a - ( t & ( t >> 31 ) );
}


// Global variable to store all incoming standard input.
var input = '';


// Resume the standard input stream to listen for data.
process.stdin.resume( );
// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding( 'utf8' );

// Event handler for 'data' events on the standard input stream.
// Each time a chunk of data is received, it is appended to the 'input' variable.
process.stdin.on( 'data', function ( chunk ) {
  input += chunk; // Accumulate input data.
} );

// Event handler for the 'end' event on the standard input stream.
// This signifies that all input has been received.
process.stdin.on( 'end', function( ) {
  // Split the accumulated input string into an array of lines.
  input = input.split( '\n' );
  // Call the main function to begin processing the parsed input.
  main( );
} );