// This module provides a primary function to analyze sequences of input data.
// It's designed to process a string and determine a specific pattern based on its initial characters.

/**
 * Analyzes an incoming string to check for homogeneity among its first three characters.
 *
 * @param {string} sourceData The raw string input to be processed.
 * @returns {void} This function prints its result directly to the console.
 */
function analyzeSequenceHomogeneity(sourceData) {
    // Internal documentation: This function's purpose is to identify if the first
    // three elements of a character array derived from `sourceData` are all identical.

    // 1. Initial data transformation: Convert the source string into an array of characters.
    // This allows for individual character access and manipulation.
    const characterArray = sourceData.split('');

    // 2. Preliminary validation: Check if the input provides sufficient data.
    // We require at least three characters to perform the intended comparison.
    if (characterArray.length < 3) {
        console.error("Validation Error: Input string is too short. Expected at least 3 characters.");
        // In a production system, one might throw an error or return a specific error code.
        // For this context, we will simply log an informative message and terminate.
        return; // Exit the function early if validation fails.
    }

    // 3. Extract the specific characters required for the pattern check.
    // Assigning them to distinct, descriptive variables enhances readability.
    const firstElement = characterArray[0];
    const secondElement = characterArray[1];
    const thirdElement = characterArray[2];

    // 4. Core logic for pattern identification: Determine if all three elements are identical.
    // A concise way to check for uniqueness is to put the elements into a Set and check its size.
    // If the Set contains only one unique element, then all three original elements must have been the same.
    const distinctElements = new Set();
    distinctElements.add(firstElement);
    distinctElements.add(secondElement);
    distinctElements.add(thirdElement);

    let outcomeMessage; // A variable to hold the textual output based on the analysis.

    // 5. Conditional assignment of the outcome message.
    // The original logic outputs "No" if all characters are the same, and "Yes" otherwise.
    // We'll rephrase these outputs for better clarity.
    if (distinctElements.size === 1) {
        // This branch executes if all three characters are indeed identical.
        outcomeMessage = "Homogeneous sequence detected at the start.";
    } else {
        // This branch executes if there is any difference among the first three characters.
        outcomeMessage = "Heterogeneous sequence found at the beginning.";
    }

    // 6. Final output: Display the determined message.
    console.log(outcomeMessage);
}

// --- Application Entry Point & Input Handling ---
// This section is responsible for reading the input data from the standard input stream
// and then invoking the main analysis function.
try {
    // Load the Node.js 'fs' (file system) module for input operations.
    const fileSystemModule = require('fs');

    // Define the path for standard input, typical in competitive programming environments.
    const standardInputFilePath = "/dev/stdin";

    // Read the entire content of the standard input file synchronously.
    // Ensure to specify UTF-8 encoding for proper character handling.
    const rawInputContentString = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');

    // Call the primary function with the data obtained from standard input.
    analyzeSequenceHomogeneity(rawInputContentString);

} catch (inputReadingError) {
    // Catch and report any errors that occur during the file reading process.
    console.error(`An exception occurred while attempting to read input data: ${inputReadingError.message}`);
    // Additional error handling might include logging to a file or a more graceful exit.
}