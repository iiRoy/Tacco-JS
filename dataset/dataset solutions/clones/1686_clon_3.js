/**
 * @file This module provides a utility function to determine the
 *       amount required to reach the next multiple of a specific base number (1000 in this case).
 *       It also includes the main application logic for processing standard input.
 */

/**
 * Calculates the difference needed to reach the next multiple of one thousand.
 * If the input value is already a multiple of 1000, it returns 0.
 *
 * @param {string} sourceText - The raw input string, which will be converted to a number.
 *                              Defaults to an empty string if not provided.
 * @returns {number} The amount to add to the input value to reach the next multiple of 1000,
 *                   or 0 if the value is already a multiple.
 */
function computeThousandComplement(sourceText = "") {
    // Establish the base number for modulo operations.
    // This constant enhances readability and maintainability.
    const MOD_BASE = 1000;

    // Explicitly convert the input string to a numerical format.
    // The original code used a bitwise OR (0 | input) which implicitly
    // converts non-numeric strings to 0. We replicate this behavior
    // by checking for NaN and defaulting to 0.
    let processedNumericValue = Number(sourceText);
    if (isNaN(processedNumericValue)) {
        // If the conversion yields Not-a-Number, we treat it as zero
        // to maintain consistent behavior with the initial implementation.
        processedNumericValue = 0;
    }

    // Determine the current remainder when the numerical value is divided by the base.
    // This intermediate step is crucial for the subsequent calculation.
    let currentRemainder = processedNumericValue % MOD_BASE;

    // Compute the additional value required.
    // The expression `(MOD_BASE - currentRemainder) % MOD_BASE`
    // elegantly handles both cases:
    // 1. If `currentRemainder` is 0, it yields `0`.
    // 2. If `currentRemainder` is positive, it yields `MOD_BASE - currentRemainder`.
    let neededAddition = (MOD_BASE - currentRemainder) % MOD_BASE;

    return neededAddition;
}

// Export the core computation function for external module usage.
// This allows other parts of an application to import and utilize this specific utility.
module.exports.calculateOffsetToNextThousand = computeThousandComplement;

/**
 * Orchestrates the primary application flow:
 * Reads raw input, sanitizes it, processes it using the core logic,
 * and then outputs the computed result to the console.
 *
 * @param {string} programInputString - The raw string data provided to the application,
 *                                      typically from standard input.
 * @returns {void}
 */
function executeProgramLogic(programInputString) {
    // Cleanse the input by removing any leading or trailing whitespace characters.
    const trimmedInput = programInputString.trim();

    // Add a non-essential informational warning if the input becomes empty after trimming.
    // This serves as a "new fragment" for Type III cloning.
    if (trimmedInput.length === 0) {
        console.warn("Warning: An empty input string was provided after trimming. Processing as numerical zero.");
    }

    // Invoke the central calculation utility with the cleaned input.
    const finalResult = computeThousandComplement(trimmedInput);

    // Display the final computed outcome to the standard output.
    console.log(finalResult);
}

// --- Application Bootstrapping and Input Handling ---

// A guard clause to prevent direct execution of standard input reading
// when the script is intended for testing purposes.
// The original `process.argv[2] !== "test"` is rephrased for Type III.
const isTestModeActivated = (process.argv.length > 2 && process.argv[2] === "test");

// Proceed with reading from standard input and executing the main logic
// only if the application is not operating in a designated test environment.
if (!isTestModeActivated) {
    try {
        // Dynamically load the 'fs' (file system) module.
        const fileSystemUtilities = require("fs");

        // Read the entire content from the standard input stream synchronously.
        // This is a common pattern for competitive programming or simple CLI tools.
        const standardInputContent = fileSystemUtilities.readFileSync("/dev/stdin", "utf8");

        // Initiate the primary application execution sequence with the acquired input.
        executeProgramLogic(standardInputContent);
    } catch (inputError) {
        // Implement robust error handling for potential issues during file I/O.
        // This is an "added new fragment" for Type III.
        console.error("An unrecoverable error occurred while attempting to read from standard input:", inputError.message);
        // Terminate the process with a non-zero exit code to signal an error condition.
        process.exit(1);
    }
}