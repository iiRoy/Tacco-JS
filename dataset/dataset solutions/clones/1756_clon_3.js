// This file provides a collection of JavaScript utility functions.
// It includes functionalities ranging from array manipulation to mathematical operations.

// --- Global Configuration and Constants ---
const VERBOSE_LOGGING_ENABLED = false; // Set to true for detailed console output
const MAXIMUM_SAFE_INTEGER_VALUE = Number.MAX_SAFE_INTEGER; // Largest integer JavaScript can reliably represent
const DEFAULT_PRIME_MODULUS = 1000000007; // A common large prime number used in modular arithmetic

/**
 * Main execution entry point for processing input data from standard input.
 * Reads a multi-line string, parses numerical data, performs an XOR-based transformation,
 * and outputs the space-separated results to the console.
 *
 * @param {string} rawInputString - The complete raw string received from standard input.
 */
function processInputData(rawInputString) {
    // Input validation: Ensure the raw input is a non-empty string.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        logIfVerbose("Error: Input string for processing is invalid or empty.");
        console.error("Input data is missing or malformed. Cannot proceed.");
        return;
    }

    // Split the input into individual lines and remove any leading/trailing whitespace.
    const inputLines = rawInputString.trim().split("\n");

    // Expect at least two lines: one for metadata (ignored here) and one for the numbers.
    if (inputLines.length < 2) {
        logIfVerbose(`Insufficient input lines received: ${inputLines.length}. Expected at least 2.`);
        console.error("Not enough data lines to process. Please check input format.");
        return;
    }

    // Attempt to parse the second line, which contains space-separated numbers.
    let numericalValues;
    try {
        numericalValues = inputLines[1].split(" ").map(str => {
            const parsedNum = Number(str);
            // Validate that each part successfully converts to a number.
            if (isNaN(parsedNum)) {
                throw new Error(`Non-numeric token encountered: "${str}"`);
            }
            return parsedNum;
        });
    } catch (parseError) {
        logIfVerbose(`Detailed parsing error: ${parseError.message}`);
        console.error(`Failed to parse numerical values from input line: ${parseError.message}`);
        return;
    }

    // Handle case where the numerical line is empty or contains no valid numbers.
    if (numericalValues.length === 0) {
        console.log(""); // Output an empty line as there are no results.
        return;
    }

    // Calculate the cumulative XOR sum of all numbers in the array.
    let xorAccumulator = 0;
    for (const currentVal of numericalValues) {
        xorAccumulator ^= currentVal;
    }

    // Transform each original number by XORing it with the total XOR sum.
    // This creates a new array of transformed values.
    const transformedResults = numericalValues.map(originalVal => xorAccumulator ^ originalVal);

    // Join the transformed numbers with spaces and print the final result.
    console.log(transformedResults.join(" "));
}

/**
 * Calculates the power of a base number raised to an exponent using BigInts
 * to support large numbers without precision loss. Uses binary exponentiation.
 *
 * @param {bigint} baseNum - The base number (must be a BigInt).
 * @param {bigint} exponent - The exponent (must be a non-negative BigInt).
 * @returns {bigint} The result of baseNum raised to the power of exponent.
 * @throws {Error} If inputs are not BigInts or if the exponent is negative.
 */
function calculatePower(baseNum, exponent) {
    // Type validation for BigInt inputs.
    if (typeof baseNum !== 'bigint' || typeof exponent !== 'bigint') {
        throw new Error("Inputs for calculatePower must both be of type BigInt.");
    }
    // Exponent must be non-negative for standard integer power calculation.
    if (exponent < 0n) {
        throw new Error("Exponent for BigInt power calculation must be a non-negative BigInt.");
    }
    if (exponent === 0n) {
        return 1n; // Any number raised to the power of zero is 1.
    }
    if (baseNum === 0n) {
        return 0n; // Zero raised to any positive power is zero.
    }

    let result = 1n;
    let currentBase = baseNum;
    let currentExponent = exponent;

    // Implementing exponentiation by squaring (binary exponentiation) for efficiency.
    while (currentExponent > 0n) {
        // If the current exponent bit is 1 (odd exponent)
        if (currentExponent % 2n === 1n) {
            result *= currentBase; // Multiply result by current base
        }
        currentBase *= currentBase; // Square the base
        currentExponent /= 2n; // Halve the exponent
    }
    return result;
}

