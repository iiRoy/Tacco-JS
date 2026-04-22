"use strict"; // Enforce strict parsing and error handling for cleaner code.

/**
 * This module is responsible for processing a specific numerical string operation.
 * It reads input, performs a unique concatenation and division, then outputs the result.
 *
 * IMPORTANT NOTE ON LOGIC:
 * The core logic concatenates two numeric string parts before converting the combined string
 * into a number and then dividing that number by two. This is NOT an arithmetic average.
 * For example, if the input is "10 20", the calculation will be (1020) / 2 = 510,
 * rather than (10 + 20) / 2 = 15. This behavior is intentionally preserved.
 */

/**
 * Executes the primary business logic: parsing the raw input, performing calculations,
 * and presenting the outcome.
 *
 * @param {string} incomingPayload - The complete string received from the input source.
 *                                   Expected to contain two space-separated numeric strings.
 * @returns {void} This function prints the computed result to standard output or an error to standard error.
 */
function ComputeConcatenatedHalf(incomingPayload) {

    // Trim whitespace from the payload and split it into individual string components.
    // Using a regex for splitting handles multiple spaces robustly.
    const stringComponents = incomingPayload.trim().split(/\s+/);

    // --- Input Validation: Ensure the correct number of components ---
    // The original logic implicitly assumed exactly two components.
    // We add an explicit check to make this robust.
    const EXPECTED_COMPONENT_COUNT = 2;
    if (stringComponents.length !== EXPECTED_COMPONENT_COUNT) {
        console.error(
            `Error: Invalid input format. Expected exactly ${EXPECTED_COMPONENT_COUNT} ` +
            `space-separated numeric strings, but received ${stringComponents.length}.`
        );
        process.exit(1); // Terminate script with an error code.
    }

    // Extract the individual string parts using descriptive variable names.
    const firstNumericString = stringComponents[0];
    const secondNumericString = stringComponents[1];

    // --- Core Transformation: Concatenate and Convert ---
    // Explicitly concatenate the two string components.
    // Using a template literal for clarity in string combination.
    const combinedStringValue = `${firstNumericString}${secondNumericString}`;

    // Convert the combined string into a numerical type.
    // The original code relied on implicit type coercion; here, we make it explicit for readability and safety.
    const numericalRepresentation = Number(combinedStringValue);

    // --- Validation for Numerical Conversion ---
    // Check if the conversion resulted in a valid number.
    if (isNaN(numericalRepresentation)) {
        console.error(
            `Error: The combined string "${combinedStringValue}" could not be converted to a valid number. ` +
            `Please ensure input consists of digits.`
        );
        process.exit(1); // Terminate on invalid numerical conversion.
    }

    // --- Final Calculation ---
    // Perform the division operation as specified by the original logic.
    const resultantValue = numericalRepresentation / 2;

    // --- Output the Final Result ---
    // Display the computed value to the console.
    console.log(resultantValue);
}

// --- Application Entry Point and Input Handling ---
// This block is responsible for reading data from standard input and initiating the processing.
try {
    // Asynchronously read the entire content from the standard input stream.
    // Specifying 'utf8' ensures proper character encoding for text data.
    const stdInputData = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke the core processing function with the data obtained from standard input.
    ComputeConcatenatedHalf(stdInputData);

} catch (inputReadError) {
    // --- Robust Error Handling for I/O Operations ---
    // Catch and report any errors that occur during the file system read operation.
    console.error(
        "An unexpected I/O error occurred while attempting to read from standard input:",
        inputReadError.message
    );
    process.exit(1); // Exit with a non-zero status code to indicate failure.
}