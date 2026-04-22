// Type III Clone Generation - Extensive modifications applied.

// --- Stage 1: Configuration and Constants ---
// Define a constant for the standard input path, enhancing readability.
const STANDARD_INPUT_PATH = '/dev/stdin';
// Define the delimiter used to separate input lines.
const NEWLINE_DELIMITER = '\n';
// The specific numeric value that triggers the alternative message.
const ALTERNATE_CONDITION_TRIGGER = 1;
// The greeting message displayed under a specific condition.
const GREETING_PHRASE = 'Hello World';
// The radix for integer parsing, ensuring correct conversion.
const PARSING_RADIX = 10;

// --- Stage 2: Input Handling and Pre-processing ---

/**
 * Safely reads content from a specified file path.
 * Includes basic error handling for file system operations.
 * @param {string} filePath - The path to the file to read.
 * @returns {string | null} The file content as a UTF-8 string, or null if an error occurs.
 */
const retrieveFileContent = (filePath) => {
    try {
        // Using 'fs' module to read the file synchronously.
        return require('fs').readFileSync(filePath, 'utf8');
    } catch (readingError) {
        // Log the error for debugging purposes, but do not crash.
        console.error(`Error during file content retrieval from ${filePath}:`, readingError.message);
        return null; // Indicate failure to read.
    }
};

// Retrieve the raw input data from the standard input source.
const rawInputBuffer = retrieveFileContent(STANDARD_INPUT_PATH);

// Guard clause: If no input buffer is obtained, terminate execution.
if (rawInputBuffer === null) {
    console.error("Input data could not be retrieved. Exiting operation.");
    process.exit(1); // Standard exit code for unhandled errors.
}

// Split the raw input string into an array of individual lines.
const processedInputLines = rawInputBuffer.split(NEWLINE_DELIMITER);

// Basic validation: Ensure there are enough lines for processing.
if (processedInputLines.length < 3) {
    console.error("Insufficient input lines provided. Expected at least 3 lines.");
    process.exit(1);
}

// --- Stage 3: Data Extraction and Transformation ---

/**
 * Parses a string into an integer, providing a default value on failure.
 * @param {string} strValue - The string to parse.
 * @param {number} defaultValue - The value to return if parsing fails.
 * @returns {number} The parsed integer or the default value.
 */
const parseNumericValue = (strValue, defaultValue = 0) => {
    const parsed = parseInt(strValue, PARSING_RADIX);
    // Check if parsing resulted in a valid number.
    return isNaN(parsed) ? defaultValue : parsed;
};

// Extract and parse the primary condition identifier from the first line.
// Default to 0 if parsing fails, to avoid unexpected behavior.
const primaryConditionIdentifier = parseNumericValue(processedInputLines.shift(), 0);

// Extract and parse the first numeric operand.
const firstNumericOperand = parseNumericValue(processedInputLines.shift(), 0);

// Extract and parse the second numeric operand.
const secondNumericOperand = parseNumericValue(processedInputLines.shift(), 0);

// --- Stage 4: Core Logic Execution ---

/**
 * Performs the main conditional calculation or message selection.
 * @param {number} conditionVal - The value determining the output.
 * @param {number} valA - The first operand for summation.
 * @param {number} valB - The second operand for summation.
 * @returns {string | number} The result of the operation or the greeting message.
 */
const executeConditionalLogic = (conditionVal, valA, valB) => {
    let finalOutputContent; // Declare a variable to hold the computed result or message.

    // Evaluate the primary condition.
    if (conditionVal === ALTERNATE_CONDITION_TRIGGER) {
        finalOutputContent = GREETING_PHRASE; // Assign the specific greeting.
    } else {
        // Otherwise, perform the arithmetic summation.
        finalOutputContent = valA + valB;
    }
    return finalOutputContent;
};

// Execute the core logic with the extracted parameters.
const finalResultOrMessage = executeConditionalLogic(
    primaryConditionIdentifier,
    firstNumericOperand,
    secondNumericOperand
);

// --- Stage 5: Output Presentation ---

/**
 * Displays the final computed result or message to the console.
 * This function acts as a wrapper for console.log, allowing future modifications
 * to output behavior without altering the core logic.
 * @param {string | number} contentToDisplay - The data to be printed.
 */
const displayProgramOutput = (contentToDisplay) => {
    // Simply output the content. In a more complex scenario, this could format or log.
    console.log(contentToDisplay);
};

// Present the final outcome to the user.
displayProgramOutput(finalResultOrMessage);

// End of program execution.