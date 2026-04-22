'use strict' // Enforce strict parsing and error handling for better code quality.

// This function serves as the primary entry point for data processing.
const executeProcessor = rawDataString => {
  // First, split the incoming string into individual lines, then convert each line
  // into a numeric value. This creates a temporary array of numbers.
  const processedLines = rawDataString . split ( '\n' ) . map ( lineStr => Number ( lineStr ) ) ;

  // Remove the first element from the temporary array.
  // This is often a header or count that's not part of the data to be summed.
  processedLines . shift ( ) ;

  // Sort the remaining numeric data in descending order.
  // The largest number will be at the beginning of the array.
  let sortedNumericData = processedLines . sort ( ( valA , valB ) => valB - valA ) ;

  // Initialize the final result. The largest number is halved as a starting point.
  let finalResult = sortedNumericData [ 0 ] / 2 ;

  // Iterate through the sorted data, starting from the second element (index 1).
  // Each subsequent number is added directly to the running total.
  for ( let idx = 1 ; idx < sortedNumericData . length ; idx ++ )
  {
    finalResult += sortedNumericData [ idx ] ; // Accumulate the sum.
  }

  // Display the computed final result to the console.
  console . log ( finalResult ) ;
};

// Invoke the main processing function with data read from standard input.
// The 'fs' module is used to read the file synchronously.
executeProcessor(require('fs').readFileSync('/dev/stdin', 'utf8'));