"use strict";

/**
 * Computes the number of ways to form the target pattern "ABC"
 * within a given candidate sequence, considering '?' as a wildcard.
 * @param {string} sourceText - The raw input string containing the candidate sequence.
 */
function computeCombinations(sourceText) {
    // Trim whitespace from the input and obtain the primary sequence.
    const candidateSequence = sourceText.trim();
    const sequenceLength = candidateSequence.length;

    // Define core constants for the problem.
    const targetPattern = "ABC";
    const patternLength = targetPattern.length;
    const primeModulus = 1000000007; // A large prime number for modulo operations.

    // Early exit for trivial or invalid cases.
    if (sequenceLength < patternLength) {
        console.log(0);
        return;
    }

    // Initialize the dynamic programming table.
    // countMatrix[i][j] will store the number of ways to form the suffix of targetPattern
    // starting from index 'j', using the suffix of candidateSequence starting from index 'i'.
    // The dimensions are (sequenceLength + 1) x (patternLength + 1).
    const countMatrix = Array.from({ length: sequenceLength + 1 },
        () => Array.from({ length: patternLength + 1 }, () => 0));

    // Populate the DP table from bottom-up (right-to-left in string, right-to-left in pattern).
    // Iterate through the candidate sequence from its end to the beginning.
    for (let seqPointer = sequenceLength; seqPointer >= 0; --seqPointer) {
        // Iterate through the target pattern parts from its end (fully formed) to the beginning.
        for (let patternPointer = patternLength; patternPointer >= 0; --patternPointer) {

            // Base case: If we've reached the end of the candidate sequence (seqPointer == sequenceLength).
            if (seqPointer === sequenceLength) {
                // If we've also completed the target pattern (patternPointer == patternLength),
                // there's one way to achieve this (an empty suffix matches an empty suffix).
                // Otherwise, if the pattern is not yet complete, there are zero ways.
                countMatrix[seqPointer][patternPointer] = (patternPointer === patternLength) ? 1 : 0;
            }
            // Recursive step: For positions within the candidate sequence.
            else {
                // Calculate the number of ways if the current character at seqPointer does NOT contribute
                // to forming the current patternPartIdx (patternPointer).
                // If candidateSequence[seqPointer] is '?', it can be any of 'A', 'B', 'C' (3 options),
                // none of which are used to advance the pattern in this specific branch.
                // Otherwise, it's just 1 option (the character itself).
                const nonContributingFactor = (candidateSequence[seqPointer] === '?') ? 3 : 1;
                let waysFromSkippingChar = (countMatrix[seqPointer + 1][patternPointer] * nonContributingFactor) % primeModulus;

                // Check if the current character at seqPointer CAN contribute to forming
                // the current pattern part (patternPointer).
                const canCurrentCharMatchPattern = (patternPointer < patternLength) &&
                                                   (candidateSequence[seqPointer] === '?' ||
                                                    candidateSequence[seqPointer] === targetPattern[patternPointer]);

                if (canCurrentCharMatchPattern) {
                    // If it can, add the ways obtained by using this character to advance the pattern.
                    // This transitions to the next character in the sequence and the next part of the pattern.
                    waysFromSkippingChar = (waysFromSkippingChar + countMatrix[seqPointer + 1][patternPointer + 1]) % primeModulus;
                }

                // Store the total calculated ways for this state.
                countMatrix[seqPointer][patternPointer] = waysFromSkippingChar;
            }
        }
    }

    // The final result is the number of ways to form the entire target pattern "ABC"
    // starting from the beginning of the candidate sequence (index 0) and the beginning of the pattern (index 0).
    console.log(countMatrix[0][0]);
}

// Standard boilerplate for running the script in Node.js environment.
// This checks if the script is executed directly and reads from standard input.
if (typeof window === "undefined") {
    // Ensure 'fs' module is available for file system operations.
    const fileSystem = require("fs");
    // Read the entire content of /dev/stdin as UTF-8.
    const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    // Execute the main logic with the obtained input.
    computeCombinations(inputContent);
}