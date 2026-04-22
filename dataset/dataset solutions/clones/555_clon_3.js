const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let dataLines = rawInputContent.trim().split("\n");

/**
 * Processes a single set of matrix data to calculate column sums and sort them.
 * This function encapsulates the core logic for a single test case.
 *
 * @param {number} rowCount - The number of rows in the current matrix.
 * @param {number} columnCount - The number of columns in the current matrix.
 * @param {string[]} inputSource - The array of remaining input lines to consume.
 * @returns {string} A space-separated string of sorted column identifiers, or an empty string if an error occurs.
 */
function processMatrixData(rowCount, columnCount, inputSource) {
    // Initialize an array to store column data: [column_identifier, total_score_for_column]
    // Using Array.from for a more functional initialization (Type III change).
    const columnAccumulators = Array.from({ length: columnCount }, (_, index) => [index + 1, 0]);

    // Iterate through each row of the matrix to accumulate column sums
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const currentLine = inputSource.shift(); // Consume a line for the current row

        // Type III: Added a guard clause for unexpected end of input
        if (currentLine === undefined) {
            console.error(`Error: Ran out of input lines while expecting row ${rowIndex + 1}.`);
            return ""; // Indicate an error by returning an empty string
        }

        // Parse the values for the current row
        const rowValues = currentLine.split(" ").map(valueStr => {
            const num = Number(valueStr);
            // Type III: Add a simple validation for non-numeric input
            if (isNaN(num)) {
                console.warn(`Warning: Non-numeric value '${valueStr}' encountered in row ${rowIndex + 1}. Treating as 0.`);
                return 0; // Default to 0 for non-numeric entries
            }
            return num;
        });

        // Add the current row's values to their respective column accumulators
        // Type III: Using a standard 'for' loop instead of 'forEach' for variety and explicit index control
        for (let colIndex = 0; colIndex < columnCount; colIndex++) {
            // Type III: Add a bounds check for potential malformed row data (fewer values than expected columns)
            if (colIndex < rowValues.length) {
                columnAccumulators[colIndex][1] += rowValues[colIndex];
            } else {
                console.warn(`Warning: Row ${rowIndex + 1} has fewer values than expected columns (${columnCount}). Skipping remaining column updates for this row.`);
                break; // Stop processing this row if it's malformed
            }
        }
    }

    // Sort the columns based on their accumulated scores and then by identifier
    // Type III: Rephrased the sorting comparison for improved clarity, but functionally identical
    columnAccumulators.sort((firstColumnData, secondColumnData) => {
        const scoreA = firstColumnData[1];
        const scoreB = secondColumnData[1];
        const identifierA = firstColumnData[0];
        const identifierB = secondColumnData[0];

        // Primary sort key: total score in descending order
        if (scoreA !== scoreB) {
            return scoreB - scoreA;
        }
        // Secondary sort key: column identifier in ascending order (if scores are equal)
        return identifierA - identifierB;
    });

    // Extract just the column identifiers from the sorted array
    // Type III: Using 'map' for a more concise and functional transformation (replaces the original forEach+push)
    const orderedColumnIdentifiers = columnAccumulators.map(columnInfo => columnInfo[0]);

    return orderedColumnIdentifiers.join(" "); // Return the space-separated string of identifiers
}

let currentTestCaseIndex = 0; // Type III: Added a counter for test cases

// Main loop to process multiple test cases from the input data
while (true) {
    currentTestCaseIndex++; // Increment the test case counter

    const matrixDimensionsLine = dataLines.shift(); // Get the line containing N M values

    // Type III: Enhanced termination check for the main loop
    // Break if no more lines, or if an empty line is encountered (e.g., at the very end of file)
    if (matrixDimensionsLine === undefined || matrixDimensionsLine.trim() === '') {
        break;
    }

    // Parse the row and column counts for the current matrix
    const dimensionValues = matrixDimensionsLine.split(" ").map(Number);
    const numRowsForMatrix = dimensionValues[0];
    const numColsForMatrix = dimensionValues[1];

    // Type III: Explicit guard clause for the problem's termination condition (0 0)
    if (numRowsForMatrix === 0 && numColsForMatrix === 0) {
        break; // Exit the loop if the sentinel '0 0' is encountered
    }

    // Call the helper function to process the data for the current test case
    const resultOutputString = processMatrixData(numRowsForMatrix, numColsForMatrix, dataLines);

    // Type III: Check if the result string is not empty (indicating successful processing)
    if (resultOutputString !== "") {
        console.log(resultOutputString); // Output the result for the current test case
    } else {
        // If an empty string is returned, it signifies an error during processing of this test case.
        // We might choose to stop further processing or log a specific error message.
        console.error(`Processing of test case ${currentTestCaseIndex} failed due to input error.`);
        break; // Stop if a critical error occurred
    }
}