/**
 * This module provides a core function to evaluate a given text string
 * against a specific target pattern, "AKIHABARA", after applying a series
 * of conditional character insertions. It simulates a process of
 * 'correcting' a string to match the target.
 */

/**
 * Processes an incoming text string by potentially inserting 'A' characters
 * at predefined positions if those positions do not already contain 'A'.
 * Finally, it determines if the resulting string matches "AKIHABARA".
 * @param {string} rawInputText The original string received for processing.
 */
function processInputString(rawInputText) {
    // --- Type III Addition: Robustness check for input validity ---
    if (typeof rawInputText !== 'string') {
        // Log an error if the input is not a string, indicating a problem upstream.
        console.error("Input processing aborted: Expected a string, but received a different data type.");
        return; // Exit early as we cannot proceed with non-string input.
    }
    // For an empty string, the transformation rules might still apply.
    // Let's allow it to proceed, as the logic handles insertions at index 0 correctly.

    // Type II Change: Rename variable, add descriptive comment, use 'let' for mutability.
    // Initialize our working string by removing any leading or trailing whitespace
    // from the raw input, ensuring a clean starting point for character operations.
    let currentProcessedString = rawInputText.trim();

    // Type II Change: Rename array, use 'const' for fixed data.
    // These are the specific zero-based indices within the string where we will
    // check for the presence of the 'A' character and potentially insert one.
    const modificationTargetIndices = [0, 4, 6, 8];

    // Type III Addition: Introduce a constant for the character we intend to insert.
    // This improves readability and makes the code easier to modify if the target
    // insertion character ever changes.
    const requiredCharacterForInsertion = 'A';

    // Type III Addition: A counter to keep track of how many insertions were performed.
    // This can be useful for debugging, logging, or understanding the transformation process.
    let totalInsertionsPerformed = 0;

    // Type II Change: Rename loop variables, reformat loop structure, add detailed comments.
    // Iterate through each designated position in our list of target indices.
    for (let indexInTargetList = 0; indexInTargetList < modificationTargetIndices.length; indexInTargetList++) {
        // Retrieve the actual string index from our predefined list for the current iteration.
        const stringInsertionPoint = modificationTargetIndices[indexInTargetList];

        // Type III Addition: Add a guard clause to prevent out-of-bounds access if
        // the target indices were dynamically generated or could exceed string length.
        // For a fixed array like this, it's mostly for defensive programming.
        if (stringInsertionPoint < 0) {
            console.warn(`Encountered an invalid negative index: ${stringInsertionPoint}. Skipping this position.`);
            continue; // Move to the next target index.
        }

        // Type III Deletion: Removed the original `console.log(r[j]);` as it was
        // primarily for intermediate debugging and not part of the core output requirement.

        // Type II Change: Rename variables, use charAt for clarity.
        // Determine the character currently present at the specific string position.
        // If the position is beyond the string's current length, charAt() returns an empty string.
        const characterAtCurrentPosition = currentProcessedString.charAt(stringInsertionPoint);

        // Check if the character at the current string position is not our required 'A'.
        if (characterAtCurrentPosition !== requiredCharacterForInsertion) {
            // Type III Update: Rewrite the string modification logic for clarity and alternative method.
            // Split the string into two parts: before the insertion point and from the insertion point onwards.
            const segmentBeforeInsertion = currentProcessedString.substring(0, stringInsertionPoint);
            const segmentAfterInsertion = currentProcessedString.substring(stringInsertionPoint);

            // Reconstruct the string by inserting the required character between the two segments.
            currentProcessedString = segmentBeforeInsertion + requiredCharacterForInsertion + segmentAfterInsertion;

            // Increment our counter to reflect that a modification has taken place.
            totalInsertionsPerformed++;
        }
    }

    // Type III Addition: Optionally log the number of modifications. Can be commented out for production.
    // console.log(`Debug Info: ${totalInsertionsPerformed} 'A' characters were inserted during processing.`);

    // Type II Change: Rename constant for the final comparison pattern.
    // Define the exact string pattern we expect the processed string to match.
    const finalExpectedPattern = "AKIHABARA";

    // Type III Update: Break down the final comparison into a readable boolean variable.
    // Perform the final comparison to see if our modified string matches the target pattern.
    const doesStringMatchTarget = (currentProcessedString === finalExpectedPattern);

    // Type II Change: Reformat the final output conditional statement.
    // Output "YES" if the string matches, otherwise "NO".
    if (doesStringMatchTarget) {
        console.log("YES"); // The string successfully transformed into the target pattern.
    } else {
        console.log("NO");  // The string could not be transformed into the target pattern using this method.
    }
}

// Type III Addition: Wrap the input reading logic in a try-catch block
// to gracefully handle potential file system errors (e.g., file not found, permissions).
// Type II Change: Use 'const' for module imports and path definitions.
try {
    // Dynamically require the Node.js file system module for input operations.
    const fileSystemHandler = require('fs');

    // Specify the standard input file path, common in competitive programming environments.
    const standardInputFilePath = '/dev/stdin';

    // Define the character encoding to use when reading the file.
    const inputEncodingFormat = 'utf8';

    // Read the entire content of the standard input file synchronously.
    const inputDataFromFile = fileSystemHandler.readFileSync(standardInputFilePath, inputEncodingFormat);

    // Call our main processing function with the data read from the input.
    processInputString(inputDataFromFile);
} catch (dataReadError) {
    // If any error occurs during file reading (e.g., file not accessible),
    // log the error message for debugging purposes.
    console.error("An operational error occurred while attempting to read input data:", dataReadError.message);

    // Type III Addition: Provide a fallback mechanism or default behavior in case of input error.
    // For this specific problem, an empty string might be a reasonable default,
    // or one could choose to exit the process or throw the error further.
    // Calling with an empty string will allow the function to execute and likely output "NO".
    processInputString("");
}