// This module is designed to ingest raw text data, extract a sequence of numerical values
// from a specific line within that data, and then compute the total numerical span (range)
// between the highest and lowest values found in that sequence.
// The primary expectation is that the input is a multi-line string, and the actual
// numbers of interest are located on the second line (index 1), separated by spaces.
function processNumericalSpan(rawDataPayload) {
    // Initial validation: Ensure the input payload is a string and not empty or invalid.
    // This helps prevent unexpected errors further down the processing pipeline.
    if (typeof rawDataPayload !== 'string' || rawDataPayload.trim().length === 0) {
        console.error("InputError: The provided raw data payload is either not a string or is empty. Cannot proceed.");
        return null; // Returning null to indicate a processing failure.
    }

    // Split the entire input payload into an array of individual lines.
    // This assumes lines are delimited by standard newline characters.
    const contentLines = rawDataPayload.split('\n');

    // Define the zero-based index for the line expected to contain the numerical data.
    const TARGET_DATA_LINE_IDX = 1;

    // Guard clause: Check if there are enough lines in the input.
    // If the target line doesn't exist, we cannot extract numerical data.
    if (contentLines.length <= TARGET_DATA_LINE_IDX) {
        console.warn(`DataWarning: Insufficient lines detected in the input payload. Expected at least ${TARGET_DATA_LINE_IDX + 1} lines.`);
        // For range calculation, if no numbers are found, a span of 0 is a reasonable default.
        return 0;
    }

    // Retrieve the specific line that should contain the space-separated numbers.
    const rawNumericStringFromLine = contentLines[TARGET_DATA_LINE_IDX];

    // Split this raw string into individual token strings based on space delimiters.
    // An additional filter is applied to remove any empty string tokens that might result
    // from multiple consecutive spaces in the input, ensuring clean processing.
    const stringifiedNumericTokens = rawNumericStringFromLine
        .split(' ')
        .filter(token => token.trim() !== ''); // Remove empty strings from potential double spaces

    // Convert each string token into its numerical representation.
    // A subsequent filter removes any 'NaN' (Not-a-Number) values that might arise
    // if a token cannot be successfully converted to a number (e.g., "abc").
    const actualNumericValues = stringifiedNumericTokens
        .map(valueStr => Number(valueStr))
        .filter(num => !isNaN(num)); // Exclude any non-numeric entries

    // Guard clause: After all parsing and filtering, check if any valid numbers remain.
    // If the array is empty, a range cannot be calculated.
    if (actualNumericValues.length === 0) {
        console.warn("DataWarning: No valid numeric values were successfully extracted from the target line after filtering. Returning 0 span.");
        return 0;
    }

    // Calculate the maximum observed value from the array of valid numbers.
    // The spread operator (`...`) is used for a concise and modern way to pass array elements
    // as individual arguments to `Math.max()`.
    const maximumObservedValue = Math.max(...actualNumericValues);

    // Calculate the minimum observed value using the same method.
    const minimumObservedValue = Math.min(...actualNumericValues);

    // Compute the final numerical span by subtracting the minimum from the maximum value.
    const calculatedDataSpan = maximumObservedValue - minimumObservedValue;

    // Return the computed span.
    return calculatedDataSpan;
}

// --- Main execution block ---
// This section handles reading input from standard input and invoking the processing logic.

// Utilize Node.js 'fs' module to synchronously read the entire content of standard input.
// The input is expected to be UTF-8 encoded, and leading/trailing whitespace is trimmed.
const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();

// Call the primary function to process the retrieved content and get the resulting span.
const finalResultingSpan = processNumericalSpan(systemInputContent);

// Output the final result to the console.
// A check is performed to ensure the processing function returned a valid number
// (not null, which indicates an error in the initial input validation).
if (finalResultingSpan !== null) {
    console.log(finalResultingSpan);
} else {
    // If finalResultingSpan is null, an error message would have already been logged
    // by the processNumericalSpan function itself.
    // This block could be used for a generic failure message if desired.
    // console.error("ApplicationTerminated: Processing could not be completed successfully.");
}