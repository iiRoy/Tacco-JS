let   rawData = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ; // Acquire raw input data from the standard input source

const numberSequence = rawData . trim ( ) . split ( "\n" ) . map ( Number ) ; // Process raw data: strip whitespace, split by newline, and convert to numbers

while ( true ) { // Main processing loop for each set of input values
  let   currentNum = numberSequence . shift ( ) ; // Extract the first number from the sequence

  if ( currentNum === 0 ) { // Check if the current number indicates loop termination
    break ; // Exit the loop if currentNum is 0
  }

  if ( currentNum === 1 ) { // Handle the special case where currentNum is 1
    console . log ( "" ) ; // Output an empty line
    continue ; // Proceed to the next iteration of the loop
  }

  let   flagArray = [ ] ; // Initialize an array to store boolean flags
  for ( let loopIndex = 0 ; loopIndex < currentNum ; loopIndex ++ ) {
    flagArray [ loopIndex ] = false ; // Set all flags to false initially
  }

  // Mark specific indices in the flagArray based on a quadratic congruence relation
  for ( let loopIndex = 1 ; loopIndex < currentNum ; loopIndex ++ ) {
    flagArray [ ( loopIndex * loopIndex ) % currentNum ] = true ; // Set flag to true for computed index
  }

  const markedIndices = [ ] ; // Create an array to store the indices that were marked true
  flagArray . forEach ( function ( itemValue , itemIndex ) {
    if ( itemValue ) { // If the flag is true
      markedIndices . push ( itemIndex ) ; // Add the index to markedIndices
    }
  } ) ;

  let   resultArray = [ ] ; // Initialize an array to accumulate final results
  const halfRange = ( currentNum - 1 ) / 2 ; // Calculate a half-range value for array initialization and modulo operations

  // Initialize the resultArray with zeros up to the calculated halfRange
  for ( let loopIndex = 0 ; loopIndex <= halfRange ; loopIndex ++ ) {
    resultArray [ loopIndex ] = 0 ;
  }

  // Iterate through all unique pairs of marked indices to calculate differences
  for ( let loopIndex = 0 ; loopIndex < markedIndices . length ; loopIndex ++ ) {
    for ( let innerIndex = loopIndex + 1 ; innerIndex < markedIndices . length ; innerIndex ++ ) {
      let   diffValue = markedIndices [ loopIndex ] - markedIndices [ innerIndex ] ; // Calculate the first difference

      if ( diffValue < 0 ) {
        diffValue += currentNum ; // Adjust difference to be positive within the modulo range
      }
      if ( halfRange < diffValue ) {
        diffValue -= currentNum ; // Adjust difference to be within the half-range
      }
      resultArray [ diffValue ] ++ ; // Increment the count for this difference

      diffValue = markedIndices [ innerIndex ] - markedIndices [ loopIndex ] ; // Calculate the second difference (symmetric)

      if ( diffValue < 0 ) {
        diffValue += currentNum ; // Adjust symmetric difference
      }
      if ( halfRange < diffValue ) {
        diffValue -= currentNum ; // Adjust symmetric difference to be within half-range
      }
      resultArray [ diffValue ] ++ ; // Increment the count for the symmetric difference
    }
  }

  resultArray . shift ( ) ; // Remove the first element (at index 0) from the resultArray

  // Output each remaining element of the resultArray, multiplied by two
  resultArray . forEach ( function ( countValue ) {
    console . log ( countValue * 2 ) ;
  } ) ;
}