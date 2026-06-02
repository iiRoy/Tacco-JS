"use strict";

// Helper function to safely parse a string into an integer with radix 10.
const parseInteger = (inputString) => {
    return parseInt(inputString, 10);
};

// Main function to execute the solution logic.
const executeSolution = (inputContent) => {
    // Split the entire input content into individual lines.
    const allInputLines = inputContent.split("\n");

    // Parse the first line to get the sequence length (N) and number of queries (Q).
    const firstLineTokens = allInputLines[0].split(" ");
    const sequenceLength = parseInteger(firstLineTokens[0]);
    const numQueries = parseInteger(firstLineTokens[1]);

    // The second line contains the character sequence S.
    const charSequence = allInputLines[1].split("");

    // Extract the query ranges (l, r) from subsequent lines.
    // The original code uses `N + 1` as the upper bound for slicing,
    // which means it takes lines from index 2 up to (but not including) N+1.
    // This implies lines 2 through N are considered for queries.
    // This behavior is preserved.
    const queryRanges = allInputLines.slice(2, sequenceLength + 1);

    // Initialize an array to store prefix sums of 'AC' pairs.
    // `acPrefixSums[k]` will store the count of 'AC' pairs in `charSequence[0...k-2]`.
    // The array is initialized to `sequenceLength + 1` size to accommodate indices up to `sequenceLength`.
    const acPrefixSums = new Array(sequenceLength + 1).fill(0);
    let currentAcPairCount = 0; // Accumulator for 'AC' pairs found so far.

    // Iterate through the character sequence to calculate prefix sums.
    // The loop runs from `k = 0` to `sequenceLength - 1`.
    for (let k = 0; k < sequenceLength; k++) {
        const nextCharIndex = k + 1;

        // Check if the current character and the next character form an 'AC' pair.
        // Ensure `nextCharIndex` is within the bounds of `charSequence`.
        const isCurrentPairAC = (nextCharIndex < sequenceLength) &&
                                (charSequence[k] === 'A') &&
                                (charSequence[nextCharIndex] === 'C');

        if (isCurrentPairAC) {
            currentAcPairCount++;
        }

        // Store the cumulative count in `acPrefixSums[k+1]`.
        // This means `acPrefixSums[1]` stores count after checking `S[0]S[1]`,
        // `acPrefixSums[2]` after `S[1]S[2]`, and so on, up to `acPrefixSums[sequenceLength]`.
        acPrefixSums[nextCharIndex] = currentAcPairCount;
    }

    // Process each query.
    // The loop runs `numQueries` times.
    for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        // Parse the start and end positions for the current query.
        // These positions are 1-indexed as per typical problem statements.
        const [startPos, endPos] = queryRanges[queryIdx].split(" ").map(parseInteger);

        // Calculate the number of 'AC' pairs within the specified range [startPos, endPos].
        // The count of 'AC' pairs in `charSequence[startPos-1 ... endPos-2]`
        // is given by `acPrefixSums[endPos-1] - acPrefixSums[startPos-1]`.
        const resultForQuery = acPrefixSums[endPos - 1] - acPrefixSums[startPos - 1];
        console.log(resultForQuery);
    }
};

// Read input from standard input and pass it to the solution function.
executeSolution(require('fs').readFileSync('/dev/stdin', 'utf8'));
