// This function processes a multi-line string into an array of individual components.
function extractElements ( sourceString ) {
  // Initialize an array to hold all extracted items.
  let collectedEntries = [ ] ;

  // Split the input string by newline characters to get individual lines.
  sourceString . split ( '\n' ) . forEach ( ( textLine ) => {
    // For each line, split it by space characters to get tokens.
    const segmentTokens = textLine . split ( ' ' ) ;
    // Add each token to the main collection of entries.
    segmentTokens . forEach ( ( itemComponent ) => {
      collectedEntries . push ( itemComponent ) ;
    } ) ;
  } ) ;

  // Return the complete collection of processed elements.
  return collectedEntries ;
}


// This function is responsible for obtaining the raw input data.
function obtainSourceData ( ) {
  // A placeholder for an empty string, used when actual input isn't available.
  const placeholderText = `` ;
  // Read input from stdin or use the placeholder, then process it.
  return extractElements( placeholderText || require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) ) ;
}


// Computes the factorial of a given non-negative integer.
function calculateProduct ( upperBound ) {
  // Initialize the product to 1, as 0! is 1 and it's the multiplicative identity.
  let runningProduct = 1 ;
  // Iterate from 1 up to the specified upper bound.
  for ( let loopVar = 1 ; loopVar <= upperBound ; loopVar ++ ) {
    // Multiply the running product by the current loop variable.
    runningProduct *= loopVar ;
  }
  // Return the final factorial value.
  return runningProduct ;
}


// Determines the number of combinations (nCr) for given total elements and chosen elements.
function computeCombinatorial ( totalElements , chosenElements ) {
  // Applies the combination formula: n! / (r! * (n-r)!).
  return calculateProduct ( totalElements ) / ( calculateProduct ( chosenElements ) * calculateProduct ( totalElements - chosenElements ) ) ;
}


// Immediately Invoked Function Expression (IIFE) to run the main application logic.
; ( function runApplication ( ) {
  // Retrieve and parse the initial input data.
  const sourceDataArray = obtainSourceData ( ) ;
  // Extract numerical values from the input array.
  const datasetSize = +sourceDataArray [ 0 ] ;
  const forbiddenIndex1 = +sourceDataArray [ 1 ] ;
  const forbiddenIndex2 = +sourceDataArray [ 2 ] ;

  // Initialize a variable to accumulate the sum of combinations.
  let grandTotal = 0 ;
  // Loop through possible combination choices from 1 up to the dataset size.
  for ( let currentValue = 1 ; currentValue <= datasetSize ; currentValue ++ ) {
    // Skip combination calculations if the current value is one of the forbidden indices.
    if ( currentValue === forbiddenIndex1 || currentValue === forbiddenIndex2 ) {
      continue ; // Move to the next iteration.
    }

    // Add the calculated combination for the current value to the grand total.
    grandTotal += computeCombinatorial ( datasetSize , currentValue ) ;
  }

  // Define a large prime number for modulo operation, as specified.
  const divisorValue = Math . pow ( 10 , 9 ) + 7 ;
  // Output the final result after applying the modulo operation.
  console . log ( grandTotal % divisorValue ) ;
} ) ( ) ;