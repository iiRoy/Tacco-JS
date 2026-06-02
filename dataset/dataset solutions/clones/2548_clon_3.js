"use strict";

const inputStringContent = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const inputLineSegments = inputStringContent.split('\n');

const firstLineData = inputLineSegments[0].split(' ');
const permutationSourceElements = inputLineSegments[1].split(' ');

const totalElementCount = parseInt(firstLineData[0]); // N, not directly used in logic but parsed
const subsegmentLength = parseInt(firstLineData[1]); // K

const distinctPermutationStrings = new Set();

// Iterate through all possible starting positions for the subsegment
// The loop condition ensures that startIndex + subsegmentLength does not exceed the array length.
for (let startIndex = 0; startIndex <= permutationSourceElements.length - subsegmentLength; startIndex++) {
    // Extract the part of the array before the subsegment
    const leadingElements = permutationSourceElements.slice(0, startIndex);

    // Extract the subsegment that needs to be sorted
    const segmentToSort = permutationSourceElements.slice(startIndex, startIndex + subsegmentLength);

    // Create a sorted version of the subsegment
    // The sort function (a, b) => a > b ? 1 : a < b ? -1 : 0 performs lexicographical string comparison.
    const sortedSegment = [...segmentToSort].sort((a, b) => a > b ? 1 : a < b ? -1 : 0);

    // Extract the part of the array after the subsegment
    const trailingElements = permutationSourceElements.slice(startIndex + subsegmentLength);

    // Combine the parts to form the current permutation
    const currentCombinedPermutation = [...leadingElements, ...sortedSegment, ...trailingElements];
    const currentPermutationKey = currentCombinedPermutation.join('');

    // Add the string representation of the permutation to the Set to track uniqueness
    distinctPermutationStrings.add(currentPermutationKey);
}

// Output the total count of unique permutations found
console.log(distinctPermutationStrings.size);
