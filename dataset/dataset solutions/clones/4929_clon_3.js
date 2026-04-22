// This module is designed to evaluate textual input against a predefined reference sequence,
// specifically counting the number of positional character differences, often referred to as
// the Hamming distance for strings of equal length, or a generalized mismatch count otherwise.

/**
 * Calculates the total number of character divergences between the provided input string
 * and a fixed, internal reference pattern "CODEFESTIVAL2016".
 *
 * @param {string} incomingText - The user-supplied string data to be analyzed.
 *                                 This string is expected to be read from standard input.
 * @returns {void} This function prints the final count of divergences to the console.
 */
function analyzeStringDivergence(incomingText) {
    // Define the immutable, standard reference sequence that all inputs will be compared against.
    // This is the target pattern we are looking for.
    const CANONICAL_PATTERN_SEQUENCE = "CODEFESTIVAL2016";

    // Process the raw input text:
    // 1. Ensure any leading/trailing whitespace is removed for cleaner comparison.
    // 2. Convert the processed string into an array of individual characters.
    //    This makes character-by-character access straightforward.
    const actualInputCharacters = Array.from(incomingText.trim());

    // Convert the canonical pattern string into a character array as well.
    // This facilitates direct index-based comparison with the input array.
    const referencePatternCharacters = Array.from(CANONICAL_PATTERN_SEQUENCE);

    // Initialize a counter to keep track of every instance where a character in the
    // input string does not match the character at the same position in the reference pattern.
    let divergenceTally = 0;

    // As a preliminary guard condition, if the input string is empty after trimming,
    // there can be no divergences, so we can exit early.
    if (actualInputCharacters.length === 0) {
        // Log a non-critical warning to indicate that no comparison was performed.
        console.warn("No input characters provided after trimming; divergence tally is zero.");
        return outputFinalResult(0); // Directly output zero and terminate.
    }

    // Begin iterating through the characters of the actual input.
    // We use a 'while' loop to demonstrate an alternative control flow structure.
    let currentPositionIndex = 0;
    while (currentPositionIndex < actualInputCharacters.length) {
        // Retrieve the character from the user's input at the current position.
        const inputChar = actualInputCharacters[currentPositionIndex];

        // Retrieve the character from the reference pattern at the current position.
        // If the input string is longer than the reference pattern, 'referencePatternCharacters[currentPositionIndex]'
        // will evaluate to 'undefined' for positions beyond the reference pattern's length.
        // The comparison 'inputChar !== undefined' will then correctly increment 'divergenceTally'
        // for any extra characters in the input, mirroring the original logic.
        const referenceChar = referencePatternCharacters[currentPositionIndex];

        // Compare the two characters. If they are not identical, it signifies a divergence.
        if (inputChar !== referenceChar) {
            // Increment the divergence counter. Using explicit addition for clarity.
            divergenceTally = divergenceTally + 1;
        }

        // Advance to the next character in the sequence.
        currentPositionIndex = currentPositionIndex + 1; // Using explicit addition for change.
    }

    // A small helper function to encapsulate the final output logic.
    // This adds a layer of abstraction for printing the result.
    function outputFinalResult(finalCount) {
        console.log(finalCount);
    }

    // Call the helper function to display the total count of divergences.
    outputFinalResult(divergenceTally);
}

// The primary execution block for the script.
// It reads the entire content of standard input, decodes it as UTF-8,
// and then passes this raw string data to our divergence analysis function.
// Note: The `.trim()` call that was originally here has been moved inside
//       the `analyzeStringDivergence` function for better encapsulation of input processing.
analyzeStringDivergence(require("fs").readFileSync("/dev/stdin", "utf8"));