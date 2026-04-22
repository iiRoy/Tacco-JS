"use strict";

// This function orchestrates the entire solution process from input parsing to output generation.
const processInputAndSolve = rawInputText => {
    // Extract problem parameters from the initial line of the provided raw data.
    const sequenceLength = parseInt(rawInputText.split("\n")[0].split(" ")[0], 10);
    const numberOfQueries = parseInt(rawInputText.split("\n")[0].split(" ")[1], 10);

    // Parse the character sequence for analysis, breaking it into individual characters.
    const inputCharacters = rawInputText.split("\n")[1].split("");

    // Obtain the query ranges, skipping initial lines and taking 'sequenceLength' entries.
    // The slice range (2, sequenceLength + 1) is maintained for structural equivalence.
    const queryIntervals = rawInputText.split("\n").slice(2, sequenceLength + 1);

    // Initialize a dynamic programming array to store cumulative counts of "AC" pairs.
    // Its size corresponds to the length of the character sequence.
    let cumulativeACCounts = new Array(sequenceLength).fill(0);

    // A temporary variable to maintain the running total of "AC" occurrences.
    let runningTotal = 0;

    // Iterate through the character sequence to populate the cumulative counts array.
    // The loop processes each character, checking for "AC" patterns.
    for (let currentIdx in cumulativeACCounts) {
        // Check if the current character is 'A' and the subsequent character is 'C'.
        // Ensure the index for the second character is within bounds.
        if (inputCharacters[currentIdx] === "A" && inputCharacters[parseInt(currentIdx, 10) + 1] === "C") {
            runningTotal++; // Increment the count if an "AC" pair is found.
        }
        // Store the current running total in the dp array at the next position.
        // This allows for prefix sum calculations later.
        cumulativeACCounts[parseInt(currentIdx, 10) + 1] = runningTotal;
    }

    // Process each of the specified queries.
    for (let queryIndex = 0; queryIndex < numberOfQueries; ++queryIndex) {
        // Parse the left and right boundaries for the current query.
        const leftBoundary = parseInt(queryIntervals[queryIndex].split(" ")[0], 10);
        const rightBoundary = parseInt(queryIntervals[queryIndex].split(" ")[1], 10);

        // Calculate and display the number of "AC" pairs within the specified range.
        // This is achieved by subtracting cumulative counts: count(up to R-1) - count(up to L-1).
        console.log(cumulativeACCounts[rightBoundary - 1] - cumulativeACCounts[leftBoundary - 1]);
    }
};

// Execute the main processing function by reading input from standard input.
processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));