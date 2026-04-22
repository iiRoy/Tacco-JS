/**
 * Core processing function: analyzes item counts from a structured input.
 * It first processes an initial set of items, incrementing their frequency.
 * Subsequently, it processes a second set, decrementing frequencies.
 * Finally, it reports the highest frequency observed among all items.
 *
 * @param {string} rawInputPayload - The entire input as a single string, typically read from standard input.
 *                                   Expected format:
 *                                   - Line 1: Number of items in the first batch (N1)
 *                                   - Next N1 lines: Item identifiers for the first batch
 *                                   - Next line: Number of items in the second batch (N2)
 *                                   - Next N2 lines: Item identifiers for the second batch
 */
function analyzeItemOccurrences(rawInputPayload) {
  // Guard against invalid or empty input payload.
  if (typeof rawInputPayload !== 'string' || rawInputPayload.trim() === '') {
    console.error("Input payload is either missing or not a valid string. Aborting processing.");
    return;
  }

  // Split the input into individual lines, clean whitespace, and filter out any empty lines.
  const cleansedInputLines = rawInputPayload.split('\n')
                                            .map(line => line.trim())
                                            .filter(line => line.length > 0);

  // Validate that there are enough lines to extract the initial batch count.
  if (cleansedInputLines.length === 0) {
    console.error("No valid lines found in the input after cleaning. Exiting.");
    return;
  }

  // Use a JavaScript Map object to store and manage item frequencies dynamically.
  // Maps offer better performance for arbitrary keys compared to plain objects.
  const itemFrequencyMap = new Map();

  // Extract the count for the first batch of items from the first line.
  // `shift()` removes the first element from the array and returns it.
  const countForFirstBatch = parseInt(cleansedInputLines.shift(), 10);

  // Perform validation on the extracted count for the first batch.
  if (isNaN(countForFirstBatch) || countForFirstBatch < 0) {
    console.error(`Invalid number encountered for the first batch count: ${countForFirstBatch}. Expected a non-negative integer.`);
    return;
  }
  if (countForFirstBatch > cleansedInputLines.length) {
    console.warn(`Warning: Declared first batch count (${countForFirstBatch}) exceeds available lines (${cleansedInputLines.length}). Processing fewer items.`);
  }

  // Initialize a cursor to track our current position within the `cleansedInputLines` array.
  let currentLinePointer = 0;

  // Iterate through the first batch of items, incrementing their frequencies in the map.
  for (let i = 0; i < countForFirstBatch; i++) {
    // Check for array bounds before accessing to prevent errors if input is malformed.
    if (currentLinePointer >= cleansedInputLines.length) {
      console.warn(`Input exhausted prematurely for first batch at item index ${i}.`);
      break;
    }
    const currentItemIdentifier = cleansedInputLines[currentLinePointer];
    // Retrieve current count, default to 0 if item not seen, then increment.
    itemFrequencyMap.set(currentItemIdentifier, (itemFrequencyMap.get(currentItemIdentifier) || 0) + 1);
    currentLinePointer++; // Advance the pointer to the next line.
  }

  // After processing the first batch, the next line should contain the count for the second batch.
  // Validate its presence.
  if (currentLinePointer >= cleansedInputLines.length) {
    console.error("Missing declaration for the second batch item count in the input. Cannot proceed.");
    return;
  }

  // Extract the count for the second batch of items.
  const countForSecondBatch = parseInt(cleansedInputLines[currentLinePointer], 10);
  currentLinePointer++; // Move the pointer past the second batch count declaration.

  // Perform validation on the extracted count for the second batch.
  if (isNaN(countForSecondBatch) || countForSecondBatch < 0) {
    console.error(`Invalid number encountered for the second batch count: ${countForSecondBatch}. Expected a non-negative integer.`);
    return;
  }
  if (countForSecondBatch > (cleansedInputLines.length - currentLinePointer)) {
    console.warn(`Warning: Declared second batch count (${countForSecondBatch}) exceeds available lines (${cleansedInputLines.length - currentLinePointer}). Processing fewer items.`);
  }

  // Iterate through the second batch of items, decrementing their frequencies in the map.
  for (let j = 0; j < countForSecondBatch; j++) {
    // Check for array bounds.
    if (currentLinePointer >= cleansedInputLines.length) {
      console.warn(`Input exhausted prematurely for second batch at item index ${j}.`);
      break;
    }
    const itemToAdjustFrequency = cleansedInputLines[currentLinePointer];
    // Retrieve current count, default to 0 if item not seen, then decrement.
    itemFrequencyMap.set(itemToAdjustFrequency, (itemFrequencyMap.get(itemToAdjustFrequency) || 0) - 1);
    currentLinePointer++; // Advance the pointer.
  }

  // Find the maximum frequency value recorded across all items.
  // Initialize `peakFrequency` to 0, as frequencies can potentially be negative.
  let peakFrequency = 0;

  // Use a `for...of` loop to iterate directly over the values of the Map.
  for (const currentFrequencyValue of itemFrequencyMap.values()) {
    if (currentFrequencyValue > peakFrequency) {
      peakFrequency = currentFrequencyValue;
    }
  }

  // Output the final computed maximum frequency to standard output.
  console.log(peakFrequency);
}

