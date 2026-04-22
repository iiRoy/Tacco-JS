"use strict"; // Ensuring strict mode for modern JavaScript practices

/**
 * Orchestrates the process of calculating the displacement cost for reordering characters.
 * This function serves as the primary entry point for the application logic.
 * It reads input, validates it, and then delegates to a specialized calculation function.
 * @param {string} rawInputString The string data read from the input source.
 */
function processSequenceOperations(rawInputString) {
    // Define the character we are interested in moving to the front.
    const CHARACTER_TO_REPOSITION = 'W';

    // Initialize the total count of required shifts.
    let totalShiftCount = 0;

    // Track the number of target characters already processed.
    // This helps determine the ideal placement for subsequent target characters.
    let processedTargetElements = 0;

    // --- Input Validation Guard Clause ---
    // Ensure the input is a valid non-empty string before proceeding.
    if (typeof rawInputString !== 'string' || rawInputString.length === 0) {
        console.error("Error: Input sequence is invalid or empty. Cannot perform calculation.");
        // For invalid input, we log an error and treat the shift count as zero.
        console.log(0);
        return; // Exit early as there's nothing to process.
    }

    // Iterate through the input string using a standard loop construct.
    // 'currentCursorPosition' represents the current index being examined.
    for (let currentCursorPosition = 0; currentCursorPosition < rawInputString.length; currentCursorPosition++) {
        // Extract the character at the current position for easier comparison.
        const observedCharacter = rawInputString[currentCursorPosition];

        // Check if the current character is the one we intend to reposition.
        if (observedCharacter === CHARACTER_TO_REPOSITION) {
            // Calculate the displacement for this specific target character.
            // Its current index minus the number of target characters already found
            // gives us how many non-target characters it needs to 'jump' over.
            const individualCharacterDisplacement = currentCursorPosition - processedTargetElements;

            // Accumulate this individual displacement into the running total.
            totalShiftCount = totalShiftCount + individualCharacterDisplacement;

            // Increment the count of target characters found.
            // This adjusts the 'ideal' position for the next target character.
            processedTargetElements = processedTargetElements + 1; // Explicit addition for clarity.
        }
        // If the character is not the target, we simply ignore it and proceed to the next one.
        // No explicit 'continue' statement is needed here as there's no 'else' block.
    }

    // Output the final calculated total shift count to the console, as per requirements.
    console.log(totalShiftCount);

    // Optionally, the function could return the value, but the original only logs it.
    // return totalShiftCount;
}

// --- Application Entry Point & Input Handling ---
// This block handles reading the input from standard input and passing it to the main logic.
try {
    // Acquire a reference to the file system module's readFileSync method.
    const fileSystemReader = require("fs").readFileSync;

    // Read the entire content of standard input as a UTF-8 string.
    const dataFromStandardIn = fileSystemReader("/dev/stdin", "utf8");

    // Invoke our main processing function with the obtained input data.
    processSequenceOperations(dataFromStandardIn.trim()); // Trim whitespace from input for robustness.

} catch (inputError) {
    // Catch any errors that might occur during file reading (e.g., /dev/stdin not available).
    console.error("Failed to read input from /dev/stdin:", inputError.message);
    // In case of input error, we can still call the function with an empty string
    // or handle it gracefully to avoid crashing.
    processSequenceOperations("");
}