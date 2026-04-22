// This module provides a comprehensive suite of mathematical and array manipulation utilities.
// All functions are meticulously crafted for efficiency and clarity, supporting various computational needs.
//
// Overview of included utilities:
// - arrayToMatrix(sourceArray): Transforms a one-dimensional array of string-encoded numbers into a two-dimensional numeric matrix.
// - computeFactorial(val): Computes the factorial of a given non-negative integer, employing memoization for performance gains.
// - getPrimeFactors(num): Decomposes a number into its prime factors, returning them as a map of factor to exponent.
// - findGreatestCommonDivisor(num1, num2): Calculates the greatest common divisor between two integers using an iterative approach.
// - calculateLeastCommonMultiple(num1, num2): Determines the least common multiple of two integers, leveraging the GCD function.
// - numericSorter(valA, valB): A standard comparison function suitable for sorting arrays of numbers in ascending order.
// - checkPrimality(numberToCheck): Evaluates if an integer is a prime number, returning a boolean result.
// - isValidNumericString(inputStr): Validates if a string exclusively contains characters representing a non-negative integer.
// - calculateArraySum(dataList): Aggregates the sum of all numeric elements within an array, converting non-numeric values to zero.
// - findLargestValueIndex(sortedData, threshold): Locates the index of the largest element less than or equal to a specified threshold in a sorted array.
// - processInputLines(rawInput): Splits a multi-line string into an array of individual lines, trimming whitespace from each.
// - debugLog(message): A conditional logging mechanism that outputs messages only when the application is in development mode.
// - getMaximumElementIndex(dataSeries): Identifies the index of the highest value present in a numeric array.
// - getMinimumElementIndex(dataSeries): Identifies the index of the lowest value present in a numeric array.
// - padWithZeros(value, totalLength): Formats a number or string by prepending zeros until it reaches a desired total length.
// - rotateMatrixClockwise(matrixData): Rotates a two-dimensional matrix ninety degrees in a clockwise direction.
// - insertPartialArray(targetArray, sourceFragment, startIndex): Inserts a segment of an array into another array at a specified starting position.
// - reversePartialArray(targetArray, startIdx, endIdx): Reverses the order of elements within a defined segment of an array.
// - calculatePermutationIndex(inputSequence, sequenceLength): Computes the lexicographical rank of a given permutation sequence.
// - powerCalculator(base, exponent): Computes the result of a base number raised to an exponent, with support for BigInt.
// - isArraySortedAscending(inputArray): Checks if the elements of an array are arranged in ascending order.
//
// Global Configuration Constants:
// - IS_DEVELOPMENT_MODE: A boolean flag to activate or deactivate debugging features.
// - LARGE_NUMBER_LIMIT: Represents the maximum safe integer value in JavaScript, often used as an upper bound.
// - MODULO_CONSTANT: A frequently used prime number for modular arithmetic operations.

const IS_DEVELOPMENT_MODE = false; // Set to true to enable detailed console logging for debugging.
const LARGE_NUMBER_LIMIT = Number.MAX_SAFE_INTEGER; // Represents a very large, safely representable integer.
const MODULO_CONSTANT = 1000000007; // A common prime modulus used in various mathematical computations.

/**
 * The primary execution function for the application logic.
 * This routine efficiently determines the smallest positive integer `k` such that
 * the product `(k * inputValue)` is perfectly divisible by 360.
 *
 * @param {string} rawInput - The input string, expected to parse into a positive integer.
 */