/**
 * Computes the lexicographical rank (0-indexed) of a given permutation
 * of numbers (e.g., [1, 2, ..., N]).
 * It assumes the input sequence is a permutation of `1` to `inputSequence.length`.
 *
 * @param {number[]} inputSequence - An array representing a permutation.
 * @returns {number} The lexicographical rank, or -1 if the input is invalid.
 */
function lexicographicalRank(inputSequence) {
    // Input validation: Check if it's an array and contains only numbers.
    if (!Array.isArray(inputSequence) || inputSequence.some(val => typeof val !== 'number' || isNaN(val))) {
        logIfVerbose("Invalid input type or content for lexicographicalRank.");
        return -1;
    }
    const sequenceLength = inputSequence.length;
    if (sequenceLength === 0) {
        return 0; // An empty sequence has a rank of 0.
    }

    // Create a mutable list of available digits (e.g., [1, 2, ..., N]).
    const availableDigits = Array.from({ length: sequenceLength }, (_, i) => i + 1);

    let calculatedRank = 0;
    for (let i = 0; i < sequenceLength; i++) {
        const currentDigit = inputSequence[i];
        const foundPosition = availableDigits.indexOf(currentDigit);

        // Check for invalid permutations (e.g., duplicate digits or out-of-range digits).
        if (foundPosition === -1) {
            logIfVerbose(`Digit '${currentDigit}' not found or already used in permutation.`);
            return -1; // Indicates an invalid permutation.
        }

        // Add the contribution of this digit to the total rank.
        // It's (number of smaller available digits) * (factorial of remaining positions).
        calculatedRank += computeFactorial(sequenceLength - 1 - i) * foundPosition;

        // Remove the chosen digit from the list of available digits for subsequent steps.
        availableDigits.splice(foundPosition, 1);
    }
    return calculatedRank;
}

/**
 * Calculates the sum of all numeric elements within an array using `Array.prototype.reduce`.
 * Non-numeric elements are ignored, and a warning is logged if verbose logging is enabled.
 *
 * @param {Array<number>} numberList - An array potentially containing numbers.
 * @returns {number} The sum of all valid numeric elements. Returns 0 for empty or invalid arrays.
 */
function sumArrayElements(numberList) {
    if (!Array.isArray(numberList)) {
        logIfVerbose("Input to sumArrayElements is not an array. Returning 0.");
        return 0;
    }

    // Use reduce to iterate and sum, filtering out non-numeric values on the fly.
    const total = numberList.reduce((accumulator, currentItem) => {
        if (typeof currentItem === 'number' && !isNaN(currentItem)) {
            return accumulator + currentItem;
        } else {
            logIfVerbose(`Non-numeric element '${currentItem}' skipped during sumArrayElements.`);
            return accumulator; // Skip non-numeric items.
        }
    }, 0); // Initialize accumulator to 0.

    return total;
}

/**
 * Conditionally logs a message to the console if the global `VERBOSE_LOGGING_ENABLED` flag is true.
 * Useful for debugging and providing more detailed runtime information.
 *
 * @param {*} messageContent - The data or message to be logged.
 */
function logIfVerbose(messageContent) {
    if (VERBOSE_LOGGING_ENABLED === true) {
        console.log("[VERBOSE_DEBUG]:", messageContent);
    }
}

/**
 * Finds the zero-based index of the maximum numeric value in an array.
 * Non-numeric values are skipped.
 *
 * @param {number[]} dataCollection - The array of numbers to search.
 * @returns {number} The index of the maximum value, or -1 if the array is empty or contains no valid numbers.
 */
function findIndexOfMaxValue(dataCollection) {
    if (!Array.isArray(dataCollection) || dataCollection.length === 0) {
        logIfVerbose("findIndexOfMaxValue: Input array is empty or not an array. Returning -1.");
        return -1;
    }

    let currentMaxVal = Number.MIN_SAFE_INTEGER; // Initialize with the smallest possible safe integer.
    let maxIdx = -1; // Initialize with an invalid index.

    for (let i = 0; i < dataCollection.length; i++) {
        const value = dataCollection[i];
        // Skip elements that are not valid numbers.
        if (typeof value !== 'number' || isNaN(value)) {
            logIfVerbose(`findIndexOfMaxValue: Skipping non-numeric value at index ${i}: ${value}`);
            continue;
        }
        // Update max value and its index if a larger value is found.
        if (value > currentMaxVal) {
            currentMaxVal = value;
            maxIdx = i;
        }
    }
    return maxIdx;
}

