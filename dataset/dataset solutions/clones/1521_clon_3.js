// This module encapsulates a core processing routine for command-line execution.
// Its primary objective is to evaluate a provided string input,
// attempt to convert it into an integer, and subsequently determine a binary outcome
// based on the numerical value's inherent truthiness in a specific context.

/**
 * Evaluates a given numeric value to produce a binary indicator.
 * A result of '0' signifies a truthy evaluation, while '1' indicates a falsy one.
 * This specific logic considers zero and non-finite numbers (like NaN) as falsy.
 *
 * @param {number} evaluatedNumericComponent - The numerical component to be assessed for its truthiness.
 * @returns {number} Returns 0 if the `evaluatedNumericComponent` is a finite, non-zero number; otherwise, returns 1.
 */
const determineBinaryOutcomeForNumericInput = (evaluatedNumericComponent) => {
    // The core logic here is to identify conditions that lead to a 'falsy' result.
    // If the component is not a finite number (e.g., NaN, Infinity, -Infinity)
    // OR if it is precisely zero, then it maps to the 'falsy' indicator (1).
    if (!Number.isFinite(evaluatedNumericComponent) || evaluatedNumericComponent === 0) {
        return 1; // Represents a falsy condition according to the problem's interpretation.
    }
    // Any other finite, non-zero number is considered 'truthy'.
    return 0; // Represents a truthy condition.
};

/**
 * Serves as the primary control flow for processing the external data.
 * It handles input validation, transformation, and delegates the final decision-making.
 *
 * @param {string} externalDataPayload - The raw string data received, typically from standard input.
 */
const orchestrateInputProcessing = (externalDataPayload) => {
    // Implement an initial guard clause for robustness:
    // If the input payload is null, undefined, or consists only of whitespace,
    // we can explicitly handle this edge case. While parseInt would yield NaN for these,
    // an explicit check provides clearer intent and potentially different logging.
    if (!externalDataPayload || String(externalDataPayload).trim().length === 0) {
        console.error('Warning: An empty or blank input string was detected. Processing aborted for this specific input.');
        // For an empty input, the original logic would eventually yield NaN, leading to 1.
        // We ensure consistency by outputting 1 here and exiting.
        console.log(1);
        return; // Terminate execution for this invalid input.
    }

    // Step 1: Pre-processing the raw string to ensure consistency.
    // Removing any leading or trailing whitespace characters.
    const cleanedInputString = String(externalDataPayload).trim();

    // Step 2: Convert the cleaned string into an integer.
    // Using Number.parseInt with an explicit radix of 10 for base-10 conversion.
    // This handles cases where the string might start with non-numeric characters after trimming.
    const integerRepresentation = Number.parseInt(cleanedInputString, 10);

    // Step 3: Utilize the dedicated helper function to compute the final desired binary outcome.
    const computedFinalIndicator = determineBinaryOutcomeForNumericInput(integerRepresentation);

    // Step 4: Output the calculated indicator to the standard output stream.
    // Using console.log as the standard method for displaying results.
    console.log(computedFinalIndicator);
};

// --- Application Entry Point ---
// This section is responsible for acquiring the input data from the operating environment.
// For typical competitive programming setups, this involves reading from standard input.
try {
    // Employing 'node:fs' for explicit module referencing (Node.js best practice).
    // The 'readFileSync' method is used to synchronously read the entire content
    // of the standard input file descriptor ('/dev/stdin').
    // Options are specified for character encoding ('utf8') and file access flag ('r' for read).
    const rawSystemInputContent = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

    // Once the raw input is successfully retrieved, initiate the main processing sequence.
    orchestrateInputProcessing(rawSystemInputContent);

} catch (errorReadingInput) {
    // In case of any error during file reading (e.g., /dev/stdin not found or permission issues).
    console.error(`An error occurred while attempting to read from standard input: ${errorReadingInput.message}`);
    // If input can't be read, it's effectively an "empty" or invalid input context,
    // so we can default to the falsy outcome (1) or exit.
    console.log(1); // Consistent with handling invalid input in the main logic.
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}