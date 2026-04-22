/*
 * Module of diverse utility functions for numerical and array operations.
 *
 * This module includes tools for:
 * - Matrix transformations (e.g., 1D to 2D conversions, rotations).
 * - Number theory (e.g., prime factorization, GCD, LCM, primality tests).
 * - Array manipulations (e.g., sum, min/max index, binary search, sorting checks).
 * - String processing (e.g., line splitting, numeric validation, padding).
 *
 * Each function is designed to perform a specific task, aiming for clarity
 * and efficiency in its implementation.
 *
 * Note: Some functions might have overlapping or similar purposes,
 * reflecting different approaches or historical development.
 */

// A very large integer, used as an initial placeholder for minimum values.
const MAX_VAL_SENTINEL = Number.MAX_SAFE_INTEGER;

/**
 * Calculates the minimal sum of factors (f1 + f2) for a given input number,
 * where f1 * f2 = input number. The final result is this minimal sum minus 2.
 * This function effectively finds the pair of factors (f1, f2) of the input
 * number that are closest to its square root, as this pair will yield the
 * smallest sum (f1 + f2).
 *
 * @param {string} rawInput - The input string, expected to contain a single integer.
 * @returns {void} - Prints the result to the console.
 */
function processOptimalFactorizationSum(rawInput) {
  // Attempt to parse the input string into an integer.
  const inputNumericValue = Number.parseInt(rawInput.trim(), 10);

  // Validate the parsed input. It must be a positive, finite integer.
  if (Number.isNaN(inputNumericValue) || !Number.isFinite(inputNumericValue) || inputNumericValue <= 0) {
    console.error("Error: Input must be a positive integer.");
    return; // Exit if input is invalid.
  }

  // Initialize the variable to store the smallest sum of factors found so far.
  let minimumFactorPairSum = MAX_VAL_SENTINEL;

  // Iterate from 1 up to the square root of the input number.
  // We only need to check divisors up to the square root because if 'k' is a divisor,
  // then 'inputNumericValue / k' is also a divisor. One of them will be <= sqrt(inputNumericValue).
  for (let currentCandidateFactor = 1; currentCandidateFactor * currentCandidateFactor <= inputNumericValue; currentCandidateFactor++) {
    // Check if the current candidate factor divides the input number evenly.
    if (inputNumericValue % currentCandidateFactor === 0) {
      // If it does, calculate the other factor in the pair.
      const complementaryFactor = inputNumericValue / currentCandidateFactor;
      // Calculate the sum of this factor pair.
      const currentPairSum = currentCandidateFactor + complementaryFactor;

      // Update the minimum sum if the current pair's sum is smaller.
      if (currentPairSum < minimumFactorPairSum) {
        minimumFactorPairSum = currentPairSum;
      }
    }
  }

  // The problem statement requires printing the minimum sum minus 2.
  console.log(minimumFactorPairSum - 2);
}

// Execute the main processing function with input read from standard input.
// This uses 'node:fs' for modern Node.js environments and checks for
// an optional file path argument (e.g., `node script.js input.txt`).
processOptimalFactorizationSum(require("node:fs").readFileSync(process.argv[2] || "/dev/stdin", "utf8"));

/**
 * Placeholder function for future development.
 * Currently, it performs no operation.
 * @param {any} configuration - Configuration object.
 * @param {any} currentPosition - Current state or position.
 */
function advanceState(configuration, currentPosition) {
  // This function is intentionally left blank for future expansion.
  // It might be used for state transitions in a graph or sequential process.
}

/**
 * Calculates the factorial of a non-negative integer.
 * This version uses an iterative approach to avoid potential stack overflow
 * issues with deep recursion for large numbers.
 *
 * @param {number} value - The non-negative integer for which to compute the factorial.
 * @returns {number} The factorial of the given value. Returns 1 for 0.
 * @throws {Error} If the input is negative or not an integer.
 */