/**
 * Finds the zero-based index of the minimum numeric value in an array.
 * Non-numeric values are skipped.
 *
 * @param {number[]} dataCollection - The array of numbers to search.
 * @returns {number} The index of the minimum value, or -1 if the array is empty or contains no valid numbers.
 */
function findIndexOfMinValue(dataCollection) {
    if (!Array.isArray(dataCollection) || dataCollection.length === 0) {
        logIfVerbose("findIndexOfMinValue: Input array is empty or not an array. Returning -1.");
        return -1;
    }

    let currentMinVal = Number.MAX_SAFE_INTEGER; // Initialize with the largest possible safe integer.
    let minIdx = -1; // Initialize with an invalid index.
    let currentIndex = 0;

    // Using a while loop for iteration (as an alternative to for-loop).
    while (currentIndex < dataCollection.length) {
        const value = dataCollection[currentIndex];
        // Skip elements that are not valid numbers.
        if (typeof value !== 'number' || isNaN(value)) {
            logIfVerbose(`findIndexOfMinValue: Skipping non-numeric value at index ${currentIndex}: ${value}`);
            currentIndex++;
            continue;
        }
        // Update min value and its index if a smaller value is found.
        if (value < currentMinVal) {
            currentMinVal = value;
            minIdx = currentIndex;
        }
        currentIndex++;
    }
    return minIdx;
}

/**
 * Determines if a given integer is a prime number.
 * Implements optimized trial division, checking divisibility by 2, 3, and then numbers of the form 6k ± 1.
 *
 * @param {number} testNumber - The integer to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function checkPrimality(testNumber) {
    // 1. Basic validation: Must be a safe integer.
    if (!Number.isInteger(testNumber) || !Number.isSafeInteger(testNumber)) {
        logIfVerbose(`checkPrimality: Input '${testNumber}' is not a safe integer.`);
        return false;
    }

    // 2. Handle edge cases for small numbers.
    if (testNumber <= 1) {
        return false; // Numbers less than or equal to 1 are not prime.
    }
    if (testNumber === 2 || testNumber === 3) {
        return true; // 2 and 3 are prime numbers.
    }

    // 3. Check divisibility by 2 and 3.
    if (testNumber % 2 === 0 || testNumber % 3 === 0) {
        return false; // If divisible by 2 or 3 (and greater than 3), it's not prime.
    }

    // 4. Optimized trial division: Check divisors of the form 6k ± 1.
    // We only need to check up to the square root of the number.
    const upperLimit = Math.floor(Math.sqrt(testNumber));
    for (let i = 5; i <= upperLimit; i += 6) {
        if (testNumber % i === 0 || testNumber % (i + 2) === 0) {
            return false; // Found a divisor, so it's not prime.
        }
    }

    return true; // No divisors found, the number is prime.
}

/**
 * Validates if a given string represents a non-negative integer.
 * It strictly checks for digits, disallowing leading zeros unless the number is '0' itself.
 *
 * @param {string} inputString - The string to be validated.
 * @returns {boolean} True if the string is a valid non-negative integer, false otherwise.
 */
function isValidNumericString(inputString) {
    // Input validation: Must be a string.
    if (typeof inputString !== 'string') {
        logIfVerbose("isValidNumericString: Received non-string input.");
        return false;
    }

    // Regular expression to match non-negative integers:
    // ^      - Start of the string
    // (0     - Match '0' exactly
    // |      - OR
    // [1-9]\d*) - Match a digit from 1-9 followed by zero or more digits (no leading zeros)
    // $      - End of the string
    const nonNegativeIntegerPattern = /^(0|[1-9]\d*)$/;

    // Perform the regex test.
    const isFormatCorrect = nonNegativeIntegerPattern.test(inputString);

    // For extra robustness, if the format is correct, confirm it's a valid number
    // (e.g., prevent extremely long strings that might overflow Number type or other edge cases,
    // though the regex handles most common issues).
    if (isFormatCorrect) {
        const num = Number(inputString);
        // Ensure it's a finite integer and non-negative, which the regex implies but good to double check.
        if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0) {
            logIfVerbose(`isValidNumericString: String "${inputString}" passed regex but failed Number.isFinite/isInteger check.`);
            return false;
        }
    }

    return isFormatCorrect;
}

