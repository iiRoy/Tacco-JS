"use strict";

// Define the specific string we are looking for within the grid.
const TARGET_TOKEN = "snuke";

// Pre-compute an array of uppercase English alphabet characters for column indexing.
const COLUMN_HEADERS = Array.from({ length: 26 }, (_, idx) => String.fromCharCode(65 + idx));

/**
 * Parses the raw input string, extracting grid dimensions and the content matrix.
 * Includes basic validation for input integrity.
 * @param {string} fullInputString The complete string read from the input source.
 * @returns {{rows: number, cols: number, gridMatrix: string[][]}} An object containing the parsed data.
 * @throws {Error} If the input format is invalid or incomplete.
 */
const decipherInputStructure = (fullInputString) => {
    // Normalize line endings and split into individual lines, discarding empty lines resulting from trimming.
    const inputLines = fullInputString.trim().split(/\r?\n/).filter(line => line.length > 0);

    if (inputLines.length === 0) {
        throw new Error("Input data appears to be empty or malformed.");
    }

    // The first line contains the grid's height (rows) and width (columns).
    const dimensionComponents = inputLines[0].split(/\s+/).filter(comp => comp.length > 0);
    if (dimensionComponents.length < 2) {
        throw new Error("Dimension information is incomplete on the first line.");
    }

    const totalGridRows = Number(dimensionComponents[0]);
    const totalGridCols = Number(dimensionComponents[1]);

    if (isNaN(totalGridRows) || isNaN(totalGridCols) || totalGridRows <= 0 || totalGridCols <= 0) {
        throw new Error(`Invalid grid dimensions: Rows=${totalGridRows}, Cols=${totalGridCols}. Must be positive integers.`);
    }

    // Subsequent lines form the grid content.
    // We slice from the second line (index 1) up to the expected number of rows.
    const contentRows = inputLines.slice(1, totalGridRows + 1).map(line =>
        line.split(/\s+/).filter(token => token.length > 0) // Split by whitespace, filter out empty strings
    );

    // Optional: Verify if the actual number of parsed rows matches the declared number.
    if (contentRows.length !== totalGridRows) {
        console.warn(`Warning: Declared ${totalGridRows} rows but found ${contentRows.length} content rows.`);
    }

    return {
        rows: totalGridRows,
        cols: totalGridCols,
        gridMatrix: contentRows
    };
};

/**
 * Formats a given 0-indexed column and row position into a human-readable grid coordinate.
 * E.g., (col=0, row=0) -> "A1", (col=1, row=4) -> "B5".
 * @param {number} zeroBasedColIndex The 0-indexed column number.
 * @param {number} zeroBasedRowIndex The 0-indexed row number.
 * @returns {string} The formatted coordinate string.
 */
const generateGridCoordinateLabel = (zeroBasedColIndex, zeroBasedRowIndex) => {
    // Add 1 to row index for 1-based numbering.
    const oneBasedRow = zeroBasedRowIndex + 1;

    // Use the COLUMN_HEADERS array to get the letter for the column.
    // Fallback to a generic 'Col(X)' if index is out of A-Z range.
    const colLetter = (zeroBasedColIndex >= 0 && zeroBasedColIndex < COLUMN_HEADERS.length)
        ? COLUMN_HEADERS[zeroBasedColIndex]
        : `Col(${zeroBasedColIndex + 1})`; // For columns beyond Z or invalid index

    return colLetter + oneBasedRow;
};

/**
 * Iterates through the provided grid to find the first occurrence of a specific target string.
 * @param {string[][]} searchGrid The 2D array of strings to search within.
 * @param {number} totalRows The declared number of rows in the grid.
 * @param {number} totalCols The declared number of columns in the grid.
 * @param {string} targetValue The string to search for.
 * @returns {{found: boolean, rIdx: number, cIdx: number}|null} An object containing search result and coordinates, or null if not found.
 */
const locateValueInMatrix = (searchGrid, totalRows, totalCols, targetValue) => {
    for (let rIdx = 0; rIdx < totalRows; rIdx++) {
        const currentRow = searchGrid[rIdx];
        // Basic check to ensure the row actually exists and has content.
        if (!currentRow || currentRow.length === 0) {
            continue; // Skip if row is missing or empty.
        }

        for (let cIdx = 0; cIdx < totalCols; cIdx++) {
            // Check if the current cell's value matches the target.
            if (currentRow[cIdx] === targetValue) {
                // If found, return the coordinates immediately.
                return { found: true, rIdx: rIdx, cIdx: cIdx };
            }
        }
    }
    // If the loops complete without finding the target, return not found.
    return { found: false, rIdx: -1, cIdx: -1 };
};

/**
 * Orchestrates the entire process: reading input, parsing, searching, and displaying the result.
 * @param {string} sourceData The raw input string containing grid data.
 */
const initiateGridSearchProcess = (sourceData) => {
    let parsedGridData;
    try {
        parsedGridData = decipherInputStructure(sourceData);
    } catch (error) {
        console.error("Failed to process input data:", error.message);
        return; // Exit if parsing fails critically.
    }

    const { rows, cols, gridMatrix } = parsedGridData;

    // Perform the search for the target token.
    const searchOutcome = locateValueInMatrix(gridMatrix, rows, cols, TARGET_TOKEN);

    // Display the result based on whether the target was found.
    if (searchOutcome.found) {
        const finalCoordinate = generateGridCoordinateLabel(searchOutcome.cIdx, searchOutcome.rIdx);
        console.log(finalCoordinate);
        // The original problem implies an immediate exit upon finding the first instance,
        // which is achieved by the early return from locateValueInMatrix and subsequent console.log.
    } else {
        // This branch handles cases where the target is not present, which might not be strictly
        // required by the original problem but enhances robustness.
        console.log(`The target '${TARGET_TOKEN}' was not located within the specified grid.`);
    }
};

// Entry point: Read data from standard input and start the processing.
initiateGridSearchProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));