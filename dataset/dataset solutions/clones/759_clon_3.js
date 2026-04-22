const fileSystem = require('fs'); // Utilizing the Node.js file system module for input operations.

/**
 * Retrieves and processes raw input data from a specified file path.
 * This function handles file reading errors and normalizes line endings.
 *
 * @param {string} sourcePath - The path to the input file (e.g., '/dev/stdin' for standard input).
 * @returns {string[]} An array where each element is a trimmed line from the input file.
 */
function acquireInputLines(sourcePath) {
    try {
        // Attempt to read the entire file content as a UTF-8 string.
        const completeRawContent = fileSystem.readFileSync(sourcePath, 'utf8');
        // Clean up the raw content: remove leading/trailing whitespace from the whole string,
        // then split it into an array of lines, accommodating both Windows (\r\n) and Unix (\n) line breaks.
        return completeRawContent.trim().split(/\r?\n/);
    } catch (readError) {
        // Log any errors encountered during file reading.
        console.error("Error encountered while fetching input data:", readError.message);
        // In case of an error, return an empty array to prevent further processing issues.
        return [];
    }
}

/**
 * Orchestrates the primary logic for processing the input data,
 * reading problem instances in a loop and printing results.
 * Each problem instance consists of a line specifying an element count,
 * followed by a line containing space-separated numbers.
 */
function initiateProcessingSequence() {
    // Obtain all input lines from the standard input source.
    const allInputSegments = acquireInputLines('/dev/stdin');

    // If no input was successfully read, there's nothing to process.
    if (allInputSegments.length === 0) {
        // Inform the user that no data was found and exit.
        // This could be due to an empty file or an error during reading.
        console.warn("No input data available for processing. Terminating.");
        return;
    }

    // A pointer to the current line being examined in the input array.
    let currentSegmentIndex = 0;

    // Loop through the input segments, expecting a pattern of 'count' then 'numbers'.
    while (currentSegmentIndex < allInputSegments.length) {
        // The current line should contain the number of elements expected for the next data line.
        const elementCountString = allInputSegments[currentSegmentIndex];
        const requestedElementCount = parseInt(elementCountString, 10);

        // Validate if the parsed count is a valid non-negative number.
        if (isNaN(requestedElementCount) || requestedElementCount < 0) {
            console.error(`Warning: Invalid element count detected on line ${currentSegmentIndex + 1} ('${elementCountString}'). Skipping this block.`);
            currentSegmentIndex++; // Advance past the problematic line.
            continue; // Move to the next iteration of the loop.
        }

        // According to the problem's termination condition, a count of 0 signifies the end of input.
        if (requestedElementCount === 0) {
            // Processing complete.
            break;
        }

        // Move the pointer to the next line, which should contain the actual numeric values.
        currentSegmentIndex++;

        // Ensure that a data line exists after the count line.
        if (currentSegmentIndex >= allInputSegments.length) {
            console.error(`Error: Expected ${requestedElementCount} numeric values but ran out of input lines after line ${currentSegmentIndex}.`);
            break; // Cannot proceed if the data line is missing.
        }

        // Read the line containing the space-separated numbers.
        const numericDataLine = allInputSegments[currentSegmentIndex];
        // Parse the numbers, converting each string segment to a number.
        // Filter out any resulting NaN values to ensure only valid numbers are processed.
        const parsedNumericValues = numericDataLine.split(' ')
                                                  .map(segment => Number(segment))
                                                  .filter(value => !isNaN(value));

        // Compute the smallest absolute difference among the numbers and output the result.
        // The `requestedElementCount` limits the consideration to a specific number of elements.
        console.log(determineMinimumAbsoluteDifference(parsedNumericValues, requestedElementCount));

        // Advance the pointer to the next potential 'element count' line.
        currentSegmentIndex++;
    }
}

/**
 * Computes the smallest absolute difference between any two distinct numbers
 * within a provided array of values. This implementation uses an optimized
 * approach involving sorting the array, which is more efficient than a
 * brute-force O(N^2) comparison for larger datasets.
 *
 * @param {number[]} valueCollection - An array of numbers to analyze.
 * @param {number} effectiveSizeLimit - The maximum number of elements from `valueCollection`
 *                                      to consider for the calculation.
 * @returns {number} The smallest absolute difference found, or `Number.POSITIVE_INFINITY`
 *                   if fewer than two valid numbers are available for comparison.
 */
function determineMinimumAbsoluteDifference(valueCollection, effectiveSizeLimit) {
    // Perform initial validation on the input parameters.
    if (!Array.isArray(valueCollection) || typeof effectiveSizeLimit !== 'number' || effectiveSizeLimit < 0) {
        console.error("Invalid arguments for determineMinimumAbsoluteDifference: `valueCollection` must be an array, `effectiveSizeLimit` a non-negative number.");
        return Number.POSITIVE_INFINITY; // Return a default for invalid input.
    }

    // Create a subset of the collection, considering only up to `effectiveSizeLimit` elements.
    // Ensure that only actual numbers (not NaN) are included in this subset.
    const relevantNumericSubset = valueCollection.slice(0, effectiveSizeLimit)
                                                .filter(val => typeof val === 'number' && !isNaN(val));

    // If there are fewer than two numbers in the relevant subset,
    // it's impossible to calculate a difference between two distinct values.
    if (relevantNumericSubset.length < 2) {
        return Number.POSITIVE_INFINITY;
    }

    // Sort the subset of numbers in ascending order.
    // This optimization is key: once sorted, the minimum difference between any two numbers
    // will always be found between adjacent elements.
    relevantNumericSubset.sort((a, b) => a - b);

    // Initialize the variable to hold the minimum absolute difference found so far
    // to the largest possible safe integer value.
    let smallestAbsoluteDifference = Number.MAX_SAFE_INTEGER;

    // Iterate through the sorted array, comparing each element with its immediate successor.
    for (let currentElementIdx = 0; currentElementIdx < relevantNumericSubset.length - 1; currentElementIdx++) {
        // Calculate the absolute difference between the current element and the next.
        const adjacentDifference = Math.abs(relevantNumericSubset[currentElementIdx] - relevantNumericSubset[currentElementIdx + 1]);
        // Update `smallestAbsoluteDifference` if a smaller difference is found.
        smallestAbsoluteDifference = Math.min(smallestAbsoluteDifference, adjacentDifference);
    }

    return smallestAbsoluteDifference;
}

// Initiate the main data processing sequence upon script execution.
initiateProcessingSequence();