#!/usr/bin/node
/*
 * This script processes line-based input.
 * It was initially transformed from a compact CoffeeScript version.
 */
( function() {
  // Declare storage for incoming lines and the input stream object.
  var lineStore = [], dataStream;

  // Obtain the standard input stream for this process.
  dataStream = process.openStdin();

  // Establish the character encoding for the input stream.
  dataStream.setEncoding( 'utf8' );

  // Register a handler for 'data' events on the input stream.
  dataStream.on( 'data', function( receivedContent ) {
    var parsedLines; // Temporary variable to hold split lines.

    // Divide the received content by newline characters.
    parsedLines = receivedContent.split( "\n" );

    /*
     * Check if the parsed content contains more than two segments
     * or if the second segment is not empty.
     * This logic determines if the entire segment should replace
     * the buffer or if only the first line should be appended.
     */
    if ( parsedLines.length > 2 || parsedLines[1] !== '' ) {
      lineStore = parsedLines; // Replace the buffer with new lines.
    } else {
      lineStore.push( parsedLines[0] ); // Append only the first line.
    }
  } );

  // Register a handler for the 'end' event, signifying stream closure.
  dataStream.on( 'end', function( finalState ) {
    // Declare all variables used within the processing loop.
    var currentValues, rawElement, caseIndex, secondCoordinate, numCases, calculatedOffset, firstCoordinate, internalIterator, accumulatedResults;

    // Retrieve and parse the initial line, which indicates the number of test cases.
    numCases = parseInt( lineStore.shift() );

    // Initialize an array (though unused in this particular output, it's a CoffeeScript remnant).
    accumulatedResults = [];

    /*
     * Iterate through each test case.
     * This loop structure is a direct translation from CoffeeScript's range loop.
     */
    for ( caseIndex = internalIterator = 0; 0 <= numCases ? internalIterator < numCases : internalIterator > numCases; caseIndex = 0 <= numCases ? ++internalIterator : --internalIterator ) {
      // Immediately-invoked function expression to parse the current line's numbers.
      currentValues = ( function() {
        var subIterator, referenceLength, splitReference, parsedNumbers;

        // Split the current line from the stored input by spaces.
        splitReference = lineStore[caseIndex].split( " " );
        parsedNumbers = []; // Initialize array to hold parsed integers.

        // Loop through each string segment and convert it to an integer.
        for ( subIterator = 0, referenceLength = splitReference.length; subIterator < referenceLength; subIterator++ ) {
          rawElement = splitReference[subIterator];
          parsedNumbers.push( parseInt( rawElement ) ); // Add parsed integer to the array.
        }
        return parsedNumbers; // Return the array of numbers.
      } )();

      // Perform initial transformations on the first two parsed numbers.
      firstCoordinate = currentValues[0] - 1;
      secondCoordinate = currentValues[1] - 1;
      calculatedOffset = 0; // Initialize the offset value.

      // Apply a conditional calculation for the offset based on the first coordinate.
      if ( firstCoordinate % 3 !== 2 ) {
        calculatedOffset = Math.floor( secondCoordinate / 2 );
      }

      // Output the final computed result to the console.
      console.log( 196471 - firstCoordinate * 195 - Math.floor( firstCoordinate / 3 ) * 5 - secondCoordinate * 20 + calculatedOffset - currentValues[2] );
    }
  } );
} ).call( this ); // Execute the anonymous function immediately, binding 'this'.