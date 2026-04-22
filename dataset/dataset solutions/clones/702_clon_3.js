// Import the Node.js file system module for reading input files.
const fileSystemModule = require('fs');

// Define the standard input file path as a constant.
const standardInputSource = '/dev/stdin';

/**
 * Calculates the trimmed mean of a given array of numeric values.
 * This function sorts the array, removes the smallest and largest elements,
 * and then computes the floor of the average of the remaining values.
 *
 * @param {Array<number>} numericValueCollection - An array of numbers (which may include NaN values
 *                                                 resulting from invalid input lines).
 * @returns {number} The integer part (floor) of the trimmed mean, or NaN if a meaningful
 *                   calculation cannot be performed (e.g., insufficient valid numbers after trimming).
 */
const computeTrimmedMean = (numericValueCollection) => {
    // Implement a robust guard clause for invalid or empty input collections.
    // If the input is not a proper array or contains no elements, return NaN.
    if (!Array.isArray(numericValueCollection) || numericValueCollection.length === 0) {
        return NaN; // Indicates an undefined or uncomputable result.
    }

    // Create a mutable shallow copy of the input array to prevent modifying the original data.
    // Sort the copied array numerically in ascending order.
    // JavaScript's default sort for numbers can place NaN values at the end of the array.
    const orderedValueList = [...numericValueCollection].sort((valueOne, valueTwo) => valueOne - valueTwo);

    // Attempt to remove the smallest element from the beginning of the sorted list.
    // This operation modifies 'orderedValueList' in place.
    if (orderedValueList.length > 0) {
        orderedValueList.shift();
    }

    // Attempt to remove the largest element from the end of the sorted list.
    // This operation also modifies 'orderedValueList' in place.
    if (orderedValueList.length > 0) {
        orderedValueList.pop();
    }

    // After trimming, filter out any non-numeric (NaN) values that might still be present.
    // These NaNs would have been left if they were not the absolute min/max.
    const validRemainingElements = orderedValueList.filter(item => !isNaN(item));

    // If, after all trimming and filtering, no valid numbers remain, an average cannot be computed.
    // The original code would throw a TypeError for `reduce` on an empty array.
    // Returning NaN here consistently represents such an undefined numeric result.
    if (validRemainingElements.length === 0) {
        return NaN;
    }

    // Initialize a variable to accumulate the sum of the remaining valid elements.
    let cumulativeSum = 0;
    // Iterate through the filtered list and add each valid number to the sum.
    for (const numberValue of validRemainingElements) {
        cumulativeSum += numberValue;
    }

    // Calculate the arithmetic mean by dividing the cumulative sum by the count of valid elements.
    const calculatedArithmeticMean = cumulativeSum / validRemainingElements.length;

    // Return the floor (largest integer less than or equal to) of the calculated mean.
    return Math.floor(calculatedArithmeticMean);
};

// Step 1: Read all raw content from the standard input file.
// The content is decoded as UTF-8 and any leading/trailing whitespace is removed.
let rawInputContent = fileSystemModule.readFileSync(standardInputSource, 'utf8').trim();

// Step 2: Implement an initial input validation check.
// If the raw input content is empty, there's nothing to process, so the script can terminate.
if (rawInputContent.length === 0) {
    // As per typical competitive programming scenarios, no output is usually expected for empty input.
    process.exit(0);
}

// Step 3: Parse the raw input string into an array of numbers.
// Each line in the input is converted to a numeric type. If a line cannot be parsed as a number,
// it will result in a `NaN` value within the array, mimicking the original behavior.
const parsedNumericEntries = rawInputContent.split('\n').map((singleLineText) => Number(singleLineText));

// Step 4: Main processing loop to handle multiple data sets.
// This loop is designed to run indefinitely until an explicit break condition is met.
let processedDatasetCounter = 0; // An auxiliary counter to track the number of datasets processed.
while (true) {
    // Extract the first number from the `parsedNumericEntries` array. This number
    // indicates the count of subsequent data points for the current dataset.
    // If `parsedNumericEntries` is empty, `shift()` returns `undefined`, which `Number()` would convert to `NaN`.
    const currentDatasetSize = parsedNumericEntries.shift();

    // Check for the loop termination condition: if `currentDatasetSize` is explicitly zero.
    // The original code uses `while (n = lines.shift())` which terminates if `n` is 0 or falsy (like NaN).
    // Our explicit check for `0` closely matches the intent for termination.
    if (currentDatasetSize === 0) {
        break; // Exit the processing loop.
    }

    // Increment the dataset counter for reporting or tracking purposes.
    processedDatasetCounter++;

    // Pre-allocate an array to store the data points for the current dataset.
    // If `currentDatasetSize` is `NaN` (from an empty line or non-numeric header),
    // `new Array(NaN)` creates an empty array, which is handled gracefully.
    const currentDataBatch = new Array(currentDatasetSize);

    // Populate the `currentDataBatch` with the specified number of entries.
    // If `parsedNumericEntries` runs out of elements before `currentDatasetSize` is met,
    // `parsedNumericEntries.shift()` will yield `undefined`, which becomes `NaN` in `currentDataBatch`.
    for (let indexIterator = 0; indexIterator < currentDatasetSize; indexIterator++) {
        currentDataBatch[indexIterator] = Number(parsedNumericEntries.shift());
    }

    // Step 5: Invoke the helper function to calculate the trimmed mean for the current batch.
    const finalComputedResult = computeTrimmedMean(currentDataBatch);

    // Step 6: Output the calculated result to the console.
    // If `finalComputedResult` is NaN (due to invalid input or calculation issues), `NaN` will be printed.
    console.log(finalComputedResult);
}

// End of script execution.