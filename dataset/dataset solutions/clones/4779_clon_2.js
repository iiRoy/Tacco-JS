'use strict'; // Enforce strict mode for robust code execution

/**
 * Processes the input string to find combinations of three non-negative integers (x, y, z)
 * such that their sum equals a target value (S), and each integer is less than or equal to a limit (K).
 *
 * @param {string} rawInputString - The raw input string read from standard input.
 */
function processInputData(rawInputString) {
  // Parse the input string:
  // 1. Split by newline to get the first line.
  // 2. Split the first line by space to get individual number strings.
  // 3. Map each number string to its numerical representation.
  let numericalValues = rawInputString.split('\n')[0].split(' ').map(strVal => Number(strVal));

  // Extract the two primary parameters from the parsed array.
  const upperLimit = numericalValues[0]; // Corresponds to 'K' in the problem description.
  const desiredSum = numericalValues[1]; // Corresponds to 'S' in the problem description.

  // Initialize a counter to keep track of the valid combinations found.
  let validCombinationCount = 0;

  // Outer loop: Iterate through all possible values for the first number (firstTerm).
  // The firstTerm can range from 0 up to the upperLimit (inclusive).
  for (let firstTerm = 0; firstTerm <= upperLimit; firstTerm++) {
    // Inner loop: Iterate through all possible values for the second number (secondTerm).
    // The secondTerm also ranges from 0 up to the upperLimit (inclusive).
    for (let secondTerm = 0; secondTerm <= upperLimit; secondTerm++) {
      // Calculate the required value for the third number (thirdTerm)
      // to achieve the desiredSum, given firstTerm and secondTerm.
      const thirdTerm = desiredSum - firstTerm - secondTerm;

      // Check if the calculated thirdTerm is within the valid range [0, upperLimit].
      // If it's negative or exceeds the upperLimit, this combination is invalid,
      // so we skip to the next iteration of the inner loop.
      if (thirdTerm < 0 || thirdTerm > upperLimit) {
        continue; // Move to the next secondTerm value.
      }

      // Although 'thirdTerm' is calculated to satisfy the sum,
      // the original logic explicitly checks the sum again.
      // This preserves the exact control flow and behavior.
      if ((firstTerm + secondTerm + thirdTerm) === desiredSum) {
        // If all conditions are met (each term is within bounds and their sum is desiredSum),
        // increment the counter for valid combinations.
        validCombinationCount += 1;
      }
    }
  }

  // Output the final count of valid combinations to the console.
  console.log(validCombinationCount);
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to our processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
