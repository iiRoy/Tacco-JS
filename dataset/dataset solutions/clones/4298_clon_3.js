/*
 * Utility functions for various common programming tasks.
 * This collection includes array manipulations, mathematical calculations,
 * string operations, and search algorithms.
 *
 * Functions provided:
 * - calculateLexicographicalIndex(sequence): Determines the lexicographical rank of a permutation.
 * - sumArrayElements(numericArray): Computes the total sum of numbers in an array.
 * - logIfDebugging(valueToLog): Prints a value to console only if debug mode is active.
 * - findIndexOfMaxValue(numericArray): Locates the index of the largest value in an array.
 * - findIndexOfMinValue(numericArray): Locates the index of the smallest value in an array.
 * - convertTo2DCharMatrix(stringArray): Transforms an array of strings into a 2D character array.
 * - testForPrimality(candidateNumber): Checks if a given number is a prime number.
 * - isValidNumericString(inputString): Validates if a string represents a non-negative integer.
 * - computeFactorial(numberInput): Calculates the factorial of a non-negative integer.
 * - rotateMatrix90DegreesClockwise(matrix): Rotates a 2D matrix 90 degrees clockwise.
 * - insertSubarrayAtPosition(baseArray, subArray, startIndex): Inserts a subarray into a base array.
 * - reverseSubarrayInPlace(targetArray, startInclusive, endInclusive): Reverses a portion of an array.
 * - padNumberWithLeadingZeros(numberValue, desiredLength): Adds leading zeros to a number string.
 * - getPrimeFactorizationMap(numberToFactor): Returns an object mapping prime factors to their powers.
 * - calculateGreatestCommonDivisor(numA, numB): Computes the GCD of two numbers using the Euclidean algorithm.
 * - calculateLeastCommonMultiple(numA, numB): Computes the LCM of two numbers.
 * - numericComparator(valA, valB): A comparator function for sorting numbers in ascending order.
 * - performBinarySearchForLargestSmallerOrEqual(sortedArray, targetValue): Binary search for a specific value or its insertion point.
 * - splitStringByNewlines(textInput): Splits a string into an array of lines.
 * - checkIfArrayIsSortedAscending(inputArray): Checks if an array is sorted in ascending order.
 * - calculatePrimeFactorsEfficiently(numberValue): An alternative, efficient prime factorization method.
 */

// Global configuration flags and constants
const IS_DEBUG_ENABLED = false;
const PADDING_CHAR = 'X';       // Character used for grid padding
const MINE_SYMBOL = '#';        // Character representing a mine
const EMPTY_CELL_SYMBOL = '.';  // Character representing an empty cell

/**
 * Main function to process the input grid and count adjacent mines.
 * @param {string} inputString - The raw input string containing grid dimensions and data.
 */