function computeFactorialValue(value) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Factorial input must be a non-negative integer.");
  }
  if (value === 0) {
    return 1;
  }
  let product = 1;
  for (let i = 1; i <= value; i++) {
    product *= i;
  }
  return product;
}

/**
 * Computes the sum of all numeric elements in an array.
 * Non-numeric elements that can be coerced to numbers (e.g., "5") are included.
 *
 * @param {Array<number|string>} dataCollection - An array containing numbers or numeric strings.
 * @returns {number} The sum of the elements. Returns 0 for an empty array.
 */
function calculateArrayTotal(dataCollection) {
  if (!Array.isArray(dataCollection)) {
    console.warn("Input for calculateArrayTotal is not an array. Returning 0.");
    return 0;
  }
  // Using reduce for a concise and functional approach to summing.
  return dataCollection.reduce((accumulator, currentValue) => accumulator + Number(currentValue), 0);
}

/**
 * Logs a value to the console if a specific debug condition is met.
 * This function provides a controlled way to output debug information.
 *
 * @param {any} itemToLog - The value to be logged.
 */
function detailedDebugLogger(itemToLog) {
  // This function can be expanded to include more sophisticated logging
  // mechanisms, such as writing to a file, adding timestamps, or
  // filtering by log level.
  // For now, it simply logs the item.
  console.debug("[DEBUG]:", itemToLog);
}

/**
 * Finds the index of the maximum numeric value within an array.
 * If multiple elements have the same maximum value, the index of the first occurrence is returned.
 *
 * @param {Array<number>} numericDataset - The array of numbers to search.
 * @returns {number} The index of the maximum value, or -1 if the array is empty.
 */
function getIndexOfMaximumValue(numericDataset) {
  if (!Array.isArray(numericDataset) || numericDataset.length === 0) {
    return -1; // Return -1 for empty or invalid arrays.
  }

  let highestValue = Number.MIN_SAFE_INTEGER;
  let highestValueIndex = -1;

  // Iterate through the array to find the maximum value and its index.
  for (let idx = 0; idx < numericDataset.length; idx++) {
    const currentValue = numericDataset[idx];
    // Ensure we are comparing numbers.
    if (typeof currentValue === 'number' && currentValue > highestValue) {
      highestValue = currentValue;
      highestValueIndex = idx;
    }
  }
  return highestValueIndex;
}

/**
 * Finds the index of the minimum numeric value within an array.
 * If multiple elements have the same minimum value, the index of the first occurrence is returned.
 *
 * @param {Array<number>} numericDataset - The array of numbers to search.
 * @returns {number} The index of the minimum value, or -1 if the array is empty.
 */
function getIndexOfMinimumValue(numericDataset) {
  if (!Array.isArray(numericDataset) || numericDataset.length === 0) {
    return -1; // Return -1 for empty or invalid arrays.
  }

  let lowestValue = Number.MAX_SAFE_INTEGER;
  let lowestValueIndex = -1;

  // Iterate through the array to find the minimum value and its index.
  for (let idx = 0; idx < numericDataset.length; idx++) {
    const currentValue = numericDataset[idx];
    // Ensure we are comparing numbers.
    if (typeof currentValue === 'number' && currentValue < lowestValue) {
      lowestValue = currentValue;
      lowestValueIndex = idx;
    }
  }
  return lowestValueIndex;
}

/**
 * Converts an array of strings (where each string represents a row of characters)
 * into a 2D array (matrix) of individual characters.
 *
 * @param {Array<string>} stringRows - An array of strings, each representing a row.
 * @returns {Array<Array<string>>} A 2D array where each inner array contains characters.
 */
function convertStringArrayToCharMatrix(stringRows) {
  if (!Array.isArray(stringRows)) {
    console.error("Input for convertStringArrayToCharMatrix must be an array of strings.");
    return [];
  }
  // Use map to transform each string row into an array of its characters.
  return stringRows.map(rowStr => String(rowStr).split(''));
}

