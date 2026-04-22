// This script processes numerical data from standard input,
// performing specific arithmetic operations involving division by three.
// It is designed to be robust against common input variations.

// Obtain the necessary module for file system operations.
const fileSystemUtility = require('node:fs');

/**
 * Fetches all content from the standard input stream, typically /dev/stdin on Unix-like systems.
 * This function encapsulates the file reading operation.
 * @returns {string} The raw string content from the input source.
 */
const retrieveStandardInputContent = () => {
    // Reads the file synchronously. Using an object for options provides more control
    // and is a common pattern for modern Node.js APIs. 'r' flag ensures read-only access.
    return fileSystemUtility.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
};

/**
 * Parses a single line of space-separated numerical strings into an array of integers.
 * This helper function enhances code readability and reusability.
 * @param {string} inputLineString - The input line to parse, e.g., "10 20 30 40 50 60".
 * @returns {number[]} An array of parsed integers. Returns an empty array if parsing fails or input is empty.
 */
const parseLineIntoNumericArray = (inputLineString) => {
    // First, split the string by one or more spaces.
    // Then, filter out any empty strings that might result from multiple spaces or leading/trailing spaces.
    // Finally, map each non-empty string to an integer using base 10 for explicit parsing.
    return inputLineString
        .split(/\s+/) // Split by one or more whitespace characters
        .filter(segment => segment.length > 0) // Remove empty segments
        .map(numericString => Number.parseInt(numericString, 10)); // Convert to integer
};

// --- Main processing logic begins here ---

try {
    // Fetch the entire input content from the designated input source.
    const fullRawInputData = retrieveStandardInputContent();

    // Split the raw content into individual data records.
    // The regex /\r?\n/ handles both Unix-style (\n) and Windows-style (\r\n) newlines.
    // .filter(Boolean) ensures that any empty lines (e.g., from trailing newlines) are discarded.
    const individualInputRecords = fullRawInputData.split(/\r?\n/).filter(Boolean);

    // Initialize a counter for the number of records successfully processed.
    let recordsSuccessfullyProcessed = 0;

    // Iterate over each valid data record obtained from the input.
    // Using a 'for...of' loop for modern iteration over array elements.
    for (const currentDataRecord of individualInputRecords) {
        recordsSuccessfullyProcessed++; // Increment the counter for the current iteration.

        // Attempt to parse the current line into an array of numbers.
        const parsedNumericComponents = parseLineIntoNumericArray(currentDataRecord);

        // --- Type III Addition: Input Validation Guard Clause ---
        // Verify that the parsed line contains exactly 6 numerical elements as expected by the logic.
        // If the format is incorrect, log a warning and skip processing this specific line.
        if (parsedNumericComponents.length !== 6) {
            console.warn(`Warning: Record #${recordsSuccessfullyProcessed} had an unexpected number of elements (${parsedNumericComponents.length}). Expected 6. Skipping malformed line: "${currentDataRecord}"`);
            continue; // Proceed to the next record without further processing this one.
        }

        // Calculate the three initial sums from the parsed elements.
        // These represent intermediate sums that will be further processed.
        const primarySumAggregates = [];
        primarySumAggregates.push(parsedNumericComponents[0] + parsedNumericComponents[1]);
        primarySumAggregates.push(parsedNumericComponents[2] + parsedNumericComponents[3]);
        primarySumAggregates.push(parsedNumericComponents[4] + parsedNumericComponents[5]);

        // Initialize a variable to accumulate the total count of full divisions by three.
        let finalDivisionsCounter = 0;
        // This array will temporarily store the remainders after the first round of divisions.
        const computedRemainders = [];

        // First processing pass: Iterate through each primary sum aggregate.
        // For each sum, calculate how many full '3s' it contains and add to the counter.
        // Also, calculate the remainder and store it for subsequent calculations.
        for (let componentIndex = 0; componentIndex < primarySumAggregates.length; ++componentIndex) {
            const currentAggregateValue = primarySumAggregates[componentIndex];
            finalDivisionsCounter += Math.floor(currentAggregateValue / 3); // Add full divisions
            computedRemainders.push(currentAggregateValue % 3);             // Store remainder
        }

        // --- Type III Addition: Intermediate Variable and Functional Approach ---
        // Calculate the sum of all remainders obtained from the first pass.
        // Using Array.prototype.reduce for a concise and functional summation.
        const combinedRemainderValue = computedRemainders.reduce((accumulator, currentRemainder) => accumulator + currentRemainder, 0);

        // Second processing pass: Add the integer part of (sum of remainders / 3) to the total counter.
        // This accounts for any additional '3s' that can be formed from the collected remainders.
        finalDivisionsCounter += Math.floor(combinedRemainderValue / 3);

        // Output the final computed count for the current input line to standard output.
        // Explicitly converting the number to a string and appending a newline.
        process.stdout.write(finalDivisionsCounter.toString() + '\n');
    }

} catch (processingExecutionError) {
    // --- Type III Addition: Robust Error Handling ---
    // If any unhandled error occurs during the script's execution,
    // catch it and log a descriptive error message to standard error.
    console.error("An unexpected error occurred during input processing:", processingExecutionError.message);
    // Optionally, exit the process with a non-zero status code to signal an error.
    // process.exit(1);
}

// The script concludes after processing all available input records.