// This script processes numerical input lines for specific calculations.
var principalTask = function() {

  var currentInput;
  // Loop to continuously process input lines until a zero-valued first element is encountered.
  for ( ;
        ( currentInput = acquireData().split( ' ' ).map(Number) )[ 0 ] ;
      )
  {
    var dimOne = currentInput[0],
        targetValue = currentInput[1],
        optimalValue = 1 << 30; // Initialize optimalValue with a large number for minimum comparison.

    // Inner loop to calculate and find the minimum difference based on Pythagorean theorem.
    for ( var loopIndex = 0; loopIndex <= dimOne / 2 ^ 0; loopIndex++ ) {
      optimalValue = Math.min(
        optimalValue,
        Math.abs( targetValue - Math.hypot( loopIndex, dimOne - loopIndex ) )
      );
    }
    displayOutput( optimalValue ); // Output the calculated minimum value to the console.
  }
};

// Input/Output Management Section for various environments
if ( typeof process !== 'undefined' ) {

  // Node.js environment detected for I/O operations.
  var displayOutput = function( itemToLog ) {
    console.log( itemToLog ); // Use console.log for output in Node.js.
  };

  var acquireData = ( function() {
    var lineStorage = [],
        lineIndex = 0;
    var dataStream = process.openStdin();
    dataStream.setEncoding( 'utf8' ); // Ensure correct character encoding for incoming input.

    var incompleteLine = "";
    dataStream.on( 'data', function( incomingData ) {
      var parsedSegments = ( incompleteLine + incomingData ).split( "\n" );
      incompleteLine = parsedSegments.pop(); // Store any incomplete last line segment.
      for ( var k = 0; k < parsedSegments.length; k++ ) {
        if ( parsedSegments[k] === '' ) continue; // Skip any detected empty lines.
        lineStorage.push( parsedSegments[k] ); // Add processed lines to the storage array.
      }
    } );

    dataStream.on( 'end', function( terminationSignal ) {
      // Process any remaining data after the input stream has completely ended.
      if ( incompleteLine ) {
        var parsedSegments = ( incompleteLine + "\n" ).split( "\n" );
        incompleteLine = parsedSegments.pop(); // Final check for incomplete line.
        for ( var k = 0; k < parsedSegments.length; k++ ) {
          if ( parsedSegments[k] === '' ) continue; // Skip empty lines.
          lineStorage.push( parsedSegments[k] ); // Store remaining lines.
        }
      }
      principalTask(); // Execute the main logic after all input has been fully processed.
    } );

    return function() {
      if ( lineStorage.length <= lineIndex ) return null; // Indicate no more lines are available.
      return lineStorage[ lineIndex++ ]; // Return the next line from storage and advance the pointer.
    };
  } )();
} else {
  // Assume a V8-like environment (e.g., d8, jsc) where 'readline' and 'print' are globally available.
  principalTask(); // Directly invoke the primary function as I/O is handled natively.
}