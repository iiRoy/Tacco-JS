// This module processes raw input data to compute a specific numerical property.
// It aims to find the minimum absolute difference between the sums of two partitions
// of a given array of numbers.

/**
 * Executes the primary data processing routine.
 * @param {string} rawInputString - The entire input provided as a single string.
 */
const processInputData = (rawInputString) => {
    // Break down the raw input string into individual lines for structured parsing.
    const inputLines = rawInputString.trim().split('\n');

    // Extract the first line, which contains metadata like the count of elements.
    const firstLineTokens = inputLines[0].split(' ');
    // Convert the first token from the first line into an integer, representing
    // the total number of numeric values expected in the subsequent line.
    const numericElementCount = parseInt(firstLineTokens[0], 10);

    // Guard clause: If there are fewer than two elements, a meaningful split
    // into two non-empty partitions is not possible. The difference is effectively zero.
    if (numericElementCount < 2) {
        console.log(0);
        return; // Terminate execution early.
    }

    // Parse the second line, which holds the actual numerical data, and convert
    // each string token into a floating-point number.
    const numericalValuesCollection = inputLines[1].split(' ').map(Number);

    // A helper variable to store the cumulative sum of all numbers in the collection.
    let totalCollectionSum = 0;
    // Iterate through the array to compute the grand total sum.
    for (const val of numericalValuesCollection) {
        totalCollectionSum += val;
    }

    // Initialize variables for tracking partition sums and the minimum difference.
    // 'currentLeftPartitionSum' accumulates the sum for the left segment.
    let currentLeftPartitionSum = 0;
    // 'minimumAbsoluteDifference' is initialized to the largest possible safe number
    // to ensure any valid difference found will be smaller.
    let minimumAbsoluteDifference = Number.MAX_SAFE_INTEGER;

    // Loop through all possible split points. A split point 'k' means the left partition
    // includes elements from index 0 to 'k', and the right partition takes the rest.
    // The loop runs 'numericElementCount - 1' times, covering all splits where both
    // partitions are non-empty.
    for (let currentSplitIndex = 0; currentSplitIndex < numericElementCount - 1; currentSplitIndex++) {
        // Update the left partition sum by adding the next element.
        currentLeftPartitionSum += numericalValuesCollection[currentSplitIndex];

        // Calculate the sum of the right partition by subtracting the left sum from the total.
        const currentRightPartitionSum = totalCollectionSum - currentLeftPartitionSum;

        // Determine the absolute difference between the two partition sums.
        const calculatedDifference = Math.abs(currentLeftPartitionSum - currentRightPartitionSum);

        // If the current difference is smaller than the smallest one found so far, update it.
        if (calculatedDifference < minimumAbsoluteDifference) {
            minimumAbsoluteDifference = calculatedDifference;
        }
        // No need to reset sums here; 'currentLeftPartitionSum' is incrementally built,
        // and 'currentRightPartitionSum' is derived from it.
    }

    // Output the final minimum absolute difference found.
    console.log(minimumAbsoluteDifference);
};

// Standard boilerplate for reading input from stdin in a Node.js environment.
// Reads the entire content of standard input as UTF-8 and passes it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));