const IS_DEBUG_ACTIVE = false;
const SAFE_MAX_INT = Number.MAX_SAFE_INTEGER;
const MODULO_CONSTANT = 1000000007;

/**
 * Logs a message to the console only if debugging is active.
 * @param {*} messageContent - The data or message to log.
 */
const conditionalDebugLog = (messageContent) => {
    if (IS_DEBUG_ACTIVE) {
        console.log("DEBUG:", messageContent);
    }
};

/**
 * Main entry point for processing input and calculating a final value based on thresholds.
 * This function reads two lines of input:
 * 1. A space-separated list of four initial threshold values (numbers).
 * 2. A single target quantity (number).
 * It then applies adjustment rules to the thresholds and calculates a weighted sum.
 * @param {string} rawInputString - The raw string input, typically from stdin.
 */
function processCalculationRequest(rawInputString) {
    // Input validation: ensure the input is a non-empty string.
    if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Input data is empty or not a string. Processing halted.");
        return;
    }

    const parsedLines = rawInputString.trim().split('\n');

    // Ensure there are at least two lines for thresholds and the target quantity.
    if (parsedLines.length < 2) {
        console.error("Insufficient input lines. Expected at least two lines for processing.");
        return;
    }

    // Parse the initial threshold values from the first line.
    // Each string element is immediately converted to a number.
    const initialThresholds = parsedLines[0].split(' ').map(Number);

    // Validate parsed thresholds: check for non-numeric values or insufficient count.
    if (initialThresholds.some(isNaN) || initialThresholds.length < 4) {
        console.error("Invalid or incomplete numeric thresholds provided in the first line.");
        return;
    }

    // Apply specific adjustment rules to the thresholds.
    // Each subsequent threshold must be at least double the previous one.
    const adjustedThresholds = adjustThresholdValues(initialThresholds);
    // Destructure the adjusted values for clearer variable names.
    const [costA, costB, costC, costD] = adjustedThresholds;

    // Parse the target quantity from the second line.
    const totalQuantity = Number(parsedLines[1]);

    // Validate target quantity: ensure it's a valid non-negative number.
    if (isNaN(totalQuantity) || totalQuantity < 0) {
        console.error("Target quantity is not a valid non-negative number. Check second input line.");
        return;
    }

    // Calculate the number of pairs and any remaining single units.
    // Integer division for pairs.
    const numberOfPairs = Math.floor(totalQuantity / 2);
    // Modulo for the remainder (will be 0 or 1).
    const remainingSingleUnit = totalQuantity % 2;

    // Perform the final computation based on adjusted costs.
    // The logic is (pairs * highest_cost) + (single_unit_remainder * second_highest_cost).
    const finalComputedValue = (numberOfPairs * costD) + (remainingSingleUnit * costC);

    console.log(finalComputedValue);
}

/**
 * Adjusts an array of threshold values based on a doubling rule.
 * Each subsequent threshold must be at least double the previous one.
 * This ensures a non-decreasing, specific progression of values.
 * @param {number[]} initialValues - An array of four numeric thresholds.
 * @returns {number[]} The adjusted array of thresholds, ensuring the doubling rule.
 */
function adjustThresholdValues(initialValues) {
    // Use destructuring to get mutable copies of the values.
    let [t0, t1, t2, t3] = initialValues;

    // Apply the doubling rule iteratively.
    // Math.max ensures the value is at least double the preceding one.
    t1 = Math.max(t1, t0 * 2);
    t2 = Math.max(t2, t1 * 2);
    t3 = Math.max(t3, t2 * 2);

    return [t0, t1, t2, t3];
}

/**
 * Calculates the sum of all numeric elements in an array.
 * Non-numeric elements that can be converted to numbers (e.g., "5") are included.
 * If the input is not an array, it logs a warning and returns 0.
 * @param {Array<number|string>} numericalList - The array of numbers or numeric strings.
 * @returns {number} The total sum of the elements.
 */
function calculateArraySum(numericalList) {
    if (!Array.isArray(numericalList)) {
        conditionalDebugLog("Warning: 'calculateArraySum' received non-array input. Returning 0.");
        return 0;
    }
    // Use Array.prototype.reduce for a concise sum calculation.
    // The Number() constructor ensures proper type conversion for string numbers.
    return numericalList.reduce((currentSum, element) => currentSum + Number(element), 0);
}

const factorialCache = new Map(); // Cache for memoization

