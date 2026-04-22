( function ( ) {
  // This variable will accumulate all incoming data from standard input.
  var receivedStreamData = '';

  /**
   * Initiates the primary sequence of operations.
   * It processes the input, triggers the numerical computation,
   * and displays the final outcome.
   */
  function runPrimaryProcess ( ) {
    var currentIncrement, // Represents the step size for summation.
        maxRangeValue = 600; // The ceiling for the calculation domain.

    // Extract the first numerical value from the buffered input string.
    currentIncrement = parseFloat( receivedStreamData[0] );

    // Call the function to compute the summation and log its rounded result.
    console.log( computeNumericalSum( currentIncrement, maxRangeValue ) );
  }

  /**
   * Computes an approximate integral using a form of Riemann sum.
   * The function calculates the sum of areas of squares with sides
   * proportional to `iterator * interval`.
   * @param {number} interval - The width of each segment in the summation.
   * @param {number} rangeMaximum - The upper boundary for the summation.
   * @returns {number} The integer-rounded total sum.
   */
  function computeNumericalSum ( interval, rangeMaximum ) {
    var loopCounter, // A variable to iterate through the segments.
        totalValueAccumulator = 0; // Stores the running total of the computed areas.

    // Iterate as long as the product of the counter and interval is less than the range maximum.
    for ( loopCounter = 1; loopCounter * interval < rangeMaximum; loopCounter += 1 ) {
      // Calculate the area for the current segment and add it to the accumulator.
      // The formula used is (segment_position)^2 * segment_width.
      totalValueAccumulator += Math.pow( loopCounter * interval, 2 ) * interval;
    }

    // Return the final accumulated sum, rounded to the nearest whole number.
    return Math.round( totalValueAccumulator );
  }


  // Configure the standard input stream to be resumable and use UTF-8 encoding.
  process.stdin.resume( );
  process.stdin.setEncoding( 'utf8' );

  // Attach an event listener for when data chunks are received.
  process.stdin.on( 'data', function ( dataPortion ) {
    receivedStreamData += dataPortion; // Append the new data to our buffer.
  } );

  // Attach an event listener for when the input stream has completely ended.
  process.stdin.on( 'end', function ( ) {
    // Once all data is received, split the buffered string by newline characters.
    receivedStreamData = receivedStreamData.split( '\n' );
    // Execute the main processing function with the prepared input.
    runPrimaryProcess( );
  } );
}() );