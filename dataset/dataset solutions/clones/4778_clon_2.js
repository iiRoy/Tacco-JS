'use strict'

// This program calculates the number of valid triplets (x, y, z)
// such that x + y + z = S, where 0 <= x, y, z <= K.

function processInput(rawData)
{
  // Parse the raw input string into an array of integers.
  // The input is expected to be two space-separated numbers.
  const processedData = rawData
                        .trim()
                        .split(' ')
                        .map(val => parseInt(val, 10)); // Convert string parts to integers

  // Extract the maximum value for each number (K) and the target sum (S).
  const limitVal  = processedData[0];
  const targetSum = processedData[1];

  let resultCount = 0; // Initialize a counter for valid combinations

  // Iterate through all possible values for the first number (x).
  for ( let firstNum = 0; firstNum <= limitVal; firstNum++ )
  {
    // For each first number, iterate through all possible values for the second number (y).
    for ( let secondNum = 0; secondNum <= limitVal; secondNum++ )
    {
      // Calculate the required third number (z) to meet the target sum.
      const temporaryResult = targetSum - (firstNum + secondNum);

      // Check if the calculated third number (z) is within the valid range [0, K].
      if ( (temporaryResult >= 0) && (temporaryResult <= limitVal) )
      {
        resultCount++; // Increment the counter if the combination is valid
      }
    }
  }

  // Output the final count of valid combinations.
  console.log( resultCount );
}

// Read the input from standard input and pass it to the processing function.
processInput( require('fs').readFileSync('/dev/stdin', 'utf8') );