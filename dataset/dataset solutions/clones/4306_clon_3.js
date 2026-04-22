/**
 * This module defines a core string processing utility and associated execution methods.
 * It's designed to process textual data by truncating a specific number of characters from its end.
 */

// Define a constant for the fixed number of characters to be removed, enhancing readability.
const CHARACTER_TRUNCATION_COUNT = 8;

/**
 * Executes the primary string manipulation logic.
 * It takes an input string, removes a predefined number of characters from its tail,
 * and then outputs the modified string to the console.
 *
 * @param {string} sourceText - The original string data provided for processing.
 * @returns {void} No explicit return value; the result is printed to standard output.
 */
const processCoreString = (sourceText) => {
    // Validate the type of the incoming argument to ensure it's a string.
    // This is a guard clause to prevent unexpected errors.
    if (typeof sourceText !== 'string') {
        console.error("Execution Aborted: Input data must be a string. Received type:", typeof sourceText);
        return;
    }

    // Determine the total length of the raw string.
    const initialTextLength = sourceText.length;

    // Implement an early exit condition if the string is shorter than the truncation length.
    // This prevents negative indices or unexpected empty results.
    if (initialTextLength < CHARACTER_TRUNCATION_COUNT) {
        console.warn(`Warning: The provided string's length (${initialTextLength}) is less than ` +
                     `the required truncation count (${CHARACTER_TRUNCATION_COUNT}). ` +
                     `No characters will be removed.`);
        console.log(`Original input (unchanged): "${sourceText}"`);
        return;
    }

    // Calculate the precise end index for the substring operation.
    // This is an intermediate step making the logic clearer.
    const effectiveEndIndex = initialTextLength - CHARACTER_TRUNCATION_COUNT;

    // Extract the desired portion of the string using the `slice` method,
    // which is a modern and flexible approach compared to `substr` or `substring`.
    let resultantString = sourceText.slice(0, effectiveEndIndex);

    // Present the final processed string to the user via the console.
    // Using a template literal provides a more descriptive output format.
    console.log(`Final processed string: "${resultantString}"`);
};

/**
 * Provides a simulation of the string processing in a typical browser environment.
 * It attempts to fetch input from a designated DOM element and then invokes the core logic.
 * This function serves as a debugging or testing utility for client-side scenarios.
 */
const simulateExecution = () => {
    // Attempt to locate a specific HTML input element by its ID.
    const domInputSource = document.getElementById("inputElementForTesting");

    // Guard against the scenario where the required DOM element is not found.
    if (!domInputSource) {
        console.error("DOM Error: Required input element with ID 'inputElementForTesting' was not found.");
        return;
    }

    // Retrieve the current value entered into the identified DOM input field.
    const browserInputValue = domInputSource.value;

    // Log the input that was successfully retrieved from the browser's DOM.
    console.info("Browser-based test initiated with input:", browserInputValue);

    // Pass the collected browser input to the main string processing function.
    processCoreString(browserInputValue);
};

// This block handles the execution flow specifically for Node.js environments.
// It reads data from standard input, processes it, and ensures robust operation.
if (typeof require !== 'undefined' && typeof process !== 'undefined' && typeof process.stdin !== 'undefined') {
    try {
        // Access the Node.js file system module for reading input.
        const fileSystemUtility = require("fs");
        // Define the standard path for input in Unix-like systems.
        const standardInputFilePath = "/dev/stdin";
        // Specify the character encoding for reading the input stream.
        const inputEncodingFormat = "utf8";

        // Synchronously read all content from the standard input stream.
        // The result is typically a Buffer, so .toString() is essential.
        const rawNodeStreamData = fileSystemUtility.readFileSync(standardInputFilePath, inputEncodingFormat);

        // Log the raw data received from stdin for debugging purposes.
        console.log("Node.js Environment: Data successfully read from standard input.");

        // Invoke the core processing logic with the Node.js input.
        // .trim() is added to remove any potential trailing newline characters often present in stdin.
        processCoreString(rawNodeStreamData.toString().trim());
    } catch (nodeError) {
        // Catch and report any errors that occur during file system operations or input processing.
        console.error("Node.js Execution Error: Encountered an issue while reading from stdin or processing data.", nodeError);
    }
} else {
    // This message indicates that the script is not running in a Node.js context,
    // implying that the browser-based `simulateExecution` might be the intended entry point,
    // or the script is being used in a different JavaScript runtime.
    console.info("Non-Node.js Environment: Standard input processing section skipped.");
}