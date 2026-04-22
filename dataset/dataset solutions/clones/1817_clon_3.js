const displayDebugInfo = false; // Flag to enable/disable detailed logging
const maxSafeNum = Number.MAX_SAFE_INTEGER; // Represents a very large number
const divisorConstant = 1000000007; // A common modulus used in competitive programming

/**
 * Logs a message to the console if debugging is enabled.
 * @param {any} content - The data or message to log.
 * @param {string} [prefix='DEBUG:'] - An optional prefix for the log message.
 */
function logDebugMessage(content, prefix = 'DEBUG:') {
    if (displayDebugInfo) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${prefix}`, content);
    }
}

/**
 * Computes the factorial of a given non-negative integer.
 * This version uses an iterative approach instead of recursion.
 * @param {number} inputVal - The number for which to compute the factorial.
 * @returns {number} The factorial of the inputVal. Returns 1 for 0, and -1 for negative input.
 */
function computeFactorial(inputVal) {
    if (inputVal < 0) {
        logDebugMessage(`Attempted to compute factorial for negative number: ${inputVal}`, 'ERROR:');
        return -1; // Indicate error for negative input
    }
    if (inputVal === 0) {
        return 1;
    }
    let product = 1;
    for (let currentNum = 1; currentNum <= inputVal; currentNum++) {
        product *= currentNum;
    }
    return product;
}

/**
 * Determines if a number is prime.
 * @param {number} candidateNum - The number to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function checkPrimality(candidateNum) {
    if (!Number.isInteger(candidateNum) || candidateNum < 2) {
        logDebugMessage(`Invalid input for primality check: ${candidateNum}`, 'WARNING:');
        return false;
    }
    if (candidateNum === 2) {
        return true;
    }
    if (candidateNum % 2 === 0) {
        return false; // Even numbers greater than 2 are not prime
    }
    const limit = Math.floor(Math.sqrt(candidateNum));
    for (let i = 3; i <= limit; i += 2) {
        if (candidateNum % i === 0) {
            return false;
        }
    }
    return true;
}

/**
 * Calculates the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
 * @param {number} numA - The first number.
 * @param {number} numB - The second number.
 * @returns {number} The GCD of numA and numB. Returns -1 if inputs are invalid.
 */
function calculateGreatestCommonDivisor(numA, numB) {
    if (!Number.isInteger(numA) || !Number.isInteger(numB) || numA < 0 || numB < 0) {
        logDebugMessage(`Invalid inputs for GCD: ${numA}, ${numB}`, 'ERROR:');
        return -1;
    }
    while (numB !== 0) {
        const temporary = numB;
        numB = numA % numB;
        numA = temporary;
    }
    return numA;
}

/**
 * Calculates the least common multiple (LCM) of two numbers.
 * @param {number} term1 - The first number.
 * @param {number} term2 - The second number.
 * @returns {number} The LCM of term1 and term2. Returns -1 if inputs are invalid.
 */
function calculateLeastCommonMultiple(term1, term2) {
    if (term1 === 0 || term2 === 0) return 0;
    const commonDivisor = calculateGreatestCommonDivisor(term1, term2);
    if (commonDivisor === -1) {
        logDebugMessage(`Invalid inputs for LCM: ${term1}, ${term2}`, 'ERROR:');
        return -1;
    }
    return Math.abs(term1 * term2) / commonDivisor;
}

/**
 * Converts a 1D array of strings into a 2D array of characters.
 * @param {string[]} flatArray - The input array of strings.
 * @returns {string[][]} A new array where each string element is split into a character array.
 */
function convert1DArrayTo2D(flatArray) {
    if (!Array.isArray(flatArray)) {
        logDebugMessage('Input for convert1DArrayTo2D is not an array.', 'ERROR:');
        return [];
    }
    return flatArray.map(item => String(item).split(''));
}

/**
 * Finds the index of the maximum element in a numeric array.
 * Returns the index of the first occurrence if multiple maximums exist.
 * @param {number[]} numericData - The array of numbers.
 * @returns {number} The index of the maximum element, or -1 if the array is empty.
 */
function findMaxElementIndex(numericData) {
    if (!Array.isArray(numericData) || numericData.length === 0) {
        logDebugMessage('Input array for findMaxElementIndex is empty or invalid.', 'WARNING:');
        return -1;
    }
    let currentMaximumValue = -maxSafeNum; // Initialize with smallest possible value
    let maxElementPosition = -1;
    for (let dataIdx = 0; dataIdx < numericData.length; dataIdx++) {
        const currentValue = numericData[dataIdx];
        if (typeof currentValue !== 'number' || !Number.isFinite(currentValue)) {
            logDebugMessage(`Non-numeric value found at index ${dataIdx}: ${currentValue}`, 'WARNING:');
            continue;
        }
        if (currentValue > currentMaximumValue) {
            currentMaximumValue = currentValue;
            maxElementPosition = dataIdx;
        }
    }
    return maxElementPosition;
}

/**
 * Finds the index of the minimum element in a numeric array.
 * Returns the index of the first occurrence if multiple minimums exist.
 * @param {number[]} numericData - The array of numbers.
 * @returns {number} The index of the minimum element, or -1 if the array is empty.
 */
function findMinElementIndex(numericData) {
    if (!Array.isArray(numericData) || numericData.length === 0) {
        logDebugMessage('Input array for findMinElementIndex is empty or invalid.', 'WARNING:');
        return -1;
    }
    let currentMinimumValue = maxSafeNum; // Initialize with largest possible value
    let minElementPosition = -1;
    for (let dataIdx = 0; dataIdx < numericData.length; dataIdx++) {
        const currentValue = numericData[dataIdx];
        if (typeof currentValue !== 'number' || !Number.isFinite(currentValue)) {
            logDebugMessage(`Non-numeric value found at index ${dataIdx}: ${currentValue}`, 'WARNING:');
            continue;
        }
        if (currentValue < currentMinimumValue) {
            currentMinimumValue = currentValue;
            minElementPosition = dataIdx;
        }
    }
    return minElementPosition;
}

/**
 * Calculates the sum of all numeric elements in an array.
 * Non-numeric elements are coerced to numbers.
 * @param {Array<number|string>} dataValues - The array of values to sum.
 * @returns {number} The total sum of the array elements.
 */
function sumArrayElements(dataValues) {
    if (!Array.isArray(dataValues)) {
        logDebugMessage('Input for sumArrayElements is not an array.', 'ERROR:');
        return 0;
    }
    let runningTotal = 0;
    for (const item of dataValues) {
        const numValue = Number(item);
        if (Number.isFinite(numValue)) {
            runningTotal += numValue;
        } else {
            logDebugMessage(`Skipping non-numeric array element: ${item}`, 'WARNING:');
        }
    }
    return runningTotal;
}

/**
 * Compares two numbers, primarily for use with array sorting methods.
 * @param {number} valA - The first value.
 * @param {number} valB - The second value.
 * @returns {number} A negative value if valA < valB, zero if valA = valB, a positive value if valA > valB.
 */
function compareNumbersForSort(valA, valB) {
    return valA - valB;
}

/**
 * Checks if a given value is a string representation of a non-negative integer.
 * @param {string} testString - The string to validate.
 * @returns {boolean} True if the string represents a non-negative integer, false otherwise.
 */
function isValidNumericString(testString) {
    if (typeof testString !== 'string') {
        return false;
    }
    const integerPattern = /^(0|[1-9]\d*)$/;
    return integerPattern.test(testString);
}

/**
 * Performs prime factorization of a given positive integer.
 * Returns an object where keys are prime factors and values are their exponents.
 * @param {number} targetNumber - The number to factorize.
 * @returns {Object<number, number>} An object representing the prime factors and their counts.
 */
function getPrimeFactors(targetNumber) {
    const factorMap = {};

    if (!Number.isInteger(targetNumber) || targetNumber < 1) {
        logDebugMessage(`Invalid input for prime factorization: ${targetNumber}`, 'ERROR:');
        return {};
    }
    if (targetNumber === 1) {
        return { 1: 1 };
    }

    let remainingNumber = targetNumber;
    let currentDivisor = 2;

    while (remainingNumber > 1) {
        if (currentDivisor * currentDivisor > remainingNumber && remainingNumber > 1) {
            // If currentDivisor exceeds sqrt(remainingNumber), then remainingNumber must be prime
            factorMap[remainingNumber] = (factorMap[remainingNumber] || 0) + 1;
            break;
        }

        if (remainingNumber % currentDivisor === 0) {
            factorMap[currentDivisor] = (factorMap[currentDivisor] || 0) + 1;
            remainingNumber /= currentDivisor;
        } else {
            currentDivisor++;
            // Optimization: skip even numbers if currentDivisor is > 2
            if (currentDivisor > 2 && currentDivisor % 2 === 0) {
                currentDivisor++;
            }
        }
    }
    return factorMap;
}

/**
 * Finds the index of the largest element less than or equal to `targetValue` in a sorted array using binary search.
 * @param {number[]} orderedArray - The sorted array of numbers.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the largest element <= targetValue. If all elements are greater, returns -1.
 */
function findLargestSmallerOrEqualIndex(orderedArray, targetValue) {
    if (!Array.isArray(orderedArray) || orderedArray.length === 0) {
        logDebugMessage('Input array for binary search is empty or invalid.', 'WARNING:');
        return -1;
    }

    let lowPointer = 0;
    let highPointer = orderedArray.length - 1;
    let potentialIndex = -1; // Stores the best found index so far

    while (lowPointer <= highPointer) {
        const midPointer = Math.floor((lowPointer + highPointer) / 2);
        const midValue = orderedArray[midPointer];

        if (midValue <= targetValue) {
            potentialIndex = midPointer; // This element is a candidate, try for a larger one
            lowPointer = midPointer + 1;
        } else {
            highPointer = midPointer - 1; // Element is too large, look in the left half
        }
    }
    return potentialIndex;
}

/**
 * Splits a raw input string by newline characters.
 * @param {string} rawInputString - The string to split.
 * @returns {string[]} An array of strings, each representing a line of input.
 */
function splitInputByNewline(rawInputString) {
    if (typeof rawInputString !== 'string') {
        logDebugMessage('Input for splitInputByNewline is not a string.', 'ERROR:');
        return [];
    }
    return rawInputString.split('\n').map(line => line.trim()).filter(line => line.length > 0);
}

/**
 * Checks if a given array is sorted in ascending order.
 * @param {Array<any>} inputCollection - The array to check.
 * @returns {boolean} True if the array is sorted, false otherwise.
 */
function isArraySortedAscending(inputCollection) {
    if (!Array.isArray(inputCollection) || inputCollection.length <= 1) {
        return true;
    }
    for (let elementIdx = 1; elementIdx < inputCollection.length; elementIdx++) {
        if (inputCollection[elementIdx - 1] > inputCollection[elementIdx]) {
            return false;
        }
    }
    return true;
}

/**
 * Rotates a 2D matrix 90 degrees clockwise.
 * Assumes a rectangular matrix.
 * @param {Array<Array<any>>} originalGrid - The input 2D array (matrix).
 * @returns {Array<Array<any>>} The rotated 2D array.
 */
function rotateMatrixClockwise(originalGrid) {
    if (!Array.isArray(originalGrid) || originalGrid.length === 0 || !Array.isArray(originalGrid[0])) {
        logDebugMessage('Invalid or empty matrix for rotation.', 'ERROR:');
        return [];
    }
    const numRows = originalGrid.length;
    const numCols = originalGrid[0].length;
    
    // Initialize new matrix with swapped dimensions
    const rotatedGrid = Array.from({ length: numCols }, () => Array(numRows).fill(undefined));

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            rotatedGrid[c][numRows - 1 - r] = originalGrid[r][c];
        }
    }
    return rotatedGrid;
}

/**
 * Inserts elements of a source subarray into a target array starting at a specific index.
 * Modifies the target array in place.
 * @param {Array<any>} targetArray - The array to modify.
 * @param {Array<any>} sourceSubarray - The elements to insert.
 * @param {number} insertionStartIdx - The starting index in the target array.
 * @returns {Array<any>} The modified target array.
 */
function insertSubarrayAtPosition(targetArray, sourceSubarray, insertionStartIdx) {
    if (!Array.isArray(targetArray) || !Array.isArray(sourceSubarray)) {
        logDebugMessage('Invalid array inputs for insertSubarrayAtPosition.', 'ERROR:');
        return targetArray;
    }
    if (insertionStartIdx < 0 || insertionStartIdx >= targetArray.length) {
        logDebugMessage(`Insertion index ${insertionStartIdx} is out of bounds for targetArray.`, 'WARNING:');
        // If out of bounds, decide to append, prepend, or do nothing. Here, we'll do nothing.
        return targetArray;
    }
    for (let sIdx = 0; sIdx < sourceSubarray.length; sIdx++) {
        if (insertionStartIdx + sIdx < targetArray.length) {
            targetArray[insertionStartIdx + sIdx] = sourceSubarray[sIdx];
        } else {
            // If the source subarray extends beyond the target array's original length,
            // we could either extend targetArray or stop. For now, stop.
            logDebugMessage(`Source subarray extends beyond target array length at index ${insertionStartIdx + sIdx}.`, 'WARNING:');
            break;
        }
    }
    return targetArray;
}

/**
 * Reverses a segment of an array between specified start and end indices (inclusive, 1-based).
 * @param {Array<any>} originalCollection - The array to modify.
 * @param {number} segmentStartPos - The 1-based starting position of the segment.
 * @param {number} segmentEndPos - The 1-based ending position of the segment.
 * @returns {Array<any>} A new array with the specified segment reversed.
 */
function reverseSubsegment(originalCollection, segmentStartPos, segmentEndPos) {
    if (!Array.isArray(originalCollection) || originalCollection.length === 0) {
        logDebugMessage('Invalid or empty array for reverseSubsegment.', 'ERROR:');
        return [];
    }
    const actualStartIdx = segmentStartPos - 1;
    const actualEndIdx = segmentEndPos - 1;

    if (actualStartIdx < 0 || actualEndIdx >= originalCollection.length || actualStartIdx > actualEndIdx) {
        logDebugMessage(`Invalid segment indices: [${segmentStartPos}, ${segmentEndPos}] for array of length ${originalCollection.length}.`, 'WARNING:');
        return [...originalCollection]; // Return a shallow copy if indices are invalid
    }

    const prefix = originalCollection.slice(0, actualStartIdx);
    const segmentToReverse = originalCollection.slice(actualStartIdx, actualEndIdx + 1);
    const suffix = originalCollection.slice(actualEndIdx + 1);

    segmentToReverse.reverse();

    return [...prefix, ...segmentToReverse, ...suffix];
}

/**
 * Pads a number with leading zeros to reach a desired length.
 * @param {number|string} valueToPad - The number or string to pad.
 * @param {number} desiredLength - The target length of the padded string.
 * @returns {string} The zero-padded string.
 */
function padNumberWithZeros(valueToPad, desiredLength) {
    const stringValue = String(valueToPad);
    if (stringValue.length >= desiredLength) {
        return stringValue;
    }
    return '0'.repeat(desiredLength - stringValue.length) + stringValue;
}

/**
 * Calculates the number of triangular steps required to reach or exceed a target value.
 * A triangular step adds 1, then 2, then 3, etc., to a sum.
 * @param {number} targetValue - The value to reach or exceed.
 * @returns {number} The number of steps (n) such that 1+2+...+n >= targetValue.
 */
function calculateTriangularSteps(targetValue) {
    if (!Number.isInteger(targetValue) || targetValue <= 0) {
        logDebugMessage(`Invalid target value for triangular steps: ${targetValue}. Returning 0.`, 'WARNING:');
        return 0;
    }
    let cumulativeSum = 0;
    let incrementer = 0;
    while (cumulativeSum < targetValue) {
        incrementer++;
        cumulativeSum += incrementer;
        logDebugMessage(`Current sum: ${cumulativeSum}, steps: ${incrementer}`, 'TRIANGLE:');
    }
    return incrementer;
}

/**
 * Executes the main program logic.
 * Reads input, performs calculations, and outputs the result.
 * @param {string} rawInputData - The raw input string from stdin.
 */
function executeProgram(rawInputData) {
    let parsedNumericInput;
    try {
        parsedNumericInput = parseInt(rawInputData.trim(), 10);
        if (isNaN(parsedNumericInput)) {
            throw new Error("Input is not a valid number.");
        }
        if (parsedNumericInput < 1) {
            throw new Error("Input must be a positive integer.");
        }
    } catch (error) {
        console.error("Error processing input:", error.message);
        return; // Exit if input is invalid
    }

    logDebugMessage(`Processing input: ${parsedNumericInput}`);

    // Obtain prime factors and their counts
    const primeFactorsMap = getPrimeFactors(parsedNumericInput);
    logDebugMessage(`Prime factors for ${parsedNumericInput}:`, primeFactorsMap);

    let finalResultAccumulator = 0;

    // Iterate through each unique prime factor
    for (const factorKey of Object.keys(primeFactorsMap)) {
        const exponentValue = primeFactorsMap[factorKey];
        logDebugMessage(`Calculating steps for factor ${factorKey} with exponent ${exponentValue}`);
        // For each exponent, determine the number of triangular steps
        finalResultAccumulator += calculateTriangularSteps(exponentValue);
    }

    console.log(finalResultAccumulator);
}

// Immediately-invoked function expression (IIFE) to handle input and execution
(function() {
    try {
        const fileSystem = require("fs");
        const standardInput = fileSystem.readFileSync(0, "utf8"); // Read from stdin
        executeProgram(standardInput);
    } catch (error) {
        console.error("An error occurred during program execution:", error.message);
        logDebugMessage(error.stack, 'ERROR:');
    }
})();

// --- Unused Helper Functions (for illustration of Type III changes: keeping some unused functions but heavily modifying them) ---

/**
 * Computes the lexicographical index of a permutation for a sequence of unique numbers.
 * This function assumes 'input' (a global or closure variable) defines the max number,
 * which is a poor design. It's modified to accept maxDigit as a parameter.
 * @param {number[]} inputPermutation - The permutation sequence.
 * @param {number} maxDigitCount - The maximum number value used in the sequence (e.g., if sequence is [1,3,2], maxDigitCount could be 3).
 * @returns {number} The lexicographical index.
 */
function getLexicographicalIndex(inputPermutation, maxDigitCount) {
    if (!Array.isArray(inputPermutation) || inputPermutation.length === 0) {
        logDebugMessage('Invalid inputPermutation for getLexicographicalIndex.', 'ERROR:');
        return 0;
    }
    let availableNumbers = Array.from({ length: maxDigitCount }, (_, i) => i + 1);
    let calculatedIndex = 0;

    for (let i = 0; i < inputPermutation.length; i++) {
        const currentDigit = inputPermutation[i];
        const digitPositionInAvailable = availableNumbers.indexOf(currentDigit);

        if (digitPositionInAvailable === -1) {
            logDebugMessage(`Digit ${currentDigit} not found in available numbers. Skipping.`, 'WARNING:');
            continue;
        }

        calculatedIndex += computeFactorial(inputPermutation.length - 1 - i) * digitPositionInAvailable;
        availableNumbers.splice(digitPositionInAvailable, 1); // Remove the used digit
    }
    return calculatedIndex;
}

/**
 * An alternative prime factorization algorithm, kept for Type III demonstration.
 * This version uses a slightly different loop structure.
 * @param {number} numberToFactor - The integer to factorize.
 * @returns {Object<number, number>} Map of prime factors to their exponents.
 */
function alternativePrimeFactorization(numberToFactor) {
    const primeFactorsMap = {};
    if (!Number.isInteger(numberToFactor) || numberToFactor < 2) {
        return {};
    }

    let tempNumber = numberToFactor;
    let currentFactor = 2;

    while (tempNumber > 1) {
        if (tempNumber % currentFactor === 0) {
            primeFactorsMap[currentFactor] = (primeFactorsMap[currentFactor] || 0) + 1;
            tempNumber /= currentFactor;
        } else {
            currentFactor++;
            if (currentFactor > Math.sqrt(tempNumber) && tempNumber > 1) {
                // If currentFactor exceeds sqrt(tempNumber), then tempNumber itself is prime
                primeFactorsMap[tempNumber] = (primeFactorsMap[tempNumber] || 0) + 1;
                tempNumber = 1; // Mark as fully factored
            }
        }
    }
    return primeFactorsMap;
}