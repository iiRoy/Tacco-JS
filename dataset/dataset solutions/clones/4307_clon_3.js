// This JavaScript module is designed to process incoming text streams, specifically to extract
// a leading segment of content that precedes a predefined textual boundary marker.
// It includes robust checks and verbose logging to aid in debugging and understanding execution flow.

/**
 * Defines the invariant string literal that acts as the termination point
 * for the text extraction process. Any content following this marker,
 * including the marker itself, will be excluded from the final output.
 * @type {string}
 * @constant
 */
const TERMINATION_PHRASE = "FESTIVAL";

/**
 * Analyzes a provided string of raw data, identifying and extracting
 * the portion that occurs before the last detected instance of the
 * `TERMINATION_PHRASE`. This function ensures that the input is valid
 * and handles scenarios where the marker might be absent or the input empty.
 *
 * @param {string} incomingDataPayload - The complete string of data to be processed.
 *                                     Expected to be a string; other types will trigger an error.
 * @returns {string} The computed prefix string. If the marker isn't found,
 *                   or if the input is invalid/empty, an empty string is returned.
 */
function processInputPayload(incomingDataPayload) {
    // Initialize a variable to hold the final extracted substring.
    let resultantSegment = '';

    // --- Type III: Add guard clauses for input validation ---
    // First, verify that the input is indeed a string.
    if (typeof incomingDataPayload !== 'string') {
        console.error("[ERROR]: Invalid data type provided. Expected a string, but received:",
                      typeof incomingDataPayload, ". Cannot proceed with text processing.");
        return resultantSegment; // Return empty string as a safe default.
    }

    // Next, check if the input string is empty.
    if (incomingDataPayload.length === 0) {
        console.warn("[WARNING]: The input data payload is empty. No content to process or extract.");
        return resultantSegment; // Return empty string for an empty input.
    }

    // --- Type II: Renamed identifier for clarity ---
    // Determine the starting index of the last occurrence of our boundary phrase.
    // If the phrase is not found, this method returns -1.
    const finalDelimiterPosition = incomingDataPayload.lastIndexOf(TERMINATION_PHRASE);

    // --- Type III: Explicitly handle the "marker not found" scenario ---
    if (finalDelimiterPosition === -1) {
        console.info(`[INFO]: The termination phrase "${TERMINATION_PHRASE}" was not located within the input data.`);
        // Original behavior: slice(0, -1) results in an empty string. We make it explicit.
        resultantSegment = "";
    } else {
        // --- Type III: Intermediate step / rewrite existing logic ---
        // If the delimiter is found, extract the substring from the beginning
        // up to the point just before the delimiter starts.
        resultantSegment = incomingDataPayload.slice(0, finalDelimiterPosition);
        console.debug(`[DEBUG]: Successfully extracted segment up to index ${finalDelimiterPosition}.`);
    }

    // Output the final processed string to the standard console stream.
    // This completes the primary objective of the function.
    console.log(resultantSegment);

    // Although the function logs directly, returning the value allows for
    // potential integration into other parts of a larger system.
    return resultantSegment;
}


// --- Main execution flow for the script when run in a Node.js environment ---

// Type II: Renamed module reference.
const nodeFileSystem = require("fs");

// Type II: Renamed path variable.
const standardInputDevicePath = "/dev/stdin";

// Type III: Added a helper variable for storing raw file contents.
let rawFileContents = '';

try {
    // Attempt to synchronously read all content from the standard input path.
    // The content is expected to be UTF-8 encoded text.
    rawFileContents = nodeFileSystem.readFileSync(standardInputDevicePath, "utf8");
    console.log(`[INFO]: Successfully read data from ${standardInputDevicePath}. Data length: ${rawFileContents.length} characters.`);
} catch (readingError) {
    // Type III: Added robust error handling for file system operations.
    console.error(`[CRITICAL ERROR]: Failed to retrieve data from ${standardInputDevicePath}.`,
                  `Details: ${readingError.message}. Proceeding with an empty string.`);
    // In case of an error during file reading, ensure `rawFileContents` is an empty string
    // to prevent subsequent errors in `processInputPayload`.
    rawFileContents = "";
}

// Invoke the core processing function with the data obtained from standard input.
// The result is logged internally by the function, so the return value is not explicitly stored here.
processInputPayload(rawFileContents);

// A concluding remark to signify the end of the script's primary operation.
console.info("[INFO]: Script execution completed.");