const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

/**
 * Safely parses a string into an integer.
 * Returns NaN if the string cannot be parsed into a valid integer.
 * @param {string} textValue - The string to parse.
 * @returns {number} The parsed integer or NaN.
 */
const convertToNumericValue = (textValue) => {
    // Using parseInt with radix 10 ensures proper decimal conversion.
    const numericResult = parseInt(textValue, 10);
    // A quick check for non-finite numbers (Infinity, -Infinity, NaN).
    // For this problem, we're primarily concerned with NaN from parsing.
    return numericResult;
};

// The input is initially a single string; we split it into an array of lines.
// Trimming ensures no leading/trailing whitespace affects the first/last line.
let inputLineBuffer = rawInputContent.trim().split('\n');

/**
 * Retrieves the next line from the global input buffer.
 * Provides a centralized way to consume input and handle buffer exhaustion.
 * @param {string[]} buffer - The array of input lines.
 * @returns {string|null} The next line string, or null if the buffer is empty.
 */
const consumeNextInputLine = (buffer) => {
    if (buffer.length === 0) {
        // Log an error or warning if input runs out prematurely.
        console.error("Warning: End of input reached unexpectedly.");
        return null; // Indicate no more lines are available.
    }
    return buffer.shift(); // Remove and return the first element.
};

// Label for the main processing cycle to allow for clearer break statements.
mainProcessingCycle: while (true) {
    // Fetch the configuration line for the current dataset (N and S).
    const currentDatasetConfig = consumeNextInputLine(inputLineBuffer);

    // If there are no more lines or the line is empty after trimming,
    // it implies the end of all datasets or an input error.
    if (currentDatasetConfig === null || currentDatasetConfig.trim() === '') {
        break mainProcessingCycle; // Exit the main loop.
    }

    // Split the config line into its two components: number of items and sum threshold.
    const configurationParts = currentDatasetConfig.split(' ');

    // Basic validation: ensure we have exactly two configuration parameters.
    if (configurationParts.length !== 2) {
        console.error("Input format error: Expected two configuration values (N S), but received:", configurationParts);
        // Depending on problem requirements, one might skip this dataset or terminate.
        // For robustness, we'll try to continue, assuming the next line might be valid config.
        // However, given problem structure, this often means malformed input, so terminating is safer.
        break mainProcessingCycle;
    }

    // Parse the number of elements (N) and the sum threshold (S).
    const numberOfItems = convertToNumericValue(configurationParts[0]);
    const sumUpperBound = convertToNumericValue(configurationParts[1]);

    // Check for the problem's specific termination condition (N=0 and S=0).
    if (numberOfItems === 0 && sumUpperBound === 0) {
        break mainProcessingCycle; // Exit the main loop.
    }

    // Validate parsed configuration values.
    if (isNaN(numberOfItems) || isNaN(sumUpperBound) || numberOfItems < 0) {
        console.error(`Invalid configuration values detected: N=${configurationParts[0]}, S=${configurationParts[1]}. Skipping this dataset.`);
        // If numberOfItems is invalid, we cannot reliably consume the next lines, so terminate.
        break mainProcessingCycle;
    }

    // Initialize an array to hold the numeric data points for this dataset.
    const dataPointsCollection = [];
    // Read 'numberOfItems' lines, each containing a single data point.
    for (let itemIdx = 0; itemIdx < numberOfItems; itemIdx++) {
        const itemLine = consumeNextInputLine(inputLineBuffer);

        if (itemLine === null) {
            console.error("Critical Input Error: Ran out of data lines while expecting more elements.");
            break mainProcessingCycle; // Terminate due to insufficient input.
        }

        const parsedDataItem = convertToNumericValue(itemLine);
        if (isNaN(parsedDataItem)) {
            console.warn(`Warning: Non-numeric data item encountered: '${itemLine}'. It will be treated as NaN.`);
            // Depending on strictness, NaN items could be skipped or cause termination.
            // For this problem, we'll push it and let subsequent calculations handle it.
        }
        dataPointsCollection.push(parsedDataItem);
    }

    // Sort the collected data points in ascending order.
    // This step is inherited from the original code; it can sometimes optimize pair finding,
    // though for a brute-force frequency count, its direct impact on efficiency is minimal.
    dataPointsCollection.sort((valA, valB) => valA - valB);

    // Create a frequency map for sums of pairs.
    // Assuming numbers are between 0 and 100, the maximum sum is 200.
    // An array of size 201 covers sums from 0 to 200.
    const sumFrequencyMap = Array(201).fill(0); // Initialize all sum counts to zero.

    // Iterate through all unique pairs of numbers in the collection.
    // For each pair, calculate their sum and update its frequency in the map.
    for (let outerLoopIndex = 0; outerLoopIndex < numberOfItems; outerLoopIndex++) {
        for (let innerLoopIndex = outerLoopIndex + 1; innerLoopIndex < numberOfItems; innerLoopIndex++) {
            const currentPairSum = dataPointsCollection[outerLoopIndex] + dataPointsCollection[innerLoopIndex];

            // Only consider sums that fall within our predefined frequency map range [0, 200].
            if (currentPairSum >= 0 && currentPairSum <= 200) {
                sumFrequencyMap[currentPairSum]++;
            } else {
                // If sums can fall outside this range, the array size needs adjustment or a Map should be used.
                // console.warn(`Sum ${currentPairSum} is outside the expected range [0, 200].`);
            }
        }
    }

    // Calculate the final count of pairs whose sum is strictly greater than the threshold.
    let totalExceedingSumCount = 0;
    // Iterate from 'sumUpperBound + 1' up to the maximum possible sum (200).
    for (let sumValueIterator = sumUpperBound + 1; sumValueIterator <= 200; sumValueIterator++) {
        // Add the frequency of each qualifying sum to the running total.
        totalExceedingSumCount += sumFrequencyMap[sumValueIterator];
    }

    // Output the calculated count for the current dataset.
    console.log(totalExceedingSumCount);
}

// Program execution concludes.