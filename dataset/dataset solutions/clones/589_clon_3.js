const fileSystem = require('fs');

// Reads the entire standard input stream as a UTF-8 encoded string.
// In environments like competitive programming, '/dev/stdin' is a common path for input.
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// --- Input Processing and Setup ---

// Processes the raw input string:
// 1. `trim()`: Removes leading and trailing whitespace (e.g., newline characters at the end).
// 2. `split('\n')`: Divides the string into an array of substrings, using the newline character as a delimiter.
// 3. `filter(line => line.length > 0)`: Removes any empty strings that might result from `split()`
//    (e.g., if there were multiple consecutive newlines or a newline at the very end).
// This `processedDataQueue` array will serve as our sequential data source.
let processedDataQueue = rawInputData.trim().split('\n').filter(line => line.length > 0);

/**
 * A robust utility function designed to extract the next string item from a queue
 * and convert it into a numeric value.
 * This function specifically replicates the behavior of `value - 0` in JavaScript:
 * - If the queue is empty, `shift()` returns `undefined`, and `Number(undefined)` yields `NaN`.
 * - If the extracted string cannot be parsed as a number (e.g., "abc"), `Number("abc")` yields `NaN`.
 * - Valid numeric strings (e.g., "123") are converted to their corresponding number.
 *
 * @param {string[]} dataQueue - The array serving as the source queue for string inputs.
 * @returns {number} The numeric representation of the next item, or `NaN` if parsing fails or the queue is exhausted.
 */
const getNextNumericValue = (dataQueue) => {
    // `shift()` removes and returns the first element from the array.
    const nextStringItem = dataQueue.shift();
    // `Number()` is used for explicit type conversion.
    return Number(nextStringItem);
};

// Defines a constant for the fixed number of subsequent values that need to be summed
// in each processing block. Using a constant improves code clarity and maintainability.
const VALUES_TO_SUM_PER_BLOCK = 10;

// --- Main Data Processing Loop ---

// The program iterates through blocks of data. The loop continues as long as there are
// potential data entries remaining in the `processedDataQueue` to initiate a new block.
while (processedDataQueue.length > 0) {
    // The very first numeric value in each block is treated as a 'target' or 'expected' sum.
    // This value will be compared against the sum of the next `VALUES_TO_SUM_PER_BLOCK` items.
    const blockTargetValue = getNextNumericValue(processedDataQueue);

    // --- Termination Condition ---
    // If `blockTargetValue` is explicitly `0`, it acts as a sentinel value, signaling
    // that there are no more data blocks to process, and the program should terminate.
    // Note: If `blockTargetValue` is `NaN` (due to invalid input or an empty queue),
    // the original code would not break here (`NaN == 0` is false) but would propagate `NaN`
    // through the calculations, which this clone aims to maintain.
    if (blockTargetValue === 0) {
        break; // Exit the main processing loop.
    }

    // Initializes an accumulator for the sum of the subsequent values in the current block.
    let currentBlockSum = 0;

    // --- Batch Summation Loop ---
    // This loop collects and sums exactly `VALUES_TO_SUM_PER_BLOCK` numeric values.
    for (let itemIndex = 0; itemIndex < VALUES_TO_SUM_PER_BLOCK; itemIndex++) {
        // Retrieves the next numeric value from the queue.
        const itemForSummation = getNextNumericValue(processedDataQueue);

        // Adds the retrieved value to the running sum.
        // Important: If `itemForSummation` is `NaN` (e.g., from invalid input),
        // adding `NaN` to `currentBlockSum` will cause `currentBlockSum` itself to become `NaN`.
        // This behavior precisely mirrors the original JavaScript code's handling of non-numeric input.
        currentBlockSum += itemForSummation;
    }

    // --- Result Calculation and Output ---
    // Computes the final difference between the `blockTargetValue` and the `currentBlockSum`.
    // If `currentBlockSum` (or `blockTargetValue`) is `NaN`, their difference will also be `NaN`,
    // ensuring consistent error propagation as in the original implementation.
    const finalDifference = blockTargetValue - currentBlockSum;

    // Prints the calculated difference to the standard output.
    console.log(finalDifference);
}

// The script concludes its execution after the loop terminates.