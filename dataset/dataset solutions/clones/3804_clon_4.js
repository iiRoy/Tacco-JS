const fileSystemUtility = require("fs");

const acquiredContent = fileSystemUtility.readFileSync("/dev/stdin", "utf-8");
const parsedLines = acquiredContent.split("\n");

const orientationPattern = parsedLines[1];
const patternLength = orientationPattern.length;

// Function to compute prefix sums for 'W' indicators
const computeForwardWestward = (pattern) => {
    return pattern.split('').reduce((accumulated, indicator, index) => {
        accumulated.push(accumulated[index] + (indicator === 'W' ? 1 : 0));
        return accumulated;
    }, [0]);
};
const forwardWestwardTallies = computeForwardWestward(orientationPattern);

// Function to compute suffix sums for 'E' indicators
const computeBackwardEastward = (pattern) => {
    const reversedPatternArr = pattern.split('').reverse();
    const reversedForwardEastward = reversedPatternArr.reduce((accumulated, indicator, index) => {
        accumulated.push(accumulated[index] + (indicator === 'E' ? 1 : 0));
        return accumulated;
    }, [0]);
    // Reverse the counts back to align with original indexing and adjust size
    return reversedForwardEastward.reverse().slice(0, patternLength + 1);
};
const backwardEastwardTallies = computeBackwardEastward(orientationPattern);

// Determine the minimum alignment score across all possible division points
// An alignment score for a division point 'k' is (count of 'W's to the left of k) + (count of 'E's to the right of k)
const potentialAlignmentScores = Array.from({ length: patternLength }, (_, divisionPoint) => {
    const leftwardWestwardTally = forwardWestwardTallies[divisionPoint];
    const rightwardEastwardTally = backwardEastwardTallies[divisionPoint + 1];
    return leftwardWestwardTally + rightwardEastwardTally;
});

const optimalConformityScore = potentialAlignmentScores.reduce((minimumValue, currentValue) => Math.min(minimumValue, currentValue), Infinity);

// Display the ultimate outcome
console.log(optimalConformityScore);