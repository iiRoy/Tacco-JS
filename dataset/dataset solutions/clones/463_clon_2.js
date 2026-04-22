var systemIOHandler = require('fs') // Obtain the Node.js file system utility for synchronous operations.
  , totalInputSize = systemIOHandler.fstatSync( process.stdin.fd ).size // Ascertain the byte size of the incoming data from standard input.
  , dataPayloadBuffer = new Buffer( totalInputSize ) // Instatiate a new Buffer object to temporarily hold the raw input data.
  , actualBytesRetrieved = systemIOHandler.readSync( process.stdin.fd, dataPayloadBuffer, 0, totalInputSize, 0 ) // Synchronously read bytes from stdin into the allocated buffer.
  , processedInputLines = dataPayloadBuffer.toString('utf8', 0, actualBytesRetrieved).split('\n') // Convert buffer content to UTF-8 string, then split into an array of lines.
; // End of variable declarations.

/*
 * This JavaScript module orchestrates the reading of
 * standard input, performs a sequence of numerical
 * and string transformations on each line, and then
 * outputs the results to the standard console.
 */
!function ( digitMappingTable ) { // An Immediately Invoked Function Expression (IIFE) is used here to create a private scope.
                                 // It accepts a single argument: an array acting as a mapping table.

  // Iterate over each individual string element within the `processedInputLines` array.
  processedInputLines.forEach( function ( currentLineSegment ) {

    // Evaluate if the current line segment, when coerced to a number, is a truthy value (i.e., not zero or NaN).
    // The `currentLineSegment - 0` operation performs an explicit string-to-number conversion.
    if ( currentLineSegment - 0 ) {

      // If the line segment represents a non-zero number, proceed with the transformation pipeline.
      console.log(
        ( currentLineSegment - 0 ) // Explicitly convert the string line to its numerical equivalent.
        .toString(8) // Convert the number into its octal (base-8) string representation.
        .split('') // Deconstruct the octal string into an array of its constituent character digits.
        // Apply a transformation to each octal digit character.
        .map( function ( charDigit ) {
          // Use the character digit (converted back to a number) as an index into the mapping table.
          return digitMappingTable[ charDigit - 0 ];
        } )
        .join('') // Recombine the transformed numerical elements back into a single string.
      );
    }
  } );

// The array literal passed to the IIFE, serving as the `digitMappingTable`.
// This array dictates how octal digits are translated.
}( [ 0, 1, 2, 3, 5, 7, 8, 9 ] );