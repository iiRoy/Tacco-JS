// This function processes the raw text data received from standard input.
function ProcessInput ( rawData ) {
  // Split the input into individual lines and clean up whitespace.
  const linesOfText = rawData . trim ( ) . split ( '\n' ) ;

  // Parse the first line to get N and K values.
  let firstLineTokens = linesOfText [ 0 ] . split ( ' ' ) ;
  const countN = Math . floor ( firstLineTokens [ 0 ] ) ; // The expected count of numbers.
  const divisorK = Math . floor ( firstLineTokens [ 1 ] ) ; // The divisor for modulo operations.
  
  // Convert the second line into an array of integers.
  const integerArray = linesOfText [ 1 ] . split ( ' ' ) . map ( ( stringValue ) => {
    return parseInt ( stringValue , 10 ) ;
  } ) ;
  
  // Initialize the final counter for valid sequences.
  let finalCount = 0 ;
  
  // Iterate through the array to find subsequences.
  for ( let outerIndex = 0 ; outerIndex < integerArray . length ; outerIndex ++ ) {
    // Start a new subsequence sum with the current element.
    let currentSum = integerArray [ outerIndex ] ;
    
    // Log the initial element of the subsequence for debugging.
    console . log ( 'Starting element for subsequence: ' , integerArray [ outerIndex ] ) ;
    
    // Check if the single element itself satisfies the condition.
    if ( integerArray [ outerIndex ] % divisorK === 1 ) {
      finalCount ++ ; // Increment if condition met.
    }
    
    // Extend the subsequence by adding subsequent elements.
    for ( let innerOffset = 1 ; innerOffset < integerArray . length - outerIndex ; innerOffset ++ ) {
      currentSum += integerArray [ outerIndex + innerOffset ] ;
      
      // Display the running sum of the current subsequence.
      console . log ( 'Current accumulated sum for subsequence: ' + currentSum ) ;
      
      // Check the condition for the extended subsequence.
      if ( currentSum % divisorK === innerOffset + 1 ) {
        finalCount ++ ; // Another valid sequence found.
      }
      
      // Log the current state of the total count.
      console . log ( 'Intermediate valid sequence count: ' , finalCount ) ;
    }
  }
  
  // Output the final tally of valid subsequences.
  console . log ( 'Total number of valid subsequences: ' , finalCount ) ;
}

// Execute the main processing function with data from standard input.
ProcessInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;