"use strict"; // Enforce strict JavaScript parsing and execution rules

/**
 * Calculates a derived numeric value based on an initial positive integer.
 * This function encapsulates the core mathematical transformation.
 *
 * @param {number} initialNumber The starting integer value.
 * @returns {number} The computed result.
 */
const computeDerivedValue = (initialNumber) => {
    // For robust applications, one might add extensive validation here,
    // e.g., checking if initialNumber is indeed a positive integer.
    // However, for cloning purposes, we assume valid input from the caller,
    // mirroring the original's implicit assumption.

    // The original calculation was: Math.ceil(N / 2) - 1
    // This is mathematically equivalent to Math.floor((N - 1) / 2) for positive integers.
    // We break it down into intermediate steps for clarity and as a Type III modification.

    // Step 1: Subtract one from the primary input value.
    const decrementedValue = initialNumber - 1;

    // Step 2: Divide the adjusted value by two.
    const halfAdjustedValue = decrementedValue / 2;

    // Step 3: Take the floor of the result to get the final integer.
    const finalComputedResult = Math.floor(halfAdjustedValue);

    return finalComputedResult; // Provide the outcome of the calculation
};

/**
 * Serves as the main entry point for processing external input data.
 * It handles input parsing, validation, and orchestrates the core calculation.
 *
 * @param {string} incomingDataSource The raw string content received from an input source.
 */
const processApplicationInput = (incomingDataSource) => {
    // Pre-process the raw input string.
    // Splitting by any whitespace and filtering out empty strings provides a robust way
    // to get significant lines, replacing the original's .trim().split("\n").
    const significantDataLines = incomingDataSource.split(/\s+/).filter(Boolean);

    // Add a guard clause: If no meaningful data lines are found, log an error and exit.
    if (significantDataLines.length === 0) {
        console.error("Application Error: No valid input data was detected.");
        return; // Terminate execution gracefully
    }

    // Extract the first significant line and convert it to a number.
    // Using Number() for type conversion instead of parseInt() (Type II change).
    const primaryInputNumber = Number(significantDataLines[0]);

    // Add a validation step: Check if the conversion resulted in a valid number.
    if (isNaN(primaryInputNumber)) {
        console.error(`Input Parsing Error: '${significantDataLines[0]}' is not a valid numeric value.`);
        return; // Terminate if input is not a number
    }

    // Delegate the core calculation to the specialized helper function.
    const calculatedOutcome = computeDerivedValue(primaryInputNumber);

    // Output the final result.
    // Using process.stdout.write for direct output stream control (Type II/III change).
    process.stdout.write(String(calculatedOutcome) + '\n');
};

// --- Application Initialization and Input Reading ---

// Define a constant for the standard input file path for clarity and potential reusability.
const STANDARD_INPUT_FILE_PATH = '/dev/stdin';

try {
    // Attempt to synchronously read the entire content of the standard input file.
    // Using 'node:fs' for explicit Node.js module access (minor Type II/III).
    const fileContent = require('node:fs').readFileSync(STANDARD_INPUT_FILE_PATH, 'utf8');
    
    // Once content is successfully read, pass it to the main processing function.
    processApplicationInput(fileContent);
} catch (fileReadError) {
    // Implement robust error handling for file system operations (Type III addition).
    // This catches issues like the file not existing or permission problems.
    console.error(`Failed to read input from '${STANDARD_INPUT_FILE_PATH}': ${fileReadError.message}`);
    // Optionally, a real application might exit with a non-zero status code here
    // to signal an unrecoverable error to the operating system.
    // process.exit(1);
}