// Type III Clone Generation - Original: Selection Sort with swap count

// Configuration for input/output operations.
let fileSystemConfig = {
    sourceFilePath: '/dev/stdin', // Specifies the standard input device path.
    lineDelimiter: '\n'           // Defines the character used to separate lines in the input stream.
};

/**
 * Safely reads the entire content from the configured input source and processes it into an array of lines.
 * Includes error handling for file system operations.
 * @returns {string[]} An array where each element is a line from the input, with empty lines filtered out.
 */
const retrieveAndProcessInput = () => {
    let rawInputContent = '';
    try {
        // Attempt to read the entire file content synchronously using Node.js 'fs' module.
        rawInputContent = require('fs').readFileSync(fileSystemConfig.sourceFilePath, 'utf-8');
    } catch (readError) {
        // If file reading fails, log an error message and terminate the process.
        console.error("Critical Error: Failed to read input source:", readError.message);
        process.exit(1);
    }

    // Split the raw content into individual lines based on the defined delimiter.
    const contentLines = rawInputContent.split(fileSystemConfig.lineDelimiter);

    // Filter out any lines that are empty or contain only whitespace, ensuring clean data.
    return contentLines.filter(aLine => aLine.trim() !== '');
};

/**
 * Sorts an array of numbers using the Selection Sort algorithm.
 * This function also counts the number of actual swaps (exchanges) performed.
 *
 * @param {number[]} dataArray - The array of numeric values to be sorted.
 * @param {boolean} [enableDetailedOutput=true] - If true, the sorted array will be logged to console.
 * @returns {number} The total count of element exchanges, or -1 if input is invalid.
 */
const orderNumericsViaSelection = (dataArray, enableDetailedOutput = true) => {
    // Input validation: Ensure `dataArray` is an actual array and contains only numbers.
    if (!Array.isArray(dataArray) || dataArray.some(val => typeof val !== 'number' || isNaN(val))) {
        console.error("Runtime Error: Input for sorting must be an array containing only valid numeric values.");
        return -1; // Return an error indicator.
    }

    const currentArrayLength = dataArray.length;
    // Optimization: If the array is empty or has only one element, it's already sorted.
    if (currentArrayLength <= 1) {
        if (enableDetailedOutput) {
            // If output is requested, print the (already sorted) array.
            console.log(dataArray.map(item => String(item)).join(' '));
        }
        return 0; // No swaps were necessary.
    }

    let exchangeCounter = 0; // Initialize a counter for tracking actual element swaps.

    // Outer loop: Iterates through each position from the beginning up to the second-to-last element.
    // The last element will automatically be in its correct place after n-1 passes.
    for (let outerIndex = 0; outerIndex < currentArrayLength - 1; outerIndex++) {
        let minimumValueIndex = outerIndex; // Assume the element at `outerIndex` is the smallest in the unsorted segment.

        // Inner loop: Searches for the smallest element within the remaining unsorted part of the array.
        // It starts from the element immediately following `outerIndex`.
        for (let innerPointer = outerIndex + 1; innerPointer < currentArrayLength; innerPointer++) {
            // If a smaller element is found, update the index of the minimum element.
            if (dataArray[innerPointer] < dataArray[minimumValueIndex]) {
                minimumValueIndex = innerPointer;
            }
        }

        // Perform a swap only if the smallest element found is not already at the current `outerIndex` position.
        if (minimumValueIndex !== outerIndex) {
            // Utilize array destructuring for a concise and efficient element swap.
            [dataArray[outerIndex], dataArray[minimumValueIndex]] = [dataArray[minimumValueIndex], dataArray[outerIndex]];
            exchangeCounter++; // Increment the swap counter for each actual exchange.
        }
    }

    // If detailed output is explicitly enabled, print the final sorted array.
    if (enableDetailedOutput) {
        console.log(dataArray.map(item => String(item)).join(' '));
    }

    // Return the total number of swaps performed during the sorting process.
    return exchangeCounter;
};

// --- Main application execution flow ---
// The program expects input from /dev/stdin in a specific format:
// Line 1: An integer N, representing the count of numbers that follow.
// Line 2: N space-separated integer values, which are the numbers to be sorted.

const allInputLines = retrieveAndProcessInput();

// Initial validation: Ensure there are at least two lines of input (for N and the numbers).
if (allInputLines.length < 2) {
    console.error("Input Format Error: Insufficient input lines provided. Expected at least two lines.");
    process.exit(1); // Terminate due to invalid input format.
}

// Attempt to parse the array of numbers from the second line of input.
// `trim()` removes leading/trailing whitespace, `Number()` converts string to number, handling various formats.
const initialNumericSet = allInputLines[1].split(' ').map(valStr => Number(valStr.trim())).filter(val => !isNaN(val));

// Validate the expected count from the first line against the actual number of parsed elements.
const expectedCount = Number(allInputLines[0].trim());
if (isNaN(expectedCount) || expectedCount < 0) {
    console.warn("Input Warning: The first line (expected element count) is invalid or missing. Proceeding with the actual number of parsed elements.");
} else if (initialNumericSet.length !== expectedCount) {
    console.warn(`Input Warning: Expected ${expectedCount} elements based on the first line, but found ${initialNumericSet.length} actual numeric values.`);
}

// Execute the sorting algorithm with the parsed numeric set.
// We pass `true` as the second argument to ensure the sorted array is logged by the function.
const totalSwapsMade = orderNumericsViaSelection(initialNumericSet, true);

// Output the final count of element exchanges, provided the sorting function didn't return an error.
if (totalSwapsMade !== -1) { // Check if the sorting process was successful (not an error state).
    console.log(totalSwapsMade);
}