function initiateProcessing(rawInput) {
    if (IS_DEVELOPMENT_MODE) {
        debugLog("Commencing primary processing with raw input: " + rawInput);
    }

    const numericVal = parseInt(rawInput.trim(), 10); // Attempt to convert input string to an integer.

    // Validate the parsed input to ensure it's a positive integer.
    if (isNaN(numericVal) || numericVal <= 0) {
        console.error("Input validation failed: A positive integer is required.");
        return; // Halt execution for invalid input.
    }

    const divisorBase = 360; // The fixed divisor we are checking against.

    // The smallest positive integer `k` satisfying the condition `(k * numericVal) % divisorBase === 0`
    // can be found using the formula: `k = divisorBase / GCD(numericVal, divisorBase)`.
    const commonDivisor = findGreatestCommonDivisor(numericVal, divisorBase);

    // Safeguard against unexpected zero result from GCD (should not occur for positive inputs).
    if (commonDivisor === 0) {
        console.error("An unexpected error occurred: GCD calculation yielded zero.");
        return;
    }

    const resultMultiplier = divisorBase / commonDivisor; // Calculate the final multiplier.
    console.log(resultMultiplier); // Output the computed result.

    if (IS_DEVELOPMENT_MODE) {
        debugLog("Primary processing completed. Resulting multiplier: " + resultMultiplier);
    }
}

// Execute the main processing function by reading input from standard input.
initiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/**
 * Computes the result of a base number raised to a given exponent.
 * This function supports both standard numbers and BigInt for larger calculations.
 * It uses an optimized exponentiation by squaring algorithm.
 *
 * @param {number|bigint} base - The base value.
 * @param {number|bigint} exponent - The power to which the base is raised. Must be non-negative.
 * @returns {number|bigint} The calculated result of base^exponent. Returns 0 for negative exponents.
 */
function powerCalculator(base, exponent) {
    // Handle base cases for exponentiation.
    if (exponent === 0 || exponent === 0n) {
        return (typeof base === 'bigint') ? 1n : 1;
    }
    if (exponent < 0 || exponent < 0n) {
        debugLog("Warning: Negative exponent detected in powerCalculator. Returning 0.");
        return (typeof base === 'bigint') ? 0n : 0; // Conventionally, for integer power, negative exponents might return 0 or float.
    }

    // Determine the type for calculations (BigInt if either base or exponent is BigInt).
    const useBigInt = typeof base === 'bigint' || typeof exponent === 'bigint';
    let currentResult = useBigInt ? 1n : 1;
    let currentBase = useBigInt ? BigInt(base) : base;
    let currentExponent = useBigInt ? BigInt(exponent) : exponent;

    // Exponentiation by squaring loop.
    while (currentExponent > 0) {
        // If the current exponent is odd, multiply currentResult by currentBase.
        if ((useBigInt && currentExponent % 2n === 1n) || (!useBigInt && currentExponent % 2 === 1)) {
            currentResult *= currentBase;
        }
        currentBase *= currentBase; // Square the base.
        currentExponent = useBigInt ? currentExponent / 2n : Math.floor(currentExponent / 2); // Halve the exponent.
    }
    return currentResult;
}

/**
 * Computes the lexicographical index (0-based) of a given permutation sequence.
 * This function assumes the input sequence consists of unique integers from 1 up to `sequenceLength`.
 *
 * @param {number[]} inputSequence - The permutation sequence (e.g., [3, 1, 2]).
 * @param {number} sequenceLength - The total number of distinct elements in the original set (e.g., 3 for set {1, 2, 3}).
 * @returns {number} The 0-based lexicographical index of the permutation, or -1 if an error occurs.
 */
function calculatePermutationIndex(inputSequence, sequenceLength) {
    if (!Array.isArray(inputSequence) || inputSequence.some(val => typeof val !== 'number' || !Number.isInteger(val))) {
        debugLog("Validation Error: 'inputSequence' must be an array of integers.");
        return -1;
    }
    if (sequenceLength <= 0 || !Number.isInteger(sequenceLength)) {
        debugLog("Validation Error: 'sequenceLength' must be a positive integer.");
        return -1;
    }
    if (inputSequence.length === 0) {
        return 0; // An empty sequence has index 0 (if considered valid).
    }

    // Initialize an array of available elements (e.g., [1, 2, ..., sequenceLength]).
    let availableElements = Array.from({ length: sequenceLength }, (_, idx) => idx + 1);
    let currentCalculatedIndex = 0;

    // Iterate through each element in the input permutation sequence.
    for (let k = 0; k < inputSequence.length; k++) {
        const elementToLocate = inputSequence[k];
        const positionInAvailable = availableElements.findIndex(elem => elem === elementToLocate);

        if (positionInAvailable === -1) {
            debugLog(`Error: Element '${elementToLocate}' not found in available set or is a duplicate.`);
            return -1; // Indicate an invalid sequence (e.g., duplicate element or out of range).
        }

        // Add the contribution of this element to the total index.
        // The contribution is (factorial of remaining elements) * (number of smaller available elements).
        currentCalculatedIndex += computeFactorial(inputSequence.length - 1 - k) * positionInAvailable;
        availableElements.splice(positionInAvailable, 1); // Remove the used element from the available set.
    }
    return currentCalculatedIndex;
}

