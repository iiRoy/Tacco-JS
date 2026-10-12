const INPUT_FILE_PATH = '/dev/stdin';
const MAX_POSSIBLE_DIGIT = 9; // Represents the upper bound for digits (0-9)
const INITIAL_RECURSION_START_VALUE = 0; // The starting digit for the first level of recursion

// Helper function to parse a line of input into its components
function extractParametersFromLine(inputLine) {
    const stringParts = inputLine.split(' ');
    const numericValues = stringParts.map(Number);
    const firstParameter = numericValues.shift(); // Corresponds to 'n'
    const secondParameter = numericValues.shift(); // Corresponds to 's'
    return { countParam: firstParameter, sumParam: secondParameter };
}

// Main execution block (IIFE)
(function(rawInputData) {
  // Clean the input by removing trailing newline and splitting into individual lines
  const processedInputLines = rawInputData.replace(/\n$/, '').split('\n');

  // Loop indefinitely until the termination condition is met
  while (true) {
    const currentInputLine = processedInputLines.shift();
    // Use the helper to get 'n' and 's' for the current problem instance
    const { countParam: numberOfElements, sumParam: targetSumValue } = extractParametersFromLine(currentInputLine);

    // Termination condition: if both 'n' and 's' are zero
    if (numberOfElements === 0 && targetSumValue === 0) {
      return; // Exit the IIFE, ending the program
    }

    // Calculate and print the number of combinations
    console.log(determineCombinations(numberOfElements, targetSumValue));
  }
})(require('fs').readFileSync(INPUT_FILE_PATH, 'utf8')); // Read input from stdin

// Wrapper function to initiate the recursive combination search
function determineCombinations(numElements, targetValue) {
  // Start the recursive process with the initial digit value (0)
  return findRecursiveCombinations(INITIAL_RECURSION_START_VALUE, numElements, targetValue);
}

// Recursive function to find combinations of digits that sum to a target value
function findRecursiveCombinations(currentDigitStart, remainingElements, currentTargetSum) {
  // Guard clauses for invalid states that cannot lead to a solution
  if (currentTargetSum < 0 || remainingElements < 0) {
      return 0; // No valid combinations possible
  }

  let totalCombinations = 0; // Accumulator for valid combinations

  // Iterate through possible digits, starting from currentDigitStart up to MAX_POSSIBLE_DIGIT
  for (let digit = currentDigitStart; digit <= MAX_POSSIBLE_DIGIT; digit++) {
    // Calculate the sum remaining after subtracting the current digit
    const sumAfterCurrentDigit = currentTargetSum - digit;

    // Base case: if only one element remains to be chosen
    if (remainingElements === 1) {
      // If the remaining sum is exactly zero, we found a valid combination
      if (sumAfterCurrentDigit === 0) {
        totalCombinations++;
      }
    } else {
      // Recursive step: choose the next digit from 'digit + 1' onwards
      // and reduce the number of elements to find and the target sum
      const nextDigitStart = digit + 1;
      const nextRemainingElements = remainingElements - 1;
      totalCombinations += findRecursiveCombinations(nextDigitStart, nextRemainingElements, sumAfterCurrentDigit);
    }
    // Note: currentTargetSum is not modified here, as sumAfterCurrentDigit is a new variable.
    // This implicitly handles the "backtracking" for the current level's loop iterations.
  }
  return totalCombinations;
}
