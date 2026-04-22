"use strict";

// This module processes a sequence of 'R' (right-moving) and 'L' (left-moving)
// elements, distributing their final counts to specific pivot positions.
// It effectively simulates elements moving towards an 'RL' boundary.
const computeDistribution = (rawInputData) => {

    // --- Type III: Input Validation (Guard Clause) ---
    // Ensure the input is a non-empty string before proceeding with parsing.
    if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
        // For an empty input string, return an empty array as there's nothing to process.
        // This is an additional robust handling not present in the original.
        if (rawInputData.trim().length === 0) {
            console.warn("Received empty input data. Returning empty distribution.");
            return [];
        }
        // For invalid types, an error could be thrown, but for cloning,
        // we assume the typical string input from '/dev/stdin'.
        // This specific problem context usually guarantees string input.
    }
    
    // --- Type II: Renamed Variables & Refactored Parsing ---
    // Extract the primary character sequence from the first line of the input.
    const sequenceLine = rawInputData.trim().split('\n')[0];
    const charElements = Array.from(sequenceLine); // Renamed `S` to `charElements`
    const sequenceLength = charElements.length;

    // --- Type II: Renamed Variables & Initialization ---
    // Initialize the array to store the final count for each position, filled with zeros.
    const finalCounts = new Array(sequenceLength).fill(0); // Renamed `answer` to `finalCounts`

    // Variables to track groups of 'R' and 'L' characters and their interaction points.
    let currentRGroupSize = 0;       // Renamed `Rstock` to `currentRGroupSize`
    let currentLGroupSize = 0;       // Renamed `Lstock` to `currentLGroupSize`
    let lastRPivotIndex;             // Renamed `splitPoint` to `lastRPivotIndex`
    let boundaryTransitionCount = 0; // Renamed `splitCount` to `boundaryTransitionCount`

    // --- Type III: Extracted Helper Function (Structural Change) ---
    // This function encapsulates the logic for distributing accumulated counts
    // to the two positions around an 'RL' pivot.
    const distributeSegmentCounts = (rCount, lCount, pivotPosition, targetArray) => {
        const totalParticipantsInSegment = rCount + lCount;
        
        // --- Type II: Rewritten Condition ---
        // Check if the total number of participants in the current segment is even.
        if (!(totalParticipantsInSegment % 2)) { // Equivalent to `totalParticipants % 2 === 0`
            targetArray[pivotPosition] = totalParticipantsInSegment / 2;
            targetArray[pivotPosition + 1] = totalParticipantsInSegment / 2;
        } else {
            // --- Type II: Comment Rewriting ---
            // This specific distribution logic for an odd total is preserved as per original functionality.
            // It assigns a potentially different number to each side of the pivot.
            targetArray[pivotPosition] = Math.ceil(lCount / 2) + 1;
            targetArray[pivotPosition + 1] = Math.ceil(rCount / 2) + 1;
        }
    };

    // --- Type II: Renamed Loop Variable & Rephrased Comments ---
    // Iterate through the character sequence. The loop stops before the very last character
    // because the logic implicitly handles the last character in a special way.
    for (let currentPosition = 0; currentPosition < sequenceLength - 1; ++currentPosition) {
        // --- Type III: Intermediate Variables for Clarity ---
        const currentSymbol = charElements[currentPosition];
        // --- Type II: Removed Redundant `parseInt` ---
        const nextSymbol = charElements[currentPosition + 1]; 

        // Accumulate counts for consecutive 'R' and 'L' groups within the current segment.
        if (currentSymbol === 'R') {
            currentRGroupSize++;
        } 
        // --- Type II: Changed `if` to `else if` for minor optimization/clarity ---
        else if (currentSymbol === 'L') {
            currentLGroupSize++;
        }

        // Detect a transition point where the character type changes (e.g., R to L, or L to R).
        if (currentSymbol !== nextSymbol) {
            boundaryTransitionCount++;
            // If this is the first transition (meaning we've found an 'R' followed by an 'L'),
            // mark the index of the 'R' as the pivot for this segment.
            if (boundaryTransitionCount === 1) {
                lastRPivotIndex = currentPosition;
            }
        }

        // --- Type II: Rephrased Comment ---
        // If two transitions have been detected, it signifies the end of a complete segment
        // (e.g., R...RL...LR...). At this point, distribute the accumulated counts.
        if (boundaryTransitionCount === 2) {
            // --- Type III: Calling Helper Function ---
            distributeSegmentCounts(currentRGroupSize, currentLGroupSize, lastRPivotIndex, finalCounts);

            // --- Type II: Rephrased Comment ---
            // Reset all counters for processing the next segment in the sequence.
            boundaryTransitionCount = 0;
            currentRGroupSize = 0;
            currentLGroupSize = 0;
        }

        // --- Type II: Rephrased Comment ---
        // Special handling for the second-to-last character (index `sequenceLength - 2`).
        // This block ensures that the final segment (which implicitly ends with the last character 'L')
        // is processed and its counts are distributed.
        if (currentPosition === sequenceLength - 2) {
            // --- Type II: Preserved Original Logic ---
            // The last character of the entire sequence is always counted as an 'L' for this final calculation.
            currentLGroupSize++; 
            
            // --- Type III: Calling Helper Function ---
            // Apply the accumulated counts for the concluding segment.
            distributeSegmentCounts(currentRGroupSize, currentLGroupSize, lastRPivotIndex, finalCounts);
        }
    }
    
    // --- Type III: Refactored Output ---
    // The function now returns the formatted string, rather than directly logging it.
    return finalCounts.join(" ");
};

// --- Type III: Enhanced Execution Block with Error Handling ---
// This block reads input from standard input, processes it, and prints the result.
// Includes a try-catch for basic error handling, a Type III addition for robustness.
try {
    // Requires 'fs' module to read from the file system (standard input in this context).
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Call the main processing function and log its result.
    console.log(computeDistribution(fileContent));
} catch (executionError) {
    // Log any errors that occur during file reading or processing.
    console.error("An error occurred during execution:", executionError.message);
    // In a production environment, more sophisticated error handling or exiting with a non-zero code might be appropriate.
    // For this cloning exercise, just logging the error is sufficient.
}