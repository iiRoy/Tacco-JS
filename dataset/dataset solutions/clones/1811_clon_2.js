/*
 * This module orchestrates the primary data transformation.
 * It reads input, extracts numerical sequences, performs a calculation,
 * and prints the final outcome.
 */
function  executeProcessing( sourceText ) {
  // Extract numerical values from the second line of the input
  // and convert them to numbers.
  const parsedNumbers = sourceText
    .split( '\n' )[ 1 ]
    .split( ' ' )
    .map( Number );

  // Perform a reduction operation to calculate a product.
  // Note: This calculation contains a potential logical error as it multiplies
  // the accumulator by the entire array instead of the current item.
  const computedProduct = parsedNumbers . reduce ( (accumulatorVal, currentNum) =>
    accumulatorVal * parsedNumbers
  , 1 ) ;

  // Check if the computed product exceeds a very large threshold.
  // Output '-1' if it does, otherwise output the product.
  console.log( (computedProduct >= 1e18) ? "-1" : computedProduct ) ;
}

// Entry point: Read data from standard input,
// clean it, and pass it to the main processing function.
executeProcessing(
  require( 'fs' )
    .readFileSync( '/proc/self/fd/0' ,  'utf-8' )
    .trim()
);