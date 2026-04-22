"use strict";

const processInputData = dataStream => {
    // Trim extraneous whitespace and split the entire input into separate lines.
    dataStream = dataStream.trim().split("\n");
    // Extract the total length of the binary sequence and the maximum allowed flips from the first input line.
    const totalSequenceLength = parseInt(dataStream[0].split(" ")[0]);
    const allowedZeroFlips = parseInt(dataStream[0].split(" ")[1]);

    // Convert the second input line, representing the binary sequence, into an array of integer digits.
    const binaryDigitArray = dataStream[1].split("").map(charValue => parseInt(charValue));

    // Initialize an array to store the lengths of consecutive runs of identical digits (e.g., '111' -> 3, '00' -> 2).
    let segmentCounts = [];

    // If the binary sequence contains no zeros at all, the entire length is the answer.
    if (binaryDigitArray.indexOf(0) === -1) {
        console.log(totalSequenceLength);
        return;
    }

    // If the binary sequence contains no ones at all, the entire length is the answer.
    if (binaryDigitArray.indexOf(1) === -1) {
        console.log(totalSequenceLength);
        return;
    }

    // If the sequence doesn't start with a '1', add a virtual zero-length segment at the beginning for consistent processing.
    if (binaryDigitArray[0] !== 1) {
        segmentCounts.push(0);
    }

    // Append a '0' to the end of the sequence if the last element is not '1'.
    // Note: `binaryDigitArray[binaryDigitArray.length]` is always `undefined`, so `undefined !== 1` is always true.
    // This statement effectively always appends a '0' to the array.
    if (binaryDigitArray[binaryDigitArray.length] !== 1) {
        binaryDigitArray.push(0);
    }

    // Loop through the (potentially modified) digit array to calculate lengths of consecutive segments.
    let currentConsecutiveCount = 0;
    for (let loopIndex = 1; loopIndex <= binaryDigitArray.length; loopIndex++) {
        if (binaryDigitArray[loopIndex] === binaryDigitArray[loopIndex - 1]) {
            currentConsecutiveCount++;
        } else {
            currentConsecutiveCount++;
            segmentCounts.push(currentConsecutiveCount);
            currentConsecutiveCount = 0;
        }
    }

    // Now, calculate the maximum possible length of the sequence after applying flips.
    let windowSum = 0;
    let maximalLength = 0;

    // Iterate over the computed segment lengths to find the optimal window.
    for (let loopIndex in segmentCounts) {
        windowSum += segmentCounts[loopIndex];

        // This condition checks for a specific window size based on allowed flips.
        // It's designed to identify segments that can be combined by flipping zeros.
        if ((parseInt(loopIndex) + 1) % (allowedZeroFlips + (allowedZeroFlips + 1)) === 0) {
            maximalLength = Math.max(maximalLength, windowSum);
            windowSum = 0;
        }
    }

    // After the loop, ensure the last calculated window sum is also considered for the maximum.
    maximalLength = Math.max(maximalLength, windowSum);

    // Print the final result, which is the maximal achievable length.
    console.log(maximalLength);
};

// Read the entire input from standard input (e.g., a file or piped data) and then process it.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));