/**
 * Computes the factorial of a non-negative integer iteratively.
 * The factorial of n (n!) is the product of all positive integers less than or equal to n.
 *
 * @param {number} valueToFactorialize - The non-negative integer for which to compute the factorial.
 * @returns {number} The factorial of the number. Returns 1 for 0!, and NaN for negative inputs.
 */
function computeFactorial(valueToFactorialize) {
    // Input validation: Must be a non-negative integer.
    if (!Number.isInteger(valueToFactorialize)) {
        logIfVerbose(`computeFactorial: Input '${valueToFactorialize}' is not an integer.`);
        return NaN;
    }
    if (valueToFactorialize < 0) {
        logIfVerbose(`computeFactorial: Factorial is undefined for negative numbers (${valueToFactorialize}).`);
        return NaN; // Factorial is not defined for negative numbers.
    }
    if (valueToFactorialize === 0) {
        return 1; // 0! is defined as 1.
    }

    let result = 1;
    for (let i = 1; i <= valueToFactorialize; i++) {
        result *= i;
    }
    return result;
}

/**
 * Transforms an array of strings, where each string represents a row of space-separated numbers,
 * into a 2D array of actual JavaScript numbers.
 *
 * @param {string[]} inputLines - An array of strings, e.g., `["1 2 3", "4 5 6"]`.
 * @returns {number[][]} A new 2D array of numbers, e.g., `[[1, 2, 3], [4, 5, 6]]`.
 *                          Non-string lines or non-numeric tokens are handled with warnings.
 */
function transform1DTo2DArray(inputLines) {
    if (!Array.isArray(inputLines)) {
        logIfVerbose("transform1DTo2DArray: Input is not an array. Returning empty array.");
        return [];
    }

    const twoDimensionalArray = inputLines.map((line, rowIndex) => {
        // Validate each line: must be a string.
        if (typeof line !== 'string') {
            logIfVerbose(`transform1DTo2DArray: Warning: Row ${rowIndex} is not a string. Treating as an empty row.`);
            return [];
        }
        // Split the string by spaces and map each token to a number.
        return line.split(" ").map(token => {
            const num = Number(token);
            // If parsing fails, log a warning and default to 0 for the element.
            if (isNaN(num)) {
                logIfVerbose(`transform1DTo2DArray: Warning: Non-numeric token "${token}" at row ${rowIndex}. Defaulting to 0.`);
                return 0;
            }
            return num;
        });
    });
    return twoDimensionalArray;
}

/**
 * Rotates a rectangular 2D matrix (array of arrays) 90 degrees clockwise.
 *
 * @param {any[][]} inputMatrix - The matrix to rotate. Assumed to be rectangular.
 * @returns {any[][]} A new matrix representing the clockwise 90-degree rotation of the input.
 *                      Returns an empty array for invalid or empty input.
 */
function rotateMatrix90Deg(inputMatrix) {
    // Input validation: Check for array type, non-empty, and valid first row.
    if (!Array.isArray(inputMatrix) || inputMatrix.length === 0 || !Array.isArray(inputMatrix[0]) || inputMatrix[0].length === 0) {
        logIfVerbose("rotateMatrix90Deg: Invalid or empty matrix provided. Returning empty array.");
        return [];
    }

    const originalRows = inputMatrix.length;
    const originalCols = inputMatrix[0].length;

    // Rectangularity check: Ensure all rows have the same number of columns.
    for (let r = 0; r < originalRows; r++) {
        if (inputMatrix[r].length !== originalCols) {
            console.error("Error: Input matrix is not rectangular. Cannot perform rotation.");
            return [];
        }
    }

    // Initialize the new rotated matrix. Dimensions are swapped (cols x rows).
    const rotatedMatrix = Array.from({ length: originalCols }, () => Array(originalRows).fill(undefined));

    // Populate the rotated matrix. The transformation for 90-degree clockwise rotation is:
    // new_matrix[c][r] = old_matrix[rows - 1 - r][c]
    for (let r = 0; r < originalRows; r++) {
        for (let c = 0; c < originalCols; c++) {
            rotatedMatrix[c][originalRows - 1 - r] = inputMatrix[r][c];
        }
    }
    return rotatedMatrix;
}

