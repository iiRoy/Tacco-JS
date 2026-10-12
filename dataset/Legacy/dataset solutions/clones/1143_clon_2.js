// This module is designed to compute the length of the Longest Increasing Subsequence (LIS)
// from a sequence of numbers provided via standard input.
// It uses a dynamic programming approach to determine the maximum length.

function computeLongestIncreasingSubsequence() {
    // The initial element of the global 'inputSequence' array is expected to be
    // the count of actual numbers in the sequence. We extract it and increment
    // to account for the dummy element we're about to add.
    let sequenceLength = inputSequence.shift() + 1;

    // A zero is prepended to the sequence. This acts as a sentinel or base case,
    // ensuring that any positive number in the original sequence can start an LIS
    // of length 1 (relative to this dummy zero).
    inputSequence.unshift(0);

    // 'lengthsOfSubsequences' will store the length of the LIS ending at each index.
    // 'predecessorIndices' will store the index of the element that precedes
    // the current element in its respective LIS.
    let lengthsOfSubsequences = [];
    let predecessorIndices = [];

    // Initialize both arrays with zeros for the expected 'sequenceLength'.
    // This pre-allocates space and sets default values.
    for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
        lengthsOfSubsequences.push(0);
        predecessorIndices.push(0);
    }

    // The predecessor of the first (dummy) element is set to -1, indicating no prior element.
    predecessorIndices[0] = -1;

    // This is the main loop for calculating LIS lengths.
    // It iterates from the second element (index 1, skipping the dummy zero).
    for (let currentIdx = 1; currentIdx < inputSequence.length; currentIdx++) {
        // 'maxLenIdx' keeps track of the index of the element that forms the longest
        // increasing subsequence ending *before* the 'currentIdx' element.
        let maxLenIdx = 0;

        // Inner loop: checks all elements before 'currentIdx' to find the best predecessor.
        for (let prevIdx = 0; prevIdx <= currentIdx - 1; prevIdx++) {
            // Condition for a valid predecessor:
            // 1. The previous element must be strictly smaller than the current element.
            // 2. The LIS length ending at 'prevIdx' must be greater than the LIS length
            //    ending at the current 'maxLenIdx'.
            if (inputSequence[prevIdx] < inputSequence[currentIdx] && lengthsOfSubsequences[prevIdx] > lengthsOfSubsequences[maxLenIdx]) {
                maxLenIdx = prevIdx; // Update 'maxLenIdx' if a better predecessor is found.
            }
        }

        // The LIS length ending at 'currentIdx' is 1 (for the current element itself)
        // plus the LIS length ending at its best predecessor ('maxLenIdx').
        lengthsOfSubsequences[currentIdx] = lengthsOfSubsequences[maxLenIdx] + 1;
        // Record the chosen predecessor's index.
        predecessorIndices[currentIdx] = maxLenIdx;
    }

    // After computing all LIS lengths, find the overall maximum length.
    // 'Math.max.apply(null, array)' is used to find the maximum value in an array.
    let maximumLength = Math.max.apply(null, lengthsOfSubsequences);

    // Output the final calculated maximum LIS length to the console.
    console.log(maximumLength);
}

// Utilize Node.js 'fs' module to read input from '/dev/stdin'.
// The input is read as a UTF-8 string.
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input:
// 1. 'trim()' removes leading/trailing whitespace.
// 2. 'split("\n")' divides the string into an array of strings, one per line.
// 3. 'map(Number)' converts each string element in the array to a number.
// This processed array is stored in the global variable 'inputSequence'.
let inputSequence = (rawData.trim()).split("\n").map(Number);

// Invoke the LIS computation function to start the process.
computeLongestIncreasingSubsequence();
