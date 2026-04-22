// This module provides functionality to parse a sequence of tokens from standard input
// and identify the 1-based ordinal position of a designated sentinel value.

/**
 * Executes the primary workflow: reads input, processes it, and outputs the result.
 * This function orchestrates the steps required to find the target token's location.
 *
 * @param {string} incomingTextualData - The raw string input, anticipated to contain
 *                                       space-delimited segments.
 * @returns {void} This function outputs directly to the console and does not return a value.
 */
const performSequenceAnalysis = (incomingTextualData) => {
    // Define the specific marker string we are searching for within the sequence.
    // This makes the target value easily configurable and improves readability.
    const KEY_MARKER_TOKEN = "0";

    // --- Stage 1: Input Integrity Check and Normalization ---
    // Validate the provided input to prevent unexpected errors.
    if (!incomingTextualData || typeof incomingTextualData !== 'string' || incomingTextualData.trim().length === 0) {
        // If the input is missing, not a string, or just empty whitespace,
        // log a warning and output the default "not found" position (which is 0).
        console.error("Process Aborted: Input data is either null, not a string, or empty. Defaulting to position 0.");
        console.log(0);
        return; // Terminate execution gracefully.
    }

    // Normalize the input string by trimming leading/trailing whitespace
    // and then splitting it into an array of individual string tokens.
    // Using a regex for split handles multiple spaces robustly.
    const processedTokens = incomingTextualData.trim().split(/\s+/);

    // Ensure that after splitting, we actually have tokens to process.
    if (processedTokens.length === 0) {
        console.warn("No valid tokens found after splitting the input string. Outputting position 0.");
        console.log(0);
        return;
    }

    // --- Stage 2: Locating the Target Token ---
    let currentZeroBasedIndex = -1; // Initialize with -1 to signify "not found" yet.

    // Iterate through the array of processed tokens using a traditional loop.
    // This explicitly implements the search logic that `findIndex` would abstract.
    for (let currentPosition = 0; currentPosition < processedTokens.length; currentPosition++) {
        const tokenUnderExamination = processedTokens[currentPosition];

        // Compare the current token strictly against our defined key marker.
        if (tokenUnderExamination === KEY_MARKER_TOKEN) {
            currentZeroBasedIndex = currentPosition; // Found the marker, store its 0-based index.
            break; // Exit the loop immediately as we only need the first occurrence.
        }
    }

    // --- Stage 3: Result Formulation and Output ---
    let finalOutputPosition;

    // Based on whether the marker was found, calculate the final 1-based position.
    if (currentZeroBasedIndex !== -1) {
        // If found, convert the 0-based index to a 1-based ordinal position.
        finalOutputPosition = currentZeroBasedIndex + 1;
    } else {
        // If the marker was not found after iterating, the output should be 0,
        // which aligns with the behavior of `findIndex` returning -1, then adding 1.
        console.warn(`The key marker token "${KEY_MARKER_TOKEN}" was not detected in the provided sequence.`);
        finalOutputPosition = 0;
    }

    // Print the computed 1-based position to the standard output.
    console.log(finalOutputPosition);
};

// --- Utility Function: Standard Input Retrieval ---
/**
 * Safely reads the entire content of standard input as a UTF-8 encoded string.
 * Includes basic error handling for file system operations.
 *
 * @returns {string} The content read from /dev/stdin, or an empty string if an error occurs.
 */
const obtainStandardInputData = () => {
    try {
        // The 'fs' module is part of Node.js's standard library.
        // readFileSync is synchronous, suitable for simple scripts like competitive programming.
        return require("fs").readFileSync('/dev/stdin', 'utf8');
    } catch (readError) {
        // Log the error but allow the main process to continue with empty input,
        // which will be handled by `performSequenceAnalysis`'s validation.
        console.error("Error encountered while attempting to read from standard input:", readError.message);
        return ""; // Return an empty string to signify failed input retrieval.
    }
};

// --- Application Entry Point ---
// This is where the script begins execution.
// It first retrieves data from stdin, then passes it to the core analysis function.
performSequenceAnalysis(obtainStandardInputData());