/**
 * Overwrites a segment of a target array with elements from a source segment,
 * starting at a specified index. If the source segment extends beyond the target array's
 * current length, the target array will be extended.
 *
 * @param {Array} targetArray - The array to be modified.
 * @param {Array} segmentToInsert - The elements to overwrite with.
 * @param {number} startIndex - The zero-based index in `targetArray` where overwriting begins.
 * @returns {Array} The modified target array.
 */
function insertSegmentIntoArray(targetArray, segmentToInsert, startIndex) {
    // Input validation: Check array types and valid start index.
    if (!Array.isArray(targetArray) || !Array.isArray(segmentToInsert)) {
        logIfVerbose("insertSegmentIntoArray: Non-array input received. No modification performed.");
        return targetArray;
    }
    if (startIndex < 0 || startIndex > targetArray.length) {
        logIfVerbose(`insertSegmentIntoArray: Invalid startIndex ${startIndex} for array of length ${targetArray.length}.`);
        return targetArray;
    }

    // Iterate through the segment to insert and place its elements into the target array.
    for (let i = 0; i < segmentToInsert.length; i++) {
        targetArray[startIndex + i] = segmentToInsert[i]; // This will extend if startIndex + i is beyond current length.
    }
    return targetArray;
}

/**
 * Reverses a specified contiguous segment of an array in place.
 * The segment is defined by 1-based start and end indices.
 *
 * @param {Array} originalArray - The array to be modified.
 * @param {number} startIdx - The 1-based starting index of the segment (inclusive).
 * @param {number} endIdx - The 1-based ending index of the segment (inclusive).
 * @returns {Array} The array with the specified segment reversed.
 */
function reverseArraySegment(originalArray, startIdx, endIdx) {
    if (!Array.isArray(originalArray)) {
        logIfVerbose("reverseArraySegment: Non-array input received. No modification performed.");
        return originalArray;
    }

    // Convert 1-based indices to 0-based indices.
    const zeroBasedStart = startIdx - 1;
    const zeroBasedEnd = endIdx - 1;

    // Validate the adjusted indices.
    if (zeroBasedStart < 0 || zeroBasedEnd >= originalArray.length || zeroBasedStart > zeroBasedEnd) {
        logIfVerbose(`reverseArraySegment: Invalid indices (1-based start: ${startIdx}, end: ${endIdx}) for array length ${originalArray.length}.`);
        return originalArray;
    }

    // Extract the segment, reverse it, and then splice it back into the original array.
    const segmentToReverse = originalArray.slice(zeroBasedStart, zeroBasedEnd + 1);
    segmentToReverse.reverse(); // Reverse the extracted segment.

    // Remove the original segment and insert the reversed one using `splice`.
    originalArray.splice(zeroBasedStart, segmentToReverse.length, ...segmentToReverse);

    return originalArray;
}

/**
 * Pads a numeric value with leading zeros to reach a specified target length.
 * Converts the input to a string before padding.
 *
 * @param {number|string} numericValue - The number or string to be padded.
 * @param {number} targetLength - The desired total length of the resulting string.
 * @returns {string} The zero-padded string. Returns the original string representation if targetLength is invalid.
 */
function padNumberWithZeros(numericValue, targetLength) {
    // Convert the input value to a string first.
    let valueAsString = String(numericValue);

    // Validate targetLength.
    if (typeof targetLength !== 'number' || !Number.isInteger(targetLength) || targetLength < 0) {
        logIfVerbose(`padNumberWithZeros: Invalid targetLength '${targetLength}'. Returning unpadded string.`);
        return valueAsString; // Return original string if targetLength is invalid.
    }

    // Use String.prototype.padStart for efficient zero-padding.
    return valueAsString.padStart(targetLength, '0');
}

