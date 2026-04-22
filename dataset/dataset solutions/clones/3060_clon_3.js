"use strict";

/**
 * Orchestrates the processing of input data to determine the maximum
 * consecutive length of '1's achievable by flipping at most K blocks of '0's.
 * This function handles input parsing, edge case evaluation, run-length encoding,
 * and a sliding window calculation.
 *
 * @param {string} rawInputData - The raw string input from stdin.
 */
const processInputData = (rawInputData) => {
    // --- Phase 1: Input Acquisition and Initial Setup ---
    // Remove leading/trailing whitespace and split into individual lines.
    const parsedLines = rawInputData.trim().split('\n');

    // Extract numerical parameters (N and K) from the first line.
    // N: original sequence length, K: maximum allowed flips of zero-blocks.
    const numericalParameters = parsedLines[0].split(" ").map(Number);
    const originalSequenceLength = numericalParameters[0];
    const maxZeroBlockFlips = numericalParameters[1];

    // Convert the second line into an array of integers (0s and 1s).
    const digitArray = parsedLines[1].split("").map(Number);

    // --- Phase 2: Handle Trivial/Edge Cases for Performance ---
    // Helper to check if all elements are the same.
    const areAllElementsSame = (arr, value) => arr.every(element => element === value);

    // If the sequence consists entirely of '1's, no flips are needed; the answer is N.
    if (areAllElementsSame(digitArray, 1)) {
        console.log(originalSequenceLength);
        return;
    }

    // If the sequence consists entirely of '0's, we can flip all of them
    // if K is large enough. The problem implicitly allows for this by returning N.
    if (areAllElementsSame(digitArray, 0)) {
        console.log(originalSequenceLength); // Assuming K is sufficient to flip all 0s to 1s.
        return;
    }

    // If no flips are allowed (K=0), find the longest sequence of 1s directly.
    if (maxZeroBlockFlips === 0) {
        let longestRunOfOnes = 0;
        let currentRunOfOnes = 0;
        for (let j = 0; j < digitArray.length; j++) {
            if (digitArray[j] === 1) {
                currentRunOfOnes++;
            } else {
                longestRunOfOnes = Math.max(longestRunOfOnes, currentRunOfOnes);
                currentRunOfOnes = 0;
            }
        }
        longestRunOfOnes = Math.max(longestRunOfOnes, currentRunOfOnes); // For trailing 1s
        console.log(longestRunOfOnes);
        return;
    }

    // --- Phase 3: Run-Length Encoding (RLE) of the Digit Sequence ---
    // This helper function converts the digit array into an array of segment lengths.
    // The resulting array `segmentLengths` will represent alternating blocks of 0s and 1s.
    // Example: [1,1,0,1,1] -> [2,1,2] (two 1s, one 0, two 1s)
    // Example: [0,1,1,0]   -> [0,1,2,1] (dummy 0, one 0, two 1s, one 0)
    const calculateSegmentLengths = (inputDigits) => {
        let blockLengths = [];
        let workingDigits = [...inputDigits]; // Create a mutable copy

        // If the sequence starts with '0', prepend a dummy '0' to `blockLengths`.
        // This ensures the `blockLengths` array effectively always starts with a 0-block count,
        // which can simplify subsequent window calculations in some patterns.
        if (workingDigits[0] === 0) {
            blockLengths.push(0);
        }

        // Add a sentinel '0' to the end of the `workingDigits` array if it originally ended with '1'.
        // This guarantees that the last block of '1's is properly terminated and counted
        // by the run-length loop that follows.
        const lastActualDigit = inputDigits[inputDigits.length - 1];
        if (lastActualDigit === 1) {
            workingDigits.push(0);
        }

        let currentStreakCount = 0;
        // Iterate through the (potentially modified) digit array to find consecutive runs.
        // The loop goes one element beyond the array's end to ensure the very last run is captured.
        for (let k = 0; k < workingDigits.length + 1; k++) {
            // Check if the current digit is different from the previous one,
            // or if we've reached the end of the array.
            if (k > 0 && (k === workingDigits.length || workingDigits[k] !== workingDigits[k - 1])) {
                blockLengths.push(currentStreakCount); // Store the length of the completed run.
                currentStreakCount = 1; // Start a new streak with the current digit.
            } else {
                currentStreakCount++; // Continue the current streak.
            }
        }
        return blockLengths;
    };

    const segmentLengths = calculateSegmentLengths(digitArray);

    // --- Phase 4: Sliding Window Calculation for Maximum Length ---
    // This part identifies the maximum sum of segment lengths within specific windows.
    // The window size for elements in `segmentLengths` is `2 * maxZeroBlockFlips + 1`.
    // This window corresponds to `maxZeroBlockFlips + 1` blocks of '1's and `maxZeroBlockFlips` blocks of '0's,
    // which can all be combined by flipping the '0' blocks.
    
    let currentWindowSum = 0;
    let maximumAchievableLength = 0;
    
    // The target window size for `segmentLengths` array.
    // For example, if maxZeroBlockFlips = 1, window size is 2*1+1 = 3 segments.
    // This would cover [L_ones, L_zeros, L_ones] or [L_zeros, L_ones, L_zeros].
    const windowSegmentCount = 2 * maxZeroBlockFlips + 1;

    // Iterate through the `segmentLengths` array.
    // `blockIdx` represents the current index in `segmentLengths`.
    for (let blockIdx = 0; blockIdx < segmentLengths.length; blockIdx++) {
        currentWindowSum += segmentLengths[blockIdx]; // Add current segment length to the window sum.
        
        // Check if the current window has reached the target number of segments.
        // `(blockIdx + 1)` gives the count of segments processed so far (1-indexed).
        if ((blockIdx + 1) % windowSegmentCount === 0) {
            // If the window is full, update the maximum length found so far.
            maximumAchievableLength = Math.max(maximumAchievableLength, currentWindowSum);
            currentWindowSum = 0; // Reset the window sum for the next non-overlapping window.
        }
    }

    // After the loop, account for any remaining partial window sum.
    // This ensures that if the `segmentLengths` array doesn't perfectly divide
    // into full `windowSegmentCount` blocks, the last partial sum is still considered.
    maximumAchievableLength = Math.max(maximumAchievableLength, currentWindowSum);

    // --- Phase 5: Output the Result ---
    console.log(maximumAchievableLength);
};

// Initiate the processing by reading input from stdin.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));