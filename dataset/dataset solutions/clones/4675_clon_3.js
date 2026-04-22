// Function responsible for orchestrating the user input processing.
function processUserInput(rawInputData) {
    // A guard clause to ensure that valid input data has been provided.
    // If the input is empty or just whitespace, an error is logged, and processing stops.
    if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim() === "") {
        console.error("Error: Input data is empty or invalid. Cannot proceed with token evaluation.");
        return; // Terminate execution for invalid input.
    }

    // Define a constant for the string delimiter. Using a constant improves readability and maintainability.
    const DELIMITER_CHARACTER = " ";

    // Split the raw input string into an array of individual tokens based on the defined delimiter.
    // This creates an intermediate data structure for further processing.
    const parsedTokensArray = rawInputData.split(DELIMITER_CHARACTER);

    // Call the core logic function to determine the outcome based on the array of tokens.
    const finalOutcomeString = determineComparisonOutcome(parsedTokensArray);

    // Output the final determined string to the console.
    // Using console.info for informational output, distinct from console.log.
    console.info(finalOutcomeString);
}

// Core function to evaluate an array of string tokens and return a specific outcome string.
// It primarily checks for the identity of the first two tokens.
function determineComparisonOutcome(tokenCollection) {
    // Define constants for the possible return values.
    // Using constants makes the code more self-documenting and easier to modify.
    const RESULT_IDENTICAL_TOKENS = "H"; // Indicates that the first two tokens are identical.
    const RESULT_DIFFERENT_TOKENS = "D"; // Indicates that the first two tokens are different.

    // A validation step: ensure the input is an array and contains at least two elements.
    // This prevents potential runtime errors (e.g., accessing undefined indices).
    if (!Array.isArray(tokenCollection) || tokenCollection.length < 2) {
        // If the token collection is insufficient, log a warning and return the 'different' outcome
        // as a sensible default behavior, or an error if strict validation is required.
        // For this Type III clone, we'll default to 'D' as if non-existent tokens are not equal.
        console.warn("Warning: Insufficient tokens provided for comparison. Returning 'Different' outcome.");
        return RESULT_DIFFERENT_TOKENS;
    }

    // Extract the first and second tokens into separate, clearly named variables.
    // This improves readability of the subsequent comparison.
    const primaryToken = tokenCollection[0];
    const secondaryToken = tokenCollection[1];

    // Perform a strict equality comparison (===) after explicitly converting both tokens to strings.
    // The original code used loose equality (==). Changing to strict equality and explicit conversion
    // is a Type III update that can affect edge cases (e.g., '1' == 1 is true, '1' === 1 is false).
    if (String(primaryToken) === String(secondaryToken)) {
        return RESULT_IDENTICAL_TOKENS;
    }

    // If the condition for identical tokens is not met,
    // the function directly returns the 'different' outcome.
    // This eliminates the need for an 'else' block, making the control flow slightly more direct (Type III deletion).
    return RESULT_DIFFERENT_TOKENS;
}

// Helper function to encapsulate the logic for reading input from standard input.
// This separates concerns and makes the main execution flow cleaner.
function obtainStandardInputText() {
    try {
        // Dynamically require the 'fs' (file system) module for input operations.
        const fileSystemModule = require("fs");
        // Read the entire content from /dev/stdin synchronously, decoding it as UTF-8.
        const rawStdinContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        // Trim any leading/trailing whitespace from the input content before returning.
        return rawStdinContent.trim();
    } catch (ioError) {
        // Catch and log any errors that occur during the file reading process.
        console.error(`An error occurred while reading from standard input: ${ioError.message}`);
        // Return an empty string in case of an error to prevent further processing with invalid data.
        return "";
    }
}

// Main execution block:
// 1. Obtain the input text using the dedicated helper function.
const receivedTextInput = obtainStandardInputText();
// 2. Pass the obtained input text to the primary processing function.
processUserInput(receivedTextInput);