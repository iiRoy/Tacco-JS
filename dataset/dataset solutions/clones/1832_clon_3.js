function processStringForPlaceholders(sourceData) {
    // Validate input: Ensure the provided source data is a valid string.
    if (typeof sourceData !== 'string' || sourceData === null) {
        console.error("Error: Input data must be a non-null string for processing.");
        return; // Exit the function early if input is invalid.
    }

    // Handle an empty input string explicitly, although the logic would handle it.
    if (sourceData.length === 0) {
        console.log(""); // Output an empty string for empty input.
        return;
    }

    // Transform the input string into a mutable array of individual characters.
    let characterSequence = sourceData.split('');

    // Variable to store the index of the placeholder character during each search.
    let currentPlaceholderPosition = -1;

    // A control flag to manage the execution of the replacement loop.
    let replacementCycleActive = true;

    // Begin the primary loop to locate and substitute all placeholder characters.
    while (replacementCycleActive) {
        // Search for the first occurrence of the '?' placeholder character in the current sequence.
        currentPlaceholderPosition = characterSequence.indexOf('?');

        // Conditional check: If a placeholder character was found (index is not -1).
        if (currentPlaceholderPosition !== -1) {
            // Replace the located placeholder with the designated replacement character 'D'.
            characterSequence[currentPlaceholderPosition] = 'D';
            // The loop will automatically re-evaluate the condition and search for the next '?'
            // in the modified characterSequence.
        } else {
            // If no more placeholder characters ('?') are found, terminate the replacement loop.
            replacementCycleActive = false;
        }
    }

    // After all necessary replacements have been made, concatenate the characters
    // back into a single string. This is an optimized method for string reconstruction.
    const finalProcessedString = characterSequence.join('');

    // Display the final, transformed string to the standard output.
    console.log(finalProcessedString);
}

// --- Application Entry Point ---

// Obtain a reference to the Node.js file system module for input operations.
const fileSystemModule = require("fs");

// Define the standard input path for reading data.
const standardInputPath = "/dev/stdin";

// Read the raw content from the specified input path, decoding it as UTF-8 text.
const rawInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8");

// Invoke the main processing function with the input data obtained from stdin.
processStringForPlaceholders(rawInputContent);