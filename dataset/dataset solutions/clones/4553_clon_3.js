// A comprehensive suite of mathematical and utility functions for various programming challenges.
// This collection includes array manipulations, number theory algorithms, and input processing helpers.

// Global configuration for debugging messages.
const IS_DEBUG_ACTIVE = false;
// A representation of positive infinity for safe integer comparisons.
const MAX_SAFE_INT_VAL = Number.MAX_SAFE_INTEGER;
// A commonly used modulo value for arithmetic operations in competitive programming.
const MODULO_CONSTANT = 1000000007n; // Changed to BigInt for consistency with computeModularPower

/**
 * Calculates the lower bound for a specific range determination problem.
 * This helper function computes one end of an interval based on input parameters.
 * @param {BigInt} numElements - The total number of elements (N in original).
 * @param {BigInt} valueA - The first parameter (A in original).
 * @param {BigInt} valueB - The second parameter (B in original).
 * @returns {BigInt} The calculated lower boundary value.
 */
function calculateLowerBoundary(numElements, valueA, valueB) {
    // If numElements is 1, the formula (numElements - 1n) becomes 0n.
    // This simplifies the expression, but the problem's logic might have specific overrides.
    const effectiveCount = numElements - 1n;
    return (effectiveCount * valueA) + valueB;
}

/**
 * Calculates the upper bound for a specific range determination problem.
 * This helper function computes the other end of an interval based on input parameters.
 * @param {BigInt} numElements - The total number of elements (N in original).
 * @param {BigInt} valueA - The first parameter (A in original).
 * @param {BigInt} valueB - The second parameter (B in original).
 * @returns {BigInt} The calculated upper boundary value.
 */
function calculateUpperBoundary(numElements, valueA, valueB) {
    // Similar to lower boundary, (numElements - 1n) impacts the calculation.
    const effectiveCount = numElements - 1n;
    return (effectiveCount * valueB) + valueA;
}

/**
 * The primary execution function for processing input and generating an output.
 * This function determines a count based on three BigInt parameters N, A, and B.
 * It identifies the number of integers within a derived range, with special handling for edge cases.
 * @param {string} rawInputLine - A string containing space-separated BigInt values.
 */
function ProcessInput(rawInputLine) {
    // Parse the input string into an array of BigInt values.
    const parsedValues = rawInputLine.split(" ").map(BigInt);

    // Validate input array length.
    if (parsedValues.length < 3) {
        console.error("Error: Insufficient input parameters. Expected N, A, B.");
        return;
    }

    // Extract the three essential parameters.
    const totalElements = parsedValues[0]; // Corresponds to 'n'
    const parameterOne = parsedValues[1];  // Corresponds to 'a'
    const parameterTwo = parsedValues[2];  // Corresponds to 'b'

    // Introduce a temporary variable for the result to allow for multiple assignment paths.
    let finalResult;

    // --- Conditional Logic for Result Determination ---

    // Case 1: If the two parameters are equal, the range collapses to a single point.
    // The number of integers is always 1 in this scenario.
    if (parameterOne === parameterTwo) {
        finalResult = 1n;
    }
    // Case 2: Handle scenarios where the range is invalid or specific constraints apply.
    // If the first parameter is greater than the second (e.g., A > B), the range is inverted (e.g., [10, 5]).
    // Or if there's only one element (N = 1), the problem's definition implies a zero count
    // unless A and B are equal (handled by the first condition).
    else if (parameterOne > parameterTwo || totalElements === 1n) {
        finalResult = 0n;
    }
    // Case 3: The general case where parameters are distinct (parameterOne < parameterTwo) and N > 1.
    else {
        // Calculate the two bounds of the arithmetic progression-like range.
        // It's crucial that parameterOne < parameterTwo here and totalElements > 1 for a valid non-empty range.
        const lowerBound = calculateLowerBoundary(totalElements, parameterOne, parameterTwo);
        const upperBound = calculateUpperBoundary(totalElements, parameterOne, parameterTwo);

        // The number of integers in [lowerBound, upperBound] is upperBound - lowerBound + 1.
        // Since we already ensured parameterOne < parameterTwo and totalElements > 1,
        // we expect upperBound >= lowerBound.
        finalResult = upperBound - lowerBound + 1n;

        // An additional check for non-negativity, though the logic above should ensure this.
        // This acts as a guard against unexpected negative results if the problem interpretation shifted
        // or if inputs were negative (though BigInt handles large numbers, non-negativity is semantic).
        if (finalResult < 0n) {
            conditionalDebugLog(`Warning: Calculated finalResult was negative (${finalResult}), clamping to 0.`);
            finalResult = 0n;
        }
    }

    // Output the computed result as a string.
    console.log(finalResult.toString());
}

