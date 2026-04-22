// This module is designed to process textual input, extracting specific characters
// based on a user-defined interval. It ensures robust handling of input data
// and delivers a concatenated sequence of the chosen characters.

/**
 * Orchestrates the character extraction process from a given raw input string.
 * This function handles input parsing, validation, the core extraction logic,
 * and finally outputs the resulting character sequence.
 *
 * @param {string} rawInputPayload - The complete raw input string, expected to
 *                                   contain the source text on its first line
 *                                   and the numeric extraction interval on the
 *                                   second line, separated by newlines.
 * @returns {void} The function prints the final extracted string to the console.
 *                 It will print an empty string or an error message if input is invalid.
 */
const processTextExtraction = (rawInputPayload) => {
    // --- Phase 1: Input Validation and Initial Parsing ---

    // Validate the fundamental type and presence of the input payload.
    if (typeof rawInputPayload !== 'string' || rawInputPayload.length === 0) {
        console.error("Input Error: The provided payload must be a non-empty string.");
        return; // Terminate execution for invalid primary input.
    }

    // Split the raw input into individual lines. We use `filter` to discard
    // any lines that become empty after trimming, ensuring we only process
    // meaningful content lines.
    const parsedLines = rawInputPayload.split('\n').filter(line => line.trim().length > 0);

    // Verify that we have the minimum required number of lines:
    // one for the source text and one for the interval value.
    if (parsedLines.length < 2) {
        console.error("Input Error: Insufficient data lines. Expected at least two distinct lines.");
        console.log(""); // Output an empty string as a consistent failure result.
        return; // Terminate execution due to incomplete input.
    }

    // --- Phase 2: Extracting and Validating Source Text and Interval ---

    // Retrieve and trim the first line, which represents the source text.
    const sourceTextLine = parsedLines[0].trim();

    // If the source text itself is empty after trimming, there's nothing to extract.
    if (sourceTextLine.length === 0) {
        console.log(""); // Output an empty string directly.
        return; // Terminate early.
    }

    // Convert the validated source text string into an array of individual characters.
    // This provides a robust way to access characters by index.
    const sourceCharacterSequence = Array.from(sourceTextLine);

    // Extract and trim the second line, containing the raw string representation
    // of the desired extraction interval.
    const rawIntervalValue = parsedLines[1].trim();
    // Attempt to convert the raw string interval into a numeric value.
    const extractionInterval = Number(rawIntervalValue);

    // Perform comprehensive validation on the parsed interval value.
    // It must be a valid number, an integer, and strictly positive.
    if (isNaN(extractionInterval) || !Number.isInteger(extractionInterval) || extractionInterval <= 0) {
        console.error(`Configuration Error: The extraction interval '${rawIntervalValue}' is invalid. It must be a positive integer.`);
        console.log(""); // Output an empty string for invalid interval configurations.
        return; // Terminate execution due to an invalid interval.
    }

    // --- Phase 3: Core Character Extraction Logic ---

    // Initialize an empty string to progressively build our result.
    // This avoids the overhead of array pushes and then a final join.
    let collectedCharactersBuffer = '';
    // Cache the length of the character sequence for loop optimization.
    const sequenceLength = sourceCharacterSequence.length;

    // Iterate through the source character sequence using a standard C-style for loop.
    // This provides explicit control over the current index (position).
    for (let currentPosition = 0; currentPosition < sequenceLength; ++currentPosition) {
        // Check if the current position is an exact multiple of the extraction interval.
        // This identifies the characters to be extracted.
        const isAnExtractionPoint = (currentPosition % extractionInterval === 0);

        if (isAnExtractionPoint) {
            // Retrieve the character at the identified extraction point.
            const charToAppend = sourceCharacterSequence[currentPosition];
            // Append the extracted character directly to our result buffer.
            collectedCharactersBuffer += charToAppend;
        }
    }

    // --- Phase 4: Output Result ---

    // Print the final concatenated string of extracted characters to the console.
    console.log(collectedCharactersBuffer);
};

// --- Module Entry Point: Handling Input from Standard I/O ---
// This block is responsible for reading the input from '/dev/stdin'
// and initiating the character extraction process.
try {
    // Attempt to read the entire content of standard input as a UTF-8 string.
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Pass the read content to our main processing function.
    processTextExtraction(fileContent);
} catch (ioError) {
    // If there's an error during file reading (e.g., file not found, permissions),
    // log the error message.
    console.error("I/O Error: Could not read from standard input (/dev/stdin). Details:", ioError.message);
    // In a production scenario, you might want to exit with a non-zero status
    // or provide a default behavior. For this clone, just logging is sufficient.
}