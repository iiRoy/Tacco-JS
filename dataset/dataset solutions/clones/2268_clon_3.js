// This module processes a structured input string to calculate a cumulative total
// based on specific markers and data points within the input.
function processInputData(rawInputText) {
    // --- Configuration Constants for Clarity and Maintainability ---
    const LINE_SEPARATOR_REGEX = /\r?\n/; // Regular expression to handle various line ending types (CRLF or LF).
    const MIN_REQUIRED_DATA_ENTRIES = 4; // Minimum number of lines expected: e.g., header, data, marker, footer.
    const MARKER_LINE_REL_INDEX_FROM_END = 2; // The marker line (e.g., "slept at") is the second-to-last line.
    const SUMMATION_START_OFFSET_FROM_MARKER_MATCH = 2; // If marker found at index 'k' in `relevantLabels`, sum starts at `k+2`.
    const SUMMATION_END_REL_INDEX_FROM_END = 2; // Summation stops before the last two lines (exclusive).
    const NUMERIC_VALUE_COLUMN_INDEX = 1; // The column index (0-based) where the numeric value is expected after splitting by space.
    const DEFAULT_SUM_START_IF_MARKER_NOT_FOUND = 1; // If the marker isn't found, summation starts from the second line (index 1).

    // --- Step 1: Parse Raw Input into Individual Data Entries ---
    const dataEntries = rawInputText.split(LINE_SEPARATOR_REGEX);

    // --- Step 2: Initial Validation - Ensure Sufficient Data ---
    // A basic check to prevent errors from malformed or incomplete input.
    if (dataEntries.length < MIN_REQUIRED_DATA_ENTRIES) {
        // Output an error message and return a default value (0) to maintain program flow,
        // mirroring potential implicit behavior of the original code with empty sums.
        console.error(`Error: Insufficient data entries. Expected at least ${MIN_REQUIRED_DATA_ENTRIES} lines, but received ${dataEntries.length}.`);
        outputResult(0);
        return;
    }

    // --- Step 3: Identify the Marker Label for Summation Start ---
    // The original code extracts first words of lines 1 through (length - 3) into `titles`.
    // We replicate this by slicing from index 1 up to `dataEntries.length - 2` (exclusive).
    const relevantLabels = dataEntries
        .slice(1, dataEntries.length - SUMMATION_END_REL_INDEX_FROM_END) // Excludes the very first line and the last two lines from label consideration.
        .map(entry => entry.split(' ')[0]); // Extracts only the first word (label) from each relevant entry.

    // Get the content of the specific marker line (second to last line in the full input).
    const markerCandidateLineContent = dataEntries[dataEntries.length - MARKER_LINE_REL_INDEX_FROM_END];
    // Extract the primary identifier (first word) from this marker line.
    const targetMarkerLabel = markerCandidateLineContent.split(' ')[0];

    // Search for the `targetMarkerLabel` within the `relevantLabels` array.
    // This `relevantLabelMatchIdx` is an index within the `relevantLabels` array.
    let relevantLabelMatchIdx = relevantLabels.indexOf(targetMarkerLabel);

    // --- Step 4: Determine the Actual Summation Range ---
    let effectiveSummationStartIdx; // This will be the 0-based index in `dataEntries` where summation begins.

    if (relevantLabelMatchIdx === -1) {
        // If the marker label was not found in `relevantLabels`, the original code's `sleptAt` would be -1.
        // The loop would then start from `(-1) + 2 = 1`.
        effectiveSummationStartIdx = DEFAULT_SUM_START_IF_MARKER_NOT_FOUND;
    } else {
        // If the marker label was found at `relevantLabelMatchIdx` within `relevantLabels`,
        // the original code's loop starts at `relevantLabelMatchIdx + 2`.
        effectiveSummationStartIdx = relevantLabelMatchIdx + SUMMATION_START_OFFSET_FROM_MARKER_MATCH;
    }

    // The summation loop ends just before the second-to-last line of the *full* input.
    const summationEndIdxExclusive = dataEntries.length - SUMMATION_END_REL_INDEX_FROM_END;

    // --- Step 5: Perform the Cumulative Summation ---
    let cumulativeTotal = 0.0; // Initialize sum, using float for potential decimal values.

    // Iterate through the determined range of data entries.
    for (let currentLineIdx = effectiveSummationStartIdx; currentLineIdx < summationEndIdxExclusive; currentLineIdx++) {
        const currentEntry = dataEntries[currentLineIdx];
        const entryTokens = currentEntry.split(' '); // Split the current line into parts.

        // Guard clause: Ensure there are enough parts in the line to extract a numeric value.
        if (entryTokens.length > NUMERIC_VALUE_COLUMN_INDEX) {
            const potentialNumericString = entryTokens[NUMERIC_VALUE_COLUMN_INDEX];
            const parsedNumericValue = parseFloat(potentialNumericString); // Convert the string to a floating-point number.

            // Validation: Check if the parsed value is a valid number.
            if (!isNaN(parsedNumericValue)) {
                cumulativeTotal += parsedNumericValue;
            } else {
                // Optionally, log a warning for lines with non-numeric values, but continue processing.
                // The original `Number()` conversion would result in `NaN` which doesn't affect `sum` if it's already a number,
                // but if `sum` started as `NaN`, it would propagate. Here, we ensure `sum` is always a number.
                // console.warn(`Skipping invalid numeric value '${potentialNumericString}' on line ${currentLineIdx + 1}.`);
            }
        } else {
            // Optionally, log a warning for lines that don't conform to the expected structure.
            // console.warn(`Skipping malformed line '${currentEntry}' on line ${currentLineIdx + 1}.`);
        }
    }

    // --- Step 6: Output the Final Calculated Total ---
    outputResult(cumulativeTotal);
}

// --- Helper Function for Consistent Output ---
function outputResult(finalValue) {
    console.log(finalValue.toString()); // Ensures the output is always a string representation of the number.
}

// --- Main Execution Block: Input Reading and Error Handling ---
// This block handles reading input from standard input and delegates to the main processing function.
try {
    const fileSystemHandler = require("fs"); // Import the Node.js file system module.
    const contentFromStdin = fileSystemHandler.readFileSync("/dev/stdin", "utf8"); // Read input synchronously.
    processInputData(contentFromStdin); // Initiate the data processing.
} catch (executionError) {
    // Catch any errors that occur during file reading or initial processing.
    console.error("An unhandled error occurred during script execution:", executionError.message);
    // Exit with a non-zero status code to indicate failure in an automated environment.
    process.exit(1);
}