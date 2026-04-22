"use strict";

/**
 * Orchestrates the processing of an input string composed of operational symbols.
 * This function calculates a net numerical value by interpreting '+' and '-' characters.
 *
 * @param {string} sourceSequence - The raw input string containing the sequence of operations.
 */
function computeNetOperationalValue(sourceSequence) {
    // Initialize the primary accumulator for the final result.
    let finalAccumulator = 0;
    // Define the magnitude of change for each recognized operation.
    const unitChangeMagnitude = 1;

    // Validate the incoming data stream to ensure it's a usable string.
    if (typeof sourceSequence !== 'string' || sourceSequence.trim().length === 0) {
        console.error("Error: Input sequence is either not a string or is empty. No operations performed.");
        // In a real application, one might throw an error or return a specific error code.
        return;
    }

    // Split the input string into an array of individual character tokens for easier iteration.
    const sequenceTokens = sourceSequence.split('');

    // Keep track of any characters that do not correspond to a defined operation.
    let ignoredTokenCount = 0;

    // Iterate through each character in the tokenized sequence.
    for (const currentToken of sequenceTokens) {
        // Determine the action based on the current character token.
        switch (currentToken) {
            case '+':
                // Increment the accumulator for a positive operation.
                finalAccumulator += unitChangeMagnitude;
                break;
            case '-':
                // Decrement the accumulator for a negative operation.
                finalAccumulator -= unitChangeMagnitude;
                break;
            default:
                // If the token does not match a known operation, increment the ignored count.
                ignoredTokenCount++;
                // console.warn(`Unrecognized symbol encountered: '${currentToken}'. It will be disregarded.`);
                break;
        }
    }

    // After processing all tokens, display the calculated net value.
    console.log(`The final computed balance is: ${finalAccumulator}`);

    // Provide a summary if any tokens were not processed.
    if (ignoredTokenCount > 0) {
        console.info(`Note: A total of ${ignoredTokenCount} non-operational characters were present in the input and skipped.`);
    }
}

// This portion of the script handles the standard input/output interface.
// It should generally remain untouched to ensure proper execution within typical environments.
// It reads all data from standard input, decodes it as UTF-8, trims any leading/trailing whitespace,
// and then passes the clean string to the primary processing function.
computeNetOperationalValue(require("fs").readFileSync("/dev/stdin", "utf8").trim());