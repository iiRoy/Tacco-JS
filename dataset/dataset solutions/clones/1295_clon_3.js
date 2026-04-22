'use strict';

// This module processes input data to find combinations of three distinct numbers
// that sum to a target value within a given range.
const processInputData = rawInputContent => {
    // Normalize the input: remove leading/trailing whitespace and split into lines.
    const inputLinesArray = rawInputContent.trim().split("\n");

    // Identify the position of the termination marker "0 0".
    const endMarkerPosition = inputLinesArray.indexOf("0 0");

    // Guard against malformed input where the termination marker is missing.
    if (endMarkerPosition === -1) {
        // In a production scenario, this might throw an error or handle it more gracefully.
        console.error("Input format error: Termination marker '0 0' not found.");
        return;
    }

    // Extract only the problem definition lines, excluding the termination marker.
    const problemDescriptions = inputLinesArray.slice(0, endMarkerPosition);

    // Initialize an array to store the solution counts for each problem description.
    // Each element is pre-filled with zero.
    const solutionTally = new Array(problemDescriptions.length).fill(0);

    /**
     * Recursively explores combinations of numbers to find triplets that sum to a target.
     * This function builds sequences in increasing order to ensure distinct numbers.
     *
     * @param {number[]} currentPath - The current sequence of numbers being built (e.g., [1], [1, 2]).
     * @param {number} maximumValue - The upper bound for candidate numbers (N from input).
     * @param {number} desiredTotal - The target sum (X from input).
     * @param {number} resultSlotIndex - The index in `solutionTally` to update.
     */
    const findSummingTriplets = (currentPath, maximumValue, desiredTotal, resultSlotIndex) => {
        // Determine how many numbers are currently in our sequence.
        const pathLength = currentPath.length;

        // Guard: If the sequence already contains three or more numbers,
        // this path is either complete (if length is 3) or invalid (if length > 3).
        // We are strictly looking for exactly 3 numbers.
        if (pathLength >= 3) {
            return; // Terminate this recursive branch.
        }

        // Identify the starting point for the next number to add.
        // To maintain distinctness and increasing order, the next number
        // must be greater than the last number currently in the sequence.
        const lastValueInPath = currentPath[pathLength - 1];
        const nextCandidateStartingPoint = lastValueInPath + 1;

        // Iterate through potential numbers to append to the current path.
        for (let nextPotentialValue = nextCandidateStartingPoint; nextPotentialValue <= maximumValue; nextPotentialValue++) {
            // Create a new path by adding the `nextPotentialValue`.
            const extendedPath = [...currentPath, nextPotentialValue];
            const extendedPathLength = extendedPath.length;

            // Type III Change: Calculate the sum of the `extendedPath` using a traditional loop
            // for variation, instead of array.reduce().
            let currentPathSum = 0;
            for (let k = 0; k < extendedPathLength; k++) {
                currentPathSum += extendedPath[k];
            }

            // Type III Addition: Early exit optimization.
            // If the current sum already exceeds the `desiredTotal`, there's no need
            // to continue adding larger numbers in this branch, as they would only
            // increase the sum further. Break out of the inner loop.
            if (currentPathSum > desiredTotal) {
                break;
            }

            // Check if we've formed a sequence of exactly three numbers.
            if (extendedPathLength === 3) {
                // If the three-number sequence's sum matches the `desiredTotal`,
                // increment the corresponding counter in our tally.
                if (currentPathSum === desiredTotal) {
                    solutionTally[resultSlotIndex]++;
                }
                // After forming a 3-number sequence, we don't recurse further from this specific path.
                // The loop continues to try other `nextPotentialValue`s for the *current* `currentPath`.
            } else {
                // If the sequence has fewer than three numbers, and the `currentPathSum` is
                // still less than the `desiredTotal`, we can potentially add more numbers.
                // Recursively call the function to extend this path.
                if (currentPathSum < desiredTotal) {
                    findSummingTriplets(extendedPath, maximumValue, desiredTotal, resultSlotIndex);
                }
                // If `currentPathSum` is already equal to `desiredTotal` but `extendedPathLength` is not 3,
                // we don't recurse. Adding more positive numbers would make the sum too large.
            }
        }
    };

    // Process each problem description line.
    problemDescriptions.forEach((currentDescriptionLine, descriptionIndex) => {
        // Parse the two integer values (N and X) from the current line.
        const [maxValueParam, targetSumParam] = currentDescriptionLine.split(" ").map(strVal => parseInt(strVal, 10));

        // Type III Addition: Input validation for problem parameters.
        // A valid triplet requires N to be at least 3 (for 1, 2, 3) and X to be at least 6 (1+2+3).
        // If these conditions are not met, no solutions are possible for this problem set.
        if (maxValueParam < 3 || targetSumParam < 6) {
            // We can skip this problem as its solution count will remain 0.
            // Optionally, a warning could be logged here:
            // console.warn(`Skipping invalid problem set at index ${descriptionIndex}: N=${maxValueParam}, X=${targetSumParam}`);
            return; // Proceed to the next problem description.
        }

        // Initiate the recursive search for each possible first number 'a'.
        // 'a' can range from 1 up to `maxValueParam`.
        for (let firstElement = 1; firstElement <= maxValueParam; firstElement++) {
            // Start the recursion with a sequence containing only `firstElement`.
            // The `resultSlotIndex` ensures that the count is updated for the correct problem.
            findSummingTriplets([firstElement], maxValueParam, targetSumParam, descriptionIndex);
        }
    });

    // Output the final calculated counts, with each count on a new line.
    console.log(solutionTally.join("\n"));
};

// Retrieve the file system module.
const fileSystemModule = require('fs');
// Define the standard input path.
const standardInputPath = '/dev/stdin';

// Read the raw data from standard input using UTF-8 encoding.
const rawInputData = fileSystemModule.readFileSync(standardInputPath, 'utf8');

// Execute the main data processing function with the obtained input.
processInputData(rawInputData);