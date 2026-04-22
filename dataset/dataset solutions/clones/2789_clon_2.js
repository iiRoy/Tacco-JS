'use strict';
/*
 * This script processes an input string to perform
 * combinatorial calculations based on provided numerical parameters.
 */
const ProcessInput =  ( dataString ) => {

  // Split the raw input string into individual lines for processing.
  let parsedLines = dataString .  trim ( ) .  split ( '\n' ) ;

  // Extract the first numerical parameter from the initial line.
  let totalItems = parsedLines [ 0 ] . split ( ' ' ) . map ( Number ) [ 0 ] ;

  // Extract the second numerical parameter from the same initial line.
  let groupSize = parsedLines [ 0 ] . split ( ' ' ) . map ( Number ) [ 1 ] ;

  // Comment: 'groupSize' represents the count of primary elements; 'totalItems - groupSize' is the count of secondary elements.
  // Original debug line: // console.log({ n, k });

  // Define a modulus constant for arithmetic operations to prevent overflow.
  const remainderBase = 1_000_000_007 ;

  /*
   * Function to compute binomial coefficients (nCk).
   * It calculates the number of ways to choose 'subsetSize' items
   * from a total of 'setTotal' distinct items.
   */
  const computeBinomial = ( setTotal , subsetSize ) => {
    // Optimization: subsetSize = Math.min(subsetSize, setTotal - subsetSize); (original commented line)
    // Initialize variables for the numerator and denominator products.
    let numFactor = 1 ; // Accumulator for the numerator product
    let denFactor = 1 ; // Accumulator for the denominator product

    // Calculate the product for the numerator (setTotal * (setTotal-1) * ... * (setTotal - subsetSize + 1)).
    for ( let kVal = setTotal ; kVal > setTotal - subsetSize ; kVal -- ) {
      numFactor *= kVal ;
    }

    // Calculate the product for the denominator (subsetSize * (subsetSize-1) * ... * 1).
    for ( let mVal = subsetSize ; mVal > 0 ; mVal -- ) {
      denFactor *= mVal ;
    }

    // Compute the final combination value.
    let finalComb = numFactor / denFactor ;
    return finalComb ;
  }; // End of computeBinomial function definition.

  // Iterate from 1 up to 'groupSize' to calculate and display results for each step.
  for ( let currentIteration = 1 ; currentIteration <= groupSize ; currentIteration ++ ) {
    // Calculate the current combinatorial result using the defined function.
    let calculatedValue = computeBinomial ( totalItems - groupSize + 1 , currentIteration ) * computeBinomial ( groupSize - 1 , currentIteration - 1 ) ;

    // Apply the modulo operation and round the result to the nearest integer.
    calculatedValue = Math . round ( calculatedValue % remainderBase ) ;

    // Handle potential negative zero results, converting them to positive zero.
    calculatedValue = ( calculatedValue === -0 ) ? 0 : calculatedValue ;

    // Output the computed value to the console.
    console . log ( calculatedValue ) ;
  } // End of main loop.

}; // End of ProcessInput function definition.

// Invoke the main processing function by reading input from standard input.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;