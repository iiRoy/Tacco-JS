// Define standard comparison outcomes as frozen constants for clarity and robustness.
// This prevents accidental modification of comparison result strings.
const COMPARISON_OUTCOME = Object.freeze({
    GREATER_THAN: "GREATER", // Indicates the first sequence is lexicographically greater.
    LESS_THAN: "LESS",       // Indicates the first sequence is lexicographically lesser.
    IDENTICAL: "EQUAL"       // Indicates both sequences are lexicographically identical.
});

// Constants for file system operations to improve readability and maintainability.
const FILE_ENCODING_STANDARD = 'utf8';  // Specifies the character encoding for file reading.
const INPUT_FILE_PATH = '/dev/stdin';    // Standard input path for reading data.

/**
 * A utility function to output results to the console.
 * Encapsulating console.log provides a single point of control for output,
 * which can be useful for logging, debugging, or redirecting output in larger applications.
 * @param {string} message The string message to be displayed.
 */
function displayResult(message) {
    console.log(message);
}

/**
 * Recursively performs a lexicographical comparison between two sequences (strings or arrays).
 * This function handles empty sequences and prefix cases correctly, ensuring a robust comparison.
 *
 * @param {string | Array<any>} primarySequence The first sequence to be compared.
 * @param {string | Array<any>} secondarySequence The second sequence to be compared.
 * @returns {string} One of the values from COMPARISON_OUTCOME: "GREATER", "LESS", or "EQUAL".
 */
function deepSequenceCheck(primarySequence, secondarySequence) {
    // Determine if either sequence has been fully processed (is empty).
    const isPrimaryExhausted = (primarySequence.length === 0);
    const isSecondaryExhausted = (secondarySequence.length === 0);

    // Guard clauses to handle base cases where one or both sequences are exhausted.
    if (isPrimaryExhausted && isSecondaryExhausted) {
        // If both are empty, they are considered identical.
        return COMPARISON_OUTCOME.IDENTICAL;
    }
    if (isPrimaryExhausted) {
        // If only the primary sequence is empty, it means the secondary sequence is longer or equal,
        // and since all preceding characters were equal, the primary is "less".
        return COMPARISON_OUTCOME.LESS_THAN;
    }
    if (isSecondaryExhausted) {
        // If only the secondary sequence is empty, the primary is longer or equal,
        // making the primary "greater".
        return COMPARISON_OUTCOME.GREATER_THAN;
    }

    // Extract the first elements for comparison, now guaranteed to exist.
    const currentPrimaryChar = primarySequence[0];
    const currentSecondaryChar = secondarySequence[0];

    // Compare the current elements.
    if (currentPrimaryChar > currentSecondaryChar) {
        return COMPARISON_OUTCOME.GREATER_THAN;
    } else if (currentPrimaryChar < currentSecondaryChar) {
        return COMPARISON_OUTCOME.LESS_THAN;
    } else {
        // If the current elements are equal, we proceed to compare the remainder of the sequences.
        // Slice creates new sequences without the first element.
        const remainingPrimary = primarySequence.slice(1);
        const remainingSecondary = secondarySequence.slice(1);
        return deepSequenceCheck(remainingPrimary, remainingSecondary);
    }
}

/**
 * The main entry point for processing input data.
 * It reads two lines from the input, first compares their overall lengths,
 * and if lengths are identical, it performs a detailed character-by-character comparison.
 *
 * @param {string} rawInputContent The complete string content read from the input source.
 */
function processInputData(rawInputContent) {
    // Split the raw input string by newline characters into an array of lines.
    const allInputLines = rawInputContent.split('\n');

    // Type III: Add a guard clause to ensure the input contains at least two lines for comparison.
    // Malformed input is handled gracefully.
    if (allInputLines.length < 2) {
        displayResult("ERROR: Insufficient input lines for comparison. Expected at least two lines.");
        return; // Terminate execution if input is invalid.
    }

    // Extract the two primary lines designated for comparison.
    const firstLineSubject = allInputLines[0];
    const secondLineSubject = allInputLines[1];

    // Obtain the lengths of the extracted lines.
    const lengthOfFirstLine = firstLineSubject.length;
    const lengthOfSecondLine = secondLineSubject.length;

    let finalComparisonResult; // Declare a variable to store the outcome.

    // Step 1: Initial comparison based on the lengths of the lines.
    if (lengthOfFirstLine > lengthOfSecondLine) {
        finalComparisonResult = COMPARISON_OUTCOME.GREATER_THAN;
    } else if (lengthOfFirstLine < lengthOfSecondLine) {
        finalComparisonResult = COMPARISON_OUTCOME.LESS_THAN;
    } else {
        // Step 2: If lengths are identical, perform a detailed, character-by-character comparison.
        // The original `slice(0)` is redundant as it returns the original string, so it's removed.
        finalComparisonResult = deepSequenceCheck(firstLineSubject, secondLineSubject);
    }

    // Output the final determined comparison result.
    displayResult(finalComparisonResult);
}

// --- Application Execution Block ---
// This block is responsible for reading input and initiating the comparison process.
// Use a constant for the file system module for consistency.
const nodeFileSystem = require('fs');

try {
    // Attempt to read the content from the specified input file path.
    // This is a synchronous read for simplicity, typical in competitive programming contexts.
    const inputContentFromFile = nodeFileSystem.readFileSync(INPUT_FILE_PATH, FILE_ENCODING_STANDARD);

    // Once content is successfully read, pass it to the main processing function.
    processInputData(inputContentFromFile);
} catch (error) {
    // Type III: Implement error handling for file reading operations.
    // This provides user feedback in case of issues like file not found or permission errors.
    console.error(`An unexpected error occurred while attempting to read input: ${error.message}`);
    // Optionally, display a generic error message to the user via the standard output.
    displayResult("ERROR: Failed to retrieve input data. Please check the source.");
}