const fileSystemOperations = require('fs');

/**
 * Safely parses a string into an integer.
 * Returns 0 if the string is empty, null, undefined, or cannot be parsed as a number.
 * This helper function enhances robustness against malformed input.
 * @param {string | null | undefined} inputString - The string to parse.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
function safelyParseInteger(inputString) {
    if (inputString === null || inputString === undefined || inputString.trim() === '') {
        return 0; // Treat empty or null strings as 0
    }
    const parsedValue = parseInt(inputString, 10);
    return isNaN(parsedValue) ? 0 : parsedValue;
}

// --- Input Data Acquisition ---
// Retrieve the file descriptor for standard input.
const stdInFileDescriptor = process.stdin.fd;
let totalStreamByteSize = 0;

try {
    // Synchronously query the size of the standard input stream.
    // This assumes stdin is a seekable stream (like a file), not a pipe.
    const fileStatistics = fileSystemOperations.fstatSync(stdInFileDescriptor);
    totalStreamByteSize = fileStatistics.size;
} catch (ioError) {
    // In scenarios where stdin is a pipe (e.g., `echo "data" | node script.js`),
    // fstatSync might throw an error or return a size of 0.
    // For this problem, we proceed; an empty buffer will be created if size is 0.
    console.error(`Warning: Unable to determine standard input size: ${ioError.message}. Proceeding with potential limitations.`);
}

// Allocate a buffer to store the raw bytes from standard input.
// If totalStreamByteSize is 0, an empty buffer is created.
const rawDataBuffer = Buffer.alloc(totalStreamByteSize);

let actualBytesReadCount = 0;
try {
    // Synchronously read all available data from standard input into the buffer.
    actualBytesReadCount = fileSystemOperations.readSync(
        stdInFileDescriptor, // File descriptor for stdin
        rawDataBuffer,       // Target buffer
        0,                   // Offset within the buffer to start writing
        totalStreamByteSize, // Maximum number of bytes to read
        0                    // Position in the file to begin reading (0 for start)
    );
} catch (readError) {
    console.error(`Error encountered while reading from standard input: ${readError.message}.`);
    // If an error occurs, actualBytesReadCount remains 0, leading to empty input processing.
}

// Convert the effectively read bytes into a UTF-8 encoded string.
// Only the portion of the buffer containing actual data is converted.
const fullStreamContent = actualBytesReadCount > 0
    ? rawDataBuffer.toString('utf8', 0, actualBytesReadCount)
    : '';

// Split the entire content into an array of individual lines.
const incomingLineFragments = fullStreamContent.split('\n');

// --- Main Calculation Logic ---

/**
 * Computes an adjusted numerical score based on a list of values, a specific divisor index,
 * and a deduction percentage.
 *
 * The calculation steps are:
 * 1. Sum all numbers in the `valueCollection`.
 * 2. Multiply this sum by `(100 - deductionRate)`.
 * 3. Divide the result by the value located at `divisorPosition` in `valueCollection`.
 * 4. The final score is the integer floor of this division.
 *
 * Special conditions:
 * - If `valueCollection` is empty or invalid, returns 0.
 * - If `divisorPosition` is out of bounds, returns 0.
 * - If the value at `divisorPosition` is 0, returns 0 to prevent division by zero.
 *
 * @param {Array<number>} valueCollection - An array of numeric data points.
 * @param {number} divisorPosition - The 0-based index of the element to be used as the divisor.
 * @param {number} deductionRate - A percentage value to be subtracted from 100 before applying to the sum.
 * @returns {number} The calculated and floored adjusted score, or 0 if conditions for calculation are not met.
 */
function calculateAdjustedScore(valueCollection, divisorPosition, deductionRate) {
    // Validate the input array.
    if (!Array.isArray(valueCollection) || valueCollection.length === 0) {
        console.debug("Debug: Input value collection is empty or not an array. Returning 0.");
        return 0;
    }

    // Validate the divisor index.
    if (divisorPosition < 0 || divisorPosition >= valueCollection.length) {
        console.debug(`Debug: Divisor position ${divisorPosition} is out of valid range [0, ${valueCollection.length - 1}]. Returning 0.`);
        return 0;
    }

    const valueAtDivisorIndex = valueCollection[divisorPosition];

    // Critical check: prevent division by zero.
    if (valueAtDivisorIndex === 0) {
        // As per original specification, if the divisor is zero, the result is zero.
        return 0;
    }

    // Calculate the total sum of all values in the collection.
    // Changed from `reduce` to an explicit `for...of` loop as a Type III modification.
    let runningSum = 0;
    for (const currentNumericItem of valueCollection) {
        // Ensure that each item is indeed a number before adding.
        // This adds a layer of robustness.
        if (typeof currentNumericItem === 'number' && !isNaN(currentNumericItem)) {
            runningSum += currentNumericItem;
        } else {
            console.warn(`Warning: Non-numeric item encountered in collection: '${currentNumericItem}'. Skipping.`);
        }
    }

    // Compute the effective multiplier (100 minus the deduction rate).
    const finalMultiplier = 100 - deductionRate;

    // Apply the multiplier to the cumulative sum.
    let intermediateProduct = runningSum * finalMultiplier;

    // Perform the division and explicitly floor the result to an integer.
    // Replaced bitwise `~~` operator with `Math.floor()` for clarity (Type III change).
    return Math.floor(intermediateProduct / valueAtDivisorIndex);
}