function processGridData(inputString) {
    // Parse input lines, ensuring no leading/trailing whitespace impacts processing
    const dataLines = inputString.trim().split('\n');

    // Extract grid dimensions from the very first line
    const dimensionsLine = dataLines.shift();
    if (!dimensionsLine) {
        console.error("Error: Input data is empty or missing dimensions line.");
        return; // Exit if no dimensions are provided
    }
    const dimensionValues = dimensionsLine.split(' ').map(Number);
    if (dimensionValues.length !== 2) {
        console.error("Error: Dimensions line must contain exactly two numbers (rows columns).");
        return;
    }
    const [gridRows, gridCols] = dimensionValues;

    // Validate extracted grid dimensions
    if (isNaN(gridRows) || isNaN(gridCols) || gridRows <= 0 || gridCols <= 0) {
        console.error(`Invalid grid dimensions provided: ${gridRows} rows, ${gridCols} columns. Both must be positive integers.`);
        return; // Exit if dimensions are invalid
    }

    // Convert the remaining lines into a 2D character array (the actual grid content)
    const charGrid = dataLines.map(line => line.split(''));

    // Further validation: Check if the parsed grid matches the declared dimensions
    if (charGrid.length !== gridRows) {
        console.error(`Dimension Mismatch: Expected ${gridRows} rows, but found ${charGrid.length} rows.`);
        return;
    }
    for (let r = 0; r < gridRows; r++) {
        if (charGrid[r].length !== gridCols) {
            console.error(`Dimension Mismatch: Row ${r} expected ${gridCols} columns, but found ${charGrid[r].length}.`);
            return;
        }
    }

    // Create a new grid with a padding border around it.
    // This simplifies boundary checks during mine counting, avoiding out-of-bounds errors.
    const borderedMatrix = [];
    const topBottomBorderRow = Array(gridCols + 2).fill(PADDING_CHAR); // Row for top and bottom borders
    borderedMatrix.push(topBottomBorderRow); // Add the top border row

    for (const currentRow of charGrid) {
        borderedMatrix.push([PADDING_CHAR, ...currentRow, PADDING_CHAR]); // Add left and right padding to each actual row
    }
    borderedMatrix.push(topBottomBorderRow); // Add the bottom border row

    // Iterate through the actual grid cells (skipping the padding) to count adjacent mines
    for (let currentR = 1; currentR <= gridRows; currentR++) {
        for (let currentC = 1; currentC <= gridCols; currentC++) {
            // Only process cells that are initially empty ('.')
            if (borderedMatrix[currentR][currentC] === EMPTY_CELL_SYMBOL) {
                let neighborMineCount = 0;

                // Check all 8 surrounding cells (including diagonals)
                for (let rowDelta = -1; rowDelta <= 1; rowDelta++) {
                    for (let colDelta = -1; colDelta <= 1; colDelta++) {
                        // Skip the current cell itself (0,0 offset)
                        if (rowDelta === 0 && colDelta === 0) {
                            continue;
                        }

                        // If a neighboring cell contains a mine, increment the count
                        if (borderedMatrix[currentR + rowDelta][currentC + colDelta] === MINE_SYMBOL) {
                            neighborMineCount++;
                        }
                    }
                }
                // Update the empty cell with the total count of adjacent mines
                borderedMatrix[currentR][currentC] = String(neighborMineCount); // Convert count to string for grid consistency
            }
        }
    }

    // Reconstruct the final output by removing the padding and joining rows
    const resultLines = [];
    for (let r = 1; r <= gridRows; r++) {
        // Extract the original row content (excluding padding characters)
        const rowWithoutPadding = borderedMatrix[r].slice(1, gridCols + 1);
        resultLines.push(rowWithoutPadding.join('')); // Join characters in the row to form a string
    }

    // Output the processed grid, with each row on a new line
    console.log(resultLines.join('\n'));
}

// Immediately-invoked function expression to handle input reading and error management
(function() {
    try {
        const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
        processGridData(fileData);
    } catch (err) {
        console.error("An error occurred during input processing:", err.message);
        // Optionally, provide more specific error handling based on err.code
    }
})();

/**
 * Calculates the lexicographical index (rank) of a permutation.
 * Assumes the input array contains unique positive integers starting from 1.
 * @param {number[]} permutationArray - The array representing the permutation.
 * @returns {number} The 0-indexed lexicographical rank of the permutation.
 */
function calculateLexicographicalIndex(permutationArray) {
    if (!permutationArray || permutationArray.length === 0) {
        return 0; // An empty permutation has rank 0
    }

    let availableNumbers = Array.from({ length: permutationArray.length }, (_, i) => i + 1);
    let cumulativeIndex = 0;

    for (let i = 0; i < permutationArray.length; i++) {
        const currentDigit = permutationArray[i];
        const digitPosition = availableNumbers.indexOf(currentDigit);

        if (digitPosition === -1) {
            // This case should ideally not happen for valid permutations
            console.warn(`Warning: Number ${currentDigit} not found in available numbers. Input might not be a valid permutation.`);
            return -1; // Indicate error or invalid input
        }

        const remainingLength = permutationArray.length - 1 - i;
        cumulativeIndex += computeFactorial(remainingLength) * digitPosition;
        availableNumbers.splice(digitPosition, 1); // Remove the used number
    }
    return cumulativeIndex;
}

