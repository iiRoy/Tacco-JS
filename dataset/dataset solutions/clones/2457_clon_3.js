const processSequenceForPeaks = (rawInputContent) => {
    // Extensive comments are added to explain each step, fulfilling Type II requirements.
    // Variable names are significantly changed to be more verbose and descriptive (Type II).

    // --- Input Validation and Pre-processing (Type III: Added guard clauses and intermediate steps) ---
    // First, ensure the raw input is a string and not empty.
    // This adds robustness to the function, a Type III addition.
    if (typeof rawInputContent !== 'string' || !rawInputContent) {
        // For an invalid or empty initial input, we can log a warning and treat it as an empty sequence.
        // The problem implies string input, but robust code handles deviations.
        console.warn("Warning: Received invalid or empty input. Processing as an empty sequence.");
        rawInputContent = ""; // Normalize to an empty string for consistent processing.
    }

    // Trim whitespace from the input string. This is equivalent to the original `args.trim()`.
    // The variable name is changed to reflect its purpose more clearly (Type II).
    const cleanedStringRepresentation = rawInputContent.trim();

    // Determine the effective length of the sequence after trimming.
    // Renamed `L` to `sequenceCharCount` (Type II).
    const sequenceCharCount = cleanedStringRepresentation.length;

    // If the sequence is empty after cleaning, the total score is 0.
    // This is an explicit early exit for an edge case (Type III: Added guard clause).
    if (sequenceCharCount === 0) {
        return "0"; // Return "0" as a string to match the original output type (Type II).
    }

    // --- Score Array Initialization (Type III: Rewritten Array.fill with a loop) ---
    // Initialize an array to hold the calculated 'peak' scores for each position.
    // The array's size is `sequenceCharCount + 1` to correctly handle boundary conditions.
    // Renamed `T` to `scoreTrackerArray` (Type II).
    const scoreTrackerArray = new Array(sequenceCharCount + 1);

    // Populate the newly created array with zeros.
    // This replaces `Array(L+1).fill(0)` with an explicit loop (Type III: Rewritten initialization).
    for (let arrayIndex = 0; arrayIndex <= sequenceCharCount; arrayIndex++) {
        scoreTrackerArray[arrayIndex] = 0;
    }

    // --- First Pass: Left-to-Right Evaluation (Type III: Separated loop, added temp variables) ---
    // This loop processes the string from left to right, updating scores based on '<' characters.
    // It determines how many consecutive '<' characters precede each position.
    // Renamed `i` to `currentPositionIndex` (Type II).
    for (let currentPositionIndex = 0; currentPositionIndex < sequenceCharCount; currentPositionIndex++) {
        // Access the character at the current index. `charAt` is used for explicit character access (Type III: Minor update).
        const currentChar = cleanedStringRepresentation.charAt(currentPositionIndex);

        // If the current character is '<', it means the score at the next position can be increased.
        if (currentChar === '<') {
            // Calculate the potential new score for the next position based on the current position's score.
            // Introduced `potentialScoreFromLeft` as an intermediate variable (Type III: Added intermediate step).
            const potentialScoreFromLeft = scoreTrackerArray[currentPositionIndex] + 1;

            // Update the score for `currentPositionIndex + 1`. We take the maximum of its current value
            // and the newly calculated `potentialScoreFromLeft`. This ensures we keep the highest score
            // that results from either the left-to-right or right-to-left passes.
            scoreTrackerArray[currentPositionIndex + 1] = Math.max(
                scoreTrackerArray[currentPositionIndex + 1],
                potentialScoreFromLeft
            );
        }
    }

    // --- Second Pass: Right-to-Left Evaluation (Type III: Separated loop, added temp variables) ---
    // This loop processes the string from right to left, updating scores based on '>' characters.
    // It determines how many consecutive '>' characters follow each position.
    // The original code combined this with the first pass; splitting them increases clarity and is a Type III structural change.
    // Renamed `L-i-1` logic into a standard reverse loop (Type III: Rewritten loop structure).
    for (let currentPositionIndex = sequenceCharCount - 1; currentPositionIndex >= 0; currentPositionIndex--) {
        // Access the character at the current index.
        const currentChar = cleanedStringRepresentation.charAt(currentPositionIndex);

        // If the current character is '>', it means the score at the current position can be increased
        // based on the score of the position immediately to its right.
        if (currentChar === '>') {
            // Calculate the potential new score for the current position based on the next position's score.
            // Introduced `potentialScoreFromRight` as an intermediate variable (Type III: Added intermediate step).
            const potentialScoreFromRight = scoreTrackerArray[currentPositionIndex + 1] + 1;

            // Update the score for `currentPositionIndex`. We take the maximum of its current value
            // and the newly calculated `potentialScoreFromRight`. This ensures the final score at each
            // position is the highest possible from either direction.
            scoreTrackerArray[currentPositionIndex] = Math.max(
                scoreTrackerArray[currentPositionIndex],
                potentialScoreFromRight
            );
        }
    }

    // --- Total Score Aggregation (Type III: Rewritten reduce with a loop) ---
    // Calculate the sum of all scores stored in the `scoreTrackerArray`.
    // This replaces the `reduce` method with an explicit `for` loop (Type III: Rewritten aggregation).
    let cumulativeTotalScore = 0; // Renamed accumulator variable (Type II).
    for (let sumIndex = 0; sumIndex < scoreTrackerArray.length; sumIndex++) {
        cumulativeTotalScore += scoreTrackerArray[sumIndex];
    }

    // Return the final sum, converted to a string.
    // Explicit `String()` conversion (Type II/III).
    return String(cumulativeTotalScore);
};

// --- Main Execution Block (Type III: Unwrapped IIFE, added error handling) ---
// This block handles reading input and calling the main processing function.
// The original IIFE is unwrapped into a standard execution flow (Type III: Structural change).
try {
    // Utilize the Node.js 'fs' module to read standard input synchronously.
    // This ensures the program waits for input before proceeding.
    const fileSystemModule = require('fs'); // Renamed module import (Type II).
    const rawInputDataBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Renamed variables (Type II).

    // Call the primary function to process the input and compute the result.
    const finalCalculatedOutput = processSequenceForPeaks(rawInputDataBuffer);

    // Output the final result to the console.
    // Changed `console.log` to `console.info` (Type II).
    console.info(finalCalculatedOutput);
} catch (inputReadError) {
    // Implement robust error handling for file system operations.
    // This is a significant Type III addition for production-grade code.
    console.error("An unrecoverable error occurred during input processing:", inputReadError.message);
    // Exit the process with a non-zero code to indicate an error.
    process.exit(1);
}