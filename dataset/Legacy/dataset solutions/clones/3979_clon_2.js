console.log(( ( inputStr ) => {
  // Parse the input string into numerical data.
  // The first line contains N, subsequent lines contain coordinates.
  const [ [ numPoints ], ...tempData ] = inputStr
    .trim()
    .split( '\n' )
    .map( ( lineStr ) => lineStr.split( ' ' ).map( ( valStr ) => valStr | 0 ) );

  // Initialize arrays to hold red and blue point coordinates.
  const redPoints = [];
  const bluePoints = [];

  // Populate the redPoints and bluePoints arrays.
  // The first N lines after N are red points, the next N are blue points.
  for ( let idxA = 0x0; idxA < numPoints; idxA++ ) {
    redPoints.push( tempData[ idxA ] );
    bluePoints.push( tempData[ numPoints + idxA ] );
  }

  // Sort both arrays in descending order based on their first coordinate (x-value).
  // This helps in efficiently finding matches later.
  redPoints.sort( ( [ coordA ], [ coordB ] ) => coordB - coordA );
  bluePoints.sort( ( [ coordA ], [ coordB ] ) => coordB - coordA );

  let pairCount = 0x0; // Counter for the number of successful pairings.

  // Iterate through each blue point to find a matching red point.
  for ( let idxA = 0x0; idxA < numPoints; idxA++ ) {
    const [ blueX, blueY ] = bluePoints[ idxA ]; // Current blue point's coordinates.

    // `bestMatch` stores the index and y-coordinate of the best red point found so far
    // for the current blue point. Initialized to an invalid state.
    let bestMatch = [ -0x1, -0x1 ];

    // Iterate through the available red points.
    for ( let idxB = 0x0; idxB < redPoints.length; idxB++ ) {
      const [ redX, redY ] = redPoints[ idxB ]; // Current red point's coordinates.

      // Condition 1: The blue point's x-coordinate must be greater than the red point's x-coordinate.
      if ( blueX < redX ) {
        continue; // Skip this red point if its x is too large.
      }

      // Condition 2: The blue point's y-coordinate must be greater than the red point's y-coordinate.
      // Also, we want the red point with the largest y-coordinate that satisfies the conditions.
      if ( blueY > redY && redY > bestMatch[ 0x1 ] ) {
        bestMatch = [ idxB, redY ]; // Update `bestMatch` if a better red point is found.
      }
    }

    // If a suitable red point was found (i.e., `bestMatch[1]` is no longer -1).
    if ( bestMatch[ 0x1 ] >= 0x0 ) {
      redPoints.splice( bestMatch[ 0x0 ], 0x1 ); // Remove the matched red point from the array.
      pairCount++; // Increment the count of successful pairings.
    }
  }

  // Return the final count as a string.
  return `${ pairCount }`;
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) );
