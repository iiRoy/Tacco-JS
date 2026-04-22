/*
 * Utility functions for common programming tasks.
 * This collection includes array manipulations, mathematical operations,
 * string formatting, and search algorithms.
 *
 * Contents:
 * - processEntryPoint: Main application entry point for stdin processing.
 * - getInputData: Helper to read input from /dev/stdin.
 * - computePower: Calculates base raised to an exponent.
 * - calculatePermutationRank: Determines the lexicographical rank of a permutation.
 * - sumNumericArray: Computes the sum of numbers in an array.
 * - diagnosticLogger: Logs messages conditionally based on a global flag.
 * - getIndexOfMaximum: Finds the index of the largest element in an array.
 * - getIndexOfMinimum: Finds the index of the smallest element in an array.
 * - isProbablePrime: Checks if a number is likely prime.
 * - isNonNegativeIntegerString: Validates if a string represents a non-negative integer.
 * - computeFactorial: Calculates the factorial of a number, with memoization.
 * - convertFlatArrayToMatrix: Transforms a 1D array of strings into a 2D matrix of numbers.
 * - rotateSquareMatrixClockwise: Rotates a square matrix 90 degrees clockwise.
 * - injectArraySegment: Inserts elements into an array at a specified starting index.
 * - reversePortionInPlace: Reverses a segment of an array.
 * - padNumberWithLeadingZeros: Formats a number with leading zeros to a desired length.
 * - getPrimeFactorCounts: Returns an object mapping prime factors to their counts.
 * - calculateEuclideanGCD: Computes the greatest common divisor using Euclidean algorithm.
 * - calculateLeastCommonMultiple: Computes the least common multiple of two numbers.
 * - numericComparator: A comparator function for ascending numeric sort.
 * - findUpperBoundIndex: Performs binary search to find the index of the first element greater than or equal to a target.
 * - splitInputIntoLines: Splits a multi-line string into an array of lines.
 * - isStrictlyAscending: Checks if an array of numbers is sorted in strictly ascending order.
 */

// Configuration flags and global constants
const ENABLE_DIAGNOSTICS = false; // Set to true to enable debug logging
const MAX_VAL_LIMIT = Number.MAX_VALUE; // Represents a very large number
const MODULUS_CONST = 998244353; // A common prime modulus used in calculations

// --- Core Application Logic ---

/**
 * Reads input from stdin and processes it.
 * This is the primary execution point for the program.
 * @param {string} rawInput - The raw string data read from standard input.
 */
function processEntryPoint(rawInput) {
  // Attempt to parse the input string into an integer.
  const numericalValue = parseInt(rawInput, 10);

  // Basic input validation: ensure it's a positive integer.
  if (isNaN(numericalValue) || numericalValue <= 0) {
    console.error("Error: Input must be a positive integer.");
    return; // Exit if input is invalid
  }

  // Define a reference angle for division
  const baseAngle = 360;

  // Calculate the result using integer division (truncation)
  // Ensure the result is an integer, handling potential floating point issues.
  const finalResult = Math.trunc(baseAngle / numericalValue);

  // Output the computed result
  console.log(finalResult);
}

/**
 * Helper function to read all data from standard input.
 * @returns {string} The trimmed content of /dev/stdin.
 */
const getInputData = () => {
  try {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim();
  } catch (error) {
    console.error("Failed to read input from /dev/stdin:", error.message);
    // Provide a fallback or rethrow based on desired error handling
    return ""; // Return empty string on error
  }
};

// Execute the main processing function with data from stdin
processEntryPoint(getInputData());

// --- Utility Functions ---

/**
 * Computes the result of a base number raised to an exponent.
 * Handles non-negative integer exponents.
 * @param {number} baseNum - The base number.
 * @param {number} exponentVal - The non-negative integer exponent.
 * @returns {number} The result of baseNum ^ exponentVal.
 */
function computePower(baseNum, exponentVal) {
  if (exponentVal < 0 || !Number.isInteger(exponentVal)) {
    diagnosticLogger("Warning: Exponent must be a non-negative integer.");
    return NaN; // Or throw an error
  }
  if (exponentVal === 0) {
    return 1;
  }
  let currentResult = 1;
  for (let i = 0; i < exponentVal; i++) {
    currentResult *= baseNum;
  }
  return currentResult;
}