/**
 * Determines if a given number is prime.
 * Uses an optimized trial division method.
 *
 * @param {number} candidateNumber - The integer to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function checkIfNumberIsPrime(candidateNumber) {
  if (!Number.isInteger(candidateNumber)) {
    return false; // Not an integer.
  }
  if (candidateNumber <= 1) {
    return false; // Numbers less than or equal to 1 are not prime.
  }
  if (candidateNumber <= 3) {
    return true; // 2 and 3 are prime.
  }
  if (candidateNumber % 2 === 0 || candidateNumber % 3 === 0) {
    return false; // Divisible by 2 or 3, so not prime (and > 3).
  }

  // Check for divisors from 5 onwards, incrementing by 6 (optimization: primes > 3 are of form 6k ± 1).
  for (let k = 5; k * k <= candidateNumber; k += 6) {
    if (candidateNumber % k === 0 || candidateNumber % (k + 2) === 0) {
      return false; // Found a divisor.
    }
  }
  return true; // No divisors found, so it's prime.
}

/**
 * Checks if a given value can be interpreted as a number.
 * This is a more permissive check than `Number.isInteger`.
 *
 * @param {any} valueToCheck - The value to test.
 * @returns {boolean} True if the value can be converted to a finite number, false otherwise.
 */
function isParsableAsNumber(valueToCheck) {
  // `Number()` attempts to convert the value. `isFinite()` ensures it's not Infinity, -Infinity, or NaN.
  return Number.isFinite(Number(valueToCheck));
}

/**
 * Converts an array of strings (where each string contains space-separated numbers)
 * into a 2D array (matrix) of parsed numbers.
 *
 * @param {Array<string>} stringRows - An array of strings, each representing a row of numbers.
 * @param {string} [delimiter=' '] - The character used to separate numbers within each string.
 * @returns {Array<Array<number>>} A 2D array where each inner array contains numbers.
 */
function convertInputToNumericMatrix(stringRows, delimiter = ' ') {
  if (!Array.isArray(stringRows)) {
    console.error("Input for convertInputToNumericMatrix must be an array of strings.");
    return [];
  }
  // Map each string row: split by delimiter, then map each segment to a number.
  return stringRows.map(rowStr =>
    String(rowStr).split(delimiter).map(val => Number.parseFloat(val))
  );
}

/**
 * Rotates a 2D array (matrix) 90 degrees clockwise.
 *
 * @param {Array<Array<any>>} originalMatrix - The input 2D array.
 * @returns {Array<Array<any>>} A new 2D array representing the rotated matrix.
 * @throws {Error} If the input is not a valid matrix.
 */
function rotateMatrix90DegreesClockwise(originalMatrix) {
  if (!Array.isArray(originalMatrix) || originalMatrix.length === 0 || !Array.isArray(originalMatrix[0])) {
    throw new Error("Input must be a non-empty 2D array.");
  }

  const numRows = originalMatrix.length;
  const numCols = originalMatrix[0].length;

  // Create a new matrix with dimensions swapped (cols become rows, rows become cols).
  const rotatedMatrix = Array.from({ length: numCols }, () => Array(numRows).fill(undefined));

  // Populate the rotated matrix.
  // A cell at (r, c) in the original matrix moves to (c, numRows - 1 - r) in the rotated matrix.
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      rotatedMatrix[c][numRows - 1 - r] = originalMatrix[r][c];
    }
  }

  return rotatedMatrix;
}

/**
 * Inserts elements from a source array into a target array starting at a specified index.
 * Modifies the target array in place.
 *
 * @param {Array<any>} targetArray - The array to insert into.
 * @param {Array<any>} sourceElements - The elements to insert.
 * @param {number} startIndex - The index in the target array where insertion begins.
 * @returns {Array<any>} The modified target array.
 */