// --- Auxiliary Mathematical and Data Transformation Functions ---

/**
 * Determines if a given number is a probable prime using an optimized trial division method.
 * This function handles numbers of type `number` or `bigint`.
 * @param {number|bigint} candidateNum - The integer to be tested for primality.
 * @returns {boolean} True if the number is likely prime, false otherwise.
 */
function isProbablePrime(candidateNum) {
  // Input validation for type.
  if (typeof candidateNum !== 'number' && typeof candidateNum !== 'bigint') {
    return false;
  }
  const numAsBigInt = BigInt(candidateNum); // Convert to BigInt for consistent large number arithmetic.

  // Handle base cases for primality.
  if (numAsBigInt <= 1n) return false;
  if (numAsBigInt === 2n || numAsBigInt === 3n) return true;
  if (numAsBigInt % 2n === 0n || numAsBigInt % 3n === 0n) return false;

  // Optimized trial division: check divisors of the form 6k ± 1.
  // This skips multiples of 2 and 3, improving efficiency.
  for (let divisor = 5n; divisor * divisor <= numAsBigInt; divisor += 6n) {
    if (numAsBigInt % divisor === 0n || numAsBigInt % (divisor + 2n) === 0n) {
      return false;
    }
  }
  return true;
}

/**
 * Computes the factorial of a non-negative integer using an iterative approach.
 * @param {number} inputVal - The non-negative integer for which to calculate the factorial.
 * @returns {number} The factorial of `inputVal`.
 * @throws {Error} If `inputVal` is not a non-negative integer.
 */
function computeFactorial(inputVal) {
  // Input validation.
  if (!Number.isInteger(inputVal) || inputVal < 0) {
    throw new Error(`Invalid input for factorial: ${inputVal}. Must be a non-negative integer.`);
  }
  if (inputVal === 0) {
    return 1; // Factorial of 0 is 1 by definition.
  }
  let calculatedProduct = 1;
  for (let k = 1; k <= inputVal; k++) {
    calculatedProduct *= k;
  }
  return calculatedProduct;
}

/**
 * Transforms a flat array of strings into a 2D array (matrix) of numbers.
 * Each string element is expected to contain space-separated numbers.
 * @param {string[]} arrayOfInputStrings - An array where each string represents a row of numeric values.
 * @returns {number[][]} A 2D array (matrix) of parsed numbers.
 * @throws {Error} If input is not an array or contains non-parseable elements.
 */
function transformArrayToMatrix(arrayOfInputStrings) {
  // Input type validation.
  if (!Array.isArray(arrayOfInputStrings)) {
    throw new Error("Input to transformArrayToMatrix must be an array of strings.");
  }
  return arrayOfInputStrings.map((rowString, rowIndex) => {
    // Validate each element of the input array.
    if (typeof rowString !== 'string') {
      throw new Error(`Element at index ${rowIndex} is not a string. Cannot parse.`);
    }
    // Split the string by spaces and convert each part to a number.
    const numericRow = rowString.split(' ').map(strPart => {
      const parsedNumber = Number(strPart);
      // Validate that each part successfully converts to a number.
      if (isNaN(parsedNumber)) {
        throw new Error(`Invalid numeric string '${strPart}' found in row ${rowIndex}.`);
      }
      return parsedNumber;
    });
    return numericRow;
  });
}

/**
 * Computes the sum of all finite numeric elements within an array.
 * Non-numeric or infinite values are gracefully ignored.
 * @param {Array<number|any>} numericCollection - An array potentially containing numbers.
 * @returns {number} The total sum of valid numbers in the collection.
 */
function calculateArraySum(numericCollection) {
  // Type check for the input collection.
  if (!Array.isArray(numericCollection)) {
    console.warn("Input to calculateArraySum is not an array. Returning 0 as sum.");
    return 0;
  }
  // Use `reduce` for an elegant and efficient summation.
  return numericCollection.reduce((accumulator, currentElement) => {
    // Only add to the sum if the element is a finite number.
    return (typeof currentElement === 'number' && Number.isFinite(currentElement))
      ? accumulator + currentElement
      : accumulator; // Ignore non-numeric or non-finite elements.
  }, 0); // Initial accumulator value is 0.
}

