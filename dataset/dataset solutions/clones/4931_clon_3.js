// This module defines a specialized function designed to compare an arbitrary input string
// against a fixed, immutable reference sequence of characters. It quantifies the number
// of positions where the characters in the input do not match those in the reference.

/**
 * Calculates and reports the total count of character discrepancies between a provided
 * input string and a predefined standard code phrase.
 *
 * The comparison proceeds character by character. If the input string is longer than
 * the reference phrase, any characters in the input beyond the length of the reference
 * are automatically counted as mismatches, as they have no corresponding character
 * in the standard phrase.
 *
 * @param {string | unknown} incomingTextPayload - The raw data received, which is expected
 *   to be a string. Non-string values will be coerced into strings for processing,
 *   and null/undefined inputs will default to an empty string to prevent runtime errors.
 * @returns {void} This function does not return a value; instead, it outputs the
 *   calculated divergence count directly to the standard console output.
 */
function AssessCharacterDivergence(incomingTextPayload) {
    // Establish the unchangeable reference sequence of characters.
    // This constant string represents the target pattern for comparison.
    const IMMUTABLE_REFERENCE_SEQUENCE = "CODEFESTIVAL2016";

    // Initialize a mutable counter for accumulating non-matching character positions.
    // This variable will hold the final count of differences.
    let characterMismatchedCount = 0;

    // Process the input payload: ensure it's a string, handle potential null/undefined
    // values by defaulting to an empty string, and remove any leading or trailing whitespace.
    const normalizedProcessedString = String(incomingTextPayload || '').trim();

    // Determine the maximum index for the comparison loop. The loop will iterate
    // for every character present in the normalized input string.
    const effectiveComparisonLimit = normalizedProcessedString.length;

    // A supplementary constant for the length of our reference sequence.
    // While not strictly required for the core loop logic here, it can be useful
    // for other potential validation or conditional logic.
    const immutableSequenceLength = IMMUTABLE_REFERENCE_SEQUENCE.length;

    // Commence a character-by-character scan across the normalized input string.
    // The loop variable `positionIdentifier` increments by one in each iteration,
    // moving from the start of the string towards its end.
    for (let positionIdentifier = 0; positionIdentifier < effectiveComparisonLimit; positionIdentifier = positionIdentifier + 1) {
        // Retrieve the character from the input string at the current sequential position.
        const currentInputPositionChar = normalizedProcessedString.charAt(positionIdentifier);

        // Retrieve the character from the immutable reference sequence at the same position.
        // If `positionIdentifier` exceeds the `immutableSequenceLength`, `charAt()` will
        // return an empty string (""), which will correctly trigger a mismatch if
        // `currentInputPositionChar` is any valid character.
        const currentReferencePositionChar = IMMUTABLE_REFERENCE_SEQUENCE.charAt(positionIdentifier);

        // Perform a strict comparison between the two characters.
        // If they are not identical in both value and type, increment the mismatch counter.
        if (currentInputPositionChar !== currentReferencePositionChar) {
            // Utilize a compound assignment operator for incrementing the count.
            characterMismatchedCount += 1;
        }
    }

    // Display the final tally of character mismatches to the console.
    // This provides the user with the result of the text comparison.
    console.log(characterMismatchedCount);
}

// This is the primary execution block for the script.
// It reads data from the standard input stream, specifying UTF-8 encoding,
// and then passes this collected data to our character divergence assessment function.
// Using 'node:fs' explicitly references the Node.js built-in file system module,
// and `readFileSync` is called with an options object for clarity.
AssessCharacterDivergence(require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }));