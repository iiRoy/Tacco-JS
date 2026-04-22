'use strict';

/**
 * Determines if a given input string contains the specific pattern 'keyence'
 * following a rule that allows for at most one contiguous block of skipped characters.
 * The pattern must be matched character by character, and if a skip occurs,
 * it must be a single, uninterrupted segment within the input string.
 *
 * @param {string} rawInputData The raw input string, typically from standard input.
 * @returns {string} 'YES' if the pattern is found according to the rules, 'NO' otherwise.
 */
const evaluatePatternPresence = (rawInputData) => {
    // Extract the primary string for analysis, assuming it's the first line of input.
    const mainSequence = rawInputData.split('\n')[0];

    // Define the exact pattern we are looking for.
    const requiredPhrase = 'keyence';

    // Initialize the boolean outcome flag. We optimistically assume a match ('YES')
    // unless a condition for 'NO' is explicitly met.
    let finalVerdict = 'YES';

    // Cursor for iterating through the characters of the main input sequence.
    let mainSequenceCursor = 0;
    // Cursor for iterating through the characters of the required pattern.
    let phraseCursor = 0;

    // This variable stores the index in `mainSequence` where the most recent mismatch occurred.
    // It's initialized to `null` to indicate that no mismatch (and thus no skip block)
    // has been encountered yet.
    let lastMismatchIndex = null;

    // A flag to immediately signal if an invalid pattern structure (e.g., a second non-contiguous skip)
    // has been detected, prompting an early exit and a 'NO' verdict.
    let invalidPatternEncountered = false;

    // Iterate through the main sequence as long as we haven't reached its end
    // and no invalid pattern has been detected.
    while (mainSequenceCursor < mainSequence.length && !invalidPatternEncountered) {
        // Compare the current character from the main sequence with the current character from the required phrase.
        if (mainSequence[mainSequenceCursor] === requiredPhrase[phraseCursor]) {
            // If characters match, advance the phrase cursor to check the next character in the pattern.
            phraseCursor++;
        } else {
            // If characters do not match, it indicates a character skip in the main sequence.
            // We need to check if this skip is valid according to the rules.

            // First, determine if a skip block has already been identified earlier.
            if (lastMismatchIndex !== null) {
                // If a skip block was previously recorded, this current mismatch is potentially a second skip.
                // A second skip is only valid if it is immediately adjacent to the last character
                // of the previously recorded skip block.
                // If the current `mainSequenceCursor` is NOT directly following `lastMismatchIndex`,
                // it implies there was a segment of matched characters between two skipped segments,
                // which is not allowed.
                if (mainSequenceCursor !== lastMismatchIndex + 1) {
                    invalidPatternEncountered = true; // Mark as invalid.
                    break; // Terminate the loop immediately.
                }
            }
            // If this is the first mismatch, or if it's a valid continuation of an existing skip block,
            // record the current `mainSequenceCursor` as the index of the most recent skipped character.
            lastMismatchIndex = mainSequenceCursor;
        }
        // Always advance the main sequence cursor to move to the next character in `mainSequence`.
        mainSequenceCursor++;
    }

    // After the loop, evaluate the final conditions to set the verdict.
    // The pattern is considered NOT found if:
    // 1. An invalid pattern structure was detected during iteration.
    // 2. The entire `requiredPhrase` was not successfully matched (i.e., `phraseCursor` didn't reach its full length).
    if (invalidPatternEncountered || phraseCursor !== requiredPhrase.length) {
        finalVerdict = 'NO';
    }

    return finalVerdict;
};

/**
 * Entry point for processing the input and displaying the result.
 * This function handles reading from standard input and delegates
 * the core logic to the pattern evaluation function.
 *
 * @param {string} receivedInput The raw input string read from the source.
 */
const initiateProcessingPipeline = (receivedInput) => {
    // Call the core evaluation function to get the result.
    const outcomeResult = evaluatePatternPresence(receivedInput);
    // Output the computed result to the console.
    console.log(outcomeResult);
};

// Execute the processing pipeline by reading input from `/dev/stdin`.
// This is typical for competitive programming environments.
initiateProcessingPipeline(require('fs').readFileSync('/dev/stdin', 'utf8'));