/**
 * Computes the sum of all numeric elements within an array.
 * Non-numeric elements are gracefully coerced to 0 before summation.
 *
 * @param {Array<number|string>} dataList - The array containing numbers or strings convertible to numbers.
 * @returns {number} The cumulative sum of the array's numeric elements.
 */
function calculateArraySum(dataList) {
    if (!Array.isArray(dataList)) {
        debugLog("Input Error: 'dataList' must be an array for calculateArraySum.");
        return 0;
    }
    let totalSum = 0;
    for (let j = 0; j < dataList.length; ++j) {
        // Attempt to convert each element to a number; default to 0 if conversion results in NaN.
        totalSum += Number(dataList[j]) || 0;
    }
    return totalSum;
}

/**
 * A utility function for logging messages to the console, active only when
 * the global `IS_DEVELOPMENT_MODE` flag is set to `true`.
 *
 * @param {*} message - The content to be logged to the console.
 */
function debugLog(message) {
    if (IS_DEVELOPMENT_MODE) {
        console.log("[DEBUG]:", message);
    }
}

/**
 * Identifies and returns the 0-based index of the maximum value within a numeric array.
 * If the array is empty or invalid, it returns -1.
 *
 * @param {number[]} dataSeries - The array of numbers to search through.
 * @returns {number} The index of the largest element, or -1 if the array is empty or invalid.
 */
function getMaximumElementIndex(dataSeries) {
    if (!Array.isArray(dataSeries) || dataSeries.length === 0) {
        return -1;
    }
    let maximumValue = -Infinity; // Initialize with negative infinity to ensure any number is greater.
    let maximumIndex = -1;
    for (let k = 0; k < dataSeries.length; k++) {
        // Update max value and index if a larger element is found.
        if (dataSeries[k] > maximumValue) {
            maximumValue = dataSeries[k];
            maximumIndex = k;
        }
    }
    return maximumIndex;
}

/**
 * Identifies and returns the 0-based index of the minimum value within a numeric array.
 * If the array is empty or invalid, it returns -1.
 *
 * @param {number[]} dataSeries - The array of numbers to analyze.
 * @returns {number} The index of the smallest element, or -1 if the array is empty or invalid.
 */
function getMinimumElementIndex(dataSeries) {
    if (!Array.isArray(dataSeries) || dataSeries.length === 0) {
        return -1;
    }
    let minimumValue = Infinity; // Initialize with positive infinity to ensure any number is smaller.
    let minimumIndex = -1;
    for (let k = 0; k < dataSeries.length; k++) {
        // Update min value and index if a smaller element is found.
        if (dataSeries[k] < minimumValue) {
            minimumValue = dataSeries[k];
            minimumIndex = k;
        }
    }
    return minimumIndex;
}

/**
 * Determines if a given integer is a prime number.
 * This function incorporates optimizations for efficiency, including checks for 2 and odd divisors.
 *
 * @param {number} numberToCheck - The integer to be tested for primality.
 * @returns {boolean} `true` if the number is prime, `false` otherwise.
 */