/**
 * Calculates the lexicographical rank of a given permutation sequence.
 * Assumes sequence elements are unique positive integers starting from 1.
 * This function uses factorials to determine the rank.
 * @param {number[]} targetSequence - The permutation sequence for which to calculate the rank.
 * @param {number} maxElementValue - The maximum value an element in the sequence can take (e.g., if sequence is of 1 to N, this is N).
 * @returns {number} The lexicographical rank of the sequence (0-indexed).
 */
function calculatePermutationRank(targetSequence, maxElementValue) {
  if (!Array.isArray(targetSequence) || targetSequence.length === 0) {
    diagnosticLogger("Invalid sequence provided to calculatePermutationRank.");
    return -1;
  }

  let currentRank = 0;
  // Create a mutable list of available elements for permutation calculation
  let availableElements = Array.from({ length: maxElementValue }, (_, idx) => idx + 1);

  for (let i = 0; i < targetSequence.length; i++) {
    const currentNum = targetSequence[i];
    const indexOfCurrentNum = availableElements.findIndex(val => val === currentNum);

    if (indexOfCurrentNum === -1) {
      diagnosticLogger(`Error: Element ${currentNum} not found or already used.`);
      return -1; // Element not in available set or duplicate
    }

    // Calculate permutations of remaining elements
    const remainingElementsCount = targetSequence.length - 1 - i;
    const permutationsOfRemaining = computeFactorial(remainingElementsCount);

    // Add contribution to rank
    currentRank += indexOfCurrentNum * permutationsOfRemaining;

    // Remove the current number from available elements
    availableElements.splice(indexOfCurrentNum, 1);
  }
  return currentRank;
}

/**
 * Computes the sum of all numeric values within an array.
 * Non-numeric values will be converted to 0.
 * @param {Array<number|string>} numericList - An array containing numbers or string representations of numbers.
 * @returns {number} The total sum of the elements.
 */
const sumNumericArray = (numericList) => {
  if (!Array.isArray(numericList)) {
    diagnosticLogger("Input for sumNumericArray is not an array.");
    return 0;
  }
  // Use reduce for a concise and functional approach
  return numericList.reduce((accumulator, currentElement) => accumulator + Number(currentElement || 0), 0);
};

/**
 * Logs a message to the console only if the global ENABLE_DIAGNOSTICS flag is true.
 * @param {*} messageData - The data to be logged.
 */
function diagnosticLogger(messageData) {
  if (ENABLE_DIAGNOSTICS) {
    console.log(`[DIAGNOSTICS - ${new Date().toISOString()}]`, messageData);
  }
}

/**
 * Finds the index of the maximum element in a given array.
 * Returns -1 for an empty array.
 * @param {number[]} dataSet - The array of numbers to search.
 * @returns {number} The index of the maximum value, or -1 if the array is empty.
 */
function getIndexOfMaximum(dataSet) {
  if (!Array.isArray(dataSet) || dataSet.length === 0) {
    return -1;
  }

  let currentMax = dataSet[0];
  let maxIndex = 0;

  for (let i = 1; i < dataSet.length; i++) {
    if (dataSet[i] > currentMax) {
      currentMax = dataSet[i];
      maxIndex = i;
    }
  }
  return maxIndex;
}

/**
 * Finds the index of the minimum element in a given array.
 * Returns -1 for an empty array.
 * @param {number[]} dataSet - The array of numbers to search.
 * @returns {number} The index of the minimum value, or -1 if the array is empty.
 */
function getIndexOfMinimum(dataSet) {
  if (!Array.isArray(dataSet) || dataSet.length === 0) {
    return -1;
  }

  let currentMin = dataSet[0];
  let minIndex = 0;

  for (let i = 1; i < dataSet.length; i++) {
    if (dataSet[i] < currentMin) {
      currentMin = dataSet[i];
      minIndex = i;
    }
  }
  return minIndex;
}

// Simple cache for prime checks to avoid redundant computations
const primeCheckCache = new Map();