/**
 * Computes the factorial of a non-negative integer iteratively.
 * Uses memoization to store and retrieve previously calculated factorials, improving performance.
 * @param {number} inputNumber - The number for which to compute the factorial. Must be non-negative.
 * @returns {number} The factorial of the number, or NaN if input is negative.
 */
function computeFactorial(inputNumber) {
    if (inputNumber < 0) {
        conditionalDebugLog(`Attempted to compute factorial for a negative number: ${inputNumber}. Returning NaN.`);
        return NaN;
    }
    if (inputNumber === 0 || inputNumber === 1) {
        return 1; // Base cases for factorial.
    }
    // Check if the result is already in the cache.
    if (factorialCache.has(inputNumber)) {
        return factorialCache.get(inputNumber);
    }

    let result = 1;
    for (let i = 2; i <= inputNumber; i++) {
        result *= i;
    }
    // Store the computed result in the cache before returning.
    factorialCache.set(inputNumber, result);
    return result;
}

/**
 * Determines if a given number is prime.
 * Includes optimized checks for small numbers and uses the 6k ± 1 optimization for larger numbers.
 * Handles non-integer, negative, and small number edge cases.
 * @param {number} candidateNum - The number to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function checkPrimality(candidateNum) {
    // Guard clause for non-integers, numbers less than or equal to 1.
    if (!Number.isInteger(candidateNum) || candidateNum <= 1) {
        return false;
    }
    // Special cases for 2 and 3 (the first primes).
    if (candidateNum <= 3) {
        return true;
    }
    // Check divisibility by 2 and 3.
    if (candidateNum % 2 === 0 || candidateNum % 3 === 0) {
        return false;
    }
    // Optimized loop: check for divisors from 5 up to the square root of candidateNum.
    // We only need to check numbers of the form 6k ± 1.
    let limit = Math.floor(Math.sqrt(candidateNum));
    for (let i = 5; i <= limit; i += 6) {
        if (candidateNum % i === 0 || candidateNum % (i + 2) === 0) {
            return false;
        }
    }
    return true;
}

/**
 * Converts a 1D array of strings into a 2D array (matrix) of characters.
 * Each string in the input array is split into an array of its individual characters.
 * @param {string[]} stringCollection - An array of strings, where each string represents a row.
 * @returns {string[][]} A 2D array where each inner array contains characters of the original string.
 */
function convertStringsToCharMatrix(stringCollection) {
    if (!Array.isArray(stringCollection)) {
        conditionalDebugLog("Warning: 'convertStringsToCharMatrix' received non-array input. Returning empty array.");
        return [];
    }
    // Use Array.prototype.map to transform each string into a character array.
    return stringCollection.map(str => String(str).split(''));
}

/**
 * Finds the index of the maximum value in a numerical array.
 * If the array is empty or not an array, it returns -1.
 * @param {number[]} dataArray - The array of numbers to search.
 * @returns {number} The index of the maximum value, or -1 if the array is empty or invalid.
 */
function findIndexOfMaxValue(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return -1;
    }
    let currentMax = -Infinity; // Initialize with the smallest possible number.
    let maxFoundIndex = -1;

    // Use Array.prototype.forEach to iterate and find the maximum value and its index.
    dataArray.forEach((val, idx) => {
        if (val > currentMax) {
            currentMax = val;
            maxFoundIndex = idx;
        }
    });
    return maxFoundIndex;
}

/**
 * Finds the index of the minimum value in a numerical array.
 * If the array is empty or not an array, it returns -1.
 * @param {number[]} dataArray - The array of numbers to search.
 * @returns {number} The index of the minimum value, or -1 if the array is empty or invalid.
 */
function findIndexOfMinValue(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return -1;
    }
    let currentMin = Infinity; // Initialize with the largest possible number.
    let minFoundIndex = -1;

    // Standard for loop for iteration.
    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] < currentMin) {
            currentMin = dataArray[i];
            minFoundIndex = i;
        }
    }
    return minFoundIndex;
}

/**
 * Checks if a given string represents a valid non-negative integer.
 * This includes "0" and positive integers without leading zeros.
 * @param {string} textValue - The string to validate.
 * @returns {boolean} True if the string is a valid non-negative integer, false otherwise.
 */
function isValidNonNegativeIntegerString(textValue) {
    if (typeof textValue !== 'string') {
        return false;
    }
    // Regular expression to match non-negative integers:
    // ^(0|[1-9]\d*)$ matches "0" or any number starting with 1-9 followed by digits.
    const integerPattern = /^(0|[1-9]\d*)$/;
    return integerPattern.test(textValue);
}

