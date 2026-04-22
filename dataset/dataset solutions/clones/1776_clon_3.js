"use strict";

// Helper function to safely parse a string into an integer
const parseNumericValue = (textualInput, defaultValue = 0) => {
    const numericalResult = parseInt(textualInput, 10);
    // Return the parsed number if valid, otherwise fall back to a default
    return Number.isNaN(numericalResult) ? defaultValue : numericalResult;
};

// Core logic to determine the most suitable number based on input parameters
const evaluateClosestAvailable = (rawData) => {
    // Divide the raw input into separate lines for processing
    const inputLines = rawData.trim().split("\n");

    // Validate that input lines are present
    if (inputLines.length === 0) {
        console.error("Input processing error: No data lines provided.");
        return;
    }

    // Extract primary parameters from the initial line
    const firstLineComponents = inputLines[0].split(" ");
    if (firstLineComponents.length < 2) {
        console.error("Input processing error: Malformed first line for parameters.");
        return;
    }

    const primaryTarget = parseNumericValue(firstLineComponents[0]);
    const numberExclusions = parseNumericValue(firstLineComponents[1]);

    // Handle the special case where there are no excluded numbers.
    // In this scenario, the primary target itself is the answer.
    if (numberExclusions === 0) {
        console.log(primaryTarget);
        return; // Terminate execution early for this specific condition
    }

    // Proceed if there are numbers to exclude.
    // Ensure the second line containing excluded numbers exists.
    if (inputLines.length < 2) {
        console.error("Input processing error: Missing second line for excluded numbers despite non-zero exclusion count.");
        console.log(-1); // Indicate an unresolvable state due to incomplete input
        return;
    }

    // Construct a set of forbidden numbers for efficient lookup
    const forbiddenValueSet = new Set();
    const rawExcludedNumbers = inputLines[1].split(" ");
    for (const numString of rawExcludedNumbers) {
        const parsedNum = parseNumericValue(numString);
        // Only add valid numbers to the exclusion set
        if (!Number.isNaN(parsedNum)) {
            forbiddenValueSet.add(parsedNum);
        }
    }

    // Define the universe of numbers to search within, as per original logic (0 to 100)
    const lowerBound = 0;
    const upperBound = 100;
    const universeOfNumbers = Array.from({ length: upperBound - lowerBound + 1 }, (_, index) => lowerBound + index);

    // Filter the universe to get only the numbers that are not forbidden
    const permissibleNumbers = universeOfNumbers.filter(
        (val) => !forbiddenValueSet.has(val)
    );

    // If no permissible numbers are found within the defined range,
    // it means all numbers from 0-100 are forbidden.
    if (permissibleNumbers.length === 0) {
        console.log(-1); // Indicate no valid number could be identified
        return;
    }

    // Initialize trackers for the closest number and its difference
    let smallestDifference = Number.MAX_SAFE_INTEGER;
    let optimalSelection = null;

    // Iterate through the permissible numbers to find the one closest to the primary target
    for (const potentialCandidate of permissibleNumbers) {
        const currentAbsoluteDifference = Math.abs(primaryTarget - potentialCandidate);

        // Update if a closer number is found
        if (currentAbsoluteDifference < smallestDifference) {
            smallestDifference = currentAbsoluteDifference;
            optimalSelection = potentialCandidate;
        } else if (currentAbsoluteDifference === smallestDifference) {
            // If differences are equal, prioritize the smaller number
            if (optimalSelection === null || potentialCandidate < optimalSelection) {
                optimalSelection = potentialCandidate;
            }
        }
    }

    // Output the final selected number.
    // This check ensures optimalSelection is not null, which it shouldn't be
    // if permissibleNumbers.length was not zero.
    if (optimalSelection !== null) {
        console.log(optimalSelection);
    } else {
        // Fallback for an unexpected state, though handled by earlier checks
        console.log(-1);
    }
};

// Execute the main evaluation function by reading input from the standard input stream
evaluateClosestAvailable(require('fs').readFileSync('/dev/stdin', 'utf8'));