/**
 * Decomposes a positive integer into its prime factors, storing them with their exponents in a Map.
 * @param {number} targetNumber - The positive integer to be factorized.
 * @returns {Map<number, number>} A Map where keys are prime factors and values are their corresponding exponents.
 * @throws {Error} If `targetNumber` is not a positive integer.
 */
function decomposeIntoPrimeFactors(targetNumber) {
  // Input validation.
  if (!Number.isInteger(targetNumber) || targetNumber < 1) {
    throw new Error(`Input for prime factorization must be a positive integer, received: ${targetNumber}.`);
  }
  // Special case for 1, which has itself as a factor with exponent 1.
  if (targetNumber === 1) {
    return new Map([[1, 1]]);
  }

  const primeFactorsAndExponents = new Map();
  let remainingValue = targetNumber;

  // First, handle the prime factor 2.
  while (remainingValue % 2 === 0) {
    primeFactorsAndExponents.set(2, (primeFactorsAndExponents.get(2) || 0) + 1);
    remainingValue /= 2;
  }

  // Then, handle odd prime factors starting from 3 up to the square root of the remaining value.
  for (let i = 3; i * i <= remainingValue; i += 2) {
    while (remainingValue % i === 0) {
      primeFactorsAndExponents.set(i, (primeFactorsAndExponents.get(i) || 0) + 1);
      remainingValue /= i;
    }
  }

  // If, after all divisions, `remainingValue` is still greater than 1, it must be a prime factor itself.
  if (remainingValue > 1) {
    primeFactorsAndExponents.set(remainingValue, (primeFactorsAndExponents.get(remainingValue) || 0) + 1);
  }

  return primeFactorsAndExponents;
}

/**
 * Computes the greatest common divisor (GCD) of two non-negative integers using the Euclidean algorithm.
 * @param {number} numA - The first non-negative integer.
 * @param {number} numB - The second non-negative integer.
 * @returns {number} The greatest common divisor of `numA` and `numB`.
 * @throws {Error} If inputs are not non-negative integers.
 */
function findGreatestCommonDivisor(numA, numB) {
  // Input validation for non-negative integers.
  if (!Number.isInteger(numA) || numA < 0 || !Number.isInteger(numB) || numB < 0) {
    throw new Error(`GCD inputs must be non-negative integers. Received: ${numA}, ${numB}.`);
  }
  // Base case of the Euclidean algorithm.
  if (numB === 0) {
    return numA;
  }
  // Recursive step.
  return findGreatestCommonDivisor(numB, numA % numB);
}

/**
 * Computes the least common multiple (LCM) of two non-negative integers.
 * Utilizes the relationship: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {number} valX - The first non-negative integer.
 * @param {number} valY - The second non-negative integer.
 * @returns {number} The least common multiple of `valX` and `valY`.
 * @throws {Error} If inputs are not non-negative integers.
 */
function findLeastCommonMultiple(valX, valY) {
  // Input validation for non-negative integers.
  if (!Number.isInteger(valX) || valX < 0 || !Number.isInteger(valY) || valY < 0) {
    throw new Error(`LCM inputs must be non-negative integers. Received: ${valX}, ${valY}.`);
  }
  // LCM with zero is zero.
  if (valX === 0 || valY === 0) {
    return 0;
  }
  // Use BigInt for the product to prevent potential overflow before division,
  // especially for large numbers where `valX * valY` might exceed `Number.MAX_SAFE_INTEGER`.
  const productAsBigInt = BigInt(valX) * BigInt(valY);
  const gcdValue = findGreatestCommonDivisor(valX, valY);
  return Number(productAsBigInt / BigInt(gcdValue)); // Convert back to Number for result.
}

/**
 * A standard comparison function suitable for sorting arrays of numbers in ascending order.
 * @param {number} firstElement - The first number to compare.
 * @param {number} secondElement - The second number to compare.
 * @returns {number} A negative value if `firstElement` < `secondElement`,
 *                   a positive value if `firstElement` > `secondElement`,
 *                   and 0 if they are equal.
 */
function numericAscendingComparison(firstElement, secondElement) {
  // Basic type checking for robustness, though `Array.prototype.sort` expects numbers.
  if (typeof firstElement !== 'number' || typeof secondElement !== 'number' || !Number.isFinite(firstElement) || !Number.isFinite(secondElement)) {
    console.warn(`Warning: Non-finite or non-numeric values passed to numericAscendingComparison. Received: ${firstElement}, ${secondElement}.`);
    // Fallback behavior: attempt comparison, but results might be unexpected for non-numbers.
    if (firstElement < secondElement) return -1;
    if (firstElement > secondElement) return 1;
    return 0;
  }
  return firstElement - secondElement;
}

