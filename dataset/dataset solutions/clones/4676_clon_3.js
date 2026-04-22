/**
 * @file This module processes a pair of input indicators to determine a final state.
 * @description It implements a specific logical operation, analogous to an XNOR gate,
 *              where the outcome depends on whether the two input indicators are identical or different.
 *              The input is expected as a space-separated string of two characters, 'H' or 'D'.
 * @author Code Clone Expert
 * @version 1.0.0
 */

/**
 * @constant {string} HIGH_STATE - Represents the 'High' or 'True' state indicator.
 */
const HIGH_STATE = 'H';

/**
 * @constant {string} DUAL_STATE - Represents the 'Dual' or 'False' state indicator.
 */
const DUAL_STATE = 'D';

/**
 * @function deriveInverseCondition
 * @description A private helper utility that inverts a given binary state.
 *              If the input state is 'H', it returns 'D'; if 'D', it returns 'H'.
 *              This function introduces an intermediate logic step not explicitly present
 *              in the original, contributing to Type III structural changes.
 * @param {string} currentState - The indicator character to be inverted (expected 'H' or 'D').
 * @returns {string} The inverted state. Returns an empty string and logs a warning for invalid inputs.
 */
const deriveInverseCondition = (currentState) => {
    // Validate the input to this helper function for robustness.
    if (currentState === HIGH_STATE) {
        return DUAL_STATE;
    } else if (currentState === DUAL_STATE) {
        return HIGH_STATE;
    } else {
        // Log an error or warning for unexpected data, enhancing error handling.
        console.warn(`[Helper Logic Anomaly] Received an unexpected state '${currentState}' for inversion. Defaulting to empty.`);
        return ''; // Return a neutral value or throw to indicate an unhandled case.
    }
};

/**
 * @function determineOutcome
 * @description The primary processing function that accepts a raw input string,
 *              parses it into two distinct indicators, and computes a final designation.
 *              It includes robust input validation and error handling, and implements
 *              the core logic using an alternative structure compared to the original.
 * @param {string} rawInputStringData - A string containing two space-separated indicator characters (e.g., "H H", "D H").
 * @returns {void} This function does not return a value but prints the computed
 *                 final designation ('H' or 'D') to the standard output.
 */
function determineOutcome(rawInputStringData) {
    // --- Phase 1: Input Validation and Preprocessing ---
    // Ensure the input is a non-empty string before proceeding.
    if (typeof rawInputStringData !== 'string' || rawInputStringData.trim().length === 0) {
        console.error("[Input Error] The provided data string is invalid or empty. Processing halted.");
        return; // Exit early if input is not usable.
    }

    // Split the trimmed input string into its constituent parts.
    // Using a regular expression for splitting ensures robustness against varied whitespace.
    const componentParts = rawInputStringData.trim().split(/\s+/);

    // Verify that exactly two components were successfully extracted.
    const REQUIRED_PART_COUNT = 2;
    if (componentParts.length < REQUIRED_PART_COUNT) {
        console.error(`[Input Error] Insufficient indicator components. Expected ${REQUIRED_PART_COUNT}, but found ${componentParts.length}.`);
        return;
    }

    // Extract the individual indicators and convert them to uppercase for case-insensitivity.
    const primaryIndicator = componentParts[0].toUpperCase();
    const secondaryIndicator = componentParts[1].toUpperCase();

    // Define the set of allowed indicator states for validation.
    const permittedStates = new Set([HIGH_STATE, DUAL_STATE]);

    // Validate that both extracted indicators are within the set of permitted states.
    if (!permittedStates.has(primaryIndicator) || !permittedStates.has(secondaryIndicator)) {
        console.error(`[Input Error] One or both indicator characters are invalid. Expected '${HIGH_STATE}' or '${DUAL_STATE}', received '${primaryIndicator}' and '${secondaryIndicator}'.`);
        return;
    }

    // --- Phase 2: Core Logic Determination ---
    let finalDesignationValue; // Declare a mutable variable to store the computed result.

    // Implement the core decision logic. This structural rewrite replaces the original
    // nested if-else statements with a more modular approach utilizing a helper function.
    // The logic is equivalent to an XNOR operation: if primary is 'H', output is secondary;
    // otherwise (if primary is 'D'), output is the inverse of secondary.
    if (primaryIndicator === HIGH_STATE) {
        // When the primary indicator is 'H', the final outcome directly adopts the secondary indicator's state.
        finalDesignationValue = secondaryIndicator;
    } else { // Implicitly, primaryIndicator must be DUAL_STATE due to prior validation.
        // When the primary indicator is 'D', the final outcome is the inverse of the secondary indicator's state.
        finalDesignationValue = deriveInverseCondition(secondaryIndicator);
    }

    // --- Phase 3: Output Result ---
    // Print the final determined designation to standard output.
    console.log(finalDesignationValue);
}

// --- Application Entry Point for Node.js Environment ---
// This section is responsible for reading input from the standard input stream
// and initiating the main processing logic. It includes error handling for file operations.
try {
    // Dynamically import the Node.js file system module.
    const fileSystemAdapter = require("fs");
    // Define the standard input file path typical for competitive programming environments.
    const standardInputFilePath = "/dev/stdin";

    // Read the entire content of the standard input file synchronously.
    // The 'utf8' encoding ensures correct character interpretation.
    const rawInputContentFromStdin = fileSystemAdapter.readFileSync(standardInputFilePath, "utf8");

    // Invoke the main processing function with the data obtained from standard input.
    determineOutcome(rawInputContentFromStdin);
} catch (applicationExecutionError) {
    // Catch and report any errors that occur during the file reading or initial execution phase.
    console.error(`[Application Initialization Error] Encountered an issue reading from stdin or during setup: ${applicationExecutionError.message}`);
    // Optionally, exit the process with an error code to signal failure.
    // process.exit(1);
}