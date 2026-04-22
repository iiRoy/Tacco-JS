const processSequenceQueries = (rawInputContent) => {
    // Guard clause: Exit early if the input content is empty or invalid.
    if (!rawInputContent || rawInputContent.trim().length === 0) {
        return;
    }

    // Split the raw input into individual lines, removing any initial/final whitespace.
    let inputLines = rawInputContent.trim().split('\n');

    // Remove the first line, typically containing problem-specific dimensions (e.g., N, Q).
    // Ensure there are sufficient lines before proceeding.
    if (inputLines.length < 2) {
        return;
    }
    inputLines.shift(); // Discard the dimension line.

    // Extract the primary sequence string from the input.
    const targetSequenceString = inputLines.shift();
    if (!targetSequenceString) {
        return;
    }

    // Parse the remaining lines as query ranges.
    // Each line is processed to convert space-separated numbers into an array of 0-indexed integers.
    const queryRanges = inputLines.map(line =>
        line.split(' ').map(Number).map(val => val - 1)
    );

    // Initialize an array to store the prefix sums of 'AC' occurrences within the sequence.
    // `acCountPrefixes[k]` will represent the total count of 'AC' pairs in `targetSequenceString[0...k-1]`.
    // The array is sized to match the sequence length, ensuring all relevant indices are covered.
    const acCountPrefixes = new Array(targetSequenceString.length).fill(0);

    // The 'indexs' array and its population loop from the original code were unused and have been removed.

    // Populate the prefix sum array by iterating through the target sequence.
    // This loop efficiently calculates cumulative 'AC' counts.
    for (let sequenceIdx = 0; sequenceIdx < targetSequenceString.length - 1; ++sequenceIdx) {
        // Carry over the count from the previous position.
        acCountPrefixes[sequenceIdx + 1] = acCountPrefixes[sequenceIdx];

        // Check for an 'AC' pair starting at the current position.
        const currentChar = targetSequenceString[sequenceIdx];
        const nextChar = targetSequenceString[sequenceIdx + 1];

        if (currentChar === 'A' && nextChar === 'C') {
            // If an 'AC' pair is found, increment the cumulative count for the current position.
            acCountPrefixes[sequenceIdx + 1]++;
        }
    }

    // Helper function to calculate and output the 'AC' count for a given query range.
    const outputAcCountForRange = (segmentStartIdx, segmentEndIdx, prefixSumArray) => {
        // Basic validation for the query indices to prevent out-of-bounds access.
        if (segmentStartIdx < 0 || segmentEndIdx >= prefixSumArray.length || segmentStartIdx > segmentEndIdx) {
            // In a production environment, this might log a warning or throw an error.
            return;
        }
        // The count of 'AC' pairs within the inclusive range [segmentStartIdx, segmentEndIdx]
        // is determined by subtracting prefix sums.
        const segmentAcCount = prefixSumArray[segmentEndIdx] - prefixSumArray[segmentStartIdx];
        console.log(segmentAcCount);
    };

    // Process each query in the `queryRanges` array.
    for (let queryIdx = 0; queryIdx < queryRanges.length; ++queryIdx) {
        const currentQuery = queryRanges[queryIdx];
        const queryLowerBound = currentQuery[0]; // 0-indexed start of the query range
        const queryUpperBound = currentQuery[1];   // 0-indexed end of the query range (inclusive)

        // Utilize the helper function to compute and display the result.
        outputAcCountForRange(queryLowerBound, queryUpperBound, acCountPrefixes);
    }
};

// Alias the Node.js 'fs' module for file system operations.
const fileSystemOperations = require('fs');

// Execute the main processing function with content read from standard input.
// A try-catch block is added for robust error handling during file access.
try {
    const fileContents = fileSystemOperations.readFileSync('/dev/stdin', 'utf8');
    processSequenceQueries(fileContents);
} catch (readError) {
    // Log any errors encountered during file reading or initial processing.
    // console.error("Failed to read input or process data:", readError.message);
    // Depending on context, one might `process.exit(1)` here.
}