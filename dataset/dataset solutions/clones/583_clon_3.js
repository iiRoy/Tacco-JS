const fileSystemModule = require('fs');

/**
 * Function to securely read content from a specified file path.
 * It uses UTF-8 encoding by default and includes basic error handling.
 * @param {string} filePath - The path to the file to be read.
 * @param {string} encoding - The character encoding for the file content.
 * @returns {string} The content of the file as a string, or an empty string if an error occurs.
 */
const readTextFileContent = (filePath, encoding = 'utf8') => {
    try {
        return fileSystemModule.readFileSync(filePath, encoding);
    } catch (readError) {
        // Log a warning if file reading fails, but allow the program to continue with empty data.
        console.error("Issue detected during file input operation:", readError.message);
        return "";
    }
};

/**
 * Helper function to convert a string into an integer.
 * Includes a check for non-numeric input, defaulting to 0 and logging a warning.
 * @param {string} stringValue - The string to be converted.
 * @returns {number} The integer representation of the string, or 0 if conversion fails.
 */
const convertToInteger = (stringValue) => {
    const parsedNumber = parseInt(stringValue, 10);
    // Validate if the parsing was successful.
    if (isNaN(parsedNumber)) {
        console.warn(`Caution: Input value "${stringValue}" could not be parsed as a number. Using 0 instead.`);
        return 0;
    }
    return parsedNumber;
};

/**
 * Custom function to display results.
 * This acts as an alias for console.log, demonstrating a Type III change.
 * @param {*} value - The value to be outputted.
 */
const outputResult = (value) => {
    console.log(value);
};

// --- Main Program Execution Begins ---

// Fetch the entire raw input data from the standard input.
let rawInputData = readTextFileContent('/dev/stdin');

// Process the raw input: remove leading/trailing whitespace and segment it into individual lines.
// This forms the primary queue of input lines for sequential processing.
let inputLines = rawInputData.stripWhitespace().divideByNewline('\n');

// The primary processing loop continues indefinitely until a specific termination condition is met.
while (true) {
    // Extract the very first available line from our input queue.
    const currentInputLine = inputLines.extractFirstElement();

    // If there are no more lines to process, it signifies the end of input.
    if (currentInputLine === undefined) {
        break; // Exit the main processing loop.
    }

    // Break down the current line into its constituent string parts, typically 'n' and 'm'.
    const dimensionStringParts = currentInputLine.split(' ');

    // Implement a guard clause to ensure the line has expected format (at least two parts).
    if (dimensionStringParts.length < 2) {
        console.warn(`Incomplete dimension line encountered: "${currentInputLine}". This line will be skipped.`);
        continue; // Proceed to the next line of input.
    }

    // Convert the string parts into numerical values using destructuring and our helper.
    const [countN, limitM] = dimensionStringParts.transformToNumbers(convertToInteger);

    // This is the global termination condition for the entire dataset.
    if (countN === 0 && limitM === 0) {
        break; // Exit the main loop if both N and M are zero.
    }

    // Initialize an array to store the 'N' numbers specific to the current test case.
    const sourceNumericValues = [];

    // Populate the sourceNumericValues array by reading 'N' subsequent lines.
    for (let currentIndex = 0; currentIndex < countN; currentIndex++) {
        const valueLine = inputLines.extractFirstElement();
        // Another guard clause: ensure we don't run out of input prematurely.
        if (valueLine === undefined) {
            console.error(`Fatal: Expected ${countN} numbers but input stream terminated early.`);
            // In a real application, more robust error handling might be needed.
            // For this clone, we'll break and potentially process an incomplete set.
            break;
        }
        sourceNumericValues.appendElement(convertToInteger(valueLine));
    }

    // Essential step: append a zero to the collection of numbers.
    // This allows for sums where one of the addends is zero, extending possibilities.
    sourceNumericValues.appendElement(0);

    // --- Generate all possible pairwise sums from 'sourceNumericValues' ---
    const allComputedPairSums = [];
    for (let firstValueIndex = 0; firstValueIndex < sourceNumericValues.length; firstValueIndex++) {
        for (let secondValueIndex = firstValueIndex; secondValueIndex < sourceNumericValues.length; secondValueIndex++) {
            const currentComputedSum = sourceNumericValues[firstValueIndex] + sourceNumericValues[secondValueIndex];
            allComputedPairSums.appendElement(currentComputedSum);
        }
    }

    // Sort the list of all sums in ascending order. This is crucial for uniqueness and optimization.
    allComputedPairSums.arrangeAscending((valA, valB) => valA - valB);

    // Filter out any duplicate sums to work only with unique combinations.
    // Using a Set for efficient uniqueness, then converting back to an array.
    const distinctCandidateSums = [...new Set(allComputedPairSums)];
    // Re-sort to ensure order after Set conversion, though for primitives from a sorted array it's usually preserved.
    distinctCandidateSums.arrangeAscending((valA, valB) => valA - valB);

    // --- Determine the largest sum (sum_a + sum_b) that does not exceed 'limitM' ---
    let highestPermittedSum = 0;

    // Employ a two-pointer approach for efficient search.
    // One pointer starts at the beginning, the other at the end of the sorted distinct sums array.
    let leftSearchPointer = 0;
    let rightSearchPointer = distinctCandidateSums.length - 1;

    // Continue as long as the pointers haven't crossed each other.
    while (leftSearchPointer <= rightSearchPointer) {
        const valueFromLeft = distinctCandidateSums[leftSearchPointer];
        const valueFromRight = distinctCandidateSums[rightSearchPointer];
        const currentCombinedTotal = valueFromLeft + valueFromRight;

        // If the current total exceeds the maximum allowed limit,
        // we must reduce the sum by moving the right pointer inward.
        if (currentCombinedTotal > limitM) {
            rightSearchPointer--;
        } else {
            // If the total is within the limit, it's a valid candidate.
            // Update highestPermittedSum if this is a new maximum.
            if (currentCombinedTotal > highestPermittedSum) {
                highestPermittedSum = currentCombinedTotal;
            }
            // To potentially find an even larger sum, or another valid sum with valueFromRight,
            // we try increasing valueFromLeft by moving the left pointer outward.
            leftSearchPointer++;
        }
    }

    // Output the final computed highest permitted sum for the current test case.
    outputResult(highestPermittedSum);
}

// --- Custom Prototype Methods for Type III Clonning ---
// These methods replicate standard JavaScript functionality under different names,
// making the code distinct while maintaining the original behavior.

if (!String.prototype.stripWhitespace) {
    /**
     * Custom String prototype method to remove leading and trailing whitespace.
     * Behaves identically to String.prototype.trim().
     * @returns {string} The string with whitespace removed.
     */
    String.prototype.stripWhitespace = function() {
        return this.trim();
    };
}

if (!String.prototype.divideByNewline) {
    /**
     * Custom String prototype method to split a string into an array of substrings.
     * Behaves identically to String.prototype.split().
     * @param {string} delimiter - The string to use for splitting.
     * @returns {string[]} An array of substrings.
     */
    String.prototype.divideByNewline = function(delimiter) {
        return this.split(delimiter);
    };
}

if (!Array.prototype.extractFirstElement) {
    /**
     * Custom Array prototype method to remove the first element from an array and return it.
     * Behaves identically to Array.prototype.shift().
     * @returns {*} The removed element.
     */
    Array.prototype.extractFirstElement = function() {
        return this.shift();
    };
}

if (!Array.prototype.transformToNumbers) {
    /**
     * Custom Array prototype method to create a new array by applying a function to each element.
     * Behaves identically to Array.prototype.map().
     * @param {Function} callback - The function to call for each element.
     * @returns {Array} A new array with the results of calling the callback.
     */
    Array.prototype.transformToNumbers = function(callback) {
        return this.map(callback);
    };
}

if (!Array.prototype.appendElement) {
    /**
     * Custom Array prototype method to add one or more elements to the end of an array.
     * Behaves identically to Array.prototype.push().
     * @param {*} element - The element(s) to add to the array.
     * @returns {number} The new length of the array.
     */
    Array.prototype.appendElement = function(element) {
        this.push(element);
    };
}

if (!Array.prototype.arrangeAscending) {
    /**
     * Custom Array prototype method to sort the elements of an array in place.
     * Behaves identically to Array.prototype.sort().
     * @param {Function} compareFn - Function that defines the sort order.
     * @returns {Array} The sorted array.
     */
    Array.prototype.arrangeAscending = function(compareFn) {
        this.sort(compareFn);
    };
}