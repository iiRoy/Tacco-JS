process.stdin.resume();
process.stdin.setEncoding('utf8');

// This variable accumulates all incoming data from standard input.
var accumulatedData = '';

process.stdin.on('data', function(dataPortion) {
    accumulatedData += dataPortion;
});

process.stdin.on('end', function() {
    // Once all input is received, split it into lines and pass to the main processing function.
    processInputLines(accumulatedData.split(/\r?\n/));
});

/**
 * Processes a grid-like structure (array of strings or array of arrays of characters)
 * to remove empty rows and columns.
 * @param {Array<string|Array<string>>} gridData - The input grid.
 * @returns {[boolean, string|Array<string>]} A tuple: [true if modifications occurred, the modified grid].
 */
function processGrid(gridData) {
    let modificationOccurred = false; // Flag to track if any row or column was removed.

    // First pass: Remove empty rows (rows without '#').
    for (let rowIndex = 0; rowIndex < gridData.length; rowIndex++) {
        // Check if the current row (string) does not contain '#'.
        if (!gridData[rowIndex].match(/\#/)) {
            gridData.splice(rowIndex, 1); // Remove the row.
            rowIndex--; // Decrement index to re-check the new element at the current position.
            modificationOccurred = true; // Mark that a modification happened.
        }
    }

    // Convert each row string into an array of characters for easier column manipulation.
    for (let rowIndex = 0; rowIndex < gridData.length; rowIndex++) {
        gridData[rowIndex] = gridData[rowIndex].split("");
    }

    // Second pass: Remove empty columns (columns where no row has '#' at that position).
    // This loop iterates through columns.
    for (let colIndex = 0; colIndex < gridData[0].length; colIndex++) {
        let columnIsEmpty = true; // Assume the column is empty until a '#' is found.
        // This inner loop iterates through rows for the current column.
        for (let rowIter = 0; rowIter < gridData.length; rowIter++) {
            if (gridData[rowIter][colIndex] === "#") {
                columnIsEmpty = false; // A '#' was found, so the column is not empty.
                break; // No need to check further rows for this column.
            }
        }

        // If the column was found to be empty, remove it from all rows.
        if (columnIsEmpty) {
            for (let rowIter = 0; rowIter < gridData.length; rowIter++) {
                gridData[rowIter].splice(colIndex, 1); // Remove the character at colIndex from each row.
            }
            colIndex--; // Decrement column index to re-check the new element at the current position.
            modificationOccurred = true; // Mark that a modification happened.
        }
    }

    // Convert each row (array of characters) back into a string.
    for (let rowIndex = 0; rowIndex < gridData.length; rowIndex++) {
        gridData[rowIndex] = gridData[rowIndex].join("");
    }

    // Join all processed rows back into a single string, separated by newlines.
    gridData = gridData.join("\n");

    // Return the modification flag and the processed grid data.
    return [modificationOccurred, gridData];
}

/**
 * The primary function to handle the input and orchestrate the grid processing.
 * @param {Array<string>} linesFromInput - An array of strings, each representing a line from stdin.
 */
function processInputLines(linesFromInput) {
    // Remove the first line, which is typically a count or metadata not part of the grid itself.
    linesFromInput.splice(0, 1);

    // Perform the initial grid processing.
    let processingResult = processGrid(linesFromInput);

    // Continuously process the grid until no more rows or columns can be removed.
    // The loop continues as long as the 'modificationOccurred' flag (processingResult[0]) is true.
    while (processingResult[0]) {
        // Re-process the grid using the *original* linesFromInput array (which is modified in-place by processGrid).
        // This implies that processGrid modifies the input array directly, and the loop continues
        // until a call to processGrid returns false for modificationOccurred.
        processingResult = processGrid(linesFromInput);
    }

    // Output the final processed grid string.
    console.log(processingResult[1]);
}
