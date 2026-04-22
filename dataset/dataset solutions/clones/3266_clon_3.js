/*
 * This module processes a raw input string to determine the presence of
 * specific numerical characters within its space-separated components.
 * It's designed to identify if the digits '1', '7', '4', and '9' are all
 * present in the provided sequence.
 */
function ProcessDigitSequence(inputLineData) {
    // Trim potential leading/trailing whitespace from the entire input string.
    const trimmedInput = inputLineData.trim();

    // If the input is empty after trimming, there's nothing to process.
    if (trimmedInput.length === 0) {
        console.warn("Input line is empty. No digits found.");
        return; // Early exit for empty input
    }

    // Split the input string into individual tokens based on one or more spaces.
    // This is a more robust split than just " ".
    const dataTokens = trimmedInput.split(/\s+/);

    // Define the set of essential digits that must be present for a 'SUCCESS' outcome.
    // Using a Set for efficient lookup and management of required items.
    const requiredDigits = new Set(["1", "7", "4", "9"]);

    // A Set to keep track of the unique required digits that have been successfully found
    // within the input sequence.
    const identifiedCriticalDigits = new Set();

    // Iterate through each token obtained from the input.
    // Using 'let' for the loop variable and 'of' for direct value access,
    // which is suitable for iterating over array elements.
    for (let currentToken of dataTokens) {
        // Normalize the token by trimming any surrounding whitespace.
        const cleanedToken = currentToken.trim();

        // Check if the current cleaned token is one of our required digits.
        if (requiredDigits.has(cleanedToken)) {
            // If it is, add it to our set of identified digits.
            // Sets automatically handle uniqueness, so adding a duplicate has no effect.
            identifiedCriticalDigits.add(cleanedToken);

            // Optimization: If we've already found all required digits, we can stop early.
            // This prevents unnecessary iteration over the remaining tokens.
            if (identifiedCriticalDigits.size === requiredDigits.size) {
                // All key digits have been located; no need to check further tokens.
                break;
            }
        }
    }

    // Determine the final outcome based on whether all critical digits were found.
    // This boolean variable provides clarity for the final conditional check.
    const allKeyDigitsFound = (identifiedCriticalDigits.size === requiredDigits.size);

    // Output the result. Using a different log method and message for the positive case,
    // and explicitly handling the negative case with a distinct message.
    if (allKeyDigitsFound) {
        console.info('SUCCESS: All designated digits were present in the sequence.');
    } else {
        // Added an explicit 'else' block for the negative case, which was implicitly
        // handled by printing nothing in the original code. This provides clearer feedback.
        console.log('FAILURE: Missing one or more designated digits.');
    }
}

// --- Application Entry Point ---
// This section handles reading from standard input and invoking the main processing function.
// It includes basic error handling for the file read operation to make the script more robust.
try {
    // Read the entire content of the standard input file as a UTF-8 string.
    const systemInputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
    
    // Call the primary function with the data read from the input stream.
    ProcessDigitSequence(systemInputBuffer);
} catch (error) {
    // Basic error handling for file read operations or any other synchronous errors
    // that might occur during the initial execution phase.
    console.error("An error occurred during file reading or processing:", error.message);
}