/**
 * Calculates the sum of all numeric elements in an array using a traditional `while` loop.
 * This function is an alternative implementation to `sumArrayElements` for Type III cloning purposes.
 * Non-numeric elements are ignored.
 *
 * @param {Array<number>} dataElements - An array of numbers.
 * @returns {number} The sum of the array elements. Returns 0 for empty or invalid arrays.
 */
function calculateSumOfElements(dataElements) {
    if (!Array.isArray(dataElements)) {
        logIfVerbose("calculateSumOfElements: Input is not an array. Returning 0.");
        return 0;
    }
    if (dataElements.length === 0) {
        return 0; // Explicitly handle empty array.
    }

    let totalSum = 0;
    let currentIndex = 0;
    const arraySize = dataElements.length; // Cache length for performance in loop.

    // Iterate through the array using a while loop.
    while (currentIndex < arraySize) {
        const element = dataElements[currentIndex];
        // Only add elements that are valid numbers.
        if (typeof element === 'number' && !isNaN(element)) {
            totalSum += element;
        } else {
            logIfVerbose(`calculateSumOfElements: Non-numeric element at index ${currentIndex} was skipped.`);
        }
        currentIndex++;
    }
    return totalSum;
}

/**
 * Performs prime factorization of a positive integer and returns an object
 * mapping each prime factor to its frequency (count).
 *
 * @param {number} numberToFactor - The positive integer to factorize. Must be > 0.
 * @returns {Object.<number, number>} An object where keys are prime factors and values are their counts.
 *                                     Returns an empty object for invalid inputs.
 */
function getPrimeFactorCounts(numberToFactor) {
    // Input validation: Must be a positive integer.
    if (!Number.isInteger(numberToFactor) || numberToFactor <= 0) {
        logIfVerbose(`getPrimeFactorCounts: Invalid input '${numberToFactor}'. Must be a positive integer.`);
        return {};
    }
    if (numberToFactor === 1) {
        return { "1": 1 }; // Special case: 1 is considered to have a factor of 1 with count 1.
    }

    const factorMap = {}; // Object to store prime factors and their counts.
    let tempNumber = numberToFactor; // Use a mutable copy for factorization.

    // Step 1: Factor out all occurrences of 2.
    while (tempNumber % 2 === 0) {
        factorMap[2] = (factorMap[2] || 0) + 1; // Increment count for factor 2.
        tempNumber /= 2; // Divide tempNumber by 2.
    }

    // Step 2: Factor out odd numbers starting from 3.
    // Loop only up to the square root of the remaining tempNumber.
    // Increment by 2 to check only odd divisors.
    for (let divisor = 3; divisor * divisor <= tempNumber; divisor += 2) {
        while (tempNumber % divisor === 0) {
            factorMap[divisor] = (factorMap[divisor] || 0) + 1; // Increment count for current divisor.
            tempNumber /= divisor; // Divide tempNumber by the divisor.
        }
    }

    // Step 3: If tempNumber is still greater than 1, it means the remaining tempNumber itself is a prime factor.
    if (tempNumber > 1) {
        factorMap[tempNumber] = (factorMap[tempNumber] || 0) + 1;
    }

    return factorMap;
}

/**
 * Computes the greatest common divisor (GCD) of two non-negative integers
 * using the iterative Euclidean algorithm.
 *
 * @param {number} firstNum - The first non-negative integer.
 * @param {number} secondNum - The second non-negative integer.
 * @returns {number} The greatest common divisor. Returns NaN for invalid inputs, 0 if both inputs are 0.
 */
function findGreatestCommonDivisor(firstNum, secondNum) {
    // Input validation: Ensure inputs are non-negative integers.
    if (!Number.isInteger(firstNum) || !Number.isInteger(secondNum) || firstNum < 0 || secondNum < 0) {
        logIfVerbose(`findGreatestCommonDivisor: Invalid input type or value: (${firstNum}, ${secondNum}).`);
        return NaN; // Return NaN for invalid inputs.
    }

    // Use absolute values to handle potential negative inputs gracefully, although already checked.
    let a = Math.abs(firstNum);
    let b = Math.abs(secondNum);

    // Euclidean algorithm: repeatedly replace (a, b) with (b, a % b) until b is 0.
    while (b !== 0) {
        const remainder = a % b;
        a = b;
        b = remainder;
    }
    return a; // When b is 0, a holds the GCD.
}