// --- Batch Processing Loop ---
let processedDatasetCount = 0; // A new counter for Type III modification.

// Iterate through the collected input lines until a specific termination pattern is found.
while (incomingLineFragments.length > 0) {
    const currentDataLine = incomingLineFragments.shift().trim(); // Get and remove the first line, removing leading/trailing whitespace.

    // Check for the termination sentinel '0 0 0'.
    // Robustly parse the tokens to avoid issues with extra spaces or malformed '0 0 0'.
    const terminationCheckTokens = currentDataLine.split(' ');
    if (terminationCheckTokens.length === 3 &&
        safelyParseInteger(terminationCheckTokens[0]) === 0 &&
        safelyParseInteger(terminationCheckTokens[1]) === 0 &&
        safelyParseInteger(terminationCheckTokens[2]) === 0) {
        break; // Exit the loop if the termination condition is met.
    }

    // Skip any empty lines that are not the termination sentinel.
    if (currentDataLine === '') {
        continue;
    }

    processedDatasetCount++; // Increment the counter for each valid dataset processed.

    // Parse the configuration parameters (N, M, P) from the current line.
    const configurationSegments = currentDataLine.split(' ');

    // Basic validation for configuration line structure.
    if (configurationSegments.length < 3) {
        console.error(`Error: Incomplete configuration line detected: "${currentDataLine}". Expected 3 values. Skipping this dataset.`);
        // If no more lines are available, break to prevent infinite loop on bad input.
        if (incomingLineFragments.length === 0) break;
        continue;
    }

    const totalElementsToRead = safelyParseInteger(configurationSegments[0]);
    // Adjust M to be 0-based index immediately.
    const targetDivisorIndex = safelyParseInteger(configurationSegments[1]) - 1;
    const scoreDeductionRate = safelyParseInteger(configurationSegments[2]);

    // Initialize a new array for the current set of data values.
    const numericalValueSeries = [];

    // Read the subsequent 'N' lines, each containing a data value.
    for (let i = 0; i < totalElementsToRead; i++) {
        if (incomingLineFragments.length === 0) {
            console.error(`Error: Ran out of input lines while expecting ${totalElementsToRead} data values. Only ${i} values were read.`);
            break; // Stop if input runs out prematurely.
        }
        const valueLine = incomingLineFragments.shift().trim();
        numericalValueSeries.push(safelyParseInteger(valueLine));
    }

    // Invoke the core calculation function with the prepared data.
    const finalComputedResult = calculateAdjustedScore(
        numericalValueSeries,
        targetDivisorIndex,
        scoreDeductionRate
    );

    // Output the computed result to standard output.
    console.log(finalComputedResult);
}

/*
 * Script Description:
 * This program reads structured numerical data from standard input, processes it
 * in distinct datasets, and outputs a calculated score for each.
 *
 * Input Format:
 * Each dataset begins with a configuration line consisting of three space-separated integers:
 *   N (Number of subsequent data values for this set)
 *   M (1-based index of the data value to be used as a divisor)
 *   P (Percentage rate for score adjustment)
 * Following the configuration line, N additional lines each contain a single integer,
 * representing the data values for the current set.
 * The entire input stream is terminated by a line containing "0 0 0".
 *
 * Output:
 * For each dataset, a single integer representing the calculated adjusted score is printed
 * to standard output on a new line.
 *
 * Calculation Details:
 * The adjusted score is derived by:
 * 1. Summing all N data values in the current set.
 * 2. Multiplying this sum by `(100 - P)`.
 * 3. Dividing the product by the data value found at the (M-1)-th (0-indexed) position
 *    within the N data values.
 * 4. The final result is always floored to the nearest integer.
 *
 * Error Handling & Robustness (Type III Additions):
 * - Division by zero is explicitly handled: if the divisor value is 0, the score is 0.
 * - Invalid or out-of-bounds indices for the divisor result in a score of 0.
 * - Non-numeric input strings are safely parsed to 0 to prevent runtime errors.
 * - Empty lines and malformed configuration lines are handled gracefully.
 * - Input exhaustion during data reading is detected and warned.
 *
 * Developed by: GPT-Expert (inspired by original problem logic)
 * Creation Date: October 27, 2023
 */