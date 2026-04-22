const processInputData = (inputStringData) => {
    // Helper function to parse raw string input into structured data.
    const extractProblemDetails = (rawData) => {
        const linesOfInput = rawData.split('\n');
        // Convert the first line to an integer for string length.
        const sequenceLength = parseInt(linesOfInput[0].trim(), 10);
        // The second line contains the character sequence.
        const characterSequence = linesOfInput[1];
        return { length: sequenceLength, sequence: characterSequence };
    };

    const { length: inputSize, sequence: targetCharStream } = extractProblemDetails(inputStringData);

    // Initial validation: If the string is empty or invalid, the longest common repeated substring is 0.
    if (inputSize <= 0 || !targetCharStream) {
        console.log(0);
        return;
    }

    // Initialize a 2D array (Dynamic Programming table) to store lengths of common suffixes.
    // Dimensions: (inputSize x (inputSize + 1)). The extra column is often for boundary conditions,
    // and is pre-filled with zeros as a base case for calculations extending beyond string bounds.
    let memoizationMatrix = Array(inputSize).fill(null).map(() => Array(inputSize + 1).fill(0));

    // Phase 1: Populate the last row of the memoization matrix.
    // This handles comparisons involving the very last character of the target sequence.
    // The loop iterates backwards from the second-to-last column to the first.
    for (let currentColumnIndex = inputSize - 1; currentColumnIndex >= 0; --currentColumnIndex) {
        // When comparing the last character with itself (diagonal in the last row),
        // the length of the common repeated substring is considered 0 to ensure non-overlapping matches.
        if (currentColumnIndex === inputSize - 1) {
            memoizationMatrix[inputSize - 1][currentColumnIndex] = 0;
        } else {
            // Compare the last character of the sequence with the character at currentColumnIndex.
            const charFromEnd = targetCharStream[inputSize - 1];
            const charAtCurrent = targetCharStream[currentColumnIndex];

            // If they match, the common suffix length is 1; otherwise, it's 0.
            memoizationMatrix[inputSize - 1][currentColumnIndex] = (charFromEnd === charAtCurrent) ? 1 : 0;
        }
    }

    // Phase 2: Iterate through the rest of the memoization matrix from bottom-right to top-left.
    // This calculates common suffix lengths for all other possible starting positions.
    // The outer loop iterates through rows from the second-to-last up to the first.
    for (let currentRowIndex = inputSize - 2; currentRowIndex >= 0; --currentRowIndex) {
        // The inner loop iterates through columns from the second-to-last up to the first.
        for (let currentColumnIndex = inputSize - 1; currentColumnIndex >= 0; --currentColumnIndex) {

            // If the row and column indices are identical, it means we are comparing a substring with itself starting at the same position.
            // For finding *repeated* substrings, these are typically excluded (treated as 0 length) to enforce distinct occurrences.
            if (currentRowIndex === currentColumnIndex) {
                memoizationMatrix[currentRowIndex][currentColumnIndex] = 0;
                continue; // Move to the next column.
            }

            // Extract characters for comparison to improve readability.
            const charInRow = targetCharStream[currentRowIndex];
            const charInColumn = targetCharStream[currentColumnIndex];

            // If the characters at the current indices match,
            // the common suffix length is one plus the length of the common suffix
            // from the diagonally preceding cell (dp[i+1][j+1]).
            if (charInRow === charInColumn) {
                const diagonalPreviousValue = memoizationMatrix[currentRowIndex + 1][currentColumnIndex + 1];
                memoizationMatrix[currentRowIndex][currentColumnIndex] = diagonalPreviousValue + 1;
            } else {
                // If characters do not match, the common suffix length at this point is 0.
                memoizationMatrix[currentRowIndex][currentColumnIndex] = 0;
            }
        }
    }

    // After populating the entire memoization matrix, find the maximum value within it.
    // This maximum value represents the length of the longest repeated substring.

    // Flatten the 2D array into a 1D array for easier maximum finding.
    const allComputedMatchLengths = memoizationMatrix.flat();

    // Helper function to safely determine the maximum value in an array.
    const determineOverallMaximum = (valueSet) => {
        if (!valueSet || valueSet.length === 0) {
            return 0; // Return 0 for an empty set of values.
        }
        // Use the spread operator to pass array elements as individual arguments to Math.max.
        return Math.max(...valueSet);
    };

    const finalLongestLength = determineOverallMaximum(allComputedMatchLengths);

    // Output the result.
    console.log(finalLongestLength);
};

// Execute the main processing function with input read from standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));