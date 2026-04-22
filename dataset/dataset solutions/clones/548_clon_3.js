// This module orchestrates the reading of standard input and
// performs a specific calculation involving pairs of numbers.

// A global buffer to accumulate all incoming data from stdin.
let dataAccumulator = '';

/**
 * Processes an array of string lines, performing numeric analysis
 * and aggregating sums based on value comparisons.
 *
 * @param {string[]} inputDataArray An array where the first element is the
 *                                  count of pairs to process, and subsequent
 *                                  elements are space-separated numeric pairs.
 */
function processNumericDataAggregations(inputDataArray) {
    // Initialize mutable accumulators for the two categories of sums.
    let firstCategoryTotal = 0; // Corresponds to original 'a'
    let secondCategoryTotal = 0; // Corresponds to original 'b'

    // --- Initial Input Validation and Configuration Parsing ---
    if (!inputDataArray || inputDataArray.length === 0) {
        console.error("ERROR: No input data lines were provided for processing.");
        return; // Terminate if no input
    }

    const countLineContent = inputDataArray[0].trim();
    if (!countLineContent) {
        console.error("ERROR: The first line, which should specify the number of pairs, is empty.");
        return;
    }

    // Convert the first line to an integer, representing the number of data pairs expected.
    const expectedIterations = Number(countLineContent);
    if (isNaN(expectedIterations) || expectedIterations < 0) {
        console.error(`ERROR: Invalid numerical pair count detected: '${countLineContent}'. A non-negative number is required.`);
        return;
    }

    // Obtain the actual data lines by skipping the first count line.
    const rawDataSegments = inputDataArray.slice(1);

    // Provide a warning if the number of actual data lines is less than expected.
    if (rawDataSegments.length < expectedIterations) {
        console.warn(`WARNING: Expected ${expectedIterations} data pairs, but only ${rawDataSegments.length} lines are available. Processing available data.`);
    }

    // Determine the actual number of iterations to perform,
    // ensuring we don't go out of bounds or process more than expected.
    const actualProcessingCount = Math.min(expectedIterations, rawDataSegments.length);

    // --- Main Data Pair Iteration and Calculation Loop ---
    for (let currentPairIndex = 0; currentPairIndex < actualProcessingCount; ++currentPairIndex) {
        const currentDataRow = rawDataSegments[currentPairIndex].trim();

        // Skip processing for any empty data rows encountered.
        if (!currentDataRow) {
            console.warn(`NOTICE: Skipping an empty data row at logical index ${currentPairIndex + 1}.`);
            continue;
        }

        // Split the current row by one or more whitespace characters and filter out empty strings.
        const parsedNumericStrings = currentDataRow.split(/\s+/).filter(segment => segment !== '');

        // Validate that the row contains at least two numeric segments.
        if (parsedNumericStrings.length < 2) {
            console.warn(`NOTICE: Malformed data row at logical index ${currentPairIndex + 1}: '${currentDataRow}'. Expected two numbers, found ${parsedNumericStrings.length}. Skipping.`);
            continue;
        }

        // Convert the string segments to actual numbers.
        const valueOne = Number(parsedNumericStrings[0]);
        const valueTwo = Number(parsedNumericStrings[1]);

        // Validate that both converted values are indeed numbers.
        if (isNaN(valueOne) || isNaN(valueTwo)) {
            console.warn(`NOTICE: Skipping data row due to non-numeric values at logical index ${currentPairIndex + 1}: '${currentDataRow}'.`);
            continue;
        }

        // Calculate the combined sum of the current pair for efficiency.
        const pairCombinedSum = valueOne + valueTwo;

        // Apply conditional aggregation logic based on the comparison of the two values.
        if (valueOne === valueTwo) {
            // If values are equal, add each value to its respective total.
            // This is equivalent to adding half the combined sum to each, or simply adding valueOne to both.
            firstCategoryTotal += valueOne;
            secondCategoryTotal += valueTwo;
        } else {
            // If values are different, add the combined sum to one of the totals.
            if (valueOne > valueTwo) {
                firstCategoryTotal += pairCombinedSum;
            } else { // valueOne < valueTwo
                secondCategoryTotal += pairCombinedSum;
            }
        }
    }

    // Output the final aggregated sums using a template literal for clarity.
    // The output format is maintained to be consistent with the original problem's expectation.
    console.log(`${firstCategoryTotal} ${secondCategoryTotal}`);
}

// --- Standard Input Stream Configuration ---
// Ensure the standard input stream remains open and ready to receive data.
process.stdin.resume();
// Specify the character encoding for the incoming data.
process.stdin.setEncoding('utf8');

// Attach an event listener for when data chunks are received.
process.stdin.on('data', (incomingChunk) => {
    dataAccumulator += incomingChunk; // Append each chunk to our global buffer.
});

// Attach an event listener for when the end of the input stream is reached.
process.stdin.on('end', () => {
    // Once all data is received, split it into individual lines.
    // Trimming and further processing of individual lines will occur within the main function.
    const collectedInputLines = dataAccumulator.split('\n');
    // Invoke the primary processing function with the collected and parsed input lines.
    processNumericDataAggregations(collectedInputLines);
});