function insertSliceIntoArray(targetArray, sourceElements, startIndex) {
  if (!Array.isArray(targetArray) || !Array.isArray(sourceElements)) {
    throw new Error("Target and source must be arrays.");
  }
  // Ensure startIndex is within bounds or at the end.
  const actualStartIndex = Math.max(0, Math.min(startIndex, targetArray.length));

  // Remove elements from startIndex (0 elements removed) and insert sourceElements.
  targetArray.splice(actualStartIndex, sourceElements.length, ...sourceElements);
  return targetArray;
}

/**
 * Reverses a specified sub-array (slice) within an array in place.
 * The original array is modified.
 *
 * @param {Array<any>} dataArray - The array to modify.
 * @param {number} startPosition - The 1-based starting index of the sub-array to reverse.
 * @param {number} endPosition - The 1-based ending index of the sub-array to reverse.
 * @returns {Array<any>} The modified dataArray.
 */
function reverseSubarrayInPlace(dataArray, startPosition, endPosition) {
  if (!Array.isArray(dataArray)) {
    throw new Error("Input dataArray must be an array.");
  }
  // Adjust to 0-based indexing.
  const actualStart = Math.max(0, startPosition - 1);
  const actualEnd = Math.min(dataArray.length - 1, endPosition - 1);

  if (actualStart >= actualEnd) {
    return dataArray; // Nothing to reverse or invalid range.
  }

  // Extract the sub-array, reverse it, then re-insert it.
  const segmentToReverse = dataArray.slice(actualStart, actualEnd + 1);
  segmentToReverse.reverse();

  // Replace the original segment with the reversed one using splice.
  dataArray.splice(actualStart, segmentToReverse.length, ...segmentToReverse);

  return dataArray;
}

/**
 * Pads a number with leading zeros to reach a specified length.
 *
 * @param {number|string} numericValue - The number or string to pad.
 * @param {number} desiredLength - The total desired length of the padded string.
 * @returns {string} The zero-padded string.
 */
function padNumberWithLeadingZeros(numericValue, desiredLength) {
  // Convert to string first to use `padStart`.
  const stringValue = String(numericValue);
  return stringValue.padStart(desiredLength, '0');
}

/**
 * Computes the prime factorization of a given integer.
 * Returns a Map where keys are prime factors and values are their exponents.
 *
 * @param {number} numberToFactorize - The integer to decompose.
 * @returns {Map<number, number>} A Map representing the prime factorization.
 * @throws {Error} If the input is not a positive integer.
 */
function computePrimeDecomposition(numberToFactorize) {
  if (!Number.isInteger(numberToFactorize) || numberToFactorize <= 0) {
    throw new Error("Input for prime decomposition must be a positive integer.");
  }

  const factorsMap = new Map();
  let tempNumber = numberToFactorize;

  // Handle factor 2
  while (tempNumber % 2 === 0) {
    factorsMap.set(2, (factorsMap.get(2) || 0) + 1);
    tempNumber /= 2;
  }

  // Handle odd factors from 3 upwards
  // We only need to check up to the square root of the remaining number.
  for (let i = 3; i * i <= tempNumber; i += 2) {
    while (tempNumber % i === 0) {
      factorsMap.set(i, (factorsMap.get(i) || 0) + 1);
      tempNumber /= i;
    }
  }

  // If tempNumber is still greater than 1, it means it's a prime factor itself.
  if (tempNumber > 1) {
    factorsMap.set(tempNumber, (factorsMap.get(tempNumber) || 0) + 1);
  }

  return factorsMap;
}

/**
 * Computes the greatest common divisor (GCD) of two non-negative integers using the Euclidean algorithm.
 *
 * @param {number} firstValue - The first non-negative integer.
 * @param {number} secondValue - The second non-negative integer.
 * @returns {number} The greatest common divisor of the two numbers.
 * @throws {Error} If inputs are not non-negative integers.
 */
