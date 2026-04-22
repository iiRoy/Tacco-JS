// This script processes numerical input to determine a specific range based on a sequence of coefficients.
console.log(( inputString => {
  // Parse the input string:
  // The first line contains a single integer, which serves as a key index.
  // The second line contains a space-separated series of integers, forming the coefficient array.
  const [ [ keyIndex ], coefficientArray ] = inputString
    .trim()
    .split( '\n' )
    .map( lineText =>
      lineText
        .split( ' ' )
        .map( numericText => parseFloat( numericText ) | 0 ) // Convert each numeric string to an integer
    );

  // Perform an initial check: if the coefficient at (keyIndex - 1) is greater than 2.0,
  // then a valid range cannot be determined under the problem's constraints.
  if ( coefficientArray[ keyIndex - 1.0 ] > 2.0 ) {
    return "-1.0"; // Return a specific error string to indicate an impossible scenario
  }

  // Initialize the calculated range's lower and upper boundaries.
  let lowerBoundary = 2.0;
  let upperBoundary = 3.0;

  // Iterate backward through the coefficient array, starting from keyIndex - 2.0 down to 0.0.
  // Each iteration refines the lower and upper boundaries based on the current coefficient.
  for ( let loopIndex = keyIndex - 2.0; loopIndex >= 0.0; loopIndex-- ) {
    const currentCoefficientValue = coefficientArray[ loopIndex ];

    // Update the lower boundary: find the smallest multiple of currentCoefficientValue
    // that is greater than or equal to the current lowerBoundary.
    lowerBoundary = Math.ceil( lowerBoundary / currentCoefficientValue ) * currentCoefficientValue;

    // Update the upper boundary: find the largest multiple of currentCoefficientValue
    // that is less than or equal to the current upperBoundary, and then extend it
    // to the full range covered by that multiple.
    upperBoundary = Math.floor( upperBoundary / currentCoefficientValue ) * currentCoefficientValue + currentCoefficientValue - 1.0;

    // After updating, check if the boundaries have become invalid (e.g., upperBoundary
    // is less than the current coefficient or lowerBoundary has exceeded upperBoundary).
    if ( upperBoundary < currentCoefficientValue || lowerBoundary > upperBoundary ) {
      return "-1.0"; // Return the error string if the range becomes inconsistent
    }
  }

  // If the loop completes successfully, a valid range has been found.
  // Return the calculated lower and upper boundaries as a space-separated string.
  return `${ lowerBoundary } ${ upperBoundary }`;

// The anonymous function is immediately invoked with the content read from standard input.
})( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );