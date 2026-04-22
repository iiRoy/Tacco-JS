/*
 * This JavaScript file contains a primary function for calculating a specific
 * coordinate-based metric, along with an auxiliary string manipulation routine.
 * It also includes the necessary event handlers to asynchronously process
 * input data received via the standard input stream.
 */

// Define the central function responsible for processing geographical or spatial coordinates.
function calculateMetric( inputDataLines )
{
  // The initial line of input is expected to contain a series of numeric values,
  // typically separated by one or more whitespace characters.
  const coordinateStrings = inputDataLines[ 0 ].split( /\s+/ );

  // Extract and convert the string representations of the coordinates into
  // floating-point numbers for precise calculations.
  let pointAX = Number.parseFloat( coordinateStrings[ 0 ] ); // X-coordinate of the first point
  let pointAY = Number.parseFloat( coordinateStrings[ 1 ] ); // Y-coordinate of the first point
  let pointBX = Number.parseFloat( coordinateStrings[ 2 ] ); // X-coordinate of the second point
  let pointBY = Number.parseFloat( coordinateStrings[ 3 ] ); // Y-coordinate of the second point


  // Compute a specialized scalar value, which is derived from the square root
  // of the sum of the absolute differences in X and Y coordinates.
  const derivedMeasure = Math.sqrt( Math.abs( pointBX - pointAX ) + Math.abs( pointBY - pointAY ) );

  // Display the final computed measure to the standard output,
  // ensuring it is formatted to exactly six decimal places for consistency.
  console.log( derivedMeasure.toFixed( 6 ) );

}


/*
 * This helper function facilitates the rotation or cyclic shifting of characters
 * within a given string by a specified amount.
 *
 * @param {string} textSequence   The original string that needs to be rotated.
 * @param {number} rotationIndex  The number of positions to shift characters from the start to the end.
 * @returns {string}              The resulting string after applying the character shift.
 */
function shiftCharacters( textSequence, rotationIndex ) {

  // The string is effectively split into two parts: the segment that moves to the end,
  // and the segment that remains at the beginning. These are then reassembled.
  return textSequence.slice( rotationIndex, textSequence.length ) + textSequence.slice( 0, rotationIndex );

}


// Initialize an array to serve as a buffer for collecting incoming data fragments
// from the standard input stream before full processing.
let inputSegments = [ ];

// Register an event handler to append each incoming data block to our buffer array.
process.stdin.on( 'data',
  /**
   * Callback function invoked whenever a new piece of data arrives via stdin.
   * @param {Buffer|string} dataBlock - The current fragment of input data.
   */
  function( dataBlock ) {
    inputSegments.push( dataBlock );
  }
);


// Establish another event handler that triggers once the entire standard input stream
// has been completely read and no more data is expected.
process.stdin.on( 'end',
  /**
   * Callback function executed upon the completion of the standard input stream.
   */
  function() {
    // Concatenate all buffered data segments into a single cohesive string,
    // then split this string into an array of individual lines based on newline characters.
    const rawTextRows = inputSegments.join( '' ).split( '\n' );

    // Finally, invoke the primary calculation function with the fully prepared
    // array of input lines to begin the core processing logic.
    calculateMetric( rawTextRows );
  }
);