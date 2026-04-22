'use strict';
/*
 * This immediately invoked function processes input data
 * to calculate a maximum value based on dynamic programming principles.
 * It's structured to solve a specific type of optimization problem,
 * often referred to as a "coloring" or "house painting" problem
 * with three choices per step.
 */
(function(textBlock) {
    // Initial processing of the raw string input.
    // 1. Trim leading/trailing whitespace.
    // 2. Split into individual lines.
    // 3. For each line, split by whitespace into string segments.
    // 4. Convert each string segment to a number using the 'x - 0' trick.
    textBlock = textBlock
        .trim()
        .split(/\n/)
        .map(rowString =>
            rowString
            .split(/\s+/)
            .map(parsedVal => parsedVal - 0)
        );

    // Extract the problem's total number of elements/rows from the first data point.
    const dataSize = textBlock[0][0];

    // Initialize the dynamic programming table (memoization array).
    // The first row (index 0) serves as a base case or dummy row,
    // containing three floating-point zeros for consistency.
    const maxScores = [[0.0, 0.0, 0.0]];

    // Iterate through each row of the input data, starting from the first actual element.
    for (let rowIndex = 1; rowIndex <= dataSize; rowIndex++) {
        // Prepare the current row of the DP table with initial zero values.
        maxScores[rowIndex] = [0.0, 0.0, 0.0];

        // For each row, iterate through the three possible choices (e.g., colors).
        for (let colorIdx = 0; colorIdx < 3; colorIdx++) {
            // Calculate the maximum score for the current cell (rowIndex, colorIdx).
            // This is achieved by taking the maximum of the two previous states
            // (from rowIndex - 1) that are *not* the current colorIdx,
            // and adding the cost/value associated with the current choice.
            maxScores[rowIndex][colorIdx] = Math.max(
                maxScores[rowIndex - 1][(colorIdx + 1) % 3], // Score from previous row, next choice.
                maxScores[rowIndex - 1][(colorIdx + 2) % 3]  // Score from previous row, two choices ahead.
            ) + textBlock[rowIndex][colorIdx]; // Add the current element's value.
        }
    }

    // Once the DP table is fully populated, the final solution is the maximum
    // value found in the last row of the table.
    const overallMax = Math.max.apply(null, maxScores[dataSize]);

    // Display the computed ultimate maximum value to the standard output.
    console.log(overallMax);

// The immediately invoked function is executed with data read synchronously
// from the standard input stream ('/dev/stdin') as a UTF-8 encoded string.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));