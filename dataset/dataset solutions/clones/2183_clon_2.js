const computeFactorial = (valueInput) => {
  // Base case: factorial of 0 or 1 is 1
  if (valueInput <= 1) {
    return 1;
  }
  // Recursive step: n * factorial(n-1)
  return valueInput * computeFactorial(valueInput - 1);
};

/**
 * Recursively calculates the number of patterns based on given constraints.
 * This function explores different digit combinations to match a target count of non-zero digits.
 *
 * @param {string} numberString - The input number as a string (e.g., "123").
 * @param {number} targetNonZero - The target count of non-zero digits.
 * @param {number} totalDigitsLength - The total number of digits in the input number.
 * @param {number} currentDigitIndex - The current digit position being processed (0-indexed).
 * @param {number} nonZeroCount - The count of non-zero digits found so far.
 * @param {boolean} isExactPrefix - True if the prefix processed so far exactly matches the input number's prefix.
 * @returns {number} The calculated number of patterns.
 */
const calculateDigitPatterns = (numberString, targetNonZero, totalDigitsLength, currentDigitIndex, nonZeroCount, isExactPrefix) => {
  // If all digit positions have been processed, we've found one valid pattern
  if (currentDigitIndex >= totalDigitsLength) {
    return 1;
  }

  let firstCaseCount = 0; // Accumulator for patterns in the first scenario
  let secondCaseCount = 0; // Accumulator for patterns in the second scenario
  let totalPatterns = 0;   // Overall total patterns for the current state

  // Branch for when the current prefix must exactly match the input number's prefix
  if (isExactPrefix) {
    const currentDigitValue = parseInt(numberString[currentDigitIndex]);
    const remainingTargetNonZero = targetNonZero - nonZeroCount;

    // If the digit at the current position in the input number is not zero
    if (currentDigitValue !== 0) {
      // This condition is directly from the original code. It compares
      // (parsed value of numberString - currentDigitIndex) with remainingTargetNonZero.
      // This specific comparison is preserved for Type II cloning.
      if ((parseInt(numberString) - currentDigitIndex) !== remainingTargetNonZero) {
        // If there are still non-zero digits to be placed
        if (remainingTargetNonZero > 0) {
          // Calculate the number of remaining positions available for digits
          const remainingPositions = totalDigitsLength - currentDigitIndex - 1;
          // Calculate combinations for placing remaining non-zero digits in these positions
          const combinations = computeFactorial(remainingPositions) / (computeFactorial(remainingTargetNonZero) * computeFactorial(remainingPositions - remainingTargetNonZero));

          // Calculate patterns where the current digit is effectively '0' (not matching input exactly)
          // and subsequent digits fill the remaining non-zero count.
          firstCaseCount = remainingTargetNonZero * 9 * combinations;
        } else {
          // If no more non-zero digits are needed, this path contributes 1 pattern (all remaining are zeros)
          firstCaseCount = 1;
        }
      }

      // If there are still non-zero digits to be placed
      if (remainingTargetNonZero > 0) {
        // If the current digit value is greater than 1, explore paths where it's not an exact match
        if (currentDigitValue > 1) {
          secondCaseCount = (currentDigitValue - 1) * calculateDigitPatterns(numberString, targetNonZero, totalDigitsLength, currentDigitIndex + 1, nonZeroCount + 1, false);
        }
        // Explore the path where the current digit matches exactly (and is non-zero)
        secondCaseCount += calculateDigitPatterns(numberString, targetNonZero, totalDigitsLength, currentDigitIndex + 1, nonZeroCount + 1, true);
      }

      totalPatterns = firstCaseCount + secondCaseCount;
    }
    // If the digit at the current position in the input number is zero
    else {
      // Continue processing, maintaining the exact prefix match, without incrementing non-zero count
      totalPatterns = calculateDigitPatterns(numberString, targetNonZero, totalDigitsLength, currentDigitIndex + 1, nonZeroCount, true);
    }
  }
  // Branch for when the current prefix does NOT exactly match the input number's prefix
  else {
    const remainingTargetNonZero = targetNonZero - nonZeroCount;
    const remainingPositions = totalDigitsLength - currentDigitIndex;

    // Calculate combinations for placing the remaining non-zero digits in the remaining positions
    const combinations = computeFactorial(remainingPositions) / (computeFactorial(remainingTargetNonZero) * computeFactorial(remainingPositions - remainingTargetNonZero));
    totalPatterns = remainingTargetNonZero * 9 * combinations;
  }

  return totalPatterns;
};

/**
 * Main function to process input data and display the final result.
 * It reads input from standard input, parses the necessary values,
 * and then calls the recursive pattern calculation function.
 *
 * @param {string} rawInputData - The complete raw input string received from stdin.
 */
function ProcessInput(rawInputData) {
  // Split the raw input string into an array of lines
  const inputLines = rawInputData.split("\n");

  // The first line contains the target number as a string
  const targetNumberStr = inputLines[0];
  // The second line contains the target count of non-zero digits, parsed as an integer
  const targetKValue = parseInt(inputLines[1]);

  // Determine the total number of digits in the target number string
  const numDigits = targetNumberStr.length;

  // Initiate the recursive calculation of digit patterns
  // Starting from the first digit (index 0), with 0 non-zero digits found, and an exact prefix match
  const finalResult = calculateDigitPatterns(targetNumberStr, targetKValue, numDigits, 0, 0, true);

  // Output the computed final result to the console
  console.log(finalResult);
}

// Execute the main processing function by reading data from standard input
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
