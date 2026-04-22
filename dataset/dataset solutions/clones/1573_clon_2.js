// This module processes incoming textual information.
function ProcessInputData ( rawData ) {
  // Convert the raw input string into an array of individual characters.
  const characterArray = Array . from ( rawData ) ;

  // Transform each character into its corresponding integer representation.
  const numericValues = characterArray . map ( charItem => {
    return Number . parseInt ( charItem , 10 ) ;
  } ) ;

  // Compute the grand total of all the converted numeric values.
  const totalSum = numericValues . reduce ( ( accumulatorValue , currentValue ) => {
    return accumulatorValue + currentValue ;
  } ) ;

  // Output a specific message based on whether the total sum is divisible by nine.
  console . log ( totalSum % 9 === 0 ? "YES" : "NO" ) ;
}

// Execute the main processing function by reading data from standard input.
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;