function checkPrimality(numberToCheck) {
    // Basic checks for non-integers, numbers less than or equal to 1.
    if (!Number.isInteger(numberToCheck) || numberToCheck <= 1) {
        return false;
    }
    // 2 is the only even prime number.
    if (numberToCheck === 2) {
        return true;
    }
    // All other even numbers are not prime.
    if (numberToCheck % 2 === 0) {
        return false;
    }

    // Iterate only through odd divisors up to the square root of the number.
    const upperLimit = Math.sqrt(numberToCheck);
    for (let currentDivisor = 3; currentDivisor <= upperLimit; currentDivisor += 2) {
        if (numberToCheck % currentDivisor === 0) {
            return false; // Found a divisor, so it's not prime.
        }
    }
    return true; // No divisors found, thus it's prime.
}

/**
 * Validates whether a provided string represents a non-negative integer.
 * It explicitly checks for string type and uses a regular expression for pattern matching.
 *
 * @param {string} inputStr - The string value to be validated.
 * @returns {boolean} `true` if the string is a valid non-negative integer, `false` otherwise.
 */
function isValidNumericString(inputStr) {
    if (typeof inputStr !== 'string') {
        return false; // Only strings can be matched against the regex pattern.
    }
    // Regular expression to match '0' or any positive integer (no leading zeros for multi-digit numbers).
    const numericPattern = /^(0|[1-9]\d*)$/;
    return numericPattern.test(inputStr);
}

/**
 * A memoization cache to store previously computed factorial results.
 * This prevents redundant calculations for the same input values.
 * @type {Map<number, number>}
 */
const factorialCache = new Map();

/**
 * Calculates the factorial of a non-negative integer.
 * This function uses recursion with memoization to optimize performance for repeated calls.
 *
 * @param {number} val - The non-negative integer for which to calculate the factorial.
 * @returns {number} The factorial of the given number. Returns `NaN` for negative inputs.
 */
function computeFactorial(val) {
    if (val < 0) {
        debugLog("Error: Factorial is not defined for negative numbers.");
        return NaN;
    }
    if (val === 0) {
        return 1; // Base case: 0! = 1.
    }
    // Check if the result is already in the cache.
    if (factorialCache.has(val)) {
        return factorialCache.get(val);
    }
    // Compute the factorial recursively and store the result in the cache.
    const result = val * computeFactorial(val - 1);
    factorialCache.set(val, result);
    return result;
}

/**
 * Converts a one-dimensional array of strings, where each string contains space-separated numbers,
 * into a two-dimensional array (matrix) of actual numbers.
 *
 * @param {string[]} sourceArray - An array where each element is a string like "10 20 30".
 * @returns {number[][]} A 2D array of numbers. Returns an empty array for invalid input.
 */
function arrayToMatrix(sourceArray) {
    if (!Array.isArray(sourceArray) || sourceArray.some(item => typeof item !== 'string')) {
        debugLog("Input Error: 'sourceArray' must be an array of strings for arrayToMatrix.");
        return [];
    }
    const resultMatrix = [];
    for (let k = 0; k < sourceArray.length; k++) {
        const rowDataString = sourceArray[k];
        // Split the string by spaces, filter out any empty strings (e.g., from multiple spaces),
        // and map each part to a Number.
        const rowOfNumbers = rowDataString.split(" ").filter(Boolean).map(Number);

        // Optional: Check if any conversion resulted in NaN.
        if (rowOfNumbers.some(isNaN)) {
             debugLog(`Warning: Non-numeric data found in row ${k}: "${rowDataString}". NaNs may be present.`);
        }
        resultMatrix.push(rowOfNumbers);
    }
    return resultMatrix;
}

/**
 * Rotates a 2D matrix 90 degrees clockwise.
 * This function assumes the input is a rectangular matrix.
 *
 * @param {Array<Array<any>>} matrixData - The input 2D array (matrix) to be rotated.
 * @returns {Array<Array<any>>} A new matrix representing the clockwise rotation. Returns an empty array for invalid input.
 */