/**
 * Computes the sum of all numeric elements in an array.
 * Non-numeric elements are coerced to numbers if possible.
 * @param {Array<number|string>} numericArray - The array of numbers or numeric strings.
 * @returns {number} The total sum of the array elements.
 */
function sumArrayElements(numericArray) {
    if (!Array.isArray(numericArray)) {
        console.error("Input must be an array for sumArrayElements.");
        return 0;
    }
    return numericArray.reduce((accumulator, currentValue) => accumulator + Number(currentValue), 0);
}

/**
 * Logs a message to the console only if the global debug flag is enabled.
 * @param {*} valueToLog - The value to be logged.
 */
function logIfDebugging(valueToLog) {
    if (IS_DEBUG_ENABLED) {
        console.log("[DEBUG]:", valueToLog);
    }
}

/**
 * Finds the index of the maximum value within a numeric array.
 * Returns -1 if the array is empty.
 * @param {number[]} numericArray - The array to search.
 * @returns {number} The index of the maximum value, or -1 if array is empty.
 */
function findIndexOfMaxValue(numericArray) {
    if (!Array.isArray(numericArray) || numericArray.length === 0) {
        return -1; // Return -1 for empty or invalid arrays
    }

    let maxVal = numericArray[0];
    let maxIdx = 0;

    for (let i = 1; i < numericArray.length; i++) {
        if (numericArray[i] > maxVal) {
            maxVal = numericArray[i];
            maxIdx = i;
        }
    }
    return maxIdx;
}

/**
 * Finds the index of the minimum value within a numeric array.
 * Returns -1 if the array is empty.
 * @param {number[]} numericArray - The array to search.
 * @returns {number} The index of the minimum value, or -1 if array is empty.
 */
function findIndexOfMinValue(numericArray) {
    if (!Array.isArray(numericArray) || numericArray.length === 0) {
        return -1; // Return -1 for empty or invalid arrays
    }

    let minVal = numericArray[0];
    let minIdx = 0;

    for (let i = 1; i < numericArray.length; i++) {
        if (numericArray[i] < minVal) {
            minVal = numericArray[i];
            minIdx = i;
        }
    }
    return minIdx;
}

/**
 * Converts an array of strings into a 2D array of characters.
 * Each string in the input array becomes a row in the output 2D array.
 * @param {string[]} stringArray - An array where each element is a string.
 * @returns {string[][]} A 2D array of characters.
 */
function convertTo2DCharMatrix(stringArray) {
    if (!Array.isArray(stringArray)) {
        console.error("Input must be an array of strings for convertTo2DCharMatrix.");
        return [];
    }
    return stringArray.map(str => String(str).split(''));
}

/**
 * Determines if a given number is a prime number.
 * @param {number} candidateNumber - The integer to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function testForPrimality(candidateNumber) {
    if (typeof candidateNumber !== 'number' || !Number.isInteger(candidateNumber)) {
        return false; // Not an integer
    }
    if (candidateNumber <= 1) {
        return false; // Numbers less than or equal to 1 are not prime
    }
    if (candidateNumber === 2) {
        return true; // 2 is the only even prime number
    }
    if (candidateNumber % 2 === 0) {
        return false; // Other even numbers are not prime
    }

    // Check for divisibility by odd numbers up to the square root of the candidate
    const limit = Math.floor(Math.sqrt(candidateNumber));
    for (let i = 3; i <= limit; i += 2) {
        if (candidateNumber % i === 0) {
            return false; // Found a divisor, so it's not prime
        }
    }
    return true; // No divisors found, it's prime
}

/**
 * Checks if a string represents a non-negative integer (0 or positive whole number).
 * It specifically disallows leading zeros for numbers greater than 0.
 * @param {string} inputString - The string to validate.
 * @returns {boolean} True if the string is a valid non-negative integer representation, false otherwise.
 */
function isValidNumericString(inputString) {
    if (typeof inputString !== 'string') {
        return false;
    }
    // Regular expression to match '0' or positive integers without leading zeros.
    const nonNegativeIntegerPattern = /^(0|[1-9]\d*)$/;
    return nonNegativeIntegerPattern.test(inputString);
}