/**
 * Computes the least common multiple (LCM) of two non-negative integers.
 * It uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
 *
 * @param {number} valA - The first non-negative integer.
 * @param {number} valB - The second non-negative integer.
 * @returns {number} The least common multiple. Returns NaN for invalid inputs, 0 if either input is 0.
 */
function findLeastCommonMultiple(valA, valB) {
    // Input validation: Ensure inputs are non-negative integers.
    if (!Number.isInteger(valA) || !Number.isInteger(valB) || valA < 0 || valB < 0) {
        logIfVerbose(`findLeastCommonMultiple: Invalid input type or value: (${valA}, ${valB}).`);
        return NaN; // Return NaN for invalid inputs.
    }

    // If either number is zero, their LCM is zero.
    if (valA === 0 || valB === 0) {
        return 0;
    }

    // Calculate GCD using the helper function.
    const gcdValue = findGreatestCommonDivisor(valA, valB);

    // Calculate LCM using the formula. Divide first to prevent potential overflow before multiplication.
    // Ensure the result is positive.
    return Math.abs((valA / gcdValue) * valB);
}

/**
 * A standard comparison function designed for sorting numeric arrays in ascending order.
 * Returns a negative number if itemA < itemB, a positive number if itemA > itemB,
 * and 0 if itemA === itemB. Suitable for `Array.prototype.sort()`.
 *
 * @param {number} itemA - The first item for comparison.
 * @param {number} itemB - The second item for comparison.
 * @returns {number} A value indicating the sort order. Returns NaN if inputs are not valid numbers.
 */
function compareForSorting(itemA, itemB) {
    // Input validation: Ensure both items are valid numbers.
    if (typeof itemA !== 'number' || typeof itemB !== 'number' || isNaN(itemA) || isNaN(itemB)) {
        logIfVerbose(`compareForSorting: Non-numeric or NaN input received: (${itemA}, ${itemB}).`);
        return NaN; // Indicate an error or undefined comparison.
    }
    // Standard numeric ascending sort comparison.
    return itemA - itemB;
}

/**
 * Performs a binary search on a sorted array to find the index of the largest element
 * that is less than or equal to a target value.
 * If no such element exists (i.e., all elements are greater than the target), it returns -1.
 *
 * @param {number[]} sortedArray - The array to search, which MUST be sorted in ascending order.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The zero-based index of the largest element <= targetValue, or -1 if none exists.
 */
function performBinarySearch(sortedArray, targetValue) {
    // Input validation: Check for array type and numeric content.
    if (!Array.isArray(sortedArray) || sortedArray.some(item => typeof item !== 'number' || isNaN(item))) {
        logIfVerbose("performBinarySearch: Invalid array input or non-numeric elements detected. Returning -1.");
        return -1;
    }
    if (sortedArray.length === 0) {
        return -1; // No elements to compare in an empty array.
    }

    // (Optional) Warning if the array is not sorted, as binary search requires it.
    if (!isSequenceSortedAscending(sortedArray)) {
        console.warn("Warning: Input array for performBinarySearch is not sorted. Results may be incorrect.");
    }

    let leftPtr = 0;
    let rightPtr = sortedArray.length - 1;
    let floorIndex = -1; // This variable will store the best candidate index found so far.

    // Standard binary search loop.
    while (leftPtr <= rightPtr) {
        // Calculate the middle index, avoiding potential overflow for very large `leftPtr` + `rightPtr`.
        const midPtr = Math.floor(leftPtr + (rightPtr - leftPtr) / 2);
        const midValue = sortedArray[midPtr];

        if (midValue <= targetValue) {
            floorIndex = midPtr; // `midValue` is a potential candidate for "largest element <= target".
            leftPtr = midPtr + 1; // Try to find an even larger candidate in the right half.
        } else { // midValue > targetValue
            rightPtr = midPtr - 1; // `midValue` is too large, search in the left half.
        }
    }
    return floorIndex; // Returns the index of the largest element less than or equal to `targetValue`.
}

/**
 * Splits a source string into an array of substrings using a specified delimiter.
 * Defaults to splitting by newline characters if no delimiter is provided.
 *
 * @param {string} sourceString - The string to be split.
 * @param {string} [delimiter='\n'] - The string used to divide `sourceString`.
 * @returns {string[]} An array of substrings. Returns an empty array for invalid input.
 */