function greatestCommonDivisor(firstValue, secondValue) {
  if (!Number.isInteger(firstValue) || !Number.isInteger(secondValue) || firstValue < 0 || secondValue < 0) {
    throw new Error("Inputs for GCD must be non-negative integers.");
  }
  // Ensure a is always the larger number for iterative process
  let a = Math.abs(firstValue);
  let b = Math.abs(secondValue);

  // Euclidean algorithm (iterative)
  while (b !== 0) {
    let remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

/**
 * Computes the least common multiple (LCM) of two non-negative integers.
 * Uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
 *
 * @param {number} val1 - The first non-negative integer.
 * @param {number} val2 - The second non-negative integer.
 * @returns {number} The least common multiple of the two numbers.
 * @throws {Error} If inputs are not non-negative integers or if GCD is zero (for non-zero inputs).
 */
function leastCommonMultiple(val1, val2) {
  if (!Number.isInteger(val1) || !Number.isInteger(val2) || val1 < 0 || val2 < 0) {
    throw new Error("Inputs for LCM must be non-negative integers.");
  }
  if (val1 === 0 || val2 === 0) {
    return 0; // LCM with 0 is 0.
  }
  const commonDivisor = greatestCommonDivisor(val1, val2);
  // To prevent overflow, divide one number by GCD first before multiplying.
  return (Math.abs(val1 * val2)) / commonDivisor;
}

/**
 * A comparison function for sorting in ascending order.
 *
 * @param {number} elementA - The first element to compare.
 * @param {number} elementB - The second element to compare.
 * @returns {number} A negative value if elementA < elementB, zero if equal, a positive value if elementA > elementB.
 */
function compareAscending(elementA, elementB) {
  return elementA - elementB;
}

/**
 * Performs a binary search on a sorted array to find the index of the largest element
 * that is less than or equal to a specified search target.
 *
 * @param {Array<number>} sortedNumericArray - The array to search, must be sorted in ascending order.
 * @param {number} searchTarget - The value to search for.
 * @returns {number} The index of the largest element <= searchTarget, or -1 if no such element exists.
 */
function findLargestIndexLessThanOrEqual(sortedNumericArray, searchTarget) {
  if (!Array.isArray(sortedNumericArray) || sortedNumericArray.length === 0) {
    return -1;
  }

  let lowerBound = 0;
  let upperBound = sortedNumericArray.length - 1;
  let resultIndex = -1; // Stores the potential result index

  while (lowerBound <= upperBound) {
    const midIndex = Math.floor((lowerBound + upperBound) / 2);
    const midValue = sortedNumericArray[midIndex];

    if (midValue <= searchTarget) {
      resultIndex = midIndex; // This element is a candidate, try to find a larger one on the right.
      lowerBound = midIndex + 1;
    } else {
      upperBound = midIndex - 1; // midValue is too large, search in the left half.
    }
  }
  return resultIndex;
}

/**
 * Splits a multiline string input into an array of strings,
 * where each string represents a line. Handles different line ending conventions.
 *
 * @param {string} rawInputString - The raw string input, potentially containing newlines.
 * @returns {Array<string>} An array of strings, each corresponding to a line.
 */
function splitInputByLine(rawInputString) {
  if (typeof rawInputString !== 'string') {
    return [];
  }
  // Use a regex to split by Windows (\r\n) or Unix (\n) line endings.
  return rawInputString.split(/\r?\n/);
}

/**
 * Verifies if an array of numbers is sorted in ascending order.
 *
 * @param {Array<number>} numericSequence - The array of numbers to check.
 * @returns {boolean} True if the array is sorted ascending, false otherwise.
 */
function verifyIfArrayIsSortedAscending(numericSequence) {
  if (!Array.isArray(numericSequence) || numericSequence.length <= 1) {
    return true; // Empty or single-element arrays are considered sorted.
  }

  // Iterate from the second element, comparing with the previous one.
  for (let i = 1; i < numericSequence.length; i++) {
    if (numericSequence[i - 1] > numericSequence[i]) {
      return false; // Found an out-of-order pair.
    }
  }
  return true; // All elements are in ascending order.
}