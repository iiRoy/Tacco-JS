// This software component is designed to process incoming raw data streams.
// Its primary purpose is to ascertain the presence of a predefined set of key numerical characters
// within a sequence of tokens extracted from the input. The output indicates whether all
// required elements were successfully identified.

/**
 * Executes the core logic for validating specific numeric character presence within an input string.
 * The function first tokenizes the provided string by whitespace, then systematically checks
 * if a collection of essential digits ('1', '9', '7', '4') are all contained within these tokens.
 *
 * @param {string} sourceDataPayload - A string representing the complete data payload,
 *                                   expected to contain space-separated numeric or alphanumeric tokens.
 * @returns {void} The function does not return a value; instead, it logs a verdict
 *                 ('AFFIRMATIVE' or 'NEGATIVE') to the standard output.
 */
function analyzeNumericSequence(sourceDataPayload) {
    // Define the immutable collection of numeric characters that must be identified.
    // Using a Set provides efficient average-case time complexity for checking element existence.
    const essentialCharacterSet = new Set(['1', '9', '7', '4']);

    // Initialize a boolean flag to meticulously track whether all essential characters
    // have been located within the processed input. We optimistically assume success initially.
    let allEssentialElementsLocated = true;

    // Step 1: Pre-process the raw input string.
    // - Trim leading/trailing whitespace to prevent empty tokens from an empty string or extra spaces.
    // - Split the string into an array of individual tokens using a space as the delimiter.
    // - Filter out any resultant empty strings, which can occur if there are multiple spaces
    //   between actual tokens or if the string itself was just whitespace.
    const processedTokens = sourceDataPayload
        .trim()
        .split(" ")
        .filter(tokenUnit => tokenUnit.length > 0); // Exclude any zero-length string fragments.

    // Step 2: Implement a preliminary check for an empty token list.
    // If no valid tokens are present after processing, it's impossible to find all essential elements.
    if (processedTokens.length === 0) {
        allEssentialElementsLocated = false; // No tokens means no essential elements can be found.
    } else {
        // Step 3: Iterate through each character in our essential set.
        // For each essential character, verify its existence within the array of processed tokens.
        // The Array.from() call is used to iterate over the Set's elements directly in a for...of loop.
        for (const requiredDigitCharacter of Array.from(essentialCharacterSet)) {
            // Utilize the Array.prototype.includes() method for checking the presence of the current character.
            // If even one required character is not found, the overall condition fails.
            if (!processedTokens.includes(requiredDigitCharacter)) {
                allEssentialElementsLocated = false; // Update the flag to indicate failure.
                break; // Optimization: Exit the loop immediately as the final verdict is already determined.
            }
        }
    }

    // Step 4: Construct the final output message based on the evaluation result.
    // Using named constants for output strings enhances readability and maintainability.
    const successfulOutcomeMessage = 'AFFIRMATIVE';
    const unsuccessfulOutcomeMessage = 'NEGATIVE';

    // Ternary operator provides a concise way to select the appropriate message.
    const conclusiveStatement = allEssentialElementsLocated ? successfulOutcomeMessage : unsuccessfulOutcomeMessage;

    // Step 5: Deliver the final verdict to the standard output console.
    console.log(conclusiveStatement);
}

// --- Standard Input Integration Section ---
// This block handles the standard input/output operations.
// It reads the entire content from the standard input stream ('/dev/stdin')
// and passes it as a UTF-8 encoded string to our primary processing function.
// This specific implementation detail is typically fixed in competitive programming
// environments and should generally remain unaltered to ensure proper execution.
analyzeNumericSequence(require("fs").readFileSync("/dev/stdin", "utf8"));