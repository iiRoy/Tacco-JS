/**
 * This module orchestrates the primary logic for evaluating specific digit conditions
 * within an input text string received from standard input.
 *
 * It encapsulates the core character analysis and the overall input/output flow.
 */

/**
 * Scrutinizes the initial characters of a provided string to ascertain if
 * a predefined target digit ('9') is present at either the first or second position.
 * This function performs input validation and character-level inspection.
 *
 * @param {string | null | undefined} sourceText - The string content to be analyzed.
 *                                                Can be null or undefined for robustness.
 * @returns {boolean} Returns `true` if the target digit '9' is found at index 0 or 1;
 *                    otherwise, returns `false`.
 */
function analyzeLeadingNumericCharacters(sourceText) {
    // Define the specific digit we are interested in finding.
    const TARGET_NUMERAL_CHAR = '9'; // Renamed constant for clarity and potential future modification.

    let conditionVerdict = false; // Initialize a flag to store the outcome of the character analysis.

    // --- Input Validation and Preprocessing ---

    // Guard clause: Handle cases where the input string itself is invalid (null or undefined).
    if (sourceText === null || sourceText === undefined) {
        // In a production scenario, this might log an error or throw an exception.
        // For this context, we simply consider the condition not met.
        return false;
    }

    // Normalize the input string by trimming leading/trailing whitespace.
    // This is an added preprocessing step to ensure clean character access.
    const cleanedSourceText = String(sourceText).trim();

    // Guard clause: If the string is empty after trimming, no digits can be present.
    if (cleanedSourceText.length === 0) {
        return false;
    }

    // --- Character Inspection Logic ---

    // Step 1: Examine the character at the very first position (index 0).
    // Using charAt() is a robust way to access characters, returning an empty string
    // if the index is out of bounds (though not strictly necessary for index 0 if length > 0).
    const firstCharacterInSequence = cleanedSourceText.charAt(0);

    if (firstCharacterInSequence === TARGET_NUMERAL_CHAR) {
        conditionVerdict = true;
        // Optimization: If the condition is met by the first character,
        // there's no need to check further. Return immediately.
        return conditionVerdict;
    }

    // Step 2: If the first character did not satisfy the condition,
    // proceed to check the second character (index 1), but only if the string is long enough.
    if (cleanedSourceText.length >= 2) {
        const secondCharacterInSequence = cleanedSourceText.charAt(1);

        if (secondCharacterInSequence === TARGET_NUMERAL_CHAR) {
            conditionVerdict = true;
        }
    }

    // Return the final result of the digit presence evaluation.
    return conditionVerdict;
}

/**
 * This function serves as the main entry point for the application's execution flow.
 * It handles reading input from stdin, invoking the core logic, and printing the result.
 */
function executeApplicationLogic() {
    // Load the Node.js 'fs' (file system) module using a constant variable for good practice.
    const fileSystemModule = require('fs');

    // Define the standard input file path, common in competitive programming environments.
    const standardInputDevicePath = '/dev/stdin';

    // Specify the character encoding to use when reading the input stream.
    const textEncodingFormat = 'utf8';

    let acquiredInputContent; // Declare a variable to store the data read from stdin.

    // --- Input Acquisition ---
    try {
        // Attempt to synchronously read the entire content from the specified input path.
        // This operation is wrapped in a try-catch block for robust error handling.
        acquiredInputContent = fileSystemModule.readFileSync(standardInputDevicePath, textEncodingFormat);
    } catch (inputReadError) {
        // If an error occurs during file reading (e.g., file not found, permission issues),
        // log the error and gracefully terminate the execution flow.
        console.error(`Fatal Error: Unable to read from standard input device: ${inputReadError.message}`);
        return; // Exit the function to prevent further execution with corrupted or missing input.
    }

    // --- Core Logic Invocation ---
    // Pass the acquired input string to the character analysis function.
    const isTargetDigitFound = analyzeLeadingNumericCharacters(acquiredInputContent);

    // --- Output Generation ---
    let finalOutputStatement; // Variable to hold the message to be displayed.

    // Define constants for the positive and negative response strings.
    const POSITIVE_CONFIRMATION = "Affirmative\n"; // Changed "Yes" to "Affirmative".
    const NEGATIVE_DENIAL = "Negative\n";          // Changed "No" to "Negative".

    // Use a ternary operator for a concise assignment of the output message
    // based on the boolean result from the analysis function.
    finalOutputStatement = isTargetDigitFound ? POSITIVE_CONFIRMATION : NEGATIVE_DENIAL;

    // Display the determined output statement to the standard output stream.
    // Using process.stdout.write directly is an alternative to console.log,
    // offering potentially finer control over output buffering in some contexts.
    process.stdout.write(finalOutputStatement);
}

// --- Application Entry Point ---
// Initiate the entire processing flow by calling the main execution function.
executeApplicationLogic();