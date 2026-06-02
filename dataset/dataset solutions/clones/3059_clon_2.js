"use strict";

/**
 * Processes raw input data to solve a specific problem.
 * This function simulates the main logic of a competitive programming solution.
 *
 * @param {string} rawData - The complete input string received from standard input.
 */
function ProcessInput(rawData) {
    // Split the entire input string into individual lines for easier parsing.
    let inputLines = rawData.split("\n");

    // Extract the first line which contains two space-separated integers (N and K).
    // Convert these string values to numbers using the unary plus operator.
    let numConfig = inputLines.shift().split(/\s/).map((valStr) => +valStr);
    let totalElements = numConfig[0]; // Represents 'N' from the problem statement.
    let maxOperations = numConfig[1]; // Represents 'K' from the problem statement.

    // Extract the second line, which is a string of '0's and '1's.
    // Split it into individual characters and convert each character to a number.
    let dataSequence = inputLines.shift().split(/\s/)[0].split("").map((charVal) => +charVal);

    // Initialize variables for segment identification (run-length encoding).
    let currentIndex = 0; // Tracks the current position in the dataSequence.
    let segmentList = []; // Stores objects representing consecutive segments of identical values.

    // Determine the type of the first segment (0 or 1).
    let currentType = dataSequence[0];

    // Iterate through the data sequence to find and record segments.
    while (currentIndex < totalElements) {
        let segmentEnd = currentIndex; // Marks the end of the current segment being examined.

        // Find the point where the current segment of 'currentType' ends.
        for (; segmentEnd < totalElements && dataSequence[segmentEnd] === currentType; segmentEnd++) {
            // This loop increments segmentEnd as long as the value matches currentType.
        }

        // IMPORTANT: A segment is only added to segmentList if it's NOT the very last segment
        // that extends exactly to the end of the array. This preserves a specific behavior
        // from the original code, which might be a subtle bug or an intentional design choice.
        if (segmentEnd < totalElements) {
            let segmentLength = segmentEnd - currentIndex; // Calculate the length of the identified segment.
            // Add the segment's details to our list.
            segmentList.push({ typeVal: currentType, startIdx: currentIndex, lengthVal: segmentLength });
            // Toggle the type for the next segment (0 becomes 1, 1 becomes 0).
            currentType = (currentType + 1) % 2;
        }
        // Move the currentIndex to the end of the segment just processed (or skipped).
        currentIndex = segmentEnd;
    }

    // Special handling: If the first segment in our list is a '0' segment,
    // prepend a dummy '1' segment of zero length. This is often done to simplify
    // sliding window calculations by ensuring a '1' segment always starts the sequence.
    // This operation assumes segmentList is not empty, which would lead to an error otherwise.
    if (segmentList[0].typeVal === 0) {
        segmentList.unshift({ typeVal: 1, startIdx: 0, lengthVal: 0 });
    }

    // Calculate the total count of '0' segments.
    // This variable ('zs' in original) is computed but not used later in the provided code.
    let zeroSegmentsCount = segmentList.reduce((accumulator, segmentItem) => {
        return accumulator + (segmentItem.typeVal === 0 ? 1 : 0);
    }, 0);

    // Define a local helper function.
    // This function calculates the sum of lengths for a given segment and its immediate neighbors.
    // In the original code, this function ('f') is defined but never invoked.
    // It is preserved here to maintain Type II cloning rules (no deletion of executable logic).
    const calculateSegmentSum = (segmentIndex) => {
        let currentSum = segmentList[segmentIndex].lengthVal;
        if (segmentIndex > 0) {
            currentSum += segmentList[segmentIndex - 1].lengthVal;
        }
        if (segmentIndex < segmentList.length - 1) {
            currentSum += segmentList[segmentIndex + 1].lengthVal;
        }
        return currentSum;
    };

    // Calculate the final result by summing the lengths of an initial set of segments.
    // The loop iterates up to `maxOperations * 2`, effectively summing `maxOperations * 2 + 1` segments.
    // This is typically part of a sliding window approach to find the maximum length
    // of consecutive '1's achievable with 'K' flips.
    let finalResult = 0; // Stores the accumulated length.
    for (let i = 0; i <= maxOperations * 2; i++) {
        // The original code accesses `segmentList[i]` directly without bounds checking.
        // This implies that `segmentList` is expected to have enough elements for this loop,
        // or that an out-of-bounds error is an expected behavior for certain inputs.
        finalResult += segmentList[i].lengthVal;
    }

    // Output the final computed result to the console.
    console.log(finalResult);
}

// Standard boilerplate for competitive programming in Node.js.
// Checks if the script is running in a Node.js environment (not a browser).
if (typeof window === "undefined") {
    // If in Node.js, read the entire content of stdin synchronously.
    // The 'utf8' encoding is specified for text input.
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
