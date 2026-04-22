// This module processes a specific data structure from standard input
// to determine a maximal sum based on a dynamic split point.
function SolverFunction(rawInputText) {
    // Helper function to parse a line of space-separated numbers
    const parseNumericLine = (lineContent) => {
        return lineContent.split(' ').map(Number);
    };

    const inputLines = rawInputText.trim().split('\n');

    // Basic validation: ensure we have at least 3 lines of input
    if (inputLines.length < 3) {
        // In a competitive programming context, specific error handling might not be strictly
        // required by the platform, but for a robust clone, it's a good addition.
        console.error("Insufficient input data provided; expected at least three lines.");
        return; 
    }

    const problemSize = Number(inputLines[0]); // Corresponds to 'N' in the original code

    // Further validation: check if problemSize is a positive integer
    if (isNaN(problemSize) || problemSize <= 0) {
        console.error("Invalid problem size N. Must be a positive integer.");
        return;
    }

    const firstDataRowStrings = inputLines[1];
    const secondDataRowStrings = inputLines[2];

    // Parse the two rows of numbers into numeric arrays
    const firstDataSequence = parseNumericLine(firstDataRowStrings);
    const secondDataSequence = parseNumericLine(secondDataRowStrings);

    // Validate that the parsed arrays have the expected length
    if (firstDataSequence.length !== problemSize || secondDataSequence.length !== problemSize) {
        console.error("Data row length mismatch with declared problem size N. Check input format.");
        return;
    }

    // Initialize data structures for prefix and suffix sums.
    // This is a significant Type III structural change for efficiency,
    // replacing repeated sum calculations with O(1) lookups after O(N) precomputation.
    let prefixSumsRowA = new Array(problemSize).fill(0);
    let suffixSumsRowB = new Array(problemSize).fill(0);

    // Calculate prefix sums for the first data sequence (Row A)
    // prefixSumsRowA[i] stores the sum of elements from index 0 to i (inclusive) in firstDataSequence.
    prefixSumsRowA[0] = firstDataSequence[0];
    for (let currentIdx = 1; currentIdx < problemSize; currentIdx++) {
        prefixSumsRowA[currentIdx] = prefixSumsRowA[currentIdx - 1] + firstDataSequence[currentIdx];
    }

    // Calculate suffix sums for the second data sequence (Row B)
    // suffixSumsRowB[i] stores the sum of elements from index i to N-1 (inclusive) in secondDataSequence.
    suffixSumsRowB[problemSize - 1] = secondDataSequence[problemSize - 1];
    for (let currentIdx = problemSize - 2; currentIdx >= 0; currentIdx--) {
        suffixSumsRowB[currentIdx] = suffixSumsRowB[currentIdx + 1] + secondDataSequence[currentIdx];
    }

    // Determine the maximum possible sum by iterating through all possible split points.
    // The 'split point' here refers to the index 'k' where the sum is
    // (A[0] from 0 to k) + (A[1] from k to N-1).
    let overallMaximumSum = 0;

    for (let currentSplitPointIdx = 0; currentSplitPointIdx < problemSize; currentSplitPointIdx++) {
        let temporarySumForThisSplit = 0;

        // Add the prefix sum from the first row up to the current split point index
        temporarySumForThisSplit += prefixSumsRowA[currentSplitPointIdx];

        // Add the suffix sum from the second row starting from the current split point index
        temporarySumForThisSplit += suffixSumsRowB[currentSplitPointIdx];
        
        // Update the maximum sum found if the current combination yields a larger value
        if (temporarySumForThisSplit > overallMaximumSum) {
            overallMaximumSum = temporarySumForThisSplit;
        }
    }

    // Output the final computed maximum value to standard output.
    console.log(overallMaximumSum);
}

// Do not modify the following lines; they handle standard input/output for execution in a typical environment.
SolverFunction(require("fs").readFileSync("/dev/stdin", "utf8"));