/**
 * Checks if a given number is a probable prime.
 * Uses trial division up to the square root of the number.
 * @param {number} testNum - The number to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function isProbablePrime(testNum) {
  if (typeof testNum !== 'number' || !Number.isInteger(testNum)) {
    return false; // Not an integer
  }
  if (testNum <= 1) {
    return false; // Numbers less than or equal to 1 are not prime
  }
  if (testNum === 2 || testNum === 3) {
    return true; // 2 and 3 are prime
  }
  if (testNum % 2 === 0 || testNum % 3 === 0) {
    return false; // Divisible by 2 or 3 (and greater than 3)
  }

  // Check cache first
  if (primeCheckCache.has(testNum)) {
    return primeCheckCache.get(testNum);
  }

  // Optimized trial division for numbers > 3
  // Only need to check divisors up to sqrt(testNum)
  // And only check numbers of form 6k ± 1
  const limit = Math.sqrt(testNum);
  for (let i = 5; i <= limit; i += 6) {
    if (testNum % i === 0 || testNum % (i + 2) === 0) {
      primeCheckCache.set(testNum, false);
      return false;
    }
  }

  primeCheckCache.set(testNum, true);
  return true;
}

/**
 * Validates if a given string represents a non-negative integer.
 * It does not allow leading zeros for numbers greater than 0.
 * @param {string} inputString - The string to validate.
 * @returns {boolean} True if the string is a non-negative integer, false otherwise.
 */
function isNonNegativeIntegerString(inputString) {
  const integerPattern = /^(0|[1-9]\d*)$/; // Matches '0', '1', '10', but not '01'
  return integerPattern.test(inputString);
}

// Memoization cache for factorial results
const factorialCache = new Map();

/**
 * Calculates the factorial of a non-negative integer using recursion with memoization.
 * @param {number} value - The non-negative integer for which to calculate the factorial.
 * @returns {number} The factorial of the given value.
 */
function computeFactorial(value) {
  if (value < 0 || !Number.isInteger(value)) {
    diagnosticLogger("Error: Factorial is defined only for non-negative integers.");
    return NaN;
  }
  if (value === 0) {
    return 1; // Base case: 0! = 1
  }
  if (factorialCache.has(value)) {
    return factorialCache.get(value); // Return cached result
  }

  // Compute and cache the result
  const result = value * computeFactorial(value - 1);
  factorialCache.set(value, result);
  return result;
}

/**
 * Converts a 1D array of strings (where each string represents a row of space-separated numbers)
 * into a 2D array (matrix) of numbers.
 * @param {string[]} stringArray - The input 1D array of strings.
 * @returns {number[][]} A 2D array of numbers.
 */
function convertFlatArrayToMatrix(stringArray) {
  if (!Array.isArray(stringArray) || stringArray.length === 0) {
    diagnosticLogger("Input for convertFlatArrayToMatrix is not a valid array.");
    return [];
  }

  // Map each string row to an array of numbers
  return stringArray.map(rowString => {
    // Split by space and convert each part to a number
    return rowString.split(" ").map(Number);
  });
}

/**
 * Rotates a rectangular matrix 90 degrees clockwise.
 * Assumes the input is a non-empty 2D array.
 * @param {any[][]} sourceMatrix - The original 2D array (matrix).
 * @returns {any[][]} A new 2D array representing the rotated matrix.
 */
function rotateSquareMatrixClockwise(sourceMatrix) {
  if (!Array.isArray(sourceMatrix) || sourceMatrix.length === 0 || !Array.isArray(sourceMatrix[0])) {
    diagnosticLogger("Invalid matrix provided for rotation.");
    return [];
  }

  const numRows = sourceMatrix.length;
  const numCols = sourceMatrix[0].length;

  // Create a new matrix with swapped dimensions (COL x ROW)
  const rotatedMatrix = Array.from({ length: numCols }, () => Array(numRows));

  // Populate the new matrix with rotated values
  for (let c = 0; c < numCols; c++) {
    for (let r = 0; r < numRows; r++) {
      rotatedMatrix[c][r] = sourceMatrix[numRows - 1 - r][c];
    }
  }
  return rotatedMatrix;
}

/**
 * Inserts a segment of elements into a target array at a specified starting index.
 * Modifies the `mainArray` in place.
 * @param {Array} mainArray - The array to modify.
 * @param {Array} elementsToInsert - The elements to be inserted.
 * @param {number} startIndex - The zero-based index at which to start inserting.
 * @returns {Array} The modified mainArray.
 */