/**
 * Computes the factorial of a non-negative integer iteratively.
 * @param {number} numberInput - The non-negative integer for which to compute the factorial.
 * @returns {number} The factorial of the input number. Returns 1 for 0, and -1 for invalid input.
 */
function computeFactorial(numberInput) {
    if (typeof numberInput !== 'number' || !Number.isInteger(numberInput) || numberInput < 0) {
        console.error("Factorial input must be a non-negative integer.");
        return -1; // Indicate error for invalid input
    }
    if (numberInput === 0) {
        return 1;
    }
    let result = 1;
    for (let i = 1; i <= numberInput; i++) {
        result *= i;
    }
    return result;
}

/**
 * Rotates a 2D matrix 90 degrees clockwise.
 * Assumes a rectangular matrix.
 * @param {Array<Array<any>>} matrix - The 2D array to rotate.
 * @returns {Array<Array<any>>} A new 2D array representing the rotated matrix.
 */
function rotateMatrix90DegreesClockwise(matrix) {
    if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
        return []; // Handle empty or invalid matrix
    }

    const originalRows = matrix.length;
    const originalCols = matrix[0].length;

    // Create a new matrix with dimensions swapped (cols become rows, rows become cols)
    const rotatedMatrix = Array.from({ length: originalCols }, () => Array(originalRows).fill(undefined));

    for (let r = 0; r < originalRows; r++) {
        for (let c = 0; c < originalCols; c++) {
            // The element at (r, c) in the original matrix moves to (c, originalRows - 1 - r) in the rotated matrix.
            rotatedMatrix[c][originalRows - 1 - r] = matrix[r][c];
        }
    }
    return rotatedMatrix;
}

/**
 * Inserts a subarray into a base array starting at a specified index.
 * Modifies the base array in place.
 * @param {Array<any>} baseArray - The array into which elements will be inserted.
 * @param {Array<any>} subArray - The array of elements to insert.
 * @param {number} startIndex - The zero-based index at which to start inserting.
 * @returns {Array<any>} A reference to the modified baseArray.
 */
function insertSubarrayAtPosition(baseArray, subArray, startIndex) {
    if (!Array.isArray(baseArray) || !Array.isArray(subArray)) {
        console.error("Both baseArray and subArray must be arrays.");
        return baseArray;
    }
    if (startIndex < 0 || startIndex > baseArray.length) {
        console.warn("startIndex is out of bounds. Inserting at the nearest valid position.");
        startIndex = Math.max(0, Math.min(startIndex, baseArray.length));
    }

    baseArray.splice(startIndex, 0, ...subArray);
    return baseArray;
}

/**
 * Reverses a specified segment of an array in place.
 * The reversal includes elements from `startInclusive` up to `endInclusive`.
 * @param {Array<any>} targetArray - The array to modify.
 * @param {number} startInclusive - The starting index of the segment to reverse (inclusive).
 * @param {number} endInclusive - The ending index of the segment to reverse (inclusive).
 * @returns {Array<any>} A reference to the modified targetArray.
 */
function reverseSubarrayInPlace(targetArray, startInclusive, endInclusive) {
    if (!Array.isArray(targetArray)) {
        console.error("Input must be an array for reverseSubarrayInPlace.");
        return targetArray;
    }

    const len = targetArray.length;
    let actualStart = Math.max(0, startInclusive);
    let actualEnd = Math.min(len - 1, endInclusive);

    if (actualStart >= len || actualStart > actualEnd) {
        return targetArray; // Nothing to reverse or invalid range
    }

    while (actualStart < actualEnd) {
        // Swap elements
        [targetArray[actualStart], targetArray[actualEnd]] = [targetArray[actualEnd], targetArray[actualStart]];
        actualStart++;
        actualEnd--;
    }
    return targetArray;
}

/**
 * Pads a number with leading zeros to reach a specified total length.
 * The number is converted to a string before padding.
 * @param {number|string} numberValue - The number or string to pad.
 * @param {number} desiredLength - The total desired length of the resulting string.
 * @returns {string} The zero-padded string.
 */
