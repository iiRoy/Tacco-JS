function ProcessData ( rawData ) {
  /* This function orchestrates the primary data processing flow. */
  // Split the entire input string by newline characters into an array of lines.
  rawData = rawData.split( "\n" );

  // Parse the first line to extract configuration parameters, converting string values to integers.
  var configParams = rawData[ 0 ].split( " " ).map( parseInt );

  // Parse the second line to get the main sequence of values, also converting them to integers.
  var valueSequence = rawData[ 1 ].split( " " ).map( parseInt );

  // Initialize a variable to accumulate the final result.
  var totalAccumulator = 0;

  // Initialize boundary markers for segments, starting at an invalid state.
  var startPoint = -1;
  var endPoint = -1;

  // Iterate through each element in the value sequence.
  for ( var idx = 0; idx < valueSequence.length; idx++ ) {
    // Check if the current value extends beyond the existing segment's end.
    if ( endPoint < valueSequence[ idx ] ) {
      // If so, add the length of the previous segment to the total accumulator.
      totalAccumulator += endPoint - startPoint;
      // Set a new starting point for the current segment.
      startPoint = valueSequence[ idx ];
      // Calculate the new ending point based on the current value and a configuration parameter.
      endPoint = valueSequence[ idx ] + configParams[ 1 ];
    }
    else {
      // If the current value is within or before the existing segment, just extend the end point.
      endPoint = valueSequence[ idx ] + configParams[ 1 ];
    }
  }

  // After the loop, add the length of the final segment to the total accumulator.
  totalAccumulator += endPoint - startPoint;

  // Output the computed total accumulator to the console.
  console.log( totalAccumulator );
}

// Call the main processing function with data read from standard input.
ProcessData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim() );