console.log(( ( inputData => { /* This function processes input to find matching coordinate pairs. */

  // Parse the input string: trim, split by newline, then split each line by space,
  // converting values to integers. The first line gives the count of pairs.
  const [ [ numPairs ], ...allPoints ] = inputData
    .trim()
    .split('\n')
    .map( rowText => rowText.split(' ').map( numTxt => numTxt | 0 ) );

  // Separate the parsed points into two distinct sets: primary (red) and secondary (blue).
  const primaryPoints = allPoints.slice( 0, numPairs );
  const secondaryPoints = allPoints.slice( numPairs, 2 * numPairs );

  // Sort the primary set. The sorting criteria is based on the minimum of the two coordinates.
  primaryPoints.sort( ( itemOne, itemTwo ) => Math.min( itemOne[0], itemOne[1] ) - Math.min( itemTwo[0], itemTwo[1] ) );

  // Sort the secondary set using the same criteria.
  secondaryPoints.sort( ( itemOne, itemTwo ) => Math.min( itemOne[0], itemOne[1] ) - Math.min( itemTwo[0], itemTwo[1] ) );

  // Initialize a counter for successful matches and an index to optimize the inner loop.
  let successfulMatches = 0, searchOffset = 0;

  // Iterate through each point in the primary (red) set.
  for ( let primaryIdx = 0; primaryIdx < numPairs; primaryIdx++ ) {

    // For each primary point, iterate through the secondary (blue) set, starting from the optimized offset.
    for ( let secondaryIdx = searchOffset; secondaryIdx < numPairs; secondaryIdx++ ) {

      // Check if the current primary point's coordinates are both smaller than the current secondary point's coordinates.
      // This is the core matching condition.
      if ( primaryPoints[primaryIdx][0] < secondaryPoints[secondaryIdx][0] && primaryPoints[primaryIdx][1] < secondaryPoints[secondaryIdx][1] ) {

        successfulMatches++; // Increment the counter if a match is found.
        searchOffset = secondaryIdx + 1; // Update the offset for the next primary point to avoid re-checking.
        break; // A primary point can only match with one secondary point in this specific problem logic.
      }
    }
  }

  // Return the final count of successful matches as a string.
  return `${successfulMatches}`;

} )( require('fs').readFileSync('/dev/stdin', 'utf8') ) ); // Read input from standard input using Node.js file system module.