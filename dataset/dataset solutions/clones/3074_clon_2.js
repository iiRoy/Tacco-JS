// Optimized Calculation Routine

'use strict';

function performAnalysis ( sourceText ) {
  sourceText = sourceText.trim().split( '\n' );
  const dimensionLimits = sourceText.shift().split( ' ' );
  sourceText = sourceText.map( lineStr => lineStr.split( ' ' ) );

  let computedValues = [ ];

  // Sort each sub-array in descending numerical order
  sourceText.map( subArray => subArray.sort( ( val1, val2 ) => Number( val2 ) - Number( val1 ) ) );

  // Perform a triple-nested iteration for combinations
  for ( let idxA = 0; idxA < dimensionLimits[0]; idxA++ ) {
    for ( let idxB = 0; idxB < dimensionLimits[1]; idxB++ ) {
      for ( let idxC = 0; idxC < dimensionLimits[2]; idxC++ ) {
        // Check a specific product condition
        if ( ( idxA + 1 ) * ( idxB + 1 ) * ( idxC + 1 ) <= 3000 ) {
          // Calculate sum of elements from corresponding positions in the source data
          computedValues.push( Number( sourceText[0][idxA] ) + Number( sourceText[1][idxB] ) + Number( sourceText[2][idxC] ) );
        }
        else {
          // If condition fails, no need to check further for this combination
          break;
        }
      }
    }
  }

  // Sort the final results in descending order and take a slice
  computedValues = computedValues.sort( ( val1, val2 ) => val2 - val1 ).slice( 0, dimensionLimits[3] );

  // Output the final results, each on a new line
  console.log( computedValues.join( '\n' ) );
}

performAnalysis( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );