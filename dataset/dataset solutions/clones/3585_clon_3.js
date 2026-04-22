"use strict";

// A utility function designed to securely retrieve the complete
// raw input data from the standard input stream.
// This abstraction improves modularity and testability of the main logic.
const acquireSystemInput = () => {
    try {
        // Attempt to read the entire file content as a UTF-8 string.
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (readingError) {
        // In a production environment, this error would be logged
        // and handled more gracefully, potentially exiting with a specific code.
        // For typical competitive programming, a simple error message suffices.
        console.error("Failed to read input from /dev/stdin:", readingError.message);
        return ""; // Provide an empty string as a fallback for processing.
    }
};

// Define a constant for the specific character ('#') that denotes
// an active or 'filled' cell within the grid.
const ACTIVE_CELL_INDICATOR = '#';

/**
 * Orchestrates the processing of a character grid,
 * systematically eliminating rows and columns that are entirely blank.
 * The expected input format is: first line contains dimensions (height width),
 * followed by 'height' lines representing the grid's data.
 *
 * @param {string} fullInputData - The entire raw input string received from stdin.
 */
function processCharacterGrid(fullInputData) {
    // Begin by sanitizing the input: remove any leading or trailing whitespace.
    const cleansedInput = fullInputData.trim();

    // Implement an early exit condition if the input is found to be empty
    // after the trimming operation, preventing further unnecessary processing.
    if (!cleansedInput) {
        console.log(''); // Output an empty line for no valid input.
        return;
    }

    // Deconstruct the input string into an array of individual lines.
    const inputLineSegments = cleansedInput.split('\n');

    // Extract the dimension information from the very first line of the input.
    // The 'shift()' method also conveniently removes this line from 'inputLineSegments'.
    const dimensionsDescriptor = inputLineSegments.shift();
    // Parse the two space-separated numbers into initial grid height and width.
    const [initialGridHeight, initialGridWidth] = dimensionsDescriptor.split(' ').map(Number);

    // Introduce a robust validation check for the extracted dimensions.
    // This guard clause ensures that processing only proceeds with valid numerical sizes.
    if (isNaN(initialGridHeight) || isNaN(initialGridWidth) || initialGridHeight < 0 || initialGridWidth < 0) {
        console.error("Critical error: Invalid grid dimensions detected in input.");
        console.log(''); // Output an empty line as an error indicator.
        return;
    }

    // Populate the mutable representation of the grid from the remaining input lines.
    // We precisely take 'initialGridHeight' lines, ignoring any potential surplus.
    let currentGridState = inputLineSegments.slice(0, initialGridHeight);

    // --- Step 1: Execute Row Pruning ---
    // Filter out any rows that do not contain the 'ACTIVE_CELL_INDICATOR'.
    // This replaces the original's two-pass approach (identifying then splicing)
    // with a more functional and direct filtering operation.
    let relevantRows = currentGridState.filter(
        (singleGridRow) => singleGridRow.includes(ACTIVE_CELL_INDICATOR)
    );

    // After row pruning, check if any rows are left. If not, output blank and terminate.
    if (relevantRows.length === 0) {
        console.log('');
        return;
    }

    // --- Step 2: Determine Which Columns to Preserve ---
    // Instead of rebuilding row strings iteratively, first identify all column indices
    // that contain at least one 'ACTIVE_CELL_INDICATOR' across the 'relevantRows'.
    const indicesOfRetainedColumns = [];
    // Iterate through every possible column index, from 0 up to the initial grid width.
    for (let columnIndexIterator = 0; columnIndexIterator < initialGridWidth; columnIndexIterator++) {
        // Utilize the 'some' array method to efficiently check if any row
        // has the marker character at the current column's position.
        const isThisColumnActive = relevantRows.some(
            (rowContentString) => rowContentString[columnIndexIterator] === ACTIVE_CELL_INDICATOR
        );

        if (isThisColumnActive) {
            indicesOfRetainedColumns.push(columnIndexIterator);
        }
    }

    // Another critical check: if no columns were found to be active, output blank.
    if (indicesOfRetainedColumns.length === 0) {
        console.log('');
        return;
    }

    // --- Step 3: Reconstruct the Grid with Only Retained Columns ---
    // Transform each 'relevantRow' into a new string, composed solely of characters
    // corresponding to the 'indicesOfRetainedColumns'.
    let finalFilteredGrid = relevantRows.map(
        (originalRowString) => {
            let charactersForNewRow = [];
            // Iterate through the indices of columns that we decided to keep.
            for (const keptColumnIndex of indicesOfRetainedColumns) {
                // Append the character from the original row at the 'keptColumnIndex'.
                // A fallback to a space ' ' is included for robustness, though input constraints
                // usually guarantee valid character access.
                charactersForNewRow.push(originalRowString[keptColumnIndex] || ' ');
            }
            return charactersForNewRow.join(''); // Join characters to form the new row string.
        }
    );

    // --- Step 4: Generate Final Output ---
    // Apply special formatting if the grid has been reduced to a single row.
    if (finalFilteredGrid.length === 1) {
        const remainingSingleRow = finalFilteredGrid[0];
        // From this single row, extract only the 'ACTIVE_CELL_INDICATOR' characters.
        const activeMarkersOutput = remainingSingleRow.split('').filter(
            (individualChar) => individualChar === ACTIVE_CELL_INDICATOR
        ).join('');
        console.log(activeMarkersOutput);
    } else {
        // For scenarios where multiple rows persist, join them with newline characters.
        console.log(finalFilteredGrid.join('\n'));
    }
}

// Initiate the grid processing sequence by calling the main function
// with the input data retrieved from the system's standard input.
processCharacterGrid(acquireSystemInput());