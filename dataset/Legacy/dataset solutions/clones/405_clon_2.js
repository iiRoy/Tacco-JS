#!/usr/bin/node

// This is an immediately invoked function expression (IIFE)
( function ( ) {
  // Declare an array to store numeric inputs from standard input.
  var inputNumbers = [ ] ;

  // Obtain a readable stream for standard input.
  var inputReader = process . openStdin ( ) ;

  // Set the character encoding for the input stream.
  inputReader . setEncoding ( 'utf8' ) ;

  // Initialize a sequence with the first three values.
  var sequenceValues = [ 1 , 1 , 2 ] ;

  // Generate the rest of the sequence up to the 30th element (index 30).
  // Each element is the sum of the three preceding elements.
  for ( var seqIndex = 3 ; seqIndex < 31 ; seqIndex ++ ) {
    sequenceValues . push ( sequenceValues [ seqIndex - 1 ] + sequenceValues [ seqIndex - 2 ] + sequenceValues [ seqIndex - 3 ] ) ;
  }

  // A buffer to hold incomplete lines received from standard input.
  var bufferedInput = "" ;

  // Attach an event listener for incoming data chunks.
  inputReader . on ( 'data' , function ( dataChunk ) {
    // Concatenate the buffer with the new chunk and split by newline.
    // The last element might be an incomplete line, so it's stored back in the buffer.
    var processedLines = ( bufferedInput + dataChunk ) . split ( "\n" ) ;
    bufferedInput = processedLines . pop ( ) ;

    // Process each complete line.
    for ( var lineIdx = 0 ; lineIdx < processedLines . length ; lineIdx ++ ) {
      // Skip empty lines.
      if ( processedLines [ lineIdx ] === '' ) {
        continue ;
      }
      // Convert the line to an integer using bitwise OR with 0 and add to the input numbers array.
      inputNumbers . push ( processedLines [ lineIdx ] ^ 0 ) ;
    }
  } ) ;

  // Attach an event listener for the 'end' of the input stream.
  inputReader . on ( 'end' , function ( _endEventArg ) {
    // Iterate through the collected input numbers.
    // The loop continues as long as inputNumbers[resultIdx] is truthy (i.e., not undefined or 0).
    for ( var resultIdx = 0 ; inputNumbers [ resultIdx ] ; resultIdx ++ ) {
      // Calculate the result based on the sequence and specific constants,
      // then convert to an integer using bitwise OR with 0, and print to console.
      console . log ( ( ( sequenceValues [ inputNumbers [ resultIdx ] ] + 3649 ) / 3650 ) ^ 0 ) ;
    }
  } ) ;

} ) ( ) ;
