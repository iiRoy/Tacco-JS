'use strict';

/*
 * Primary entry point for processing the provided text data.
 * @param {string} rawData The complete input string to be processed.
 */
function processInput(rawData) {
    // Split the input string into individual lines.
    let lineSegments = rawData.split('\n');
    // Remove the first line, which might be a header or metadata.
    lineSegments.shift();
    // Initialize an array to store the boolean representation of the grid.
    let booleanGrid = [];

    // Iterate over each line segment to convert characters into booleans.
    lineSegments.forEach((currentLine) => {
        // Convert the current line into an array of characters.
        let charArray = currentLine.split('');
        // Map each character to a boolean: '.' becomes true, anything else becomes false.
        let boolRow = charArray.map((charVal) => {
            if (charVal === '.') {
                return true;
            } else {
                return false;
            }
        });
        // Add the boolean row to our grid.
        booleanGrid.push(boolRow);
    });

    // Filter the grid to find rows that are not entirely 'true' (i.e., contain at least one 'false').
    let initialFilteredRows = booleanGrid.filter((gridRow) => {
        // Reduce the row to a single boolean: true if all elements are true, false otherwise.
        // Then negate the result to keep rows that are NOT all true.
        return !gridRow.reduce((accumulator, currentValue) => {
            return (accumulator && currentValue);
        });
    });

    // Transpose the filtered rows to process columns.
    let transposedInitial = transposeMatrix(initialFilteredRows);

    // Filter the transposed grid (which represents columns) using the same logic.
    let finalFilteredColumns = transposedInitial.filter((gridRow) => {
        return !gridRow.reduce((accumulator, currentValue) => {
            return (accumulator && currentValue);
        });
    });

    // Transpose the result back and convert booleans to display characters.
    let outputGrid = formatOutputGrid(transposeMatrix(finalFilteredColumns));

    // Print the final grid to the console, joining elements and lines appropriately.
    console.log(
        outputGrid.map((outputLine) => {
            return outputLine.join('');
        }).join('\n')
    );
}

/*
 * Transposes a 2D array (matrix).
 * @param {Array<Array<any>>} inputMatrix The 2D array to be transposed.
 * @returns {Array<Array<any>>} The transposed 2D array.
 */
const transposeMatrix = (inputMatrix) => {
    // If the input matrix is empty, return an empty array.
    if (inputMatrix.length === 0) return [];
    // Map over the columns of the first row to create new rows.
    return inputMatrix[0].map((_discarded, columnIndex) => {
        // For each column index, create a new array by taking the element at that index from each original row.
        return inputMatrix.map((matrixRow) => matrixRow[columnIndex]);
    });
};

/*
 * Converts a boolean matrix into a character matrix for display.
 * @param {Array<Array<boolean>>} processedBooleanMatrix A 2D array of booleans.
 * @returns {Array<Array<string>>} A 2D array of strings ('.' or '#').
 */
const formatOutputGrid = (processedBooleanMatrix) => {
    let formattedResult = processedBooleanMatrix.map((gridRow) => {
        return gridRow.map((cellValue) => {
            // If the boolean value is true, represent it as a dot.
            if (cellValue) {
                return '.';
            } else {
                // Otherwise, represent it as a hash.
                return '#';
            }
        });
    });
    return formattedResult;
};

// Execute the main processing function with content read from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
