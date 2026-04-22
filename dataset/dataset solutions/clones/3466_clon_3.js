// This module defines a core routine for string manipulation based on character sequence properties.
// The primary goal is to reorder specific elements under a predefined condition.

/**
 * Executes a character reordering operation on an input string.
 * It first sanitizes the string, then checks its character count.
 * If the character count meets a specific criterion, it performs a swap
 * between the first and third characters before reassembling and displaying the string.
 *
 * @param {string} sourceString - The original string provided for processing.
 * @returns {void} This function logs its result to the console and does not return a value.
 */
function ManipulateAndDisplaySequence(sourceString) {
    // Guard clause: Ensure the input is a valid string type.
    // If not, log an error and terminate execution for this input.
    if (typeof sourceString !== 'string') {
        console.error("Data type validation failed: Input must be a string. Received:", typeof sourceString);
        return; // Exit early if the input is invalid.
    }

    // Processing Step 1: Prepare the string.
    // First, remove any leading or trailing whitespace from the source string.
    // Then, break down the cleaned string into an array of individual characters.
    let characterCollection = sourceString.trim().split('');

    // Define a constant for the specific length that triggers the swap logic.
    // This improves readability and makes the condition's intent clear.
    const requiredCharacterCountForSwap = 3;

    // Conditional Logic: Check if the character array's length matches the exact requirement.
    // This ensures the reordering only happens for strings of a very specific size.
    if (characterCollection.length === requiredCharacterCountForSwap) {
        // Reordering Step: Perform an in-place swap of the first and third elements.
        // Modern JavaScript's array destructuring assignment provides a concise
        // and efficient way to swap values without needing a temporary variable.
        [characterCollection[0], characterCollection[2]] = [characterCollection[2], characterCollection[0]];
    }
    // If the characterCollection does not have the required length, it remains unchanged.

    // Finalization Step: Reconstruct the string from the (potentially modified) character array.
    // The `join('')` method concatenates all elements of the array into a single string.
    let resultantString = characterCollection.join('');

    // Output Step: Display the final string to the standard output.
    // This is the observable outcome of the function's execution.
    console.log(resultantString);
}

// Application Entry Point: Orchestrates the execution flow.
// This block handles reading input from the environment and invoking the main processing function.
try {
    // Dynamically load the Node.js 'fs' (File System) module.
    // This module is necessary for interacting with the file system, including standard input.
    const filesystemUtilities = require("fs");

    // Read the entire content from the standard input stream synchronously.
    // The 'utf8' encoding is specified to correctly interpret character data.
    const dataFromStandardInput = filesystemUtilities.readFileSync("/dev/stdin", "utf8");

    // Invoke our primary string manipulation function with the data obtained from standard input.
    ManipulateAndDisplaySequence(dataFromStandardInput);
} catch (executionError) {
    // Error Handling: Catch and report any exceptions that occur during
    // file system operations or the main function's execution.
    console.error("An operational error occurred:", executionError.message);
    // Additional error logging or specific error type handling could be added here.
    process.exit(1); // Exit with a non-zero code to indicate an error.
}