/**
 * Calculates the lexicographical rank (0-based index) of a given permutation.
 * Assumes the permutation consists of unique positive integers, typically from 1 to N.
 * @param {number[]} inputPermutation - An array representing the permutation.
 * @returns {number} The 0-based lexicographical rank of the permutation.
 * @throws {Error} If the input array is not a valid permutation of positive integers.
 */
function calculatePermutationRank(inputPermutation) {
  // Validate input is an array of positive integers.
  if (!Array.isArray(inputPermutation) || inputPermutation.some(x => !Number.isInteger(x) || x < 1)) {
    throw new Error("Input array for permutation rank must contain positive integers.");
  }
  const permutationLength = inputPermutation.length;
  if (permutationLength === 0) return 0;

  // Create a sorted list of expected available numbers (e.g., [1, 2, ..., N]).
  const expectedNumbers = Array.from({ length: permutationLength }, (_, i) => i + 1);

  // Validate if the input is indeed a permutation by checking for duplicates or missing numbers.
  const sortedInput = [...inputPermutation].sort(numericAscendingComparison);
  for (let i = 0; i < permutationLength; i++) {
    if (sortedInput[i] !== expectedNumbers[i]) {
      throw new Error("Input array is not a valid permutation (contains duplicates or missing numbers).");
    }
  }

  let currentPermutationRank = 0;
  // Create a mutable copy of available numbers to track what's left.
  const mutableAvailableNumbers = [...expectedNumbers];

  for (let k = 0; k < permutationLength; k++) {
    const digitAtCurrentPosition = inputPermutation[k];
    const indexInAvailableSet = mutableAvailableNumbers.indexOf(digitAtCurrentPosition);

    if (indexInAvailableSet === -1) {
      // This case indicates a logical error if the permutation validation passed.
      throw new Error(`Internal error: Digit ${digitAtCurrentPosition} not found in available set.`);
    }

    // Add (count of smaller numbers to the right in the available set) * factorial of remaining positions.
    currentPermutationRank += indexInAvailableSet * computeFactorial(permutationLength - 1 - k);

    // Remove the current digit from the set of available numbers for subsequent iterations.
    mutableAvailableNumbers.splice(indexInAvailableSet, 1);
  }
  return currentPermutationRank;
}

/**
 * Checks if a given string represents a valid non-negative integer.
 * This means it can be "0" or a string of digits not starting with "0" (e.g., "123", not "012").
 * @param {string} valueToCheck - The string value to validate.
 * @returns {boolean} True if the string is a valid non-negative integer representation, false otherwise.
 */
function isValidNonNegativeIntegerString(valueToCheck) {
  if (typeof valueToCheck !== 'string') {
    return false;
  }
  // Regular expression to match non-negative integers:
  // ^       - start of string
  // (0|[1-9]\d*) - matches '0' OR (a digit from 1-9 followed by zero or more digits)
  // $       - end of string
  const nonNegativeIntegerPattern = /^(0|[1-9]\d*)$/;
  return nonNegativeIntegerPattern.test(valueToCheck);
}

// --- Input Retrieval and Program Execution ---

/**
 * Retrieves input from standard input (for Node.js environments) or provides a mock string.
 * This function includes a fallback for environments where Node's `fs` module is unavailable.
 * @returns {string} The trimmed content of the standard input or a predefined mock string.
 */
const retrieveStandardInput = () => {
  try {
    // Check if `require` and `fs` module are available (indicative of Node.js environment).
    if (typeof require === 'function' && typeof module === 'object' && module.exports && require.resolve && require.resolve('fs')) {
      const fileSystem = require('fs');
      return fileSystem.readFileSync("/dev/stdin", "utf8").trim();
    } else {
      // Fallback for non-Node environments (e.g., browser or custom testing setup).
      console.warn("Warning: Node.js 'fs' module not found. Using mock input for demonstration purposes.");
      // This mock input simulates the expected structure for the main analysis function.
      return "5\napple\nbanana\napple\norange\napple\n3\nbanana\norange\ngrape";
    }
  } catch (inputError) {
    console.error("An error occurred while attempting to retrieve standard input:", inputError.message);
    return ""; // Return an empty string to gracefully handle input errors.
  }
};

// Execute the main item analysis function with the retrieved input.
analyzeItemOccurrences(retrieveStandardInput());