function padNumberWithLeadingZeros(numberValue, desiredLength) {
    if (typeof desiredLength !== 'number' || desiredLength < 0) {
        console.warn("Desired length for padding must be a non-negative number. Using default length.");
        desiredLength = 0;
    }
    return String(numberValue).padStart(desiredLength, '0');
}

/**
 * Calculates the prime factorization of a given positive integer and returns it as a map (object).
 * The keys are prime factors and values are their corresponding powers.
 * @param {number} numberToFactor - The positive integer to factorize.
 * @returns {Object<string, number>} An object where keys are prime factors (as strings) and values are their counts.
 *                                  Returns an empty object for invalid input or 1.
 */
function getPrimeFactorizationMap(numberToFactor) {
    if (typeof numberToFactor !== 'number' || !Number.isInteger(numberToFactor) || numberToFactor < 1) {
        console.error("Input for prime factorization must be a positive integer.");
        return {};
    }
    if (numberToFactor === 1) {
        return { "1": 1 }; // Special case for 1
    }

    const factors = {};
    let tempNum = numberToFactor; // Use a temporary variable for division

    // Check for factor 2
    while (tempNum % 2 === 0) {
        factors["2"] = (factors["2"] || 0) + 1;
        tempNum /= 2;
    }

    // Check for odd factors starting from 3
    for (let i = 3; i * i <= tempNum; i += 2) {
        while (tempNum % i === 0) {
            factors[String(i)] = (factors[String(i)] || 0) + 1;
            tempNum /= i;
        }
    }

    // If tempNum is still greater than 1, it must be a prime factor itself
    if (tempNum > 1) {
        factors[String(tempNum)] = (factors[String(tempNum)] || 0) + 1;
    }

    return factors;
}

/**
 * Calculates the Greatest Common Divisor (GCD) of two non-negative integers using the iterative Euclidean algorithm.
 * @param {number} numA - The first non-negative integer.
 * @param {number} numB - The second non-negative integer.
 * @returns {number} The GCD of numA and numB. Returns 0 if both inputs are 0.
 */
function calculateGreatestCommonDivisor(numA, numB) {
    if (typeof numA !== 'number' || typeof numB !== 'number' || numA < 0 || numB < 0 || !Number.isInteger(numA) || !Number.isInteger(numB)) {
        console.error("GCD inputs must be non-negative integers.");
        return 0; // Or throw an error
    }

    while (numB !== 0) {
        let temp = numB;
        numB = numA % numB;
        numA = temp;
    }
    return numA;
}

/**
 * Calculates the Least Common Multiple (LCM) of two non-negative integers.
 * Uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {number} numA - The first non-negative integer.
 * @param {number} numB - The second non-negative integer.
 * @returns {number} The LCM of numA and numB. Returns 0 if either input is 0.
 */
function calculateLeastCommonMultiple(numA, numB) {
    if (typeof numA !== 'number' || typeof numB !== 'number' || numA < 0 || numB < 0 || !Number.isInteger(numA) || !Number.isInteger(numB)) {
        console.error("LCM inputs must be non-negative integers.");
        return 0; // Or throw an error
    }
    if (numA === 0 || numB === 0) {
        return 0; // LCM is 0 if any number is 0
    }
    // Use Math.abs for generality, though inputs are non-negative here.
    return (Math.abs(numA * numB) / calculateGreatestCommonDivisor(numA, numB));
}

/**
 * A standard numeric comparator function for sorting arrays in ascending order.
 * Can be passed directly to `Array.prototype.sort()`.
 * @param {number} valA - The first value for comparison.
 * @param {number} valB - The second value for comparison.
 * @returns {number} A negative value if valA < valB, zero if valA == valB, a positive value if valA > valB.
 */
function numericComparator(valA, valB) {
    return valA - valB;
}