function injectArraySegment(mainArray, elementsToInsert, startIndex) {
  if (!Array.isArray(mainArray) || !Array.isArray(elementsToInsert)) {
    diagnosticLogger("Invalid array inputs for injectArraySegment.");
    return mainArray;
  }
  // Use Array.prototype.splice for efficient in-place modification
  // The second argument '0' means no elements are removed.
  mainArray.splice(startIndex, 0, ...elementsToInsert);
  return mainArray;
}

/**
 * Reverses a specified portion of an array in place.
 * Uses 1-based indexing for segmentStart and segmentEnd for consistency with some problem statements.
 * @param {Array} dataArray - The array to modify.
 * @param {number} segmentStart - The 1-based starting index of the segment to reverse.
 * @param {number} segmentEnd - The 1-based ending index of the segment to reverse.
 * @returns {Array} The modified dataArray.
 */
function reversePortionInPlace(dataArray, segmentStart, segmentEnd) {
  if (!Array.isArray(dataArray) || dataArray.length === 0 || segmentStart < 1 || segmentEnd > dataArray.length || segmentStart > segmentEnd) {
    diagnosticLogger("Invalid array or segment indices for reversePortionInPlace.");
    return dataArray;
  }

  // Adjust to 0-based indexing for slice
  const actualStart = segmentStart - 1;
  const actualEnd = segmentEnd; // slice end is exclusive

  // Extract the segment, reverse it, and then re-insert
  const segmentToReverse = dataArray.slice(actualStart, actualEnd);
  segmentToReverse.reverse();

  // Remove the original segment and insert the reversed one
  dataArray.splice(actualStart, segmentToReverse.length, ...segmentToReverse);

  return dataArray;
}

/**
 * Pads a number with leading zeros to reach a desired total length.
 * @param {(number|string)} inputVal - The number or string to pad.
 * @param {number} desiredLength - The total length of the resulting string.
 * @returns {string} The zero-padded string.
 */
function padNumberWithLeadingZeros(inputVal, desiredLength) {
  if (desiredLength < 0 || !Number.isInteger(desiredLength)) {
    diagnosticLogger("Desired length for zero padding must be a non-negative integer.");
    return String(inputVal);
  }
  // Convert input to string to ensure string operations work
  const s = String(inputVal);
  // If the string is already long enough or longer, just return it
  if (s.length >= desiredLength) {
    return s;
  }
  // Calculate how many zeros are needed and prepend them
  const numZeros = desiredLength - s.length;
  return '0'.repeat(numZeros) + s;
}

/**
 * Computes the prime factorization of a given positive integer, returning an object
 * where keys are prime factors and values are their corresponding counts.
 * @param {number} numberToFactorize - The positive integer to factorize.
 * @returns {Object<string, number>} An object mapping prime factors to their exponents.
 */
function getPrimeFactorCounts(numberToFactorize) {
  if (typeof numberToFactorize !== 'number' || !Number.isInteger(numberToFactorize) || numberToFactorize < 1) {
    diagnosticLogger("Input for getPrimeFactorCounts must be a positive integer.");
    return {};
  }
  if (numberToFactorize === 1) {
    return {}; // Prime factorization of 1 is an empty set of factors
  }

  const factorMap = {};
  let tempNumber = numberToFactorize;

  // Handle factor 2
  while (tempNumber % 2 === 0) {
    factorMap[2] = (factorMap[2] || 0) + 1;
    tempNumber /= 2;
  }

  // Handle odd factors from 3 up to sqrt(tempNumber)
  // Optimization: only check odd numbers
  for (let i = 3; i * i <= tempNumber; i += 2) {
    while (tempNumber % i === 0) {
      factorMap[i] = (factorMap[i] || 0) + 1;
      tempNumber /= i;
    }
  }

  // If tempNumber is still greater than 1, it must be a prime factor itself
  if (tempNumber > 1) {
    factorMap[tempNumber] = (factorMap[tempNumber] || 0) + 1;
  }

  return factorMap;
}

/**
 * Calculates the Greatest Common Divisor (GCD) of two non-negative integers
 * using the Euclidean algorithm (recursive implementation).
 * @param {number} firstNum - The first non-negative integer.
 * @param {number} secondNum - The second non-negative integer.
 * @returns {number} The GCD of firstNum and secondNum.
 */
