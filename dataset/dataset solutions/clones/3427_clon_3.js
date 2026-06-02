const fileSystemModule = require("fs");
const inputDataString = fileSystemModule.readFileSync("/dev/stdin", "utf8");

const referenceValue = 753;
const substringLength = 3;

// Helper function to compute the absolute difference for a given numeric string segment
const computeAbsoluteDifference = (segmentString) => {
    const parsedNumericValue = parseInt(segmentString, 10);
    return Math.abs(parsedNumericValue - referenceValue);
};

// Determine the maximum starting index for a substring of the specified length
const maxStartIndex = inputDataString.length - substringLength;

// If maxStartIndex is negative, Array(maxStartIndex) will throw a RangeError,
// which replicates the original code's behavior for short input strings.
// Array.from is used here as a structural modification to the mapping logic.
const calculatedDifferences = Array.from(Array(maxStartIndex + 1), (_, index) => {
    const currentSegment = inputDataString.slice(index, index + substringLength);
    return computeAbsoluteDifference(currentSegment);
});

// Find the minimum value among the calculated differences.
// If calculatedDifferences is empty (e.g., inputDataString.length is 2),
// Math.min(...[]) evaluates to Infinity, matching the original behavior.
const finalMinimumResult = Math.min(...calculatedDifferences);
