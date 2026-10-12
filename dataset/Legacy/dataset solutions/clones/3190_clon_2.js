'use strict'; // Enforce strict parsing and error handling for better code quality.

/**
 * Processes the raw input string to calculate the minimum greatest common divisor
 * among adjacent elements in a sorted list of numbers.
 *
 * @param {string} rawData - The complete input string read from a source (e.g., stdin).
 */
function processInput(rawData) {
  // First, prepare the input data:
  // 1. Remove any leading or trailing whitespace from the entire input.
  // 2. Split the input string into an array of individual lines.
  // 3. For each line, split it by spaces and convert each resulting part into a number.
  let processedLines = rawData
    .trim() // Eliminate unnecessary whitespace around the input block.
    .split('\n') // Break the input into an array of strings, one for each line.
    .map(lineString => lineString.split(' ').map(Number)); // Transform each line string into an array of numbers.

  // Extract the total count of entities from the first element of the first processed line.
  const countOfEntities = processedLines[0][0];

  // Retrieve the list of creatures (numbers) from the second processed line
  // and sort them in ascending numerical order.
  const creaturesList = processedLines[1].sort((valueA, valueB) => valueA - valueB);

  // Initialize a variable to hold the smallest GCD found so far.
  // Start with the largest possible safe integer to ensure any valid GCD will be smaller.
  let minimumGCDValue = Number.MAX_SAFE_INTEGER;

  /**
   * Computes the greatest common divisor (GCD) of two non-negative integers
   * using the Euclidean algorithm.
   *
   * @param {number} valueA - The first integer.
   * @param {number} valueB - The second integer.
   * @returns {number} The greatest common divisor of valueA and valueB.
   */
  const calculateGreatestCommonDivisor = (valueA, valueB) => {
    // The base case for the recursion: if the second value is zero, the first value is the GCD.
    // Otherwise, recursively call with the second value and the remainder of the first divided by the second.
    return valueB === 0 ? valueA : calculateGreatestCommonDivisor(valueB, valueA % valueB);
  };

  // Iterate through the sorted list of creatures, comparing each adjacent pair.
  // The loop runs up to `countOfEntities - 1` because we are always looking at `idx` and `idx + 1`.
  for (let entityIndex = 0; entityIndex < countOfEntities - 1; entityIndex++) {
    // Calculate the GCD for the current creature and its immediate successor.
    const currentPairGCD = calculateGreatestCommonDivisor(creaturesList[entityIndex], creaturesList[entityIndex + 1]);

    // Update `minimumGCDValue` if the `currentPairGCD` is smaller than the previously recorded minimum.
    minimumGCDValue = Math.min(currentPairGCD, minimumGCDValue);
  }

  // Output the final calculated minimum GCD value to the standard console.
  console.log(minimumGCDValue);
}

// Execute the main processing function by reading input from standard input.
// This typically involves reading a file named '/dev/stdin' in competitive programming environments.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
