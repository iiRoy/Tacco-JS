// This module provides functionality to read input from the console.
// It's a fundamental part of handling user interactions in a command-line environment.
const standardInputReader = require('readline');

/**
 * Processes a given input string and displays it with a predefined prefix.
 * Includes basic validation for the input content.
 * @param {string | null | undefined} rawData - The raw string data to be processed.
 * @returns {void} - This function performs a side effect (logging to console) and doesn't return a value.
 */
function processAndDisplayInput(rawData) {
    // Define a constant string that will always precede the user's input.
    const fixedPrefixString = "EnhancedOutput: ";

    let effectiveInputContent; // Declare a variable to hold the content after validation.

    // Perform a basic check for the validity of the raw input.
    // If the input is null, undefined, or an empty string after trimming,
    // a default message is used to ensure meaningful output.
    if (!rawData || typeof rawData !== 'string' || rawData.trim() === '') {
        effectiveInputContent = "[No valid input provided, using default response]";
        // Optionally, a warning could be logged here for debugging purposes.
        // console.warn("Input validation failed: Using a default placeholder.");
    } else {
        // If input is valid, trim any leading/trailing whitespace.
        effectiveInputContent = rawData.trim();
    }

    // Combine the fixed prefix with the (validated and processed) input content.
    // Using a template literal for cleaner string concatenation.
    const finalOutputMessage = `${fixedPrefixString}${effectiveInputContent}`;

    // Output the fully constructed message to the standard console.
    console.log(finalOutputMessage);
}

// The main execution block of the script:
// 1. Obtain a single line of input from the system's standard input stream.
const capturedInputLine = standardInputReader();

// 2. Pass the captured input to our specialized processing function.
// This encapsulates the display logic and allows for potential reuse or modification.
processAndDisplayInput(capturedInputLine);

// End of script execution.