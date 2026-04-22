// This script processes a list of numeric values from standard input,
// counts their occurrences, and then prints out values that appear more than once.

// Define constants for file system operations to improve readability and maintainability.
const SYSTEM_INPUT_PATH = "/dev/stdin";
const TEXT_ENCODING_FORMAT = "utf8";

// Regular expression used to parse the incoming data stream.
// It's designed to split the input string by a comma, followed by one or more digits,
// and optionally followed by zero or more newline characters.
// This effectively extracts the main data segments (e.g., "10", "25", "100")
// by removing the separators like ",1\n", ",5", or ",10".
const DATA_SEGMENT_DELIMITER = /,\d+\n{0,}/;

// A mutable array to hold the individual data segments parsed from the input file.
// These segments are expected to be string representations of numbers.
let processedInputSegments = [];

// An array serving as a frequency map for the numeric values.
// The index of the array will correspond to the numeric value itself,
// and the value at that index will store its count.
// This allows for efficient lookup and storage for numeric keys.
let numericValueOccurrenceCounts = [];

// A helper variable to keep track of the largest numeric index (value) encountered
// during the counting process. This is crucial for optimizing the final iteration loop,
// ensuring we only check relevant indices up to the maximum observed.
let maxNumericIndexFound = -1;

try {
    // Attempt to read the entire content of the standard input file synchronously.
    // This is a common pattern in competitive programming environments.
    const rawFileContent = require("fs").readFileSync(SYSTEM_INPUT_PATH, TEXT_ENCODING_FORMAT);

    // Split the raw file content into an array of segments using the defined delimiter regex.
    // The result is an array of strings, each representing a potential numeric value.
    processedInputSegments = rawFileContent.split(DATA_SEGMENT_DELIMITER);

    // Determine the total number of segments obtained from the split operation.
    const totalSegmentQuantity = processedInputSegments.length;

    // Implement a guard clause: If no segments were found, it indicates
    // either empty input or input that didn't match the expected format.
    if (totalSegmentQuantity === 0) {
        console.log("No valid input data segments were detected for analysis.");
        // Exit the process gracefully as there's nothing further to do.
        process.exit(0);
    }

    // --- First Processing Stage: Accumulate Frequencies of Numeric Values ---
    // Iterate over each segment in the `processedInputSegments` array.
    for (let segmentPointer = 0; segmentPointer < totalSegmentQuantity; segmentPointer++) {
        let currentSegmentString = processedInputSegments[segmentPointer];

        // Skip any segments that are empty or consist only of whitespace.
        // These are typically artifacts of splitting or malformed input.
        if (!currentSegmentString || currentSegmentString.trim() === '') {
            continue;
        }

        // Convert the string segment into a numeric key.
        // JavaScript's Number() constructor handles type coercion.
        const actualNumericKey = Number(currentSegmentString);

        // Perform input validation:
        // 1. Check if the conversion resulted in NaN (Not a Number).
        // 2. Ensure the numeric key is non-negative, as array indices cannot be negative.
        if (isNaN(actualNumericKey) || actualNumericKey < 0) {
            console.warn(`[Data Warning] Skipping invalid or negative input value: '${currentSegmentString}' found at position ${segmentPointer}.`);
            continue; // Move to the next segment if invalid.
        }

        // Increment the count for the `actualNumericKey`.
        // If this key hasn't been encountered before, its count is initialized to 0 (or undefined),
        // so `(numericValueOccurrenceCounts[actualNumericKey] || 0)` ensures it starts at 0 before incrementing.
        numericValueOccurrenceCounts[actualNumericKey] = (numericValueOccurrenceCounts[actualNumericKey] || 0) + 1;

        // Update `maxNumericIndexFound` if the current numeric key is larger.
        // This helps define the upper bound for the subsequent iteration, avoiding unnecessary checks.
        if (actualNumericKey > maxNumericIndexFound) {
            maxNumericIndexFound = actualNumericKey;
        }
    }

    // --- Second Processing Stage: Report Multi-Occurring Values ---
    // Set the upper limit for the final iteration loop.
    // If no valid numeric data was processed, `maxNumericIndexFound` remains -1.
    const iterationUpperBoundary = maxNumericIndexFound;

    // Another guard clause: If no valid numeric data was processed (e.g., all input was invalid),
    // there's nothing to display.
    if (iterationUpperBoundary < 0) {
        console.log("No valid numeric data with multiple occurrences was found to display.");
        process.exit(0); // Exit gracefully.
    }

    // Iterate from index 0 up to `iterationUpperBoundary` (inclusive).
    // This loop checks every potential numeric key that could have been counted.
    for (let currentCountIndex = 0; currentCountIndex <= iterationUpperBoundary; currentCountIndex++) {
        // Check two conditions:
        // 1. If `numericValueOccurrenceCounts[currentCountIndex]` is not `undefined` (meaning the value was seen at least once).
        // 2. If the count for `currentCountIndex` is strictly greater than 1.
        if (numericValueOccurrenceCounts[currentCountIndex] !== undefined && numericValueOccurrenceCounts[currentCountIndex] > 1) {
            // Output the numeric value (index) and its corresponding count.
            // Using a template literal for clear and concise output formatting.
            console.log(`${currentCountIndex} ${numericValueOccurrenceCounts[currentCountIndex]}`);
        }
    }

} catch (operationError) {
    // Catch and handle any errors that might occur during file reading or processing.
    // This provides robust error handling for unexpected issues.
    console.error(`An unexpected operational error occurred: ${operationError.message}`);
    // Exit with a non-zero status code to indicate an error.
    process.exit(1);
}