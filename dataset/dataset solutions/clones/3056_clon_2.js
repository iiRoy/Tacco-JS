'use strict'; // Enforce strict mode for cleaner code execution.

/**
 * Processes the raw input string to compute a minimum cost based on digit patterns.
 * This function reads a sequence of digits and determines the minimum operations
 * to transform it into an alternating sequence of 0s and 1s.
 *
 * @param {string} rawData - The raw input string, typically read from standard input.
 */
function ProcessInput(rawData) {
  // First, prepare the input:
  // 1. Remove any leading or trailing whitespace.
  // 2. Split the string into an array of individual character digits.
  // 3. Convert each character digit into its numerical representation.
  let digitArray = rawData.trim().split('').map(char => Number(char));

  // Initialize accumulators for sums of digits at specific indices.
  let sumOfOddIndexedDigits = 0;   // Sum of digits at indices 1, 3, 5, ...
  let sumOfEvenIndexedDigits = 0;  // Sum of digits at indices 0, 2, 4, ...

  // Get the total number of digits for loop iteration.
  const arrayLength = digitArray.length;

  // Iterate through the digit array to populate the sums.
  for (let idx = 0; idx < arrayLength; idx++) {
    // Check if the current index is even or odd.
    if (idx % 2 === 0) {
      // If the index is even, add the digit to the even-indexed sum.
      sumOfEvenIndexedDigits += digitArray[idx];
    } else {
      // If the index is odd, add the digit to the odd-indexed sum.
      sumOfOddIndexedDigits += digitArray[idx];
    }
  }

  // Calculate the expected count of positions for even and odd indices.
  // For a 0-indexed array of length L:
  // Number of even indices (0, 2, ...) is ceil(L/2).
  // Number of odd indices (1, 3, ...) is floor(L/2).
  let expectedEvenCount = Math.floor(arrayLength / 2) + (arrayLength % 2);
  let expectedOddCount = Math.floor(arrayLength / 2);

  // Calculate two possible costs to achieve an alternating pattern.
  // Cost Option One: Transform to '101010...' pattern.
  // This means even-indexed digits should be 1, odd-indexed digits should be 0.
  // Cost = (Number of even positions - Sum of actual even-indexed digits)
  //        + (Sum of actual odd-indexed digits - Number of odd positions if they were 0s)
  //        (The second part simplifies to just sumOfOddIndexedDigits because 0s don't contribute to sum)
  let costOptionOne = expectedEvenCount - sumOfEvenIndexedDigits + sumOfOddIndexedDigits;

  // Cost Option Two: Transform to '010101...' pattern.
  // This means even-indexed digits should be 0, odd-indexed digits should be 1.
  // Cost = (Sum of actual even-indexed digits - Number of even positions if they were 0s)
  //        + (Number of odd positions - Sum of actual odd-indexed digits)
  //        (The first part simplifies to just sumOfEvenIndexedDigits because 0s don't contribute to sum)
  let costOptionTwo = sumOfEvenIndexedDigits + expectedOddCount - sumOfOddIndexedDigits;

  // The final answer is the minimum of these two transformation costs.
  const finalMinimumCost = Math.min(costOptionOne, costOptionTwo);

  // Output the calculated minimum cost to the standard output.
  console.log(finalMinimumCost);
}

// Read the entire content from standard input as a UTF-8 string.
// Then, pass this string to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
