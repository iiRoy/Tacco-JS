/**
 * This module is designed to process textual input, specifically focusing on the first line.
 * It identifies and performs distinct operations based on the character count of this initial line.
 * The script provides a structured approach to input handling and conditional logic execution.
 */
function processInputData(sourcePayload) {
    // Input validation: Ensure the provided payload is indeed a string.
    // This acts as a preliminary guard clause to prevent runtime errors from unexpected types.
    if (typeof sourcePayload !== 'string') {
        // Log an error message to standard error stream and terminate processing.
        console.error("Error: The provided input payload must be a string type. Received:", typeof sourcePayload);
        return; // Exit the function gracefully.
    }

    // Step 1: Decompose the raw input into an array of individual lines.
    // This is an intermediate step to isolate the first line effectively.
    const distinctLines = sourcePayload.split('\n');

    // Step 2: Extract the primary line for further analysis.
    // We target the very first entry in the array of lines.
    let primaryContentLine = distinctLines[0];

    // Additional validation: Check if the primary line was successfully extracted and is not empty.
    // If the input was just empty or only newlines, primaryContentLine might be undefined or an empty string.
    if (!primaryContentLine) {
        primaryContentLine = ''; // Normalize to an empty string for consistent length checks.
    }

    // Cache the length of the primary content line for repeated access.
    // This is a helper variable to improve readability and potentially micro-optimize.
    const lineCharCount = primaryContentLine.length;

    // Conditional processing based on the character count of the primary line.
    // This section implements the core logic for different string lengths.
    if (lineCharCount === 2) {
        // Case 1: If the line has exactly two characters.
        // Output the original line, prefixed for clarity.
        console.log(`Matched length 2: ${primaryContentLine}`);
    } else if (lineCharCount === 3) {
        // Case 2: If the line has exactly three characters.
        // Implement a character reversal mechanism.
        let reversedStringAccumulator = ''; // Helper variable to build the reversed string.
        let characterIndex = lineCharCount; // Start from the end of the string.

        // Loop backward through the characters of the primary line.
        // This is an explicit, character-by-character reversal, an alternative to built-in methods.
        while (characterIndex > 0) {
            characterIndex--; // Decrement index to access characters from end to beginning.
            reversedStringAccumulator += primaryContentLine[characterIndex];
        }
        // Output the reversed line, clearly indicating the transformation.
        console.log(`Matched length 3 (reversed): ${reversedStringAccumulator}`);
    } else {
        // Default Case: For any other character count not explicitly handled above.
        // Provides feedback that no specific rule was applied.
        console.log(`No specific rule for length ${lineCharCount}. Content: "${primaryContentLine}"`);
    }
}

// --- Application Bootstrap and Input Acquisition ---
// This section handles the initial setup and input reading from standard input.
try {
    // Dynamically load the Node.js 'fs' (file system) module.
    // Using 'const' for module import as it's a constant reference.
    const fileSystemUtilities = require('fs');

    // Read the entire content from standard input synchronously.
    // Explicitly specify UTF-8 encoding for universal character support.
    const incomingStreamData = fileSystemUtilities.readFileSync('/dev/stdin', { encoding: 'utf8' });

    // Invoke the primary processing function with the data obtained from standard input.
    processInputData(incomingStreamData);
} catch (errorReadingInput) {
    // Error Handling: Catch any exceptions that occur during the file reading process.
    // This is a robust guard clause for I/O operations.
    console.error("Critical Error: Unable to retrieve data from /dev/stdin. Details:", errorReadingInput.message);
    // Optionally, exit the process with an error code to signal failure to the environment.
    // process.exit(1);
}