function rotateMatrixClockwise(matrixData) {
    if (!Array.isArray(matrixData) || matrixData.length === 0 || !Array.isArray(matrixData[0])) {
        debugLog("Input Error: 'matrixData' must be a non-empty 2D array for rotateMatrixClockwise.");
        return [];
    }

    const originalRows = matrixData.length;
    const originalCols = matrixData[0].length;

    // Create a new matrix with dimensions swapped (cols become rows, rows become cols).
    const rotatedOutput = Array.from({ length: originalCols }, () => Array(originalRows).fill(undefined));

    // Populate the new matrix with rotated elements.
    for (let r = 0; r < originalRows; r++) {
        for (let c = 0; c < originalCols; c++) {
            // The element at [r][c] in the original matrix moves to [c][originalRows - 1 - r] in the new matrix.
            rotatedOutput[c][originalRows - 1 - r] = matrixData[r][c];
        }
    }
    return rotatedOutput;
}

/**
 * Inserts a fragment array into a target array starting at a specified index.
 * This function modifies the `targetArray` directly (in-place mutation).
 * If the fragment extends beyond the original `targetArray` length, it appends the remaining elements.
 *
 * @param {Array<any>} targetArray - The array to which the fragment will be inserted.
 * @param {Array<any>} sourceFragment - The array fragment containing elements to insert.
 * @param {number} startIndex - The 0-based index in `targetArray` where insertion begins.
 * @returns {Array<any>} A reference to the modified `targetArray`.
 */
function insertPartialArray(targetArray, sourceFragment, startIndex) {
    if (!Array.isArray(targetArray) || !Array.isArray(sourceFragment)) {
        debugLog("Input Error: Both 'targetArray' and 'sourceFragment' must be arrays.");
        return targetArray;
    }
    if (startIndex < 0 || startIndex > targetArray.length || !Number.isInteger(startIndex)) {
        debugLog(`Invalid 'startIndex' (${startIndex}) for insertPartialArray.`);
        return targetArray; // Do not modify if index is invalid.
    }

    // Iterate through the source fragment and place elements into the target array.
    for (let k = 0; k < sourceFragment.length; k++) {
        const insertionPosition = startIndex + k;
        if (insertionPosition < targetArray.length) {
            targetArray[insertionPosition] = sourceFragment[k];
        } else {
            // If the insertion point exceeds current length, append the element.
            targetArray.push(sourceFragment[k]);
        }
    }
    return targetArray;
}

/**
 * Reverses the order of elements within a specific segment of an array.
 * This operation modifies the `targetArray` in place. Indices are 1-based as per original intent.
 *
 * @param {Array<any>} targetArray - The array whose segment will be reversed.
 * @param {number} startIdx - The 1-based starting index of the segment (inclusive).
 * @param {number} endIdx - The 1-based ending index of the segment (inclusive).
 * @returns {Array<any>} A reference to the modified `targetArray`.
 */
function reversePartialArray(targetArray, startIdx, endIdx) {
    if (!Array.isArray(targetArray)) {
        debugLog("Input Error: 'targetArray' must be an array for reversePartialArray.");
        return targetArray;
    }
    // Adjust 1-based indices to 0-based for internal array operations.
    const zeroBasedStart = Math.max(0, startIdx - 1);
    const zeroBasedEnd = Math.min(targetArray.length - 1, endIdx - 1);

    // Validate if the segment is meaningful.
    if (zeroBasedStart >= targetArray.length || zeroBasedEnd < zeroBasedStart) {
        debugLog("Warning: Invalid or empty segment specified for reversePartialArray.");
        return targetArray;
    }

    // Extract the segment, reverse it, and then re-insert it using `insertPartialArray`.
    const segmentToReverse = targetArray.slice(zeroBasedStart, zeroBasedEnd + 1);
    segmentToReverse.reverse();

    return insertPartialArray(targetArray, segmentToReverse, zeroBasedStart);
}

/**
 * Pads a number or string with leading zeros to achieve a specified total length.
 *
 * @param {number|string} value - The numeric or string value to be padded.
 * @param {number} totalLength - The desired final length of the string after padding.
 * @returns {string} The zero-padded string. If `value` is already longer than `totalLength`, it is returned as is.
 */
