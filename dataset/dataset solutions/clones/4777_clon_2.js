'use strict'; // Enforce strict parsing and error handling for cleaner code.

/**
 * Executes the primary logic of the program.
 * It reads input, performs calculations, and outputs the result.
 *
 * @param {string} rawInputLine - The raw string input from the environment.
 */
const processInputData = ( rawInputLine ) => {

  // Split the input string by space to get individual numeric parts.
  const inputParts = rawInputLine.split(' ');

  // Parse the first part as the maximum allowed value for each number.
  const maximumValue = parseInt(inputParts[0]);

  // Parse the second part as the target sum for the three numbers.
  const desiredTotal = parseInt(inputParts[1]);

  // Initialize a counter for combinations that meet the criteria.
  let validTripletsCount = 0;

  // Outer loop iterates through possible values for the first number.
  for (
    let firstOperand = 0; // Start the first number from zero.
    firstOperand <= maximumValue; // Continue as long as it's within the maximum allowed.
    firstOperand++ // Increment the first number for the next iteration.
  ) {
    // Middle loop iterates through possible values for the second number.
    for (
      let secondOperand = 0; // Start the second number from zero.
      secondOperand <= maximumValue; // Continue as long as it's within the maximum allowed.
      secondOperand++ // Increment the second number.
    ) {
      // Inner loop iterates through possible values for the third number.
      for (
        let thirdOperand = 0; // Start the third number from zero.
        thirdOperand <= maximumValue; // Continue as long as it's within the maximum allowed.
        thirdOperand++ // Increment the third number.
      ) {
        // Check if the sum of the three current numbers equals the desired total.
        if (
          firstOperand + secondOperand + thirdOperand === desiredTotal
        ) {
          // If the condition is met, increment the counter.
          validTripletsCount++;
        }
      }
    }
  }

  // Output the final count of valid combinations to the console.
  console.log(validTripletsCount);
};

// Immediately invoke the main processing function.
// It reads data from standard input, assuming it's UTF-8 encoded.
processInputData(
  require('fs').readFileSync(
    '/dev/stdin',
    'utf-8'
  )
);