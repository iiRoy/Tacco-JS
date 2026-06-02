"use strict";

// Helper function to determine which of two candidates is closer to a target value.
// If distances are equal, the smaller candidate is preferred.
const getCloserCandidate = (targetVal, candidateOne, candidateTwo) => {
    const distanceOne = Math.abs(targetVal - candidateOne);
    const distanceTwo = Math.abs(targetVal - candidateTwo);

    if (distanceOne === distanceTwo) {
        return Math.min(candidateOne, candidateTwo);
    } else {
        return (distanceOne < distanceTwo) ? candidateOne : candidateTwo;
    }
};

const processInput = (rawData) => {
    const parsedLines = rawData.trim().split("\n");

    // Parse the first line for targetValue and numForbidden
    const firstLineParts = parsedLines[0].split(" ");
    const targetValue = Number(firstLineParts[0]);
    const numForbidden = Number(firstLineParts[1]);

    // Handle the special case where no forbidden numbers are specified
    if (numForbidden === 0) {
        console.log(targetValue);
        return;
    }

    // Parse the list of forbidden numbers from the second line
    const forbiddenNumbersRaw = parsedLines[1].split(" ");
    const forbiddenNumbers = forbiddenNumbersRaw.map(currentNumStr => Number(currentNumStr));

    // Convert the array of forbidden numbers into a Set for efficient lookup
    const forbiddenSet = new Set(forbiddenNumbers);

    // Generate a list of all possible numbers from 0 to 100
    const allPossibleNumbers = Array.from({ length: 101 }, (_, index) => index);

    // Filter out numbers that are present in the forbidden set
    const availableNumbers = allPossibleNumbers.filter(currentNum => !forbiddenSet.has(currentNum));

    // Find the number in availableNumbers that is closest to targetValue.
    // The initial value 101 is used as a sentinel. If availableNumbers is empty,
    // 101 will be the result, which then triggers the -1 output in the final check.
    const finalClosestCandidate = availableNumbers.reduce((closestSoFar, currentConsideration) => {
        return getCloserCandidate(targetValue, closestSoFar, currentConsideration);
    }, 101);

    // Calculate distances for the final comparison
    const distanceToNegativeOne = Math.abs(targetValue + 1); // Equivalent to Math.abs(targetValue - (-1))
    const distanceToFinalCandidate = Math.abs(targetValue - finalClosestCandidate);

    // Output the result based on the problem's specific condition
    if (distanceToFinalCandidate >= distanceToNegativeOne) {
        console.log(-1);
    } else {
        console.log(finalClosestCandidate);
    }
};

// Execute the main processing function with input from stdin
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