/**
 * Performs prime factorization of a given positive integer.
 * Returns an object where keys are prime factors (as strings) and values are their counts (exponents).
 * Handles edge cases for 1 and invalid inputs.
 * @param {number} targetNumber - The positive integer to factorize.
 * @returns {Object<string, number>} An object mapping prime factors to their exponents.
 */
function performPrimeFactorization(targetNumber) {
    if (!Number.isInteger(targetNumber) || targetNumber <= 0) {
        conditionalDebugLog(`Invalid input for prime factorization: ${targetNumber}. Returning empty object.`);
        return {}; // Return empty object for invalid input.
    }
    if (targetNumber === 1) {
        return { "1": 1 }; // Special case: prime factors of 1 is just 1 itself with count 1.
    }

    const factorCounts = {};
    let tempNum = targetNumber; // Use a temporary variable to modify during factorization.

    // Handle factor 2: repeatedly divide by 2 until it's no longer even.
    while (tempNum % 2 === 0) {
        factorCounts["2"] = (factorCounts["2"] || 0) + 1; // Increment count for 2.
        tempNum /= 2;
    }

    // Handle odd factors from 3 up to the square root of the remaining number.
    // Increment by 2 to only check odd numbers.
    for (let i = 3; i * i <= tempNum; i += 2) {
        while (tempNum % i === 0) {
            factorCounts[String(i)] = (factorCounts[String(i)] || 0) + 1; // Increment count for current odd prime.
            tempNum /= i;
        }
    }

    // If tempNum is still greater than 1 after the loop, it means the remaining tempNum is a prime factor itself.
    if (tempNum > 1) {
        factorCounts[String(tempNum)] = (factorCounts[String(tempNum)] || 0) + 1;
    }

    return factorCounts;
}

/**
 * Calculates the greatest common divisor (GCD) of two non-negative integers using the Euclidean algorithm.
 * Performs input validation for integers and non-negativity.
 * @param {number} valX - The first non-negative integer.
 * @param {number} valY - The second non-negative integer.
 * @returns {number} The GCD of valX and valY. Returns 0 if inputs are invalid.
 */
function calculateGCD(valX, valY) {
    if (!Number.isInteger(valX) || !Number.isInteger(valY) || valX < 0 || valY < 0) {
        conditionalDebugLog(`Invalid input for GCD: (${valX}, ${valY}). Returning 0.`);
        return 0; // Or throw an error for invalid inputs.
    }
    // Base case of the Euclidean algorithm: if valY is 0, valX is the GCD.
    if (valY === 0) {
        return valX;
    }
    // Recursive step: GCD(a, b) = GCD(b, a % b).
    return calculateGCD(valY, valX % valY);
}

/**
 * Calculates the least common multiple (LCM) of two non-negative integers.
 * Uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {number} num1 - The first non-negative integer.
 * @param {number} num2 - The second non-negative integer.
 * @returns {number} The LCM of num1 and num2. Returns 0 if inputs are invalid or if either number is 0.
 */
function calculateLCM(num1, num2) {
    if (!Number.isInteger(num1) || !Number.isInteger(num2) || num1 < 0 || num2 < 0) {
        conditionalDebugLog(`Invalid input for LCM: (${num1}, ${num2}). Returning 0.`);
        return 0;
    }
    if (num1 === 0 || num2 === 0) {
        return 0; // The LCM of any number with zero is zero.
    }
    // Calculate LCM using the formula. Math.abs is used for robustness, though inputs are non-negative here.
    return Math.abs(num1 * num2) / calculateGCD(num1, num2);
}

/**
 * Compares two numbers for sorting purposes in ascending order.
 * This function is designed to be used as a comparator with Array.prototype.sort().
 * @param {number} a - The first number for comparison.
 * @param {number} b - The second number for comparison.
 * @returns {number} A negative value if a < b, zero if a == b, or a positive value if a > b.
 */
function compareAscending(a, b) {
    return a - b;
}

/**
 * Performs a binary search on a sorted array to find the index of the largest element
 * that is less than or equal to the target value.
 * If no such element exists (all elements are greater than target), it returns -1.
 * @param {number[]} orderedArray - The array of numbers, which must be sorted in ascending order.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the largest element <= targetValue, or -1 if no such element exists.
 */
function findLargestIndexLTE(orderedArray, targetValue) {
    if (!Array.isArray(orderedArray) || orderedArray.length === 0) {
        return -1; // Handle empty or invalid array.
    }

    let lowPointer = 0;
    let highPointer = orderedArray.length - 1;
    let resultIndex = -1; // This will store the best candidate index found so far.

    while (lowPointer <= highPointer) {
        const midPointer = Math.floor((lowPointer + highPointer) / 2);

        if (orderedArray[midPointer] <= targetValue) {
            resultIndex = midPointer; // This element satisfies the condition, store it.
            lowPointer = midPointer + 1; // Try to find an even larger one in the right half.
        } else {
            highPointer = midPointer - 1; // The current element is too large, search in the left half.
        }
    }
    return resultIndex;
}

/**
 * Splits a multi-line string into an array of individual lines.
 * @param {string} multiLineText - The input string potentially containing newline characters.
 * @returns {string[]} An array of strings, where each element represents a line from the input.
 */
function splitTextIntoLines(multiLineText) {
    if (typeof multiLineText !== 'string') {
        conditionalDebugLog("Warning: 'splitTextIntoLines' received non-string input. Returning empty array.");
        return [];
    }
    return multiLineText.split('\n');
}

/**
 * Checks if an array of numbers is sorted in ascending order.
 * An empty array or an array with a single element is considered sorted.
 * @param {number[]} numericSequence - The array of numbers to check.
 * @returns {boolean} True if the array is sorted ascending, false otherwise.
 */
function isArraySortedAscending(numericSequence) {
    if (!Array.isArray(numericSequence) || numericSequence.length <= 1) {
        return true; // Empty or single-element arrays are inherently sorted.
    }
    // Use Array.prototype.every for a concise check.
    // It returns true if the callback returns true for all elements.
    return numericSequence.every((val, idx, arr) => idx === 0 || val >= arr[idx - 1]);
}

/**
 * Generates a lexicographical rank (or index) for a given permutation.
 * This function assumes the input 'permutation' is a sequence of unique integers
 * representing a permutation of numbers from 1 to `totalElements`.
 * The rank is 0-indexed.
 * @param {number[]} permutation - The permutation sequence (e.g., [3, 1, 2]).
 * @param {number} totalElements - The total number of elements in the original set (e.g., 3 for [1,2,3]).
 * @returns {number} The 0-indexed lexicographical rank of the permutation, or -1 if input is invalid.
 */
function calculatePermutationLexicographicalIndex(permutation, totalElements) {
    if (!Array.isArray(permutation) || permutation.length === 0 || totalElements <= 0 || permutation.length > totalElements) {
        conditionalDebugLog("Invalid input for calculatePermutationLexicographicalIndex. Returning -1.");
        return -1;
    }

    // Create an array of available elements (e.g., [1, 2, 3] for totalElements = 3).
    let remainingElements = Array.from({ length: totalElements }, (_, i) => i + 1);
    let currentRank = 0;

    for (let i = 0; i < permutation.length; i++) {
        const currentDigit = permutation[i];
        const indexInRemaining = remainingElements.indexOf(currentDigit);

        // Validate if the digit is valid and unique in the remaining elements.
        if (indexInRemaining === -1) {
            conditionalDebugLog(`Error: Element ${currentDigit} not found or duplicated in permutation. Returning -1.`);
            return -1;
        }

        // Add (number of smaller elements * factorial of remaining positions) to the rank.
        currentRank += indexInRemaining * computeFactorial(permutation.length - 1 - i);

        // Remove the chosen digit from the available elements to avoid re-using it.
        remainingElements.splice(indexInRemaining, 1);
    }
    return currentRank;
}

/**
 * Rotates a 2D matrix (array of arrays) 90 degrees clockwise.
 * Assumes a rectangular matrix where all inner arrays have the same length.
 * @param {Array<Array<any>>} originalMatrix - The matrix to rotate.
 * @returns {Array<Array<any>>} The new, rotated matrix. Returns empty array for invalid input.
 */
function rotateMatrixClockwise(originalMatrix) {
    if (!Array.isArray(originalMatrix) || originalMatrix.length === 0 || !Array.isArray(originalMatrix[0])) {
        conditionalDebugLog("Invalid input for rotateMatrixClockwise. Returning empty array.");
        return [];
    }

    const numRows = originalMatrix.length;
    const numCols = originalMatrix[0].length;

    // Create a new matrix with swapped dimensions (columns become rows, rows become columns).
    const rotatedMatrix = Array.from({ length: numCols }, () => Array(numRows));

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            // The element at (r, c) in the original matrix moves to (c, numRows - 1 - r) in the rotated matrix.
            rotatedMatrix[c][numRows - 1 - r] = originalMatrix[r][c];
        }
    }
    return rotatedMatrix;
}

/**
 * Inserts a sub-array (slice) into a target array starting at a specified index, overwriting existing elements.
 * This modifies the target array in place.
 * @param {Array<any>} targetArr - The array to modify.
 * @param {Array<any>} sourceSlice - The sub-array to insert.
 * @param {number} startIdx - The 0-based starting index in the target array for insertion.
 * @returns {Array<any>} The modified target array.
 */
function insertSubarrayAt(targetArr, sourceSlice, startIdx) {
    if (!Array.isArray(targetArr) || !Array.isArray(sourceSlice)) {
        conditionalDebugLog("Invalid array input for insertSubarrayAt. Returning original target array.");
        return targetArr;
    }
    // Validate the starting index.
    if (startIdx < 0 || startIdx > targetArr.length) { // Allow insertion at `targetArr.length` (append).
        conditionalDebugLog(`Start index ${startIdx} out of valid bounds for insertSubarrayAt. Returning original target array.`);
        return targetArr;
    }

    // Use Array.prototype.splice to remove elements and insert new ones.
    // It removes `sourceSlice.length` elements starting from `startIdx`, then inserts all elements from `sourceSlice`.
    targetArr.splice(startIdx, sourceSlice.length, ...sourceSlice);
    return targetArr;
}

/**
 * Reverses a specified segment of an array in place.
 * The segment is defined by 1-based start and end indices, inclusive.
 * @param {Array<any>} dataArr - The array to modify.
 * @param {number} segmentStartOneBased - The 1-based start index of the segment.
 * @param {number} segmentEndOneBased - The 1-based end index of the segment.
 * @returns {Array<any>} The array with the reversed segment. Returns original array for invalid inputs.
 */
function reverseArraySegment(dataArr, segmentStartOneBased, segmentEndOneBased) {
    if (!Array.isArray(dataArr) || dataArr.length === 0) {
        conditionalDebugLog("Invalid array input for reverseArraySegment. Returning original array.");
        return dataArr;
    }

    // Convert 1-based indices to 0-based indices.
    const startIdx = segmentStartOneBased - 1;
    const endIdx = segmentEndOneBased - 1;

    // Validate indices to ensure they are within bounds and form a valid segment.
    if (startIdx < 0 || endIdx >= dataArr.length || startIdx > endIdx) {
        conditionalDebugLog(`Invalid segment indices for reverseArraySegment: [${segmentStartOneBased}, ${segmentEndOneBased}]. Returning original array.`);
        return dataArr;
    }

    // Extract the segment, reverse it, and then insert it back into the original array.
    const segmentToReverse = dataArr.slice(startIdx, endIdx + 1);
    segmentToReverse.reverse();

    // Replace the original segment with the reversed one using splice.
    dataArr.splice(startIdx, segmentToReverse.length, ...segmentToReverse);

    return dataArr;
}

/**
 * Pads a number or string with leading zeros to reach a specified total length.
 * @param {number|string} valueToPad - The number or string to pad.
 * @param {number} totalLength - The desired total length of the resulting string.
 * @returns {string} The zero-padded string. Returns original string representation for invalid input.
 */
function padNumberWithLeadingZeros(valueToPad, totalLength) {
    // Convert number to string if necessary.
    if (typeof valueToPad === 'number') {
        valueToPad = String(valueToPad);
    }
    if (typeof valueToPad !== 'string' || totalLength < 0) {
        conditionalDebugLog("Invalid input for padNumberWithLeadingZeros. Returning string representation of value.");
        return String(valueToPad);
    }
    // Use String.prototype.padStart for a clean and efficient padding.
    return valueToPad.padStart(totalLength, '0');
}

/**
 * Simple identity function, does nothing but return its input.
 * Can be used as a placeholder or for functional programming examples.
 * @param {any} value - Any value.
 * @returns {any} The input value.
 */
function identity(value) {
    return value;
}

/**
 * Creates a range of numbers, inclusive of start and end.
 * @param {number} start - The starting number (inclusive).
 * @param {number} end - The ending number (inclusive).
 * @returns {number[]} An array of numbers from start to end. Returns empty array for invalid input.
 */
function createNumericRange(start, end) {
    if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
        conditionalDebugLog("Invalid range specified for createNumericRange. Returning empty array.");
        return [];
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// This part reads input from stdin and passes it to the main processing function.
// It's typically the last part of a script for competitive programming challenges.
processCalculationRequest(require("fs").readFileSync("/dev/stdin", "utf8").trim());