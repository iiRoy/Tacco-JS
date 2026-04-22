/*
 * This JavaScript code processes input data to determine a 'flag' status.
 * It reads from standard input, parses arrays, and performs calculations.
 *
 * File: main.js
 * Purpose: Example of a Type I code clone with extensive whitespace and comment variations.
 */

// Obtain input data from standard input, decoded as UTF-8.
var input = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' );

// Process the raw input: trim whitespace and split into an array of lines.
var Arr = ( input . trim( ) ) . split( "\n" );

// Main processing loop: continues indefinitely until a specific condition is met.
while (true) {
  // Extract the first element from 'Arr', convert it to a number (N).
  // The '-0' ensures explicit numeric conversion.
  var N = Arr . shift( ) - 0;

  // If N is zero, it signifies the end of input or a termination condition.
  if ( N == 0 ) break;

  // Initialize a status flag for the current iteration.
  var flag = "OK";
  // Declare an array to store processed 'mab' (multi-attribute blocks) data.
  var mab = [ ];

  // Loop N times to populate the 'mab' array.
  for ( var i = 0 ; i < N ; i++ ) {
    // Read a line, split it by space, and convert each part to a Number.
    var arr = ( Arr . shift( ) ) . split( " " ) . map( Number );
    // Add the resulting numeric array to 'mab'.
    mab . push( arr );
  }

  // The flag is re-initialized here, implying a fresh check for the current N block.
  var flag = "OK"; // Reset flag for main logic

  // Outer loop: Iterate through each 'mab' entry.
  for ( var i = 0 ; i < N ; i++ ) {
    // If the flag has already been set to "NG", no further processing is needed for this N block.
    if ( flag == "NG" ) break;

    // Destructure properties from the current 'mab' entry.
    var W = mab[ i ][ 0 ]; // Weight or initial value
    var A = mab[ i ][ 1 ]; // Start range A
    var B = mab[ i ][ 2 ]; // End range B

    // Inner loop: Compare the current 'mab' entry with all other 'mab' entries.
    for ( var j = 0 ; j < N ; j++ ) {
      // Skip comparison with self.
      if ( i == j ) continue;

      // Destructure properties from the compared 'mab' entry.
      var w = mab[ j ][ 0 ]; // Compared weight
      var a = mab[ j ][ 1 ]; // Compared start range a
      var b = mab[ j ][ 2 ]; // Compared end range b

      // Check for overlap condition: A's range overlaps with B's range.
      if ( A <= b && B >= a ) {
        // If overlap, accumulate weight.
        W += w;
      }

      // Check if the accumulated weight exceeds a threshold.
      if ( W > 150 ) {
        // If threshold exceeded, set flag to "NG" (Not Good).
        flag = "NG";
      }
    }
  }
  // Output the final status flag for the current 'N' block.
  console . log( flag );
}
// End of the main processing loop.