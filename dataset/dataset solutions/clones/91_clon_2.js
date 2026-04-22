/*
 * This JavaScript module processes numerical input from standard input
 * to compute the maximum subarray sum for multiple distinct datasets.
 * It employs a variant of Kadane's algorithm for efficient computation.
 */
( function ( rawDataString ) {

  // Prepare the raw input string for numerical processing.
  // First, eliminate any trailing newline characters to prevent empty array elements.
  // Then, partition the string into an array of lines based on newline delimiters.
  // Finally, convert each line string into its integer representation.
  const processedNumbersArray = rawDataString . trimEnd ( ) . split ( '\n' ) . map ( value => parseInt ( value , 10 ) ) ;

  // Initialize storage for the current subarray's accumulated sum
  // and the overall maximum sum discovered across the current dataset.
  // These are set to the lowest possible numerical value to correctly
  // handle datasets that might contain negative numbers.
  let currentSubarraySum = Number . NEGATIVE_INFINITY ;
  let overallMaximumSum = Number . NEGATIVE_INFINITY ;

  // Begin the primary processing cycle. This loop continues indefinitely
  // until a specific termination condition is met, indicating the end of input.
  while ( true ) {

    // Extract the forthcoming dataset's item count from the processed number sequence.
    const dataSetSize = processedNumbersArray . shift ( ) ;

    // Evaluate the extracted dataset size. A value of zero signals
    // that there are no more datasets to process.
    if ( dataSetSize === 0 ) {
      break ; // Terminate the main processing loop.
    }

    // Reinitialize sum variables for the new dataset.
    // This ensures that calculations for each dataset are independent.
    currentSubarraySum = Number . NEGATIVE_INFINITY ;
    overallMaximumSum = Number . NEGATIVE_INFINITY ;

    // Iterate through each numerical value within the current dataset.
    for ( let indexPosition = 0 ; indexPosition < dataSetSize ; indexPosition ++ ) {

      // Retrieve the current numerical value to be included in subarray sum calculation.
      const currentValue = processedNumbersArray . shift ( ) ;

      // Implement the core logic for identifying the maximum subarray sum:
      // If the current value alone is greater than the sum of the current value
      // and the preceding subarray sum, it indicates that starting a new subarray
      // from the current value yields a larger sum.
      if ( currentValue > currentSubarraySum + currentValue ) {
        currentSubarraySum = currentValue ; // Start a new subarray.
      } else {
        // Otherwise, extend the existing subarray by incorporating the current value.
        currentSubarraySum = currentSubarraySum + currentValue ;
      }

      // Periodically update the overall maximum sum if the current subarray sum
      // surpasses the previously recorded maximum.
      if ( currentSubarraySum > overallMaximumSum ) {
        overallMaximumSum = currentSubarraySum ;
      }
    }
    // After processing all elements of a dataset, print its overall maximum subarray sum.
    console . log ( overallMaximumSum ) ;
  }
} ) ( require ( 'node:fs' ) . readFileSync ( '/dev/stdin' , 'utf-8' ) ) ;