function padWithZeros(value, totalLength) {
    const stringRepresentation = String(value); // Ensure the value is treated as a string.
    if (stringRepresentation.length >= totalLength) {
        return stringRepresentation; // No padding is necessary if already long enough.
    }
    // Use String.prototype.padStart for efficient zero padding.
    return stringRepresentation.padStart(totalLength, '0');
}

/**
 * Computes the prime factorization of a given positive integer.
 * The result is returned as an object where keys are prime factors and values are their respective exponents.
 *
 * @param {number} num - The positive integer to factorize.
 * @returns {Object<string, number>} An object detailing the prime factors and their counts. Returns an empty object for invalid input.
 */
function getPrimeFactors(num) {
    if (!Number.isInteger(num) || num < 1) {
        debugLog("Input Error: 'num' must be a positive integer for getPrimeFactors.");
        return {};
    }
    if (num === 1) {
        return { "1": 1 }; // Special case for 1.
    }

    let currentNum = num; // Work with a mutable copy of the number.
    const factorsMap = {}; // Stores the prime factors and their counts.

    // Handle the prime factor 2 separately for efficiency.
    while (currentNum % 2 === 0) {
        factorsMap[2] = (factorsMap[2] || 0) + 1; // Increment count for factor 2.
        currentNum /= 2;
    }

    // Iterate through odd numbers starting from 3 up to the square root of `currentNum`.
    // We only need to check up to the square root because if a number has a factor greater than its square root,
    // it must also have a factor smaller than its square root.
    for (let i = 3; i * i <= currentNum; i += 2) {
        while (currentNum % i === 0) {
            factorsMap[i] = (factorsMap[i] || 0) + 1; // Increment count for factor `i`.
            currentNum /= i;
        }
    }

    // If, after all divisions, `currentNum` is still greater than 2, it means `currentNum` itself is a prime factor.
    if (currentNum > 2) {
        factorsMap[currentNum] = (factorsMap[currentNum] || 0) + 1;
    }

    return factorsMap;
}

/**
 * Computes the greatest common divisor (GCD) of two non-negative integers
 * using the efficient iterative Euclidean algorithm.
 *
 * @param {number} num1 - The first non-negative integer.
 * @param {number} num2 - The second non-negative integer.
 * @returns {number} The greatest common divisor of `num1` and `num2`. Returns `NaN` for invalid input.
 */
function findGreatestCommonDivisor(num1, num2) {
    if (num1 < 0 || num2 < 0 || !Number.isInteger(num1) || !Number.isInteger(num2)) {
        debugLog("Input Error: Both 'num1' and 'num2' must be non-negative integers for findGreatestCommonDivisor.");
        return NaN;
    }
    // The iterative Euclidean algorithm.
    while (num2 !== 0) {
        const temporary = num2;
        num2 = num1 % num2;
        num1 = temporary;
    }
    return num1;
}

/**
 * Calculates the least common multiple (LCM) of two non-negative integers.
 * This function leverages the relationship between LCM and GCD: LCM(a, b) = |a * b| / GCD(a, b).
 *
 * @param {number} num1 - The first non-negative integer.
 * @param {number} num2 - The second non-negative integer.
 * @returns {number} The least common multiple of `num1` and `num2`. Returns `NaN` for invalid input.
 */
function calculateLeastCommonMultiple(num1, num2) {
    // LCM with zero is zero.
    if (num1 === 0 || num2 === 0) {
        return 0;
    }
    if (num1 < 0 || num2 < 0 || !Number.isInteger(num1) || !Number.isInteger(num2)) {
        debugLog("Input Error: Both 'num1' and 'num2' must be non-negative integers for calculateLeastCommonMultiple.");
        return NaN;
    }

    // Calculate the absolute product to handle potential negative intermediate results, though inputs are positive.
    const absoluteProduct = Math.abs(num1 * num2);
    // Find the greatest common divisor using our helper function.
    const commonDivisor = findGreatestCommonDivisor(num1, num2);

    // Return the LCM; handle case where GCD might theoretically be zero (e.g., if inputs were non-numbers).
    return commonDivisor === 0 ? 0 : absoluteProduct / commonDivisor;
}