/**
 * Performs a binary search on a sorted array to find the index of the largest element
 * that is less than or equal to the target value. If the target is smaller than all elements,
 * it returns the index where it would be inserted (0). If target is larger than all, it returns
 * array.length (insertion point).
 * @param {number[]} sortedArray - The array to search, must be sorted in ascending order.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the largest element <= targetValue, or the insertion point.
 */
function performBinarySearchForLargestSmallerOrEqual(sortedArray, targetValue) {
    if (!Array.isArray(sortedArray) || sortedArray.length === 0) {
        return 0; // Edge case: empty array, insertion point is 0
    }

    let lowIdx = 0;
    let highIdx = sortedArray.length - 1;
    let resultIdx = -1; // Stores the potential index of the largest element <= target

    while (lowIdx <= highIdx) {
        const midIdx = Math.floor((lowIdx + highIdx) / 2);

        if (sortedArray[midIdx] <= targetValue) {
            resultIdx = midIdx; // This element is a candidate, try for a larger one on the right
            lowIdx = midIdx + 1;
        } else {
            highIdx = midIdx - 1; // Element is too large, search in the left half
        }
    }

    // If a match or suitable element was found, return its index.
    // Otherwise, 'lowIdx' will be the insertion point if no element <= target was found.
    return resultIdx !== -1 ? resultIdx : lowIdx;
}

/**
 * Splits a given string into an array of strings, using the newline character as a delimiter.
 * @param {string} textInput - The string to split.
 * @returns {string[]} An array of strings, each representing a line from the input.
 */
function splitStringByNewlines(textInput) {
    if (typeof textInput !== 'string') {
        console.error("Input for splitStringByNewlines must be a string.");
        return [];
    }
    return textInput.split('\n');
}

/**
 * Checks if an array of elements is sorted in ascending order.
 * Works for arrays of numbers or strings that can be compared.
 * @param {Array<any>} inputArray - The array to check.
 * @returns {boolean} True if the array is sorted ascending, false otherwise.
 */
function checkIfArrayIsSortedAscending(inputArray) {
    if (!Array.isArray(inputArray)) {
        console.error("Input must be an array for checkIfArrayIsSortedAscending.");
        return false;
    }
    if (inputArray.length <= 1) {
        return true; // An array with 0 or 1 element is considered sorted
    }
    // Use the 'every' method to check the condition for all elements
    return inputArray.every((currentElement, index, arr) => {
        if (index === 0) {
            return true; // First element has no preceding element to compare with
        }
        return currentElement >= arr[index - 1];
    });
}

/**
 * An alternative, efficient method to calculate the prime factors of a positive integer.
 * Returns an object where keys are prime factors and values are their exponents.
 * @param {number} numberValue - The positive integer to factorize.
 * @returns {Object<string, number>} An object mapping prime factors to their counts.
 */
function calculatePrimeFactorsEfficiently(numberValue) {
    if (typeof numberValue !== 'number' || !Number.isInteger(numberValue) || numberValue < 1) {
        console.error("Input for efficient prime factorization must be a positive integer.");
        return {};
    }
    if (numberValue === 1) {
        return { "1": 1 };
    }

    const primeFactorsMap = {};
    let currentNumber = numberValue;
    let divisor = 2; // Start with the smallest prime

    // Handle factor 2
    while (currentNumber % divisor === 0) {
        primeFactorsMap[String(divisor)] = (primeFactorsMap[String(divisor)] || 0) + 1;
        currentNumber /= divisor;
    }

    divisor = 3; // Move to odd divisors
    // Check odd divisors up to the square root of the remaining number
    while (divisor * divisor <= currentNumber) {
        while (currentNumber % divisor === 0) {
            primeFactorsMap[String(divisor)] = (primeFactorsMap[String(divisor)] || 0) + 1;
            currentNumber /= divisor;
        }
        divisor += 2; // Increment by 2 to check only odd numbers
    }

    // If currentNumber is still greater than 1, it must be a prime factor itself
    if (currentNumber > 1) {
        primeFactorsMap[String(currentNumber)] = (primeFactorsMap[String(currentNumber)] || 0) + 1;
    }

    return primeFactorsMap;
}