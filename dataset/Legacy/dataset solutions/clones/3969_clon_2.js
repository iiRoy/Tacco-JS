console.log(( ( inputStr ) => {
  // This section parses the input string.
  // The first line contains 'numPoints', and subsequent lines contain point coordinates.
  const [ [ numPoints ], ...tempData ] = inputStr
    .trim() // Remove any leading or trailing whitespace from the input.
    .split('\n') // Split the input string into an array of lines.
    .map( ( rowStr ) => rowStr.split(' ').map( ( valStr ) => parseInt(valStr, 10) ) ); // For each line, split by space and convert each part to an integer.

  // Separate the parsed data into two distinct arrays: red points and blue points.
  // The first 'numPoints' rows after the initial 'numPoints' value are red points.
  const redPoints = tempData.slice(0, numPoints);
  // The next 'numPoints' rows are blue points.
  const bluePoints = tempData.slice(numPoints, 2 * numPoints);

  // Sort the array of red points.
  // The sorting criterion is based on the minimum of the x and y coordinates of each point.
  redPoints.sort( ( pointA, pointB ) => Math.min(pointA[0], pointA[1]) - Math.min(pointB[0], pointB[1]) );

  // Sort the array of blue points using the same criterion.
  bluePoints.sort( ( pointA, pointB ) => Math.min(pointA[0], pointA[1]) - Math.min(pointB[0], pointB[1]) );

  // Initialize a counter for successful matches and an index for optimizing the inner loop.
  let matchCount = 0;
  let nextBlueIdx = 0; // This variable helps to avoid re-checking blue points that have already been considered.

  // Iterate through each red point.
  for ( let redIdx = 0; redIdx < numPoints; redIdx++ ) {
    // For each red point, iterate through the blue points starting from 'nextBlueIdx'.
    for ( let blueIdx = nextBlueIdx; blueIdx < numPoints; blueIdx++ ) {
      // Check if the current red point can be matched with the current blue point.
      // A match occurs if the red point's x-coordinate is less than the blue point's x-coordinate,
      // AND the red point's y-coordinate is less than the blue point's y-coordinate.
      if ( redPoints[redIdx][0] < bluePoints[blueIdx][0] && redPoints[redIdx][1] < bluePoints[blueIdx][1] ) {
        matchCount++; // Increment the total count of matches.
        nextBlueIdx = blueIdx + 1; // Update 'nextBlueIdx' to start the next search from the point after the current blue point.
        break; // A match has been found for the current red point, so move to the next red point.
      }
    }
  }

  // Return the final count of matches as a string.
  return `${matchCount}`;
} )( require('fs').readFileSync('/dev/stdin', 'utf8') ) ); // Read the entire content of standard input as a UTF-8 string.
