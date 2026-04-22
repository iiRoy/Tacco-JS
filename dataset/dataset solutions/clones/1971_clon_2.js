const calculateAndOutput = (dataString) => {
  /* This constant holds a large prime number often used for
   * modulo arithmetic to prevent integer overflows in calculations. */
  const primeDivisor = 1_000_000_000 + 7;

  // Deconstructs the input string into two numerical values
  // after stripping whitespace and splitting by space.
  const [upperLimit, startPoint] = dataString .  trim (  ) . split ( ' ' ) . map ( Number ) ;


  let cumulativeSum = 0; // Initialize a variable to accumulate the final result.

  // Loop from the initial starting point up to one more than the upper limit.
  for ( let iterationIndex = startPoint ; iterationIndex <= upperLimit + 1 ; iterationIndex++ ) {
    // Calculate the sum of an arithmetic progression starting from 0 up to (iterationIndex - 1).
    const sumOfLowerSequence = ( iterationIndex - 1 ) * iterationIndex / 2 ;

    // Determine the first term of the upper sequence based on the upper limit and current index.
    const firstTermOfUpperSequence = upperLimit - iterationIndex + 1 ;

    // Compute the sum of an arithmetic progression for the upper sequence.
    // This sequence starts from 'firstTermOfUpperSequence' and goes up to 'upperLimit',
    // with 'iterationIndex' terms.
    const sumOfUpperSequence = ( firstTermOfUpperSequence + upperLimit ) * iterationIndex / 2 ;

    // Add the difference between the upper and lower sums, plus one, to the cumulative total.
    cumulativeSum += sumOfUpperSequence - sumOfLowerSequence + 1 ;
  }

  // Output the final result, ensuring it remains within the bounds of the prime divisor
  // using double modulo for correct handling of negative results (though not expected here).
  return console . log ( ( ( cumulativeSum % primeDivisor ) + primeDivisor ) % primeDivisor ) ;
} ;

// Conditional execution block:
// Checks for an environment variable to determine execution mode.
process.env.RUN_TEST_ENV
  ? (process.env.RUN_TEST_ENV === 'test'
      ? runTestCases() // Execute specific test cases if 'test' mode is active.
      : calculateAndOutput(require('fs').readFileSync('dev/stdin', 'utf8'))) // Read from 'dev/stdin' for other test environments.
  : calculateAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8')) ; // Default execution: read from '/dev/stdin'.