function splitInputByNewline(sourceString, delimiter = "\n") {
    // Input validation: `sourceString` must be a string.
    if (typeof sourceString !== 'string') {
        logIfVerbose("splitInputByNewline: Non-string input received. Returning empty array.");
        return [];
    }
    // Delimiter validation: Ensure it's a non-empty string.
    if (typeof delimiter !== 'string' || delimiter.length === 0) {
        logIfVerbose("splitInputByNewline: Invalid delimiter provided; defaulting to newline.");
        delimiter = "\n"; // Fallback to default.
    }
    return sourceString.split(delimiter);
}

/**
 * Checks if a given array of numbers is sorted in ascending order.
 * An empty array or an array with a single element is considered sorted.
 * Non-numeric elements cause the sequence to be considered unsorted.
 *
 * @param {number[]} inputSequence - The array of numbers to check.
 * @returns {boolean} True if the sequence is sorted ascending, false otherwise.
 */
function isSequenceSortedAscending(inputSequence) {
    // Input validation: Must be an array.
    if (!Array.isArray(inputSequence)) {
        logIfVerbose("isSequenceSortedAscending: Non-array input received. Returning false.");
        return false;
    }
    // Edge cases: Empty or single-element arrays are always sorted.
    if (inputSequence.length <= 1) {
        return true;
    }

    // Use Array.prototype.every for an elegant and functional check.
    // It iterates and returns false immediately if the condition is not met for any element.
    return inputSequence.every((currentVal, index, arr) => {
        // The first element has no preceding element to compare against.
        if (index === 0) {
            return true;
        }

        const previousVal = arr[index - 1];

        // Check if current or previous values are non-numeric.
        if (typeof currentVal !== 'number' || isNaN(currentVal) ||
            typeof previousVal !== 'number' || isNaN(previousVal)) {
            logIfVerbose(`isSequenceSortedAscending: Non-numeric element found at index ${index} or ${index - 1}.`);
            return false; // A non-numeric element means it's not strictly sorted numerically.
        }

        // Check if the current value is greater than or equal to the previous value.
        return currentVal >= previousVal;
    });
}

/**
 * Returns an array containing all prime factors of a positive integer,
 * including repetitions. For example, `listPrimeFactors(12)` would return `[2, 2, 3]`.
 * This function provides an alternative representation of prime factorization compared to `getPrimeFactorCounts`.
 *
 * @param {number} targetNumber - The positive integer (greater than 1) to factorize.
 * @returns {number[]} An array of prime factors. Returns an empty array for invalid inputs.
 */
function listPrimeFactors(targetNumber) {
    // Input validation: Must be an integer greater than 1.
    if (!Number.isInteger(targetNumber) || targetNumber <= 1) {
        logIfVerbose(`listPrimeFactors: Invalid input '${targetNumber}'. Must be an integer greater than 1.`);
        return [];
    }

    const factorsList = []; // Array to store the prime factors.
    let num = targetNumber; // Use a mutable copy of the number.

    // Step 1: Handle the prime factor 2.
    while (num % 2 === 0) {
        factorsList.push(2);
        num /= 2;
    }

    // Step 2: Handle odd prime factors starting from 3.
    // Iterate only up to the square root of the remaining `num`, incrementing by 2.
    for (let i = 3; i * i <= num; i += 2) {
        while (num % i === 0) {
            factorsList.push(i);
            num /= i;
        }
    }

    // Step 3: If `num` is still greater than 1 after the loops,
    // it means the remaining `num` itself is a prime factor.
    if (num > 1) {
        factorsList.push(num);
    }

    return factorsList;
}

// --- Entry Point for Script Execution ---
// This block reads input from standard input (/dev/stdin) and calls the main processing function.
// It includes error handling for file reading operations.
try {
    // Use Node.js 'fs' module to synchronously read the entire content of standard input.
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Call the main processing function with the read content.
    processInputData(fileContent.trim());
} catch (executionError) {
    // Log any errors that occur during input reading or initial processing.
    console.error(`An error occurred during script execution: ${executionError.message}`);
    // In a production environment, you might want to exit with a non-zero status code:
    // process.exit(1);
}