function ProcessDataStream ( dataString ) {
  // Extract the initial configuration values from the first line of the input
  const maxPossibleId = parseInt( dataString.split( '\n' )[0].split( ' ' )[0] ); // Represents the total count of valid items
  const totalConstraints = parseInt( dataString.split( '\n' )[0].split( ' ' )[1] ); // Denotes the number of filtering rules

  // Initialize the currently valid range based on the overall item count
  let currentLowerBound = 1;
  let currentUpperBound = maxPossibleId;

  // Iterate through each subsequent line, which contains a new constraint
  for ( let constraintIndex = 1; constraintIndex <= totalConstraints; constraintIndex++ ) {
    // Parse the min and max values for the current constraint
    const boundsArray = dataString.split( '\n' )[constraintIndex].split( ' ' ).map( ( strVal ) => Number( strVal ) );

    let currentConstraintMin = boundsArray[0]; // The minimum allowed by this specific rule
    let currentConstraintMax = boundsArray[1]; // The maximum allowed by this specific rule

    // Update the overall valid range by finding the intersection with the current constraint
    currentLowerBound = Math.max( currentConstraintMin, currentLowerBound );
    currentUpperBound = Math.min( currentConstraintMax, currentUpperBound );
  }

  // Calculate the final count of items that satisfy all constraints
  const effectiveRangeLength = currentUpperBound - currentLowerBound + 1;

  // Output the result, ensuring it's not negative (in case no valid items remain)
  console.log( Math.max( effectiveRangeLength, 0 ) );
}

ProcessDataStream( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );