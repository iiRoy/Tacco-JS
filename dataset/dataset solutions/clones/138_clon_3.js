const fileSystemModule = require("fs"); // Renamed 'fs' to 'fileSystemModule'

// Define a constant for the standard input path, enhancing readability
const STANDARD_INPUT_SOURCE = "/dev/stdin";

/**
 * Processes a single string record containing comma-separated numerical data.
 * It performs a series of calculations including cumulative sums, scaling,
 * and then finds a specific index based on the processed data.
 *
 * @param {string} recordLineString The input string containing comma-separated numbers.
 */
function processDataRecord(recordLineString) { // Renamed the anonymous function and its parameter 'i'
    // Step 1: Parse the input string into an array of numbers.
    // Explicitly converting to Number to avoid implicit type coercion issues.
    let numericDataSet = recordLineString.split(',').map(Number); // Renamed 'j' to 'numericDataSet'

    // Guard clause: Ensure there are enough data points for the calculations.
    // The original code implicitly assumes at least 12 elements.
    if (numericDataSet.length < 12) {
        console.error(`Warning: Record "${recordLineString}" has insufficient data points (${numericDataSet.length} < 12). Skipping.`);
        return; // Exit early if data is malformed
    }

    let runningAccumulator = 0; // Renamed 's' to 'runningAccumulator'
    let currentElementIterator = 0; // Renamed 'm' to 'currentElementIterator'

    // Step 2: Calculate negative prefix sums for the first 10 elements.
    // The original logic `j[m]=s-=j[m]` is split for clarity.
    // 'runningAccumulator' eventually holds the negative sum of the first 10 original elements.
    for (currentElementIterator = 0; currentElementIterator < 10; currentElementIterator++) {
        // Subtract the current value from the accumulator
        runningAccumulator -= numericDataSet[currentElementIterator];
        // Store the updated accumulator value back into the array, overwriting the original element.
        numericDataSet[currentElementIterator] = runningAccumulator;
    }

    // Step 3: Extract specific values for the scaling factor calculation.
    // These correspond to j[10] and j[11] in the original code.
    const divisorNumerator = numericDataSet[10];
    const divisorComponentA = numericDataSet[10];
    const divisorComponentB = numericDataSet[11];

    // Calculate the denominator for the scaling factor.
    const calculatedDenominator = -divisorComponentA - divisorComponentB;

    // Guard clause: Prevent division by zero, which would result in Infinity or NaN.
    if (calculatedDenominator === 0) {
        console.error(`Warning: Division by zero detected in record "${recordLineString}". Skipping.`);
        return; // Exit early to prevent errors
    }

    // Step 4: Calculate the scaling factor and apply it to the running accumulator.
    const dynamicScalingFactor = divisorNumerator / calculatedDenominator;
    runningAccumulator *= dynamicScalingFactor;

    let targetPositionIndex = 0; // Renamed 'n' to 'targetPositionIndex', initialized separately

    // Step 5: Find the first index where the element value is not strictly greater than
    // the negative of the scaled running accumulator.
    // The original `for` loop with an empty body is rewritten as a `while` loop for improved readability.
    while (targetPositionIndex < numericDataSet.length && numericDataSet[targetPositionIndex] > -runningAccumulator) {
        targetPositionIndex++; // Increment the index
    }

    // Step 6: Output the 1-based index.
    // The original `console.log(++n)` is equivalent to `console.log(n + 1)`.
    console.log(targetPositionIndex + 1);
}

// Main execution block to read and process input
try {
    // Read the entire content from the specified standard input path.
    // Using 'utf-8' encoding for consistency, instead of 'utf8'.
    const rawInputBuffer = fileSystemModule.readFileSync(STANDARD_INPUT_SOURCE, 'utf-8');

    // Process the raw input:
    // 1. Trim leading/trailing whitespace from the entire input.
    // 2. Split the content into an array of records using one or more whitespace characters as delimiters.
    //    Using `/\s+/` is more robust than `/\s/` as it handles multiple spaces/newlines.
    // 3. Filter out any empty strings that might result from splitting (e.g., if input ends with a newline).
    const processedInputRecords = rawInputBuffer
        .trim()
        .split(/\s+/)
        .filter(record => record.length > 0); // Added filter for robustness

    // Iterate over each cleaned record and apply the processing function.
    // Using forEach as the original code's map return value was not used.
    processedInputRecords.forEach(processDataRecord);

} catch (inputError) {
    // Catch and report any errors that occur during file reading or processing.
    console.error("An error occurred during input processing:", inputError.message);
}