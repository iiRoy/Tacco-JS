var processInput = function ( rawData )
{
  // First, parse the raw input data.
  rawData = rawData.split ( '\n' ) ;

  // Extract the total number of records from the beginning.
  var recordCount = rawData.shift ( ) ;

  // Join the remaining parts into a single continuous string.
  var dataString = rawData.join ( ) ;

  // Declare variables for segment analysis.
  var leftSegment ; // Represents the current left portion of the string.
  var leftFiltered ; // Left portion after filtering specific characters.
  var rightSegment ; // Represents the current right portion of the string.
  var rightFiltered ; // Right portion after filtering specific characters.

  var currentCount ; // Holds the calculated count for the current iteration.
  var minimumCount = 300000; // Initialize with a very large value.

  // Iterate through each possible split point in the data string.
  for ( var idx = 0 ; idx < recordCount ; idx ++ ) {
    leftSegment = dataString.slice ( 0 , idx ) ;
    rightSegment = dataString.slice ( idx + 1 , recordCount ) ;

    // Filter out 'W' characters from the left segment.
    leftFiltered = leftSegment.split ( 'W' ) . join ( '' ) ;

    // Filter out 'E' characters from the right segment.
    rightFiltered = rightSegment.split ( 'E' ) . join ( '' ) ;

    // Calculate the total count based on the lengths of segments.
    currentCount = ( leftSegment.length - leftFiltered.length ) + ( rightSegment.length - rightFiltered.length ) ;

    // Check for an optimal scenario where count is zero.
    if ( currentCount === 0 || currentCount === -0 ) { // -0 is equivalent to 0 in JS, but keeping for structural parity.
      minimumCount = 0 ;
      break ; // No need to check further, 0 is the absolute minimum.
    }
    // Update the minimum count if the current count is smaller.
    else if ( currentCount < minimumCount ) {
      minimumCount = currentCount ;
    }
  }

  // Output the final calculated minimum count to the console.
  console.log ( minimumCount ) ;
  return 0 ; // Indicate successful execution.

};

// Execute the main processing function with data read from standard input.
processInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;