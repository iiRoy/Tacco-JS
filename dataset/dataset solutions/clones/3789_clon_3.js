"use strict";

// Retrieve the raw textual data from the standard input stream.
const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

// Process the raw input to separate it into distinct lines.
const dataLines = sourceData.split("\n");

// The first line specifies the upper bound for partitioning the main string.
// This value dictates how many possible segmentations will be considered.
const segmentationLimit = parseInt(dataLines[0], 10);

// The second line contains the primary string sequence that will be analyzed.
const mainStringData = dataLines[1];

// A dynamic collection to hold all generated segment pairs.
// Each pair will consist of two Set objects for efficient character management.
const stringPartitionSets = [];

// Iterate through all valid partition points within the main string.
// The loop starts from 1 to ensure that both left and right segments are non-empty.
for (let partitionPoint = 1; partitionPoint < segmentationLimit; partitionPoint++) {
    // Extract the substring for the left segment.
    const leftSegmentContent = mainStringData.slice(0, partitionPoint);
    // Extract the substring for the right segment.
    const rightSegmentContent = mainStringData.slice(partitionPoint);

    // Convert each segment into a Set of characters.
    // This automatically handles uniqueness and provides fast lookup (`has` method).
    const leftCharacters = new Set(leftSegmentContent);
    const rightCharacters = new Set(rightSegmentContent);

    // Store the character sets for this specific partition.
    stringPartitionSets.push({
        left: leftCharacters,
        right: rightCharacters
    });
}

// An array to accumulate the counts of common unique characters for each partition.
const commonCharacterTally = [];

// Process each generated partition pair.
for (const segmentEntry of stringPartitionSets) {
    let currentOverlapCount = 0; // Counter for common unique characters in the current pair.

    // Iterate over each unique character found in the left segment.
    for (const charFromLeft of segmentEntry.left) {
        // Check if this character also exists in the right segment.
        if (segmentEntry.right.has(charFromLeft)) {
            currentOverlapCount++; // Increment the count if it's a common unique character.
        }
    }
    // Record the tally for the current partition.
    commonCharacterTally.push(currentOverlapCount);
}

// Determine the maximum count of common unique characters found across all partitions.
let overallMaximumOverlap = 0;

// Ensure there are counts to process before attempting to find the maximum.
if (commonCharacterTally.length > 0) {
    overallMaximumOverlap = Math.max(...commonCharacterTally);
}
// If `commonCharacterTally` is empty (e.g., `segmentationLimit` was 0 or 1),
// `overallMaximumOverlap` remains 0, which is the correct result for no possible splits.

// Display the final computed maximum value to standard output.
console.log(overallMaximumOverlap);