function calculateEuclideanGCD(firstNum, secondNum) {
  if (!Number.isInteger(firstNum) || !Number.isInteger(secondNum) || firstNum < 0 || secondNum < 0) {
    diagnosticLogger("GCD inputs must be non-negative integers.");
    return NaN;
  }
  // Base case for Euclidean algorithm
  if (secondNum === 0) {
    return firstNum;
  }
  // Recursive step
  return calculateEuclideanGCD(secondNum, firstNum % secondNum);
}

/**
 * Calculates the Least Common Multiple (LCM) of two non-negative integers.
 * Uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {number} valueA - The first non-negative integer.
 * @param {number} valueB - The second non-negative integer.
 * @returns {number} The LCM of valueA and valueB.
 */
function calculateLeastCommonMultiple(valueA, valueB) {
  if (!Number.isInteger(valueA) || !Number.isInteger(valueB) || valueA < 0 || valueB < 0) {
    diagnosticLogger("LCM inputs must be non-negative integers.");
    return NaN;
  }
  if (valueA === 0 || valueB === 0) {
    return 0; // LCM with 0 is 0
  }
  // Use the GCD function to compute LCM
  const commonDivisor = calculateEuclideanGCD(valueA, valueB);
  // Avoid potential floating point issues by dividing first
  return Math.abs(valueA * (valueB / commonDivisor));
}

/**
 * A comparator function for sorting numbers in ascending order.
 * Suitable for use with Array.prototype.sort().
 * @param {number} val1 - The first value for comparison.
 * @param {number} val2 - The second value for comparison.
 * @returns {number} A negative value if val1 < val2, positive if val1 > val2, and 0 if equal.
 */
function numericComparator(val1, val2) {
  if (typeof val1 !== 'number' || typeof val2 !== 'number') {
    diagnosticLogger("Numeric comparator received non-numeric input.");
    // Fallback or error handling for non-numeric types
    return 0;
  }
  return val1 - val2;
}

/**
 * Performs a binary search on a sorted array to find the index of the first element
 * that is greater than or equal to the target value (upper bound equivalent).
 * If the target value is not found, it returns the index where it would be inserted
 * to maintain sorted order.
 * @param {number[]} orderedCollection - The sorted array of numbers to search within.
 * @param {number} searchKey - The value to search for.
 * @returns {number} The index of the element, or the insertion point if not found.
 */
function findUpperBoundIndex(orderedCollection, searchKey) {
  if (!Array.isArray(orderedCollection) || orderedCollection.length === 0) {
    diagnosticLogger("Empty or invalid collection for findUpperBoundIndex.");
    return 0; // Insertion point for empty array
  }

  let lowBound = 0;
  let highBound = orderedCollection.length - 1;
  let resultIndex = orderedCollection.length; // Default to insertion at end

  while (lowBound <= highBound) {
    const midPoint = Math.floor((lowBound + highBound) / 2);
    const midValue = orderedCollection[midPoint];

    if (midValue >= searchKey) {
      resultIndex = midPoint; // Potential upper bound
      highBound = midPoint - 1; // Try to find an even smaller index
    } else {
      lowBound = midPoint + 1; // Search in the right half
    }
  }
  return resultIndex;
}

/**
 * Splits a multi-line string into an array of individual lines.
 * @param {string} rawText - The input string, potentially containing newline characters.
 * @returns {string[]} An array where each element is a line from the input text.
 */
function splitInputIntoLines(rawText) {
  if (typeof rawText !== 'string') {
    diagnosticLogger("Input for splitInputIntoLines must be a string.");
    return [];
  }
  return rawText.split("\n");
}

/**
 * Checks if an array of numbers is sorted in strictly ascending order.
 * An array is strictly ascending if each element is strictly greater than the previous one.
 * @param {number[]} inputSeq - The array of numbers to check.
 * @returns {boolean} True if the array is strictly ascending, false otherwise.
 */
function isStrictlyAscending(inputSeq) {
  if (!Array.isArray(inputSeq)) {
    diagnosticLogger("Input for isStrictlyAscending is not an array.");
    return false;
  }
  if (inputSeq.length < 2) {
    return true; // An array with 0 or 1 element is considered sorted
  }

  // Use Array.prototype.every for a concise check
  return inputSeq.every((currentVal, index, arr) => {
    // For the first element, there's no previous element to compare
    if (index === 0) {
      return true;
    }
    // Check if current value is strictly greater than the previous value
    return currentVal > arr[index - 1];
  });
}