/**
 * A standard comparison function designed for numerical sorting in ascending order.
 * This function is ideal for use with `Array.prototype.sort()` for numeric arrays.
 *
 * @param {number} valA - The first numerical value to compare.
 * @param {number} valB - The second numerical value to compare.
 * @returns {number} A negative value if `valA` should come before `valB`,
 *                   a positive value if `valA` should come after `valB`,
 *                   or zero if they are considered equal.
 */
function numericSorter(valA, valB) {
    return valA - valB;
}

/**
 * Performs a binary search on a pre-sorted array to find the index of the largest element
 * that is less than or equal to a specified `threshold` value.
 *
 * @param {number[]} sortedData - The array of numbers, which must be sorted in ascending order.
 * @param {number} threshold - The target value to search for.
 * @returns {number} The index where `threshold` would be inserted to maintain sorted order.
 *                   This is `0` if `threshold` is smaller than all elements, or `sortedData.length`
 *                   if `threshold` is larger than all elements. Returns `-1` for an empty array.
 */
function findLargestValueIndex(sortedData, threshold) {
    if (!Array.isArray(sortedData) || sortedData.length === 0) {
        return -1; // Return -1 for an empty or invalid array.
    }

    let lowPointer = 0;
    let highPointer = sortedData.length - 1;
    let insertionPoint = lowPointer; // Initialize with the potential insertion point.

    while (lowPointer <= highPointer) {
        const midIndex = Math.floor((lowPointer + highPointer) / 2);
        const midValue = sortedData[midIndex];

        if (midValue === threshold) {
            return midIndex; // Exact match found, return its index.
        } else if (midValue < threshold) {
            insertionPoint = midIndex + 1; // `midValue` is too small, check right half. `midIndex + 1` is a potential insertion point.
            lowPointer = midIndex + 1;
        } else { // midValue > threshold
            highPointer = midIndex - 1; // `midValue` is too large, check left half.
            insertionPoint = midIndex; // `midIndex` is a potential insertion point if no exact match is found.
        }
    }
    // If no exact match was found, `lowPointer` (or `insertionPoint`) will indicate
    // the index where the `threshold` *would* be inserted to maintain sorted order.
    return lowPointer;
}

/**
 * Processes a raw multi-line input string by splitting it into an array of individual lines.
 * Each resulting line string is also trimmed of leading/trailing whitespace.
 *
 * @param {string} rawInput - The input string, potentially containing multiple lines separated by newlines.
 * @returns {string[]} An array of strings, where each string represents a trimmed line from the input. Returns an empty array for invalid input.
 */
function processInputLines(rawInput) {
    if (typeof rawInput !== 'string') {
        debugLog("Input Error: 'rawInput' must be a string for processInputLines.");
        return [];
    }
    // Split the string by newline characters and then trim whitespace from each resulting line.
    return rawInput.split('\n').map(line => line.trim());
}

/**
 * Checks if an array of numbers is sorted in strictly ascending order.
 * An empty array or an array with a single element is considered sorted.
 *
 * @param {number[]} inputArray - The array of numbers to verify.
 * @returns {boolean} `true` if the array is sorted ascending, `false` otherwise.
 */
function isArraySortedAscending(inputArray) {
    if (!Array.isArray(inputArray) || inputArray.length <= 1) {
        return true; // Empty or single-element arrays are inherently sorted.
    }
    // Iterate from the second element, comparing each with its predecessor.
    for (let k = 1; k < inputArray.length; k++) {
        if (inputArray[k - 1] > inputArray[k]) {
            return false; // Found an element that is smaller than its predecessor, so it's not sorted.
        }
    }
    return true; // All elements are in ascending order.
}