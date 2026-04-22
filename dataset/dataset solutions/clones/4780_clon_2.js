// This module contains a function to compute specific numeric combinations.

function calculateCombinations ( inputString ) {
  // Split the raw input string by space to get individual numeric parts.
  const tokenizedParts = inputString . split ( ' ' );

  // Parse the first token as the maximum allowed value for each number.
  const maxVal = parseInt ( tokenizedParts [ 0 ] );

  // Parse the second token as the target sum for the three numbers.
  const targetSumValue = parseInt ( tokenizedParts [ 1 ] );

  // Initialize a counter for valid combinations found.
  let solutionCount = 0;

  // Outer loop: iterate for the first number from 0 up to maxVal.
  for ( let numOne = 0; numOne <= maxVal; numOne++ ) {

    // Inner loop: iterate for the second number from 0 up to maxVal.
    for ( let numTwo = 0; numTwo <= maxVal; numTwo++ ) {

      // Calculate the potential third number required to reach the target sum.
      let numThreeCandidate = targetSumValue - ( numOne + numTwo );

      // Check if the third number candidate is within the valid range [0, maxVal].
      if ( numThreeCandidate >= 0 && numThreeCandidate <= maxVal ) {
        // If it is, increment the counter for valid combinations.
        solutionCount++;
      }
    }
  }

  // Output the final count of valid combinations to the console.
  console.log ( solutionCount );
}

// Read input from standard input using Node.js file system module.
calculateCombinations ( require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) );