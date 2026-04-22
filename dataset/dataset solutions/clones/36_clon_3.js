const fileSystemModule = require('fs');

/**
 * Calculates the number of combinations of four single digits (0-8) that sum up to a target value.
 *
 * @param {number} desiredSum - The target sum to achieve.
 * @returns {number} The total count of valid combinations.
 */
const determineDigitSumCombinations = (desiredSum) => {
  // Validate the input: ensure it's a non-negative integer.
  if (typeof desiredSum !== 'number' || !Number.isInteger(desiredSum) || desiredSum < 0) {
    // For invalid inputs, no combinations are possible.
    return 0;
  }

  // Define the upper bound for each individual digit.
  const maximumDigitValue = 8;
  // Initialize the accumulator for successful combinations.
  let successfulCombinationCount = 0;

  // Pre-check: If the desired sum is outside the possible range (0 to 4 * 8 = 32),
  // we can immediately return 0, avoiding unnecessary loops.
  if (desiredSum > (4 * maximumDigitValue)) {
      return 0;
  }

  // Iterate through all possible values for the first digit.
  for (let digitOne = 0; digitOne <= maximumDigitValue; digitOne++) {
    // Iterate through all possible values for the second digit.
    for (let digitTwo = 0; digitTwo <= maximumDigitValue; digitTwo++) {
      // Calculate the cumulative sum of the first two digits.
      const currentSumOfTwo = digitOne + digitTwo;

      // Optimization: If the sum of the first two digits already exceeds the desired sum,
      // no further digits can bring the total down, so break early from this inner loop.
      if (currentSumOfTwo > desiredSum) {
        break; // Exits the 'digitTwo' loop.
      }

      // Iterate through all possible values for the third digit.
      for (let digitThree = 0; digitThree <= maximumDigitValue; digitThree++) {
        // Calculate the cumulative sum of the first three digits.
        const currentSumOfThree = currentSumOfTwo + digitThree;

        // Optimization: Similar to above, break if sum of three digits is too high.
        if (currentSumOfThree > desiredSum) {
          break; // Exits the 'digitThree' loop.
        }

        // Iterate through all possible values for the fourth digit.
        for (let digitFour = 0; digitFour <= maximumDigitValue; digitFour++) {
          // Check if the sum of all four digits precisely matches the desired sum.
          if ((currentSumOfThree + digitFour) === desiredSum) {
            // If it matches, increment the counter.
            successfulCombinationCount++;
          }
        }
      }
    }
  }
  // Return the final count of combinations.
  return successfulCombinationCount;
};

// Read the raw content from the standard input stream.
// This is a common pattern for competitive programming platforms.
const rawDataString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw string: split it into individual lines and
// filter out any empty strings that might result from trailing newlines.
const processedInputEntries = rawDataString
  .split('\n')
  .map(entry => entry.trim()) // Trim whitespace from each entry
  .filter(entry => entry !== ''); // Remove truly empty entries

// Iterate over each cleaned input entry.
for (const currentEntry of processedInputEntries) {
  // Convert the string entry into an integer.
  // Using parseInt with radix 10 for explicit base conversion.
  const numericalTarget = parseInt(currentEntry, 10);

  // Perform an additional validation check for the parsed number.
  // If it's not a number or is negative, log an error and skip to the next entry.
  if (isNaN(numericalTarget) || numericalTarget < 0) {
    console.error(`Warning: Skipping invalid or non-positive input record: "${currentEntry}".`);
    continue; // Proceed to the next iteration of the loop.
  }

  // Call the dedicated function to compute the combinations for the current target.
  const calculatedResult = determineDigitSumCombinations(numericalTarget);

  // Output the result in a more descriptive format,
  // omitting the original input and parsed number from the output.
  console.log(`Input value: ${numericalTarget} -> Combinations found: ${calculatedResult}`);
}