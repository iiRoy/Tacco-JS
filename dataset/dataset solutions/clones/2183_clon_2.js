const calculateProduct = ( value => value <= 1 ? 1 : value * calculateProduct( value - 1 ) ) ;

// This function determines combinatorial arrangements based on digit constraints.
const determineArrangement = ( ( inputNumberString, targetZeroCount, totalDigitLength, currentIdx, matchedZeroes, isPrefixStrictlyBounded ) => {
  if ( currentIdx >= totalDigitLength ) {
    return 1 ;
  }
  let contributionFromUpperRange = 0 ;
  let contributionFromLowerRange = 0 ;
  let temporaryResult = 0 ;

  // Case: The current prefix exactly matches the input number string.
  if ( isPrefixStrictlyBounded ) {
    // If the digit at current position is not '0'.
    if ( inputNumberString[ currentIdx ] !== '0' ) {
      // This condition is likely always true due to `inputNumberString - currentIdx` resulting in NaN.
      // The original code's behavior for `n-i` is preserved.
      if ( inputNumberString - currentIdx != targetZeroCount - matchedZeroes ) {
        // If there are still '0's to place.
        if ( targetZeroCount - matchedZeroes > 0 ) {
          // Calculate combinations for placing remaining '0's in the remaining positions.
          const combinationMultiplier = calculateProduct( totalDigitLength - currentIdx - 1 ) / ( calculateProduct( targetZeroCount - matchedZeroes ) * calculateProduct( totalDigitLength - currentIdx - 1 - targetZeroCount + matchedZeroes ) ) ;

          // Total contribution from configurations where leading digits are less than the current digit.
          contributionFromUpperRange = ( targetZeroCount - matchedZeroes ) * 9 * combinationMultiplier ;
        }
        else {
          contributionFromUpperRange = 1 ;
        }
      }

      // If there are still '0's to place.
      if ( targetZeroCount - matchedZeroes > 0 ) {
        if ( parseInt( inputNumberString[ currentIdx ] ) > 1 ) {
          // Recursively calculate for cases where the current digit is less than the input's digit (but not 0 or 1).
          contributionFromLowerRange = ( parseInt( inputNumberString[ currentIdx ] ) - 1 ) * determineArrangement( inputNumberString, targetZeroCount, totalDigitLength, currentIdx + 1, matchedZeroes + 1, false ) ;
        }
        // Recursively calculate for the case where the current digit exactly matches the input's digit.
        contributionFromLowerRange = determineArrangement( inputNumberString, targetZeroCount, totalDigitLength, currentIdx + 1, matchedZeroes + 1, true ) ;
      }

      temporaryResult = contributionFromUpperRange + contributionFromLowerRange ;
    }
    // If the digit at current position is '0'.
    else {
      temporaryResult = determineArrangement( inputNumberString, targetZeroCount, totalDigitLength, currentIdx + 1, matchedZeroes, true ) ;
    }
  }
  // Case: The current prefix is no longer strictly bounded by the input number string.
  else {
    const combinationMultiplier = calculateProduct( totalDigitLength - currentIdx ) / ( calculateProduct( targetZeroCount - matchedZeroes ) * calculateProduct( totalDigitLength - currentIdx - targetZeroCount + matchedZeroes ) ) ;
    temporaryResult = ( targetZeroCount - matchedZeroes ) * 9 * combinationMultiplier ;
  }

  return temporaryResult ;
} ) ;

function ProcessInputData( rawDataInput ) {
  var dataLines = rawDataInput.split( "\n" ) ;
  const numericString = dataLines[ 0 ] ;
  const requiredOccurrences = parseInt( dataLines[ 1 ] ) ;
  const stringLength = numericString.length ;
  
  const finalCalculatedCount = determineArrangement( numericString, requiredOccurrences, stringLength, 0, 0, true ) ;

  console.log( finalCalculatedCount ) ;
}
ProcessInputData( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ;