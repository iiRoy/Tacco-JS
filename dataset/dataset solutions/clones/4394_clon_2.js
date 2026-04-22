/*
 * This JavaScript module processes a series of numerical inputs.
 * Its purpose is to identify which of two candidate values is closer to a primary target value.
 */
function EvaluateNumericProximity( sourceContent ) {
  // First, parse the provided string content into a collection of numerical entities.
  // The input string is expected to contain space-separated numbers.
  const numericCollection = sourceContent.split( ' ' ).map( ( currentToken ) => {
    // Convert each string token into its numerical representation.
    return Number( currentToken ) ;
  } ) ;

  // Assign the initial numerical entity as the main reference.
  const centralValue = numericCollection[ 0 ] ;

  // Assign the second numerical entity as the first candidate.
  const candidateAlpha = numericCollection[ 1 ] ;

  // Assign the third numerical entity as the second candidate.
  const candidateBeta = numericCollection[ 2 ] ;

  // Compare the absolute difference between the central value and candidate alpha
  // against the absolute difference between the central value and candidate beta.
  if ( Math.abs( centralValue - candidateAlpha ) > Math.abs( centralValue - candidateBeta ) ) {
    // If candidate alpha is further away, log the label 'B'.
    console.log( 'B' ) ;
  }
  else {
    // Otherwise (if candidate beta is further or distances are equal), log the label 'A'.
    console.log( 'A' ) ;
  }
} // End of function EvaluateNumericProximity.


// Execute the core processing routine.
// The raw input data is asynchronously read from the standard input stream
// using Node.js's file system module, interpreted as UTF-8 encoding.
EvaluateNumericProximity( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) ) ;