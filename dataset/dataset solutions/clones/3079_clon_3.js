// This module is designed to process a single line of text input
// to determine if its first three space-separated components are identical.

/**
 * Evaluates whether the first three distinct elements from a given string
 * are all strictly equal. It expects the relevant data on the first line.
 *
 * @param {string} incomingText - The raw string input, potentially containing multiple lines.
 * @returns {string} "Yes" if the first three elements are identical, otherwise "No".
 *                   Outputs the result to the console and also returns it.
 */
function evaluateThreeElements(incomingText) {
    // Define constant messages for clarity and easier modification.
    const IDENTICAL_VERDICT = "Yes";
    const DIFFERENT_VERDICT = "No";

    // --- Input Validation and Pre-processing (Added fragments) ---

    // Ensure the input is a string and not empty after trimming.
    // This is a guard clause for robustness.
    if (typeof incomingText !== 'string' || incomingText.trim().length === 0) {
        console.error("Warning: Received empty or invalid input data type.");
        // For consistency with the original problem, an invalid input can default to "No".
        console.log(DIFFERENT_VERDICT);
        return DIFFERENT_VERDICT;
    }

    // Split the entire input into individual lines.
    const inputLinesCollection = incomingText.split('\n');

    // Extract the first line, which is expected to contain the actual data.
    // Use .trim() to remove any leading/trailing whitespace from the line itself.
    const primaryRelevantLine = inputLinesCollection[0] ? inputLines[0].trim() : '';

    // If the primary line is empty after trimming, there's no data to process.
    if (primaryRelevantLine.length === 0) {
        console.error("Warning: The first line of input is empty.");
        console.log(DIFFERENT_VERDICT);
        return DIFFERENT_VERDICT;
    }

    // Split the primary line by one or more whitespace characters.
    // .filter(Boolean) is used to remove any empty strings that might result
    // from multiple spaces or leading/trailing spaces during the split.
    const parsedComponents = primaryRelevantLine.split(/\s+/).filter(Boolean);

    // --- Core Logic: Element Extraction and Comparison ---

    // Validate that we have at least three components to compare.
    // This is another guard clause to handle malformed input.
    if (parsedComponents.length < 3) {
        console.error(`Error: Expected at least 3 elements, but found only ${parsedComponents.length}.`);
        console.log(DIFFERENT_VERDICT);
        return DIFFERENT_VERDICT;
    }

    // Use array destructuring to assign the first three elements to distinct variables.
    // This is an update to how variables were assigned.
    const [firstOperand, secondOperand, thirdOperand] = parsedComponents;

    let finalDecision; // Declare a variable to store the comparison result.

    // Perform the equality check using an if-else block.
    // This is a structural update from the original's ternary operator.
    if (firstOperand === secondOperand && secondOperand === thirdOperand) {
        finalDecision = IDENTICAL_VERDICT;
    } else {
        finalDecision = DIFFERENT_VERDICT;
    }

    // --- Output Generation ---

    // Output the determined result to the console.
    // Changed the formatting from '%s' to a simple template literal.
    console.log(`${finalDecision}`);

    // Return the result for potential further use in other modules.
    return finalDecision;
}

// --- Standard Input/Output Handling (Do not modify this section) ---
// This part is crucial for competitive programming environments to read input
// and invoke the primary processing function.
try {
    const fullInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    evaluateThreeElements(fullInputContent);
} catch (ioError) {
    // Log any errors that occur during file reading or initial processing.
    console.error("An error occurred during standard input processing:", ioError.message);
    // In case of a critical I/O error, we might still want to output "No"
    // to prevent the program from hanging or failing ambiguously in some contexts.
    // console.log("No");
}