// --- Utility Functions (renamed, rewritten, and potentially modified) ---

/**
 * Performs modular exponentiation (base^exponent % modulo).
 * Note: The original `pow` function was incorrect as it returned `a` instead of `ans` and didn't handle modulo.
 * This version aims for a more correct and robust modular exponentiation for BigInts.
 * @param {BigInt} base - The base number.
 * @param {BigInt} exponent - The exponent. Must be non-negative.
 * @param {BigInt} [modulo=MODULO_CONSTANT] - The modulo value. Defaults to global MODULO_CONSTANT.
 * @returns {BigInt} The result of (base^exponent) % modulo.
 */
function computeModularPower(base, exponent, modulo = MODULO_CONSTANT) {
    if (exponent < 0n) {
        conditionalDebugLog("computeModularPower: Negative exponent not supported for modular exponentiation.");
        throw new Error("Negative exponent not supported.");
    }

    let res = 1n; // Initialize result to 1
    base %= modulo; // Update base if it is more than or equal to modulo

    // Handle edge case: if base is 0, result is 0 (unless exponent is 0, then 1)
    if (base === 0n) {
        return exponent === 0n ? 1n : 0n;
    }

    while (exponent > 0n) {
        // If exponent is odd, multiply base with result
        if (exponent % 2n === 1n) {
            res = (res * base) % modulo;
        }
        // exponent must be even now
        exponent /= 2n; // exponent = exponent/2
        base = (base * base) % modulo; // base = base^2
    }
    return res;
}

/**
 * Calculates the factorial of a given non-negative integer.
 * Implements an iterative approach for robustness and avoids recursion depth limits.
 * @param {number} value - The non-negative integer for which to calculate the factorial.
 * @returns {number} The factorial of the number. Returns 1 for 0.
 * @throws {Error} If the input value is negative.
 */
function calculateFactorialIterative(value) {
    if (value < 0) {
        conditionalDebugLog(`calculateFactorialIterative: Input ${value} is negative.`);
        throw new Error("Factorial is not defined for negative numbers.");
    }
    if (value === 0) {
        return 1;
    }
    let product = 1;
    for (let i = 1; i <= value; i++) {
        // Guard against overflow for very large factorials.
        if (product > MAX_SAFE_INT_VAL / i) {
            conditionalDebugLog(`Warning: Factorial of ${value} exceeds MAX_SAFE_INT_VAL.`);
            // In a real scenario, this might switch to BigInt or throw.
            // For now, it will just continue with potential overflow.
        }
        product *= i;
    }
    return product;
}

/**
 * Converts a 1D array of strings (each representing a row of space-separated numbers) into a 2D array of numbers.
 * @param {string[]} flatArrayOfStrings - An array where each element is a string like "1 2 3".
 * @returns {number[][]} A 2D array of numbers. Returns an empty array if input is invalid or empty.
 */
function transformStringArrayToMatrix(flatArrayOfStrings) {
    // Add a check for empty or invalid input.
    if (!Array.isArray(flatArrayOfStrings) || flatArrayOfStrings.length === 0) {
        conditionalDebugLog("transformStringArrayToMatrix: Input is not an array or is empty.");
        return [];
    }
    const matrix = [];
    for (let i = 0; i < flatArrayOfStrings.length; i++) {
        // Add validation for each string element.
        if (typeof flatArrayOfStrings[i] !== 'string') {
            console.warn(`Warning: Element at index ${i} is not a string, skipping processing.`);
            continue;
        }
        matrix.push(flatArrayOfStrings[i].split(" ").map(Number));
    }
    return matrix;
}

