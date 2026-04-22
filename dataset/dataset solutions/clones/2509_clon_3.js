"use strict";

/**
 * A specialized utility function designed to compute string transformation metrics.
 * This routine processes a sequence of characters and a repetition factor to derive
 * a final calculated score based on specific adjacent character matching rules.
 *
 * The algorithm involves two distinct counting patterns (Alpha and Beta) that
 * modify internal copies of the character sequence to prevent re-counting.
 *
 * @param {string} rawInputContent - The complete raw input string, expected to contain
 *                                   two newline-separated lines:
 *                                   1. The initial character string (e.g., "ABCA")
 *                                   2. An integer repetition multiplier (e.g., "3")
 */
const processCharacterSequenceTransform = (rawInputContent) => {
    // Basic input integrity check: ensure the input is a valid string and not empty.
    if (typeof rawInputContent !== 'string' || rawInputContent.length === 0) {
        console.error("Error: Provided input content must be a non-empty string.");
        return; // Terminate execution for invalid input
    }

    // Divide the raw input into individual lines, removing any leading/trailing whitespace.
    const contentLines = rawInputContent.trim().split("\n");

    // Use array destructuring to extract the character string and repetition factor.
    // This improves readability compared to accessing by index directly.
    const [originalCharString, repetitionCountString] = contentLines;

    // Convert the character string into an array of individual characters for easier manipulation.
    const charElements = Array.from(originalCharString);
    // Parse the repetition factor string into an integer.
    const repetitionFactor = Number(repetitionCountString);

    // Validate the parsed numerical input for the repetition factor.
    if (isNaN(repetitionFactor) || repetitionFactor < 0) {
        console.error("Error: Repetition factor must be a valid non-negative number.");
        return;
    }

    // Handle the edge case where the input character sequence is empty.
    // An empty sequence requires no transformations, so the score is 0.
    if (charElements.length === 0) {
        console.log(0);
        return;
    }

    // Special scenario: a single-character input string (e.g., "A").
    // When repeated 'K' times, it forms a string like "AAAA...A".
    // The number of operations to break all adjacent pairs is simply floor(K/2).
    if (charElements.length === 1) {
        console.log(Math.floor(repetitionFactor / 2));
        return;
    }

    /**
     * Calculates the "Pattern Alpha" operation count.
     * This pattern counts adjacent identical character pairs, modifying the sequence
     * greedily to prevent re-counting. It has a unique rule for the very first pair.
     * @param {Array<string>} sequenceToAnalyze - The character array to process.
     * @returns {number} The total count of operations for Pattern Alpha.
     */
    const computePatternAlphaScore = (sequenceToAnalyze) => {
        let alphaScore = 0;
        // Create a shallow copy of the input array to safely modify it during counting.
        const currentWorkingSequence = [...sequenceToAnalyze];
        // A flag to track if the initial element of the sequence was modified.
        let wasInitialElementAltered = false;

        // Iterate through the sequence, examining each character with its immediate successor.
        for (let currentIndex = 0; currentIndex < currentWorkingSequence.length - 1; currentIndex++) {
            // Check if the current character is identical to the next character.
            if (currentWorkingSequence[currentIndex] === currentWorkingSequence[currentIndex + 1]) {
                alphaScore++; // An operation is required for this pair.

                // Specific rule for the last adjacent pair in the sequence.
                if (currentIndex === currentWorkingSequence.length - 2) {
                    currentWorkingSequence[currentIndex + 1] = 'Ω'; // Mark the last character with a unique symbol.
                    // Loop will terminate after this iteration.
                }
                // Specific rule for the very first adjacent pair (index 0).
                else if (currentIndex === 0) {
                    currentWorkingSequence[currentIndex] = '§'; // Modify the *current* character.
                    wasInitialElementAltered = true; // Record this specific modification.
                }
                // General rule for all other adjacent pairs.
                else {
                    currentWorkingSequence[currentIndex + 1] = '€'; // Modify the *next* character.
                }
            }
        }
        return alphaScore;
    };

    /**
     * Calculates the "Pattern Beta" operation count.
     * This pattern first checks if the original sequence's start and end characters are identical,
     * applying an initial modification and count if they are. Then it proceeds with a greedy
     * adjacent pair counting, similar to a standard disjoint pair count.
     * @param {Array<string>} sequenceToProcess - The character array to analyze.
     * @returns {number} The total count of operations for Pattern Beta.
     */
    const computePatternBetaScore = (sequenceToProcess) => {
        let betaScore = 0;
        // Create another fresh copy of the character array for this calculation.
        const modifiedCharSequence = Array.from(sequenceToProcess);

        const firstCharacter = sequenceToProcess[0];
        const lastCharacter = sequenceToProcess[sequenceToProcess.length - 1];

        // Conditional initial modification based on the original sequence's first and last characters.
        if (firstCharacter === lastCharacter) {
            modifiedCharSequence[0] = 'Φ'; // Alter the first element.
            modifiedCharSequence[modifiedCharSequence.length - 1] = 'Ψ'; // Alter the last element.
            betaScore = 2; // These two initial alterations count as operations.
        }
        // If firstCharacter !== lastCharacter, betaScore remains 0 initially.

        // Iterate through the (potentially pre-modified) sequence to count subsequent adjacent pairs.
        for (let iterationIndex = 0; iterationIndex < modifiedCharSequence.length - 1; iterationIndex++) {
            if (modifiedCharSequence[iterationIndex] === modifiedCharSequence[iterationIndex + 1]) {
                betaScore++; // Increment operation count.
                modifiedCharSequence[iterationIndex + 1] = 'Δ'; // Mark the next character to avoid re-counting.
            }
        }
        return betaScore;
    };

    // Execute both distinct pattern calculations on the original character array.
    const alphaPatternResult = computePatternAlphaScore(charElements);
    const betaPatternResult = computePatternBetaScore(charElements);

    // Determine the final overall score based on the parity of the repetition factor.
    let finalAggregateScore;
    // If the repetition factor is an even number.
    if (repetitionFactor % 2 === 0) {
        // Sum both pattern results and scale by half the repetition factor.
        finalAggregateScore = (alphaPatternResult + betaPatternResult) * (repetitionFactor / 2);
    }
    // If the repetition factor is an odd number.
    else {
        // Apply different scaling factors (ceil and floor) to each pattern result.
        finalAggregateScore = (alphaPatternResult * Math.ceil(repetitionFactor / 2)) +
                              (betaPatternResult * Math.floor(repetitionFactor / 2));
    }

    // Output the computed final score.
    console.log(finalAggregateScore);
};

// Initiate the processing by reading input from standard input stream.
// This setup is common in competitive programming environments.
processCharacterSequenceTransform(require('fs').readFileSync('/dev/stdin', 'utf8'));