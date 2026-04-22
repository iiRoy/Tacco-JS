#!/usr/bin/node
// This code processes standard input to perform calculations.
( function( ) {
  var collectedInputLines = [ ], inputDataStream;

  // Obtain the standard input stream for data processing.
  inputDataStream = process.openStdin();

  // Configure the input stream to use UTF-8 character encoding.
  inputDataStream.setEncoding( 'utf8' );

  // Attach a listener for incoming data chunks.
  inputDataStream.on( 'data', function( receivedChunk ) {
    // Split the received data into lines based on newline characters.
    var lineSegments = receivedChunk.split( "\n" );

    // If the data contains more than two segments or the second segment is not empty,
    // replace the entire collection. Otherwise, append the first segment.
    if ( lineSegments.length > 2 || lineSegments[ 1 ] !== '' ) {
      collectedInputLines = lineSegments;
    } else {
      collectedInputLines.push( lineSegments[ 0 ] );
    }
  } );

  // Attach a listener for the end of the input stream.
  inputDataStream.on( 'end', function( completionArg ) {
    var currentLineNumbers, outerLoopIndex, innerLoopIndex, secondCoordinateValue, totalIterationsCount, resultOffset, firstCoordinateValue;

    // Parse the first line as the total number of iterations.
    totalIterationsCount = parseInt( collectedInputLines.shift( ) );

    // Iterate through the collected input lines.
    for ( outerLoopIndex = 0; outerLoopIndex < totalIterationsCount; outerLoopIndex ++ ) {
      // Split the current line by spaces and parse each part as an integer.
      currentLineNumbers = collectedInputLines[ outerLoopIndex ].split( " " );
      for ( innerLoopIndex = 0; innerLoopIndex < currentLineNumbers.length; innerLoopIndex ++ ) {
        currentLineNumbers[ innerLoopIndex ] = parseInt( currentLineNumbers[ innerLoopIndex ] );
      }

      // Extract and adjust the first two numeric values.
      firstCoordinateValue = currentLineNumbers[ 0 ] - 1;
      secondCoordinateValue = currentLineNumbers[ 1 ] - 1;
      resultOffset = 0;

      // Apply a conditional adjustment based on the first coordinate value.
      if ( firstCoordinateValue % 3 !== 2 ) {
        resultOffset = Math.floor( secondCoordinateValue / 2 );
      }

      // Log the final calculated result based on the processed values.
      console.log( 196471 - firstCoordinateValue * 195 - Math.floor( firstCoordinateValue / 3 ) * 5 - secondCoordinateValue * 20 + resultOffset - currentLineNumbers[ 2 ] );
    }
  } );
} ).call( this );