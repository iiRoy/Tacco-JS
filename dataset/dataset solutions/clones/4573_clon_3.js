// This module facilitates reading data from the standard input stream.
// It is designed to process three space-separated integer values provided as input.
// The primary goal is to determine if the third value falls inclusively between the first and second values.

// A buffer to accumulate all incoming data chunks from standard input.
let accumulatedInputStreamData = '';
// A flag to ensure the final processing logic executes only once,
// especially important for 'end' event handlers that might be re-triggered in some environments.
let hasProcessingConcluded = false;

// Initiates the standard input stream to listen for data.
process.stdin.resume();

// Sets the character encoding for the standard input stream to UTF-8.
// This ensures proper interpretation of text data.
process.stdin.setEncoding('utf8');

/**
 * Provides a standardized way to output the final determination message.
 * @param {string} conclusiveMessage - The message indicating the outcome of the range check.
 */
const presentDecision = (conclusiveMessage) => {
    // Using template literals for a slightly different output format.
    console.log(`--- Result: ${conclusiveMessage} ---`);
};

/**
 * Attempts to parse a given string segment into a valid integer.
 * Includes validation to ensure the parsed value is indeed an integer and not NaN.
 * @param {string} textSegment - The string segment to be parsed.
 * @returns {number} The parsed integer, or NaN if parsing fails or the value is not an integer.
 */
const safelyExtractInteger = (textSegment) => {
    // Using Number() for parsing, which can handle various string formats.
    const convertedNumericValue = Number(textSegment);
    // Explicitly checking for NaN and ensuring it's an integer.
    if (Number.isNaN(convertedNumericValue) || !Number.isInteger(convertedNumericValue)) {
        // Optionally, one could log a warning here or throw an error.
        // For this clone, returning NaN to be handled by subsequent checks.
        return NaN;
    }
    return convertedNumericValue;
};

// Event listener for incoming data chunks from standard input.
process.stdin.on('data', (incomingDataPiece) => {
    // Appends the current data chunk to the global buffer.
    accumulatedInputStreamData += incomingDataPiece;
});

// Event listener triggered when the standard input stream ends (e.g., EOF or Ctrl+D).
process.stdin.on('end', () => {
    // Guard clause to prevent redundant processing.
    if (hasProcessingConcluded) {
        return;
    }
    hasProcessingConcluded = true; // Mark processing as started.

    // Trims whitespace and splits the accumulated input by one or more spaces.
    const rawInputSegments = accumulatedInputStreamData.trim().split(/\s+/);

    // Initial validation: check if the correct number of input segments were provided.
    if (rawInputSegments.length !== 3) {
        presentDecision("Incorrect number of parameters detected. Expected 3 numeric values.");
        return; // Exit early if input is malformed.
    }

    // Parses each segment into an integer using the helper function.
    const processedNumericCollection = rawInputSegments.map(safelyExtractInteger);

    // Validation: check if any of the parsed values are NaN (indicating failed parsing).
    if (processedNumericCollection.some(Number.isNaN)) {
        presentDecision("Invalid numeric data encountered. Ensure all inputs are integers.");
        return; // Exit early if non-numeric data is present.
    }

    // Destructures the array into distinct, meaningfully named variables.
    const [firstCandidateValue, secondCandidateValue, valueToEvaluate] = processedNumericCollection;

    // Determines the actual lower and upper bounds from the first two input values.
    // This handles cases where the "lower" bound might be numerically greater than the "upper" bound.
    const effectiveMinimumBound = Math.min(firstCandidateValue, secondCandidateValue);
    const effectiveMaximumBound = Math.max(firstCandidateValue, secondCandidateValue);

    // Evaluates whether the 'valueToEvaluate' falls within the calculated inclusive range.
    let evaluationOutcome = false; // Initialize the outcome.
    if (valueToEvaluate >= effectiveMinimumBound && valueToEvaluate <= effectiveMaximumBound) {
        evaluationOutcome = true; // Set to true if the condition is met.
    }

    // Constructs the final message based on the evaluation outcome using a ternary operator.
    const finalVerdictStatement = evaluationOutcome ? "Within Specified Range" : "Outside Specified Range";
    // Presents the final decision.
    presentDecision(finalVerdictStatement);
});

// Optional: Error handler for the standard input stream.
// This catches unexpected errors during input operations.
process.stdin.on('error', (inputError) => {
    console.error(`An unexpected input stream error occurred: ${inputError.message}`);
    presentDecision("Input processing terminated due to an error.");
});

/*
 * This concludes the setup of the input processing logic.
 * The script is now active and awaiting data from standard input.
 * Upon receiving all input and the stream ending, the range check will be performed
 * and the result will be displayed.
 */