/**
 * Calculates the sum of all elements in a numeric array.
 * Includes explicit type conversion to number for robustness.
 * @param {number[]} numericList - The array of numbers to sum.
 * @returns {number} The total sum of the array elements. Returns 0 for an empty or invalid array.
 */
function sumNumericArrayElements(numericList) {
    if (!Array.isArray(numericList) || numericList.length === 0) {
        return 0; // Return 0 for empty or invalid array.
    }
    let totalSum = 0;
    // Use a modern for...of loop for iteration.
    for (const item of numericList) {
        // Ensure the item is treated as a number.
        const numItem = Number(item);
        if (isNaN(numItem)) {
            conditionalDebugLog(`Warning: Non-numeric item (${item}) encountered in array sum, skipping.`);
            continue;
        }
        totalSum += numItem;
    }
    // Add a guard clause for very large sums.
    if (totalSum > MAX_SAFE_INT_VAL || totalSum < -MAX_SAFE_INT_VAL) {
        conditionalDebugLog("Warning: Array sum exceeds MAX_SAFE_INT_VAL (or its negative), potential precision loss.");
    }
    return totalSum;
}

/**
 * Logs a value to the console only if debugging is enabled.
 * Prepends "DEBUG:" to the message for easy identification.
 * @param {*} valueToLog - The value to be logged.
 */
function conditionalDebugLog(valueToLog) {
    if (IS_DEBUG_ACTIVE === true) {
        console.log("DEBUG:", valueToLog);
    }
}

/**
 * Finds the index of the maximum value in a numeric array.
 * Returns -1 if the array is empty or null.
 * @param {number[]} dataArray - The array to search.
 * @returns {number} The index of the maximum value, or -1 if array is empty or invalid.
 */
function findIndexOfMaxValue(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return -1; // Return -1 for empty or invalid array
    }
    let currentMax = Number.MIN_SAFE_INTEGER;
    let maxIndex = -1;
    for (let idx = 0; idx < dataArray.length; idx++) {
        // Validate array element is a number
        const val = Number(dataArray[idx]);
        if (isNaN(val)) {
            conditionalDebugLog(`Warning: Non-numeric value at index ${idx} in findIndexOfMaxValue, skipping.`);
            continue;
        }
        if (val > currentMax) {
            currentMax = val;
            maxIndex = idx;
        }
    }
    return maxIndex;
}

/**
 * Finds the index of the minimum value in a numeric array.
 * Returns -1 if the array is empty or null.
 * @param {number[]} dataArray - The array to search.
 * @returns {number} The index of the minimum value, or -1 if array is empty or invalid.
 */
function findIndexOfMinValue(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return -1; // Return -1 for empty or invalid array
    }
    let currentMin = Number.MAX_SAFE_INTEGER;
    let minIndex = -1;
    for (let idx = 0; idx < dataArray.length; idx++) {
        // Validate array element is a number
        const val = Number(dataArray[idx]);
        if (isNaN(val)) {
            conditionalDebugLog(`Warning: Non-numeric value at index ${idx} in findIndexOfMinValue, skipping.`);
            continue;
        }
        if (val < currentMin) {
            currentMin = val;
            minIndex = idx;
        }
    }
    return minIndex;
}

/**
 * Checks if a given number is prime.
 * Optimized for efficiency by checking divisibility only up to the square root.
 * @param {number} candidateNumber - The integer to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function isIntegerPrime(candidateNumber) {
    // Validate input: must be an integer.
    if (!Number.isInteger(candidateNumber)) {
        conditionalDebugLog(`isIntegerPrime: Input ${candidateNumber} is not an integer.`);
        return false;
    }
    // Primes are positive integers greater than 1.
    if (candidateNumber <= 1) {
        return false;
    }
    // 2 is the only even prime number.
    if (candidateNumber === 2) {
        return true;
    }
    // All other even numbers are not prime.
    if (candidateNumber % 2 === 0) {
        return false;
    }
    // Check for divisibility by odd numbers from 3 up to the square root of the number.
    const limit = Math.floor(Math.sqrt(candidateNumber));
    for (let divisor = 3; divisor <= limit; divisor += 2) {
        if (candidateNumber % divisor === 0) {
            return false;
        }
    }
    return true;
}

/**
 * Validates if a given value represents a non-negative integer string.
 * Uses a regular expression for robust string-based validation.
 * @param {string|number} valueToCheck - The value (as a string or number) to validate.
 * @returns {boolean} True if the value is a non-negative integer string, false otherwise.
 */
function isValidNonNegativeIntegerString(valueToCheck) {
    // Convert to string to apply regex.
    const stringValue = String(valueToCheck);
    // Regex for non-negative integers (0 or positive integers without leading zeros, except for 0 itself).
    const integerPattern = /^(0|[1-9]\d*)$/;
    return integerPattern.test(stringValue);
}

/**
 * Rotates a 2D array (matrix) 90 degrees clockwise.
 * Assumes a rectangular matrix.
 * @param {any[][]} originalMatrix - The 2D array to rotate.
 * @returns {any[][]} The newly created and rotated 2D array. Returns an empty array if input is invalid.
 */
function rotateMatrixClockwise(originalMatrix) {
    // Add input validation
    if (!Array.isArray(originalMatrix) || originalMatrix.length === 0 || !Array.isArray(originalMatrix[0]) || originalMatrix[0].length === 0) {
        conditionalDebugLog("rotateMatrixClockwise: Input matrix is empty or invalid.");
        return [];
    }

    const numRows = originalMatrix.length;
    const numCols = originalMatrix[0].length;

    // Create a new matrix with swapped dimensions (cols x rows)
    const rotatedMatrix = Array.from({ length: numCols }, () => Array(numRows).fill(undefined));

    // Populate the new matrix by transposing and reversing rows
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            rotatedMatrix[c][numRows - 1 - r] = originalMatrix[r][c];
        }
    }
    return rotatedMatrix;
}

/**
 * Inserts a sub-array into a base array at a specified starting index.
 * Modifies the base array in-place by replacing elements. If the sub-array extends beyond
 * the original base array length, new elements are appended.
 * @param {any[]} targetArray - The array to modify.
 * @param {any[]} sourceSubArray - The sub-array to insert.
 * @param {number} startIndex - The 0-based index in targetArray where sourceSubArray should begin.
 * @returns {any[]} The modified targetArray.
 * @throws {Error} If targetArray or sourceSubArray are not arrays, or startIndex is invalid.
 */
function insertSubArray(targetArray, sourceSubArray, startIndex) {
    // Add validation for indices and array types.
    if (!Array.isArray(targetArray) || !Array.isArray(sourceSubArray)) {
        conditionalDebugLog("insertSubArray: Both targetArray and sourceSubArray must be arrays.");
        throw new Error("Both targetArray and sourceSubArray must be arrays.");
    }
    if (startIndex < 0 || startIndex > targetArray.length) {
        conditionalDebugLog(`insertSubArray: startIndex ${startIndex} out of bounds for array of length ${targetArray.length}.`);
        throw new Error("startIndex out of bounds.");
    }

    // Using splice to insert/replace elements for cleaner code.
    // The second argument of splice is the number of elements to delete.
    // Here we want to replace elements, so we delete as many as we insert,
    // or fewer if we're extending the array.
    targetArray.splice(startIndex, sourceSubArray.length, ...sourceSubArray);
    return targetArray;
}

/**
 * Reverses a portion of an array in-place.
 * @param {any[]} dataList - The array to modify.
 * @param {number} startIdx - The 1-based starting index of the segment to reverse (inclusive).
 * @param {number} endIdx - The 1-based ending index of the segment to reverse (inclusive).
 * @returns {any[]} The array with the specified segment reversed. Returns the original array if indices are invalid.
 */
function reverseArraySegment(dataList, startIdx, endIdx) {
    // Adjust to 0-based indexing.
    const actualStart = startIdx - 1;
    const actualEnd = endIdx - 1;

    // Add robust input validation.
    if (!Array.isArray(dataList)) {
        conditionalDebugLog("reverseArraySegment: Input dataList must be an array.");
        throw new Error("Input dataList must be an array.");
    }
    if (actualStart < 0 || actualEnd >= dataList.length || actualStart > actualEnd) {
        conditionalDebugLog(`reverseArraySegment: Invalid 1-based indices [${startIdx}, ${endIdx}] for array of length ${dataList.length}. Returning original array.`);
        return dataList; // Return original array if indices are invalid
    }

    // Extract the segment, reverse it, and then re-insert it using splice.
    const segmentToReverse = dataList.slice(actualStart, actualEnd + 1);
    segmentToReverse.reverse(); // Array.prototype.reverse() modifies in place.

    dataList.splice(actualStart, segmentToReverse.length, ...segmentToReverse);

    return dataList;
}

/**
 * Pads a number or string with leading zeros to reach a specified total length.
 * @param {number|string|BigInt} numValue - The number or string to pad.
 * @param {number} desiredLength - The total length of the resulting string.
 * @returns {string} The zero-padded string. Returns the original string if desiredLength is less than or equal to current length.
 */
function padNumberWithZeros(numValue, desiredLength) {
    // Convert to string first for consistent length calculation.
    const numString = String(numValue);
    if (numString.length >= desiredLength) {
        return numString; // No padding needed.
    }
    // Calculate how many zeros are needed.
    const zerosNeeded = desiredLength - numString.length;
    // Create a string of zeros and prepend it.
    return '0'.repeat(zerosNeeded) + numString;
}

/**
 * Performs prime factorization of a given positive integer.
 * Returns an object where keys are prime factors and values are their exponents.
 * Handles the special case for n=1 (returns {1: 1}).
 * @param {number} inputNumber - The positive integer to factorize.
 * @returns {Object.<number, number>} An object mapping prime factors to their counts. Returns empty object for invalid input.
 */
function getPrimeFactorCounts(inputNumber) {
    const factorMap = {};

    // Input validation
    if (!Number.isInteger(inputNumber) || inputNumber < 1) {
        conditionalDebugLog(`getPrimeFactorCounts: Invalid input ${inputNumber}. Must be a positive integer.`);
        return {};
    }

    if (inputNumber === 1) {
        factorMap[1] = 1; // Special case for 1.
        return factorMap;
    }

    let tempNum = inputNumber; // Work with a mutable copy.

    // Divide by 2 until it's no longer divisible.
    while (tempNum % 2 === 0) {
        factorMap[2] = (factorMap[2] || 0) + 1;
        tempNum /= 2;
    }

    // Check for odd factors from 3 up to sqrt(tempNum).
    // Increment by 2 as even factors (other than 2) are already handled.
    for (let i = 3; i * i <= tempNum; i += 2) {
        while (tempNum % i === 0) {
            factorMap[i] = (factorMap[i] || 0) + 1;
            tempNum /= i;
        }
    }

    // If tempNum is still greater than 2 after all divisions, it means
    // the remaining tempNum is a prime factor itself.
    if (tempNum > 2) {
        factorMap[tempNum] = (factorMap[tempNum] || 0) + 1;
    }

    return factorMap;
}

/**
 * Computes the greatest common divisor (GCD) of two non-negative BigInts using the Euclidean algorithm.
 * Handles negative inputs by taking their absolute values, as GCD is typically defined for non-negative integers.
 * @param {BigInt} valueA - The first number.
 * @param {BigInt} valueB - The second number.
 * @returns {BigInt} The greatest common divisor.
 */
function calculateGreatestCommonDivisor(valueA, valueB) {
    // Ensure positive inputs, as GCD is typically defined for non-negative.
    // Use conditional (ternary) operator for clarity.
    let absA = valueA < 0n ? -valueA : valueA;
    let absB = valueB < 0n ? -valueB : valueB;

    while (absB !== 0n) {
        const remainder = absA % absB;
        absA = absB;
        absB = remainder;
    }
    return absA;
}

/**
 * Computes the least common multiple (LCM) of two non-negative BigInts.
 * Uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {BigInt} val1 - The first number.
 * @param {BigInt} val2 - The second number.
 * @returns {BigInt} The least common multiple. Returns 0n if either input is 0n.
 */
