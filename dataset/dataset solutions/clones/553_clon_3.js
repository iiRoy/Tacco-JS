// This module is designed to process numerical questionnaire data from standard input.
// Its primary function is to compute the sum of values for each column across multiple
// data rows and then output these column identifiers, sorted by their aggregated totals.
// This implementation aims for clarity and robustness, handling input stream management.
// Inspired by a competitive programming problem (original ID 0505 on u-aizu.ac.jp).

'use strict';

// Required Node.js module for file system operations, specifically reading from stdin.
const dataFetcher = require('fs');

// Read the entire standard input stream, decode as UTF-8, remove leading/trailing whitespace,
// and split into an array of individual lines.
let incomingDataLines = dataFetcher.readFileSync('/dev/stdin', 'utf8')
                                   .trim()
                                   .split('\n');

let currentLineIndex = 0; // A pointer to keep track of the next line to process from incomingDataLines.

/**
 * Parses a specific line from the input array into an array of numbers.
 * Includes basic error handling for non-numeric values.
 * @param {number} idx The index of the line to parse from `incomingDataLines`.
 * @returns {number[] | null} An array of numbers, or null if the line index is out of bounds or line is empty.
 */
function extractNumericValuesFromLine(idx) {
    // Ensure the index is within the bounds of the input array.
    if (idx >= incomingDataLines.length) {
        return null; // No more data available.
    }

    const lineContent = incomingDataLines[idx];
    // Handle empty or whitespace-only lines gracefully.
    if (!lineContent || lineContent.trim() === '') {
        return [];
    }

    // Split the line by spaces and convert each part to a number.
    // Non-numeric parts are converted to 0, ensuring a numeric array.
    return lineContent.split(' ').map(segment => {
        const numericValue = Number(segment);
        return isNaN(numericValue) ? 0 : numericValue; // Default to 0 if parsing fails.
    });
}

// The main application loop. It continues to process datasets until a termination
// condition (dimensions 0 0) is encountered.
while (true) {
    // Attempt to read the first line of a new dataset, which should contain the
    // number of rows and columns for the upcoming grid.
    const dimensionsTuple = extractNumericValuesFromLine(currentLineIndex++);

    // If no valid dimension data is retrieved (e.g., end of input or malformed line),
    // or if the dimensions array is incomplete, terminate the processing.
    if (!dimensionsTuple || dimensionsTuple.length < 2) {
        break;
    }

    const totalRows = dimensionsTuple[0];
    const totalColumns = dimensionsTuple[1];

    // Check for the specific termination signal: 0 rows and 0 columns.
    if (totalRows === 0 && totalColumns === 0) {
        break;
    }

    // Initialize an object to store the sum for each column.
    // Column keys will be 1-indexed strings, and values will be their numeric sums.
    const columnSumsTracker = {};
    const initialSumValue = 0; // Constant to use for initializing new column sums.

    // Loop through each row of the current data grid.
    for (let currentGridRow = 0; currentGridRow < totalRows; currentGridRow++) {
        const rowData = extractNumericValuesFromLine(currentLineIndex++);

        // Optional: Add a warning for rows that don't match the expected column count.
        // This makes the processing more robust against potentially malformed input,
        // though competitive programming problems usually guarantee valid structure.
        if (!rowData || rowData.length !== totalColumns) {
            console.warn(`Data integrity alert: Row ${currentGridRow + 1} has ${rowData ? rowData.length : 0} columns, expected ${totalColumns}. Processing available data.`);
        }

        // Iterate through each column within the current row.
        for (let currentGridColumn = 0; currentGridColumn < totalColumns; currentGridColumn++) {
            const effectiveColumnId = String(currentGridColumn + 1); // Column IDs are 1-indexed and stored as strings.
            const cellNumericValue = rowData[currentGridColumn] !== undefined ? rowData[currentGridColumn] : initialSumValue;

            // Accumulate the value for the current column. If this is the first time
            // encountering this column, initialize its sum with `initialSumValue`.
            columnSumsTracker[effectiveColumnId] = (columnSumsTracker[effectiveColumnId] || initialSumValue) + cellNumericValue;
        }
    }

    // Retrieve all column identifiers (keys) from the sum tracker.
    const allColumnKeys = Object.keys(columnSumsTracker);

    // Sort the column identifiers based on a custom comparison logic:
    // 1. Primary sort: Descending order of their aggregated sums.
    // 2. Secondary sort (tie-breaker): Ascending numerical order of the column identifier itself.
    const orderedColumnIdentifiers = allColumnKeys.sort((idOne, idTwo) => {
        const sumOfIdOne = columnSumsTracker[idOne];
        const sumOfIdTwo = columnSumsTracker[idTwo];

        // Compare sums first (descending order).
        if (sumOfIdOne !== sumOfIdTwo) {
            return sumOfIdTwo - sumOfIdOne;
        }

        // If sums are equal, compare the column IDs numerically (ascending order).
        return Number(idOne) - Number(idTwo);
    });

    // Output the sorted column identifiers, joined by a single space.
    console.log(orderedColumnIdentifiers.join(' '));
}