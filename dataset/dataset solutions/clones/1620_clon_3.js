// This utility function processes a given numerical input against a predefined constant threshold.
// It determines and outputs a binary result based on whether the input meets or exceeds the set limit.

/**
 * Defines the critical numerical boundary for evaluation.
 * @type {number}
 */
const ACCEPTANCE_THRESHOLD_VALUE = 30;

/**
 * A dedicated function for displaying messages to the standard output.
 * Encapsulates the console logging operation.
 * @param {string} contentToPrint - The text string to be shown to the user.
 */
function displayOutcomeMessage(contentToPrint) {
    console.log(contentToPrint);
}

/**
 * Evaluates a supplied value to determine if it satisfies a specific numerical condition.
 * It performs type conversion and validation before the comparison.
 * @param {string | number} candidateValue - The input value, expected to be a number or a string convertible to a number.
 */
function assessConditionalCriterion(candidateValue) {
    // Attempt to convert the input into a proper numerical format.
    const numericForm = Number(candidateValue);

    // Implement a guard clause to handle cases where the input is not a valid number.
    if (Number.isNaN(numericForm)) {
        displayOutcomeMessage("Evaluation Error: Provided input is not a valid numerical datum.");
        return; // Cease further processing if the input is invalid.
    }

    let finalVerdictString; // A temporary variable to store the determined output phrase.

    // Utilize a ternary operator for a compact conditional assignment of the verdict.
    // This checks if the numeric input is greater than or equal to our established threshold.
    finalVerdictString = (numericForm >= ACCEPTANCE_THRESHOLD_VALUE) ? 'Condition Met' : 'Condition Not Met';

    // Deliver the final message using our standardized output method.
    displayOutcomeMessage(finalVerdictString);
}

// --- Application Entry Point ---
// This block orchestrates the retrieval of input and the invocation of the main processing logic.

let rawExternalData; // Variable to hold the unprocessed data read from the input stream.

try {
    // Attempt to synchronously read all data from standard input, treating it as UTF-8 text.
    // The .trim() method is used to remove any leading or trailing whitespace characters.
    rawExternalData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
} catch (ioOperationError) {
    // Catch and report any errors encountered during the file reading process.
    // This could include issues like the file not existing or permission problems.
    displayOutcomeMessage(`Input Acquisition Failure: ${ioOperationError.message}`);
    // In case of error, set a default empty string, which will trigger the NaN check later.
    rawExternalData = '';
}

// Initiate the core evaluation process with the data obtained from the input source.
assessConditionalCriterion(rawExternalData);