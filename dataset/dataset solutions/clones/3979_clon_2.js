// This script processes coordinate data to find matching pairs based on specific rules.
console.log(( inputData => {
  // First, we parse the incoming string data from the standard input.
  // The initial line contains a single integer representing the total count of items.
  // Subsequent lines contain pairs of coordinates.
  const [
    // The total number of entities to process
    [ totalItems ],
    // Remaining lines of coordinate data
    ...parsedLines
  ] = inputData
      .trim()                                   // Remove any leading/trailing whitespace.
      .split('\n')                              // Split the input into individual lines.
      .map( lineStr =>
        lineStr.split(' ')                      // Split each line by space to get components.
        .map( valStr => Number(valStr) )        // Convert each string component to a number.
      );

  // Initialize two distinct collections for coordinate points.
  // 'crimsonPoints' will store the first set of coordinates.
  const crimsonPoints = [ ] ;
  // 'azurePoints' will store the second set of coordinates.
  const azurePoints = [ ] ;

  // Distribute the parsed coordinate data into their respective collections.
  // The first 'totalItems' lines go to 'crimsonPoints', the next 'totalItems' to 'azurePoints'.
  for ( let idx = 0 ; idx < totalItems ; idx++ ) {
    crimsonPoints.push( parsedLines[idx] );
    azurePoints.push( parsedLines[totalItems + idx] );
  }

  // Sort both collections in descending order based on their first coordinate (x-value).
  // This helps in optimizing the matching process later.
  crimsonPoints.sort(( [ firstCoord_A ], [ firstCoord_B ] ) => firstCoord_B - firstCoord_A );
  azurePoints.sort(( [ firstCoord_A ], [ firstCoord_B ] ) => firstCoord_B - firstCoord_A );

  // Initialize a counter for the number of successfully matched pairs.
  let successfulPairs = 0 ;

  // Iterate through each point in the 'azurePoints' collection.
  for ( let primaryIndex = 0 ; primaryIndex < totalItems ; primaryIndex++ ) {
    // Extract the x and y coordinates of the current blue point.
    const [ currentBlueX, currentBlueY ] = azurePoints[primaryIndex];

    // Initialize variables to track the optimal red point match for the current blue point.
    // 'optimalCandidate[0]' stores the index of the best red point in 'crimsonPoints'.
    // 'optimalCandidate[1]' stores the y-coordinate of the best red point.
    // Initial values (-1) indicate no suitable match has been found yet.
    let optimalCandidate = [ -1, -1 ];

    // Iterate through the available 'crimsonPoints' to find a match.
    for ( let secondaryIndex = 0 ; secondaryIndex < crimsonPoints.length ; secondaryIndex++ ) {
      // Extract the x and y coordinates of the current red point.
      const [ currentRedX, currentRedY ] = crimsonPoints[secondaryIndex];

      // Condition 1: The x-coordinate of the blue point must be strictly less than the red point's x-coordinate.
      if ( currentBlueX < currentRedX ) {
        continue; // If this condition is not met, move to the next red point.
      }

      // Condition 2: The y-coordinate of the blue point must be strictly greater than the red point's y-coordinate.
      // Additionally, we want to find the red point with the largest y-coordinate among valid matches.
      if ( currentBlueY > currentRedY && currentRedY > optimalCandidate[1] ) {
        // If both conditions are met and this red point's y-coordinate is better than previous best, update 'optimalCandidate'.
        optimalCandidate = [ secondaryIndex, currentRedY ];
      }
    }

    // After checking all available red points, if an optimal candidate was found (y-coordinate >= 0).
    if ( optimalCandidate[1] >= 0 ) {
      // Remove the matched red point from the collection to prevent it from being matched again.
      crimsonPoints.splice( optimalCandidate[0], 1 );
      // Increment the counter for successful pairings.
      successfulPairs++;
    }
  }

  // The final count of successful pairings is converted to a string and returned.
  return `${successfulPairs}`;

// This immediately invoked function expression (IIFE) reads input from stdin.
})( require('fs').readFileSync('/dev/stdin', 'utf8') ) );