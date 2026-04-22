'use strict';

// A helper function to determine if a given array (representing a line or column)
// contains at least one 'false' value. This is used for filtering.
const containsAnyInactive = (valueSequence) => {
    let foundInactive = false;
    for (const element of valueSequence) {
        if (!element) { // If an element is false, it means it's an 'inactive' marker
            foundInactive = true;
            break;
        }
    }
    return foundInactive;
};

// Function responsible for transposing a 2D array (matrix).
// This effectively swaps rows and columns.
const rotateGrid = (originalGrid) => {
    // Handle cases of empty or invalid input grids gracefully.
    if (!originalGrid || originalGrid.length === 0 || originalGrid[0].length === 0) {
        return [];
    }

    const totalRows = originalGrid.length;
    const totalColumns = originalGrid[0].length;
    
    // Initialize a new grid with dimensions swapped.
    const rotatedResult = Array.from({ length: totalColumns }, () => Array(totalRows).fill(null));

    // Populate the new grid by swapping indices.
    for (let rIndex = 0; rIndex < totalRows; rIndex++) {
        for (let cIndex = 0; cIndex < totalColumns; cIndex++) {
            rotatedResult[cIndex][rIndex] = originalGrid[rIndex][cIndex];
        }
    }
    return rotatedResult;
};

// Function to convert a boolean grid back into its character representation.
// True values become '.', False values become '#'.
const reconstructVisualOutput = (booleanLayout) => {
    const LIVE_SYMBOL = '.';
    const DEAD_SYMBOL = '#';

    return booleanLayout.map(rowOfBooleans => {
        return rowOfBooleans.map(isLive => isLive ? LIVE_SYMBOL : DEAD_SYMBOL);
    });
};

/**
 * Core processing routine for the input data.
 * This function orchestrates the transformation and filtering steps.
 * @param {string} incomingData The raw string content received for processing.
 * @returns {void} Outputs the final transformed grid to the console.
 */
function dataProcessor(incomingData) {
    // Define the character constants used throughout the processing.
    const ACTIVE_POINT_CHAR = '.';
    const INACTIVE_POINT_CHAR = '#';

    // Initial validation: check if the input data is meaningful.
    if (!incomingData || incomingData.trim().length === 0) {
        console.error("Input data is either empty or contains only whitespace. Cannot proceed.");
        return;
    }

    // Split the input into individual lines. The first line is typically metadata
    // or header information and is therefore skipped for content processing.
    let allLines = incomingData.split('\n');
    const operationalLines = allLines.slice(1); // Exclude the very first line

    let initialBooleanMatrix = [];

    // Iterate through each operational line to convert characters into boolean values.
    // '.' character is mapped to 'true', any other character to 'false'.
    for (const currentLineText of operationalLines) {
        // Skip any completely empty lines that might appear in the content.
        if (currentLineText.trim() === '') {
            continue;
        }

        let currentBooleanRow = [];
        for (const character of currentLineText) {
            currentBooleanRow.push(character === ACTIVE_POINT_CHAR);
        }
        initialBooleanMatrix.push(currentBooleanRow);
    }

    // If, after initial parsing, no valid data rows were found, exit early.
    if (initialBooleanMatrix.length === 0) {
        console.log(""); // Output an empty string if no content to process
        return;
    }

    // First filtering pass: remove any rows that are entirely composed of 'true' values (all '.').
    // Rows that contain at least one 'false' (one '#') are retained.
    const rowFilteredMatrix = initialBooleanMatrix.filter(containsAnyInactive);

    // If all rows were filtered out, there's nothing left to process.
    if (rowFilteredMatrix.length === 0) {
        console.log("");
        return;
    }

    // Transpose the matrix to prepare for column-wise filtering.
    const interimTransposedMatrix = rotateGrid(rowFilteredMatrix);

    // Second filtering pass: now operating on what were originally columns.
    // Remove any of these "columns" that are entirely 'true' (all '.').
    const columnFilteredMatrix = interimTransposedMatrix.filter(containsAnyInactive);

    // If all columns were filtered out (meaning the original content was entirely '.' or removed), exit.
    if (columnFilteredMatrix.length === 0) {
        console.log("");
        return;
    }

    // Transpose the matrix back to its original row/column orientation.
    const finalOrientedBooleanGrid = rotateGrid(columnFilteredMatrix);

    // Convert the final boolean grid into its human-readable character format.
    const finalCharacterGrid = reconstructVisualOutput(finalOrientedBooleanGrid);

    // Join the characters in each row, then join the rows with newline characters
    // to form the complete output string.
    let outputDisplayString = finalCharacterGrid.map(row => row.join('')).join('\n');
    console.log(outputDisplayString);
}

// The program's entry point: reads data from standard input and passes it
// to the main processing function.
dataProcessor(require('fs').readFileSync('/dev/stdin', 'utf8'));