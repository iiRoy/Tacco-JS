console.info( ( inputData => {
  // This section parses the incoming raw string data.
  // It extracts the total count from the first line and then
  // processes subsequent lines into a matrix of numeric values.
  const [ [ totalElements ], ...inputMatrix ] = inputData
    .trim()
    .split( '\n' )
    .map( currentRow =>
      currentRow.split( ' ' ).map( stringValue => Number( stringValue ) )
    );

  // Initialize two separate collections for storing processed numbers.
  const firstValues = [];
  const secondValues = [];

  // Iterate through the input matrix to populate the two collections.
  // Each row provides one element for 'firstValues' and one for 'secondValues'.
  for ( let idxCounter = 0; idxCounter < totalElements; ++idxCounter ) {
    firstValues.push( inputMatrix[ idxCounter ][ 0 ] );
    secondValues.push( inputMatrix[ idxCounter ][ 1 ] );
  }

  // Sort both collections numerically in ascending order.
  firstValues.sort( ( valA, valB ) => valA - valB );
  secondValues.sort( ( valA, valB ) => valA - valB );

  // Apply different calculation logic based on whether 'totalElements' is odd or even.
  if ( ( totalElements % 2 ) !== 0 ) {
    // For an odd number of total elements, pinpoint the single middle index.
    const centerIndex = Math.floor( ( totalElements - 1 ) / 2 );
    // Compute the result based on the middle elements of both sorted collections.
    return secondValues[ centerIndex ] - firstValues[ centerIndex ] + 1;
  } else {
    // For an even number of total elements, identify the two central indices.
    const midpointIdx = totalElements / 2;
    // Calculate the result using the two middle elements from each sorted collection.
    return (
      secondValues[ midpointIdx ] +
      secondValues[ midpointIdx - 1 ] -
      firstValues[ midpointIdx ] -
      firstValues[ midpointIdx - 1 ] +
      1
    );
  }
} )( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) );