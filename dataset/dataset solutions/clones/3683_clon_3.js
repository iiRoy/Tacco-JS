// Utility function to safely convert a string representation to an integer.
// This function ensures a base-10 radix is used for consistent numerical parsing.
// It also includes basic error handling for non-numeric or empty string inputs.
const parseNumericValue = (inputStringRepresentation) => {
    // A robust check to ensure the input is actually a string and not empty.
    if (typeof inputStringRepresentation !== 'string' || inputStringRepresentation.trim() === '') {
        console.warn("Input for numeric parsing was invalid or empty, returning NaN.");
        return NaN; // Indicate failure to parse
    }

    // Attempt to convert the trimmed string to an integer using base 10.
    const convertedNumber = parseInt(inputStringRepresentation.trim(), 10);

    // Verify if the parsing was successful. If not, log a warning and return 0 as a fallback.
    if (isNaN(convertedNumber)) {
        console.warn(`Warning: Failed to parse "${inputStringRepresentation}" as an integer. Defaulting to 0.`);
        return 0;
    }

    return convertedNumber;
};

/**
 * Orchestrates the primary data processing flow.
 * It reads from standard input, delegates the processing, and handles potential errors.
 */
try {
    // Access the Node.js file system module for input operations.
    const fileSystemModule = require("fs");

    // Synchronously read the entire content from /dev/stdin (standard input).
    // The content is expected to be UTF-8 encoded.
    const standardInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Pass the raw input string to the dedicated processing function.
    processInputData(standardInputBuffer);

} catch (processingError) {
    // Catch any errors that occur during file reading or initial processing.
    console.error("An unrecoverable error occurred during input acquisition or initial processing:", processingError.message);
    // Exit the process with a non-zero status code to indicate failure.
    process.exit(1);
}

/**
 * Core function to process the raw input content.
 * It extracts a source string and a step size, then builds a new string
 * by taking characters from the source at regular intervals.
 * @param {string} rawInputContent The complete string read from the input source.
 */
function processInputData(rawInputContent) {
    // Pre-validation: Ensure the input content is a non-empty string.
    if (typeof rawInputContent !== 'string' || rawInputContent.length === 0) {
        console.error("Operation Aborted: The provided input content is empty or not a valid string type.");
        return; // Terminate execution gracefully.
    }

    // Split the entire input content into an array of lines, using the newline character as a delimiter.
    const contentLinesArray = rawInputContent.split('\n');

    // Validation: Check if there are enough lines for the source string and the step size.
    if (contentLinesArray.length < 2) {
        console.error("Operation Aborted: Insufficient input lines. Expected at least two distinct lines of data.");
        return;
    }

    // The first line is treated as the primary string sequence from which characters will be extracted.
    const primarySourceSequence = contentLinesArray[0];

    // The second line is parsed as the integer step size for character extraction.
    // We use our custom utility function for safe conversion.
    let characterExtractionStep = parseNumericValue(contentLinesArray[1]);

    // Robust validation for the parsed step size:
    // It must be a positive integer. If not, a warning is issued, and it defaults to 1
    // to ensure the program can still proceed without errors (e.g., infinite loop if 0).
    if (isNaN(characterExtractionStep) || characterExtractionStep <= 0) {
        console.warn(`Warning: Invalid or non-positive extraction step "${contentLinesArray[1]}" detected. Defaulting to a step of 1.`);
        characterExtractionStep = 1; // Set a safe default.
    }

    // Determine the total length of the primary source sequence.
    const totalSequenceLength = primarySourceSequence.length;

    // Initialize an array to accumulate the extracted characters.
    // Using an array and then `join('')` at the end is often more performant
    // for many concatenations than repeatedly using `+=` on a string.
    const collectedCharacterSegments = [];

    // Iterate through the primary source sequence.
    // The loop increments by `characterExtractionStep` in each iteration.
    for (let currentPositionIndex = 0; currentPositionIndex < totalSequenceLength; currentPositionIndex += characterExtractionStep) {
        // Retrieve the character at the current index.
        const currentCharacter = primarySourceSequence[currentPositionIndex];

        // Add the retrieved character to our collection.
        // A check for `undefined` ensures no accidental additions if `currentPositionIndex`
        // somehow goes out of bounds, though the loop condition should prevent this.
        if (currentCharacter !== undefined) {
            collectedCharacterSegments.push(currentCharacter);
        }
    }

    // Combine all collected character segments into a single final string.
    const resultantOutputString = collectedCharacterSegments.join('');

    // Print the final string to standard output.
    console.log(resultantOutputString);
}