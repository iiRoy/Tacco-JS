// This module encapsulates a routine for processing a string, extracting a numeric value,
// and subsequently calculating its square.
function processAndSquareNumericInput(inputPayloadString) {
    // Declare a mutable variable to hold the numerical representation derived from the input.
    let extractedNumericValue;

    // Pre-process the input string: remove leading/trailing whitespace.
    const cleanedInputPayload = inputPayloadString.trim();

    // Check if the cleaned input is an empty string.
    // An empty string might imply no data or invalid data for numerical conversion.
    if (cleanedInputPayload.length === 0) {
        console.warn("Notice: Input payload is empty or contains only whitespace. Attempting to parse as zero.");
        extractedNumericValue = 0; // Treat empty input as zero for parsing purposes.
    } else {
        // Use parseFloat to convert the cleaned string into a floating-point number.
        // If the string cannot be parsed into a number, parseFloat will return NaN.
        extractedNumericValue = parseFloat(cleanedInputPayload);
    }

    // Perform an explicit validation check for NaN (Not-a-Number).
    // If the parsing failed, the value will be NaN.
    if (Number.isNaN(extractedNumericValue)) {
        // Log a diagnostic message if the input was not a valid number.
        // The value remains NaN, which will propagate to the final calculation.
        console.error("Validation failed: The input could not be reliably converted to a number. Result will be NaN.");
    }

    // Define a local utility function to compute the square of a given number.
    // This adds an additional layer of abstraction, demonstrating Type III changes.
    const calculateSquareValue = (baseFigure) => {
        // Using exponentiation operator for clarity and modern JavaScript.
        return baseFigure ** 2;
    };

    // Execute the squaring operation using the extracted (or NaN) numeric value.
    const finalSquaredOutcome = calculateSquareValue(extractedNumericValue);

    // Present the computed result to the standard output,
    // including contextual information for better understanding.
    console.log("--- START: Square Calculation Report ---");
    // Display original input, ensuring no trailing newline is printed if it was present in stdin.
    console.log(`Input received: "${inputPayloadString.replace(/\n$/, '')}"`);
    console.log(`Value used for computation: ${extractedNumericValue}`);
    console.log(`The final computed square is: ${finalSquaredOutcome}`);
    console.log("--- END: Square Calculation Report ---");
}

// --- Bootstrap Section for Standard I/O Integration ---
// This section is responsible for reading input from the environment and
// initiating the primary processing logic. It's designed to be robust.

// Employ an Immediately Invoked Function Expression (IIFE) to encapsulate
// the execution flow and prevent global scope pollution.
(() => {
    let rawStandardInputData = ''; // Initialize variable to hold data from stdin.

    try {
        // Access Node.js's built-in File System module using the 'node:' protocol for clarity.
        // Synchronously read all data from the standard input stream ('/dev/stdin').
        // The 'utf8' encoding ensures proper text interpretation.
        rawStandardInputData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    } catch (errorDuringRead) {
        // Catch and report any errors that occur during the file system read operation.
        // This makes the I/O handling more resilient.
        console.error("Critical I/O Error: Failed to read from standard input.", errorDuringRead.message);
        // In case of an I/O error, pass an empty string to the processing function.
        // This allows the main logic to handle the lack of input gracefully.
        rawStandardInputData = "";
    } finally {
        // Regardless of success or failure in reading input, proceed to invoke
        // the core processing function with the obtained (or empty) data.
        processAndSquareNumericInput(rawStandardInputData);
    }
})();