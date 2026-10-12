'use strict';

/**
 * Processes the input string to filter and transform a grid.
 * @param {string} rawData The raw input string.
 */
function processInput(rawData) {
    const inputLines = rawData.split('\n').slice(1);
    let booleanGrid = [];

    // Helper function to convert a character to its boolean representation
    const convertCharToBoolean = (char) => char === '.';

    // Convert each line of characters into an array of booleans
    booleanGrid = inputLines.map((currentLine) => {
        const lineChars = currentLine.split('');
        return lineChars.map(convertCharToBoolean);
    });

    // Helper function to check if a row contains any 'false' (i.e., '#')
    const containsFalseElement = (row) => !row.every(val => val);

    // First filtering step: remove rows where all elements are true (all '.')
    const filteredRowsInitial = booleanGrid.filter(containsFalseElement);

    // Transpose the grid
    const transposedGrid = transposeMatrix(filteredRowsInitial);

    // Second filtering step: remove rows (which were columns) where all elements are true
    const filteredRowsFinal = transposedGrid.filter(containsFalseElement);

    // Transpose back and format for display
    const finalOutputGrid = formatForDisplay(transposeMatrix(filteredRowsFinal));

    // Prepare the final string for output
    const outputString = finalOutputGrid.map((eachRow) => {
        return eachRow.join('');
    }).join('\n');

    console.log(outputString);
}

/**
 * Transposes a 2D array (matrix).
 * @param {Array<Array<any>>} matrix The 2D array to transpose.
 * @return {Array<Array<any>>} The transposed 2D array.
 */
const transposeMatrix = (matrix) => {
    if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
        return [];
    }
    const numColumns = matrix[0].length;
    return Array.from({ length: numColumns }, (_, colIndex) => {
        return matrix.map((row) => row[colIndex]);
    });
};

/**
 * Converts a boolean matrix into a readable string matrix ('.' for true, '#' for false).
 * @param {Array<Array<boolean>>} booleanMatrix The matrix of booleans.
 * @return {Array<Array<string>>} The matrix with '.' and '#'.
 */
const formatForDisplay = (booleanMatrix) => {
    return booleanMatrix.map((currentRow) => {
        return currentRow.map((cellValue) => (cellValue ? '.' : '#'));
    });
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
