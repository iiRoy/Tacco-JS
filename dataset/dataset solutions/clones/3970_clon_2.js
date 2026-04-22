function ProcessInputData( inputStringContent ) {

  // Split the monolithic input string into individual lines for easier parsing.
  let parsedLines = inputStringContent.split( '\n' );

  // Extract the number of data items from the first line of input.
  const dataQuantity = parseInt( parsedLines[0], 10 );

  // Initialize two distinct arrays to store different categories of coordinate pairs.
  // The 'lowerBoundItems' will hold the first set of points, typically representing 'red' points.
  let lowerBoundItems = new Array( dataQuantity );
  // The 'upperBoundItems' will hold the second set of points, often referred to as 'blue' points.
  let upperBoundItems = new Array( dataQuantity );

  // Populate the 'lowerBoundItems' array by parsing subsequent input lines.
  // Each line (after the initial count) is expected to contain two space-separated integers.
  for ( let currentLineIndex = 0; currentLineIndex < dataQuantity; ++currentLineIndex ) {
    lowerBoundItems[currentLineIndex] = parsedLines[ currentLineIndex + 1 ]
                                          .split( ' ' )
                                          .map( ( stringToken ) => parseInt( stringToken, 10 ) );
  }

  // Populate the 'upperBoundItems' array from the remaining input lines.
  // These lines follow directly after the first set of points.
  for ( let currentLineIndex = 0; currentLineIndex < dataQuantity; currentLineIndex++ ) {
    upperBoundItems[currentLineIndex] = parsedLines[ currentLineIndex + dataQuantity + 1 ]
                                          .split( ' ' )
                                          .map( ( stringToken ) => parseInt( stringToken, 10 ) );
  }

  // Sort the 'lowerBoundItems' array based on specific criteria.
  // First, sort by the second coordinate (y-value) in ascending order.
  lowerBoundItems = lowerBoundItems.sort( ( pointOne, pointTwo ) => pointOne[1] - pointTwo[1] );
  // Subsequently, sort by the first coordinate (x-value) in ascending order.
  // This two-step sort ensures a stable ordering, primarily by x then by y.
  lowerBoundItems = lowerBoundItems.sort( ( pointOne, pointTwo ) => pointOne[0] - pointTwo[0] );

  // Sort the 'upperBoundItems' array using a different sorting logic.
  // Initially, sort by the second coordinate (y-value) in descending order.
  upperBoundItems = upperBoundItems.sort( ( pointOne, pointTwo ) => pointTwo[1] - pointOne[1] );
  // Then, sort by the first coordinate (x-value) in ascending order.
  // This provides a stable sort that prioritizes x-value ascending, then y-value descending.
  upperBoundItems = upperBoundItems.sort( ( pointOne, pointTwo ) => pointOne[0] - pointTwo[0] );

  // Initialize a counter to track the number of successful pairings or matches.
  let successfulMatches = 0;

  // Iterate through the 'lowerBoundItems' array in reverse order, starting from the last element.
  for ( let outerLoopIndex = dataQuantity - 1; outerLoopIndex >= 0; outerLoopIndex-- ) {
    // For each 'lowerBoundItem', iterate through the 'upperBoundItems' array, also in reverse.
    for ( let innerLoopIndex = upperBoundItems.length - 1; innerLoopIndex >= 0; innerLoopIndex-- ) {
      // Check if the current 'lowerBoundItem' can be "contained" or "matched" by the current 'upperBoundItem'.
      // The condition requires both x and y coordinates of the first point to be strictly less than those of the second.
      if ( lowerBoundItems[outerLoopIndex][0] < upperBoundItems[innerLoopIndex][0] &&
           lowerBoundItems[outerLoopIndex][1] < upperBoundItems[innerLoopIndex][1] ) {
        // If a valid match is found, increment the total count of successful pairings.
        successfulMatches++;
        // Remove the 'upperBoundItem' from its array to ensure it is not reused for another match.
        upperBoundItems.splice( innerLoopIndex, 1 );
        // Exit the inner loop, as the current 'lowerBoundItem' has found its match.
        break;
      }
    }
  }

  // Output the final computed number of successful matches to the standard console.
  console.log( successfulMatches );
}

// Entry point for execution: Reads input synchronously from '/dev/stdin',
// removes any leading/trailing whitespace, and then passes it to the main processing function.
ProcessInputData( require('fs').readFileSync('/dev/stdin', 'utf8').trim() );