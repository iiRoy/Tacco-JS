// A global identifier representing the current problem dimension or data set size.
var currentDataSetSize;

// An array to store pre-calculated cumulative sums of integers.
// This will be populated based on the 'currentDataSetSize'.
var precomputedSums = [];

/**
 * Initializes the 'precomputedSums' array up to the 'currentDataSetSize'.
 * The array stores values where precomputedSums[k] = 0 + 1 + ... + k.
 * This is a foundational step for subsequent calculations.
 */
function prepareCumulativeArray() {
    // Input validation: ensure a valid size is provided.
    // If the size is invalid or non-positive, clear the array and return.
    if (currentDataSetSize === null || currentDataSetSize === undefined || currentDataSetSize <= 0) {
        precomputedSums = []; // Ensure it's cleared or empty.
        return;
    }

    // Clear and re-initialize the array for the new data set.
    // The size is currentDataSetSize + 1 because we need indices from 0 to currentDataSetSize.
    precomputedSums = new Array(currentDataSetSize + 1);
    precomputedSums[0] = 0; // The sum up to 0 is 0.

    // Populate the array with cumulative sums.
    // Iterates from 1 up to and including 'currentDataSetSize'.
    for (let kdx = 1; kdx <= currentDataSetSize; kdx++) {
        precomputedSums[kdx] = precomputedSums[kdx - 1] + kdx;
    }
}

/**
 * Performs a binary search on the 'precomputedSums' array to determine
 * if a specific target value exists within it.
 * @param {number} targetValue - The numeric value to search for.
 * @returns {boolean} True if the target value is found, false otherwise.
 */
function locateTargetInSums(targetValue) {
    // Handle edge cases for an empty or uninitialized array.
    if (!precomputedSums || precomputedSums.length === 0) {
        return false;
    }
    // Optimization: If target is smaller than smallest element or larger than largest,
    // it cannot be found (assuming the array is sorted, which precomputedSums is).
    if (targetValue < precomputedSums[0] || targetValue > precomputedSums[precomputedSums.length - 1]) {
        return false;
    }

    let lowerBound = 0;
    // The upper bound should be the last valid index for the search.
    // Since precomputedSums has size currentDataSetSize + 1, its last index is currentDataSetSize.
    let upperBound = currentDataSetSize;

    // Standard binary search loop.
    // Continues as long as there's more than one element in the search range.
    while (lowerBound + 1 < upperBound) {
        // Calculate the middle index using bitwise right shift for efficiency (equivalent to floor division by 2).
        const midIndex = (lowerBound + upperBound) >>> 1;

        // Compare the value at the middle index with the target.
        if (precomputedSums[midIndex] <= targetValue) {
            lowerBound = midIndex; // Target is in the upper half or is the mid value itself.
        } else {
            upperBound = midIndex; // Target is in the lower half.
        }
    }

    // After the loop, 'lowerBound' points to the largest element less than or equal to 'targetValue'.
    // Check if this element is exactly our target.
    return precomputedSums[lowerBound] === targetValue;
}

/**
 * The main application logic entry point.
 * Reads data set sizes, performs calculations, and outputs results.
 * This function processes multiple data sets until no more valid input is available.
 */
function processInputDatasets() {
    // Loop continues as long as a valid numeric data set size can be extracted from input.
    // The `!!` converts the potentially null/undefined/0 result of `popNumericValue` to a boolean,
    // treating 0 as a falsy value and thus terminating the loop.
    while (!!(currentDataSetSize = popNumericValue())) {
        // Prepare the cumulative sums array for the current data set size.
        prepareCumulativeArray();

        let numberOfMatchesFound = 0; // Counter for the number of successful searches.

        // Iterate through possible starting indices (from 0 up to currentDataSetSize - 1).
        // This loop checks combinations based on the precomputed sums.
        for (let idx = 0; idx < currentDataSetSize; idx++) {
            // Calculate the required sum for the current iteration.
            // This is derived from a value in 'precomputedSums' plus the current 'currentDataSetSize'.
            const sumToSearch = precomputedSums[idx] + currentDataSetSize;

            // Attempt to locate this calculated sum within the 'precomputedSums' array.
            if (locateTargetInSums(sumToSearch)) {
                // If found, increment the match counter.
                numberOfMatchesFound++;
            }
        }
        // Display the total number of matches found for the current data set.
        outputResultToConsole(numberOfMatchesFound);
    }
}

// Buffer to store raw input data received from stdin.
var incomingTextBuffer = '';

/**
 * Extracts and returns the next numeric token from the processed input buffer.
 * It assumes the input buffer has been pre-processed (reversed, split, trimmed).
 * @returns {number | null} The next numeric value, or null if no more numeric tokens.
 */
function popNumericValue() {
    // Check if the input buffer is empty before attempting to pop.
    if (incomingTextBuffer.length === 0) {
        return null; // No more input.
    }
    const token = incomingTextBuffer.pop();
    // Use the unary plus operator to convert the string token to a number.
    // If the token is not a valid number, this will result in NaN.
    const numericValue = +token;

    // Return null if the extracted token isn't a valid number.
    if (isNaN(numericValue)) {
        return null;
    }
    return numericValue;
}

// The original `scan_string` function was never used and has been deleted
// as part of Type III changes (deletion of non-essential statements).

/**
 * Outputs a given value to the console, typically for displaying results.
 * @param {*} valueToDisplay - The value to be printed.
 */
function outputResultToConsole(valueToDisplay) {
    console.log(valueToDisplay);
}

// Set up standard input processing.
// Resume the stdin stream to start listening for data.
process.stdin.resume();
// Set the encoding for the incoming data.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
// Appends each chunk to the 'incomingTextBuffer'.
process.stdin.on('data', function(chunkOfData) {
    incomingTextBuffer += chunkOfData;
});

// Event listener for the 'end' of the stdin stream.
// This is where the input processing and main logic execution begins.
process.stdin.on('end', function() {
    // Pre-process the accumulated input:
    // 1. Trim whitespace from both ends.
    // 2. Split into an array of tokens by any whitespace.
    // 3. Reverse the array so that `pop()` retrieves tokens in their original order.
    incomingTextBuffer = incomingTextBuffer.trim().split(/\s+/).reverse();
    // Once input is ready, initiate the main processing logic.
    processInputDatasets();
});