'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Computes a specific ratio for a given integer.
 * The ratio is the input number divided by the sum of its digits.
 *
 * @param {number} initialValue The integer for which to calculate the ratio.
 * @returns {number} The calculated ratio.
 */
function calculateRatio(initialValue) {
  let digitSum = 0; // Initialize a variable to accumulate the sum of digits.
  let tempValue = initialValue; // Use a temporary variable to avoid modifying the original input.

  // Loop through the digits of the number.
  while (tempValue > 0) {
    digitSum += tempValue % 10; // Add the last digit to the sum.
    tempValue = Math.floor(tempValue / 10); // Remove the last digit (integer division).
  }

  // Return the original value divided by the sum of its digits.
  return initialValue / digitSum;
}

/**
 * Main function to process input and generate a sequence of numbers.
 * It reads input from stdin, parses it, and then iteratively finds and prints numbers
 * based on a specific ratio calculation.
 *
 * @param {string} rawData The raw input string, typically from stdin.
 * @returns {number} An exit code, 0 for successful completion.
 */
function processInput(rawData) {
  // Split the input string into an array of lines.
  const inputLines = rawData.split("\n");

  // Parse the first line to get the limit count.
  const firstLineParts = inputLines[0].split(' ');
  const limitCount = parseInt(firstLineParts[0], 10); // Convert the first part to an integer.

  // The first number in the sequence is always 1.
  console.log(1);

  let currentNumber = 2; // Start the sequence generation from 2.

  // Iterate 'limitCount - 1' times to generate the remaining numbers.
  for (let iterationIndex = 1; iterationIndex < limitCount; iterationIndex += 1) {
    let bestCandidate = currentNumber; // Initialize the best candidate for this iteration.
    let modifiedNumber = currentNumber; // A working copy of the number for modifications.

    let minRatio = calculateRatio(bestCandidate); // Calculate the ratio for the initial candidate.

    // Loop through powers of 10 to explore modifications to 'modifiedNumber'.
    for (let divisorPower = 1; divisorPower <= currentNumber * 10; divisorPower *= 10) {
      // Calculate a new 'modifiedNumber' by changing a digit to 9.
      // This operation aims to find a number with a potentially smaller ratio.
      modifiedNumber = currentNumber + (9 - Math.floor((currentNumber / divisorPower) % 10)) * divisorPower;

      const currentRatio = calculateRatio(modifiedNumber); // Calculate the ratio for the modified number.

      // If the new ratio is smaller, update the best candidate and its ratio.
      if (currentRatio < minRatio) {
        bestCandidate = modifiedNumber;
        minRatio = currentRatio;
      }
    }

    // Print the best candidate found for the current iteration.
    console.log(bestCandidate);

    // Prepare for the next iteration: the next starting number is one greater than the best candidate.
    currentNumber = bestCandidate + 1;
  }

  return 0; // Indicate successful execution.
}

// Execute the main function by reading input from standard input.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
