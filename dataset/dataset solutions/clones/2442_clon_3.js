/*
 * This JavaScript module, originally designed for simple numerical transformations,
 * has been refactored to enhance readability, maintainability, and
 * robustness against various input conditions.
 * It processes a single integer value obtained from standard input,
 * applying a specific calculation based on the number's parity.
 * The core logic computes a derived value which is then
 * presented to the standard output.
 *
 * Key improvements include:
 * - Comprehensive input validation and error handling.
 * - Introduction of intermediate variables for clarity in complex calculations.
 * - Alternative expression of conditional logic using bitwise operations.
 * - Modular separation of concerns for input retrieval and output display.
 * - Extensive comments detailing the purpose and mechanism of each section.
 *
 * Version: 1.1.0-alpha
 * Author: RefactorBot
 * Date: 2023-10-27
 */

// Define a symbolic constant for the primary data source path.
// This improves configurability and makes the code easier to adapt.
const PRIMARY_DATA_STREAM_PATH = "/dev/stdin";

/**
 * Utility function to securely obtain raw textual data from a specified file path.
 * This acts as an abstraction layer for file system operations,
 * promoting cleaner separation of concerns.
 *
 * @param {string} sourceLocation - The file path from which to read the data.
 * @returns {string | null} The trimmed content of the file as a string,
 *                          or null if an error occurs during reading.
 */
const acquireInputContent = (sourceLocation) => {
    try {
        // Leverage Node.js's built-in file system module for synchronous reading.
        // 'utf8' encoding ensures proper interpretation of text data.
        const fileBuffer = require("fs").readFileSync(sourceLocation, "utf8");
        // It's crucial to trim any leading/trailing whitespace
        // that might interfere with subsequent parsing operations.
        return fileBuffer.trim();
    } catch (readOperationError) {
        // In case of any file system access errors (e.g., file not found, permissions),
        // an error message is logged, and a null value is returned to indicate failure.
        console.error(`ERROR: Failed to retrieve data from ${sourceLocation}. Details: ${readOperationError.message}`);
        return null; // Signal that input acquisition was unsuccessful.
    }
};

/**
 * Helper function dedicated to displaying the final computed result.
 * Encapsulating console output facilitates potential changes
 * to the display mechanism (e.g., writing to a file, GUI update)
 * without modifying core logic.
 *
 * @param {number} finalNumericalOutcome - The numerical value to be presented.
 */
const presentOutputValue = (finalNumericalOutcome) => {
    // Before displaying, a quick type check ensures that a valid number
    // is being outputted, preventing unexpected console behavior.
    if (typeof finalNumericalOutcome === 'number' && !isNaN(finalNumericalOutcome)) {
        console.log(finalNumericalOutcome);
    } else {
        // Log a warning if the result is not a valid number, indicating a potential issue.
        console.warn(`WARNING: Attempted to display an invalid result: '${finalNumericalOutcome}'. Output suppressed.`);
    }
};

/**
 * The primary function responsible for executing the numerical transformation logic.
 * It takes a string input, validates it, parses it, and then applies
 * a specific arithmetic rule to compute a derived value.
 *
 * @param {string} rawTextualInput - The raw string input, expected to be a positive integer.
 */
function processNumericalValue(rawTextualInput) {
    // --- Phase 1: Input Validation and Coercion ---

    // A crucial guard clause to ensure the input is a non-empty string.
    // This prevents errors from undefined or null inputs.
    if (!rawTextualInput || typeof rawTextualInput !== 'string') {
        console.error("VALIDATION_ERROR: Input provided is not a valid string. Processing halted.");
        return; // Exit early if input is fundamentally incorrect.
    }

    // Validate that the string contains only digits. Regular expressions
    // provide a robust way to check for numeric string patterns.
    if (!/^\d+$/.test(rawTextualInput)) {
        console.error(`VALIDATION_ERROR: Input '${rawTextualInput}' is not a positive integer string. Processing aborted.`);
        return; // Terminate if input doesn't conform to expected numeric format.
    }

    // Convert the validated string into an integer.
    // Specifying radix (10) is best practice for `parseInt` to avoid unexpected interpretations.
    const integerOperand = parseInt(rawTextualInput, 10);

    // Additional validation: Ensure the parsed number is a non-negative integer.
    // While regex checks for positive, this ensures `parseInt` didn't yield NaN or similar.
    if (isNaN(integerOperand) || integerOperand < 0) {
        console.error(`VALIDATION_ERROR: Parsed value '${integerOperand}' is not a valid non-negative integer. Exiting.`);
        return;
    }

    // --- Phase 2: Core Transformation Logic ---

    // Introduce an intermediate variable to hold the result of integer division by 2.
    // This is equivalent to a right bit shift (halving).
    const halfValueBase = integerOperand >> 1; // e.g., 4 >> 1 = 2; 5 >> 1 = 2.

    // Determine the parity adjustment.
    // The expression `(~integerOperand & 1)` cleverly yields:
    // - 1 if `integerOperand` is EVEN (e.g., ~4 = -5; -5 & 1 = 1)
    // - 0 if `integerOperand` is ODD  (e.g., ~5 = -6; -6 & 1 = 0)
    // This replaces the traditional `integerOperand % 2 === 0 ? 1 : 0` logic.
    const parityAdjustment = (~integerOperand & 1);

    // Apply the final transformation.
    // For even numbers: (N/2) - 1 => halfValueBase - 1
    // For odd numbers:  (N-1)/2   => halfValueBase - 0 (no adjustment)
    // This single expression unifies the logic from the original `if/else` block.
    const computedOutcome = halfValueBase - parityAdjustment;

    // --- Phase 3: Result Presentation ---

    // Delegate the display of the final result to the dedicated helper function.
    presentOutputValue(computedOutcome);
}

// --- Main Execution Block (Immediately Invoked Function Expression - IIFE) ---
// This pattern encapsulates the global scope and ensures the execution flow is clear.
(function initializeAndExecute() {
    // First, attempt to retrieve the necessary input data.
    const acquiredDataLine = acquireInputContent(PRIMARY_DATA_STREAM_PATH);

    // A conditional check ensures that processing only proceeds if valid data was acquired.
    if (acquiredDataLine !== null) {
        // If data acquisition was successful, invoke the main processing function.
        processNumericalValue(acquiredDataLine);
    } else {
        // If no data was retrieved, inform the user about the operational failure.
        console.warn("SYSTEM_ALERT: Data acquisition failed. Application cannot proceed with transformation.");
    }
})();