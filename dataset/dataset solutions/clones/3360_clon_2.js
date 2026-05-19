"use strict"; // Enforce strict mode for better code quality and error handling.

/**
 * Processes an input string containing three space-separated numbers
 * to compute a specific numerical result based on a defined algorithm.
 *
 * @param {string} inputData - The raw input string, expected to contain three integers.
 */
const calculateResult = (inputData) => {
  // Split the input string into its constituent parts and parse them as integers.
  const numberComponents = inputData.split(" ");
  let firstNumber = parseInt(numberComponents[0], 10); // The first numerical value.
  let secondNumber = parseInt(numberComponents[1], 10); // The second numerical value.
  let thirdNumber = parseInt(numberComponents[2], 10); // The third numerical value.

  let finalScore = 0; // Initialize the variable that will hold the cumulative score.

  // Evaluate the relationship between the second and third numbers to update the score.
  if (secondNumber >= thirdNumber) {
    // If the second number is greater than or equal to the third, add both to the score.
    finalScore += thirdNumber + secondNumber;
    thirdNumber = 0; // The third number is fully consumed in this scenario.
  } else {
    // Otherwise, if the second number is smaller, add twice the second number to the score.
    finalScore += secondNumber * 2;
    // Adjust the third number by subtracting the second, and reset the second number.
    thirdNumber -= secondNumber;
    secondNumber = 0; // The second number is fully consumed.
  }

  // Further process the remaining third number, if any, in conjunction with the first number.
  if (thirdNumber > 0) {
    // Determine the smaller value between the remaining third number and the first number.
    let temporaryValue = Math.min(thirdNumber, firstNumber);
    // Reduce the third number by this temporary value.
    thirdNumber -= temporaryValue;
    // Add the temporary value to the overall score.
    finalScore += temporaryValue;
  }

  // Perform a final check: if the third number still has a positive value, increment the score.
  if (thirdNumber > 0) {
    finalScore++;
  }

  // Output the final calculated score to the standard console.
  console.log(finalScore);
};

// Read the entire content from standard input, decode it as UTF-8, and pass it to the processing function.
calculateResult(require('fs').readFileSync('/dev/stdin', 'utf8'));