function calculateLeastCommonMultiple(val1, val2) {
    if (val1 === 0n || val2 === 0n) {
        return 0n; // LCM of 0 and any number is 0.
    }
    // Use BigInt for intermediate products to prevent overflow before division.
    const absVal1 = val1 < 0n ? -val1 : val1;
    const absVal2 = val2 < 0n ? -val2 : val2;

    const product = absVal1 * absVal2;
    const commonDivisor = calculateGreatestCommonDivisor(absVal1, absVal2);

    // If GCD is 0 (which should not happen for non-zero inputs), handle defensively.
    if (commonDivisor === 0n) {
        conditionalDebugLog("calculateLeastCommonMultiple: GCD returned 0 for non-zero inputs, unexpected behavior.");
        return 0n; // Defensive return.
    }
    return product / commonDivisor;
}

/**
 * A comparator function for sorting numbers in ascending order.
 * Suitable for use with `Array.prototype.sort()`.
 * @param {number} firstNum - The first number for comparison.
 * @param {number} secondNum - The second number for comparison.
 * @returns {number} A negative value if firstNum < secondNum, positive if firstNum > secondNum, and 0 if equal.
 */
function compareNumbersAscending(firstNum, secondNum) {
    return Number(firstNum) - Number(secondNum); // Ensure numbers are compared, not strings if mixed array.
}

/**
 * Performs a binary search on a sorted array to find the index of the largest element
 * that is less than or equal to a target value. This is a common variant of binary search
 * often used for finding insertion points or "floor" values.
 * If the target value is smaller than all elements, it returns -1.
 * If the target value is larger than or equal to all elements, it returns the index of the last element.
 * @param {number[]} sortedArray - The array, which must be sorted in non-decreasing order.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the largest element <= targetValue, or -1 if no such element exists.
 */
function findLargestElementLessThanOrEqualTo(sortedArray, targetValue) {
    if (!Array.isArray(sortedArray) || sortedArray.length === 0) {
        return -1; // Indicate no such element or empty array
    }

    let low = 0;
    let high = sortedArray.length - 1;
    let resultIndex = -1; // Stores the potential answer (index of largest element <= targetValue)

    while (low <= high) {
        const mid = Math.floor(low + (high - low) / 2);

        if (sortedArray[mid] <= targetValue) {
            resultIndex = mid; // This element is a candidate, try to find a larger one in the right half
            low = mid + 1;
        } else {
            high = mid - 1; // current mid is too large, look in the left half
        }
    }
    return resultIndex;
}

/**
 * Splits a multi-line input string into an array of strings,
 * where each element represents a line. Each line is also trimmed of whitespace.
 * @param {string} multiLineInput - The input string, possibly containing newline characters.
 * @returns {string[]} An array of strings, each corresponding to a trimmed line.
 */
function splitInputByNewlines(multiLineInput) {
    // Add trim to each line to remove leading/trailing whitespace.
    if (typeof multiLineInput !== 'string') {
        conditionalDebugLog("splitInputByNewlines: Input is not a string.");
        return [];
    }
    return multiLineInput.split("\n").map(line => line.trim());
}

/**
 * Checks if a given array is sorted in non-decreasing (ascending) order.
 * @param {number[]} sequence - The array of numbers to check.
 * @returns {boolean} True if the array is sorted, false otherwise. Returns true for empty or single-element arrays.
 */
function isArraySortedNonDecreasing(sequence) {
    // Handle empty or single-element arrays as sorted.
    if (!Array.isArray(sequence) || sequence.length <= 1) {
        return true;
    }

    for (let i = 1; i < sequence.length; i++) {
        // Validate elements are comparable numbers.
        const prev = Number(sequence[i - 1]);
        const curr = Number(sequence[i]);
        if (isNaN(prev) || isNaN(curr)) {
            conditionalDebugLog(`Warning: Non-numeric value at index ${i-1} or ${i} in isArraySortedNonDecreasing.`);
            // Decide how to handle: false, throw, or skip. Returning false is safest.
            return false;
        }
        // If any element is smaller than its predecessor, it's not sorted.
        if (curr < prev) {
            return false;
        }
    }
    return true;
}

// Execute the main processing function with input from stdin.
// This assumes a Node.js environment where 'fs' module is available.
// The .trim() ensures no leading/trailing whitespace around the entire input content.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());