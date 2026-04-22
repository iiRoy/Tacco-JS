// This module processes a series of binary grids to find the longest sequence of '1's
// in horizontal, anti-diagonal, vertical, and diagonal directions.
// It reads grid data from standard input until a grid dimension of 0 is encountered.

/**
 * Checks if a given row and column coordinate is within the boundaries of the grid.
 * @param {number} row - The row index to check.
 * @param {number} col - The column index to check.
 * @param {number} dimension - The size (N) of the square grid (N x N).
 * @returns {boolean} True if the coordinates are within bounds, false otherwise.
 */
const isCoordinateValid = (row, col, dimension) => {
    return row >= 0 && row < dimension && col >= 0 && col < dimension;
};

/**
 * Represents a set of directional increments for traversing a grid.
 * Each object defines a change in row (dr) and column (dc).
 */
const traversalDirections = [
    { dr: 0, dc: 1 },  // Horizontal (right)
    { dr: 1, dc: -1 }, // Anti-diagonal (down-left)
    { dr: 1, dc: 0 },  // Vertical (down)
    { dr: 1, dc: 1 }   // Diagonal (down-right)
];

/**
 * Scans for the longest sequence of '1's starting from a given cell
 * in four predefined directions within a binary grid.
 * The starting cell itself must contain '1' (pre-condition).
 *
 * @param {number} startRowCoord - The starting row index.
 * @param {number} startColCoord - The starting column index.
 * @param {Array<Array<number>>} gridData - The 2D array representing the binary grid.
 * @param {number} dimSize - The dimension (N) of the square grid.
 * @returns {number} The maximum length of a sequence of '1's found from the starting cell.
 */
const evaluateSequenceLength = (startRowCoord, startColCoord, gridData, dimSize) => {
    let maxFoundLength = 1; // Minimum sequence length is 1 (the starting cell itself)
    const targetValue = 1; // We are looking for sequences of '1's

    // Iterate through each possible traversal direction
    for (const direction of traversalDirections) {
        let currentSequenceLength = 1; // Reset count for the new direction
        let stepMultiplier = 1;        // Multiplier for directional increments

        // Traverse in the current direction until a boundary is hit or a '0' is encountered
        while (true) {
            const nextRowCoord = startRowCoord + (direction.dr * stepMultiplier);
            const nextColCoord = startColCoord + (direction.dc * stepMultiplier);

            // Check if the next coordinate is within grid boundaries
            if (!isCoordinateValid(nextRowCoord, nextColCoord, dimSize)) {
                break; // Out of bounds, terminate this direction's scan
            }

            // Check the value of the cell at the next coordinate
            if (gridData[nextRowCoord][nextColCoord] !== targetValue) {
                break; // Encountered a non-target value, terminate this direction's scan
            }

            // If it's a '1' and within bounds, extend the current sequence
            currentSequenceLength++;
            stepMultiplier++;
        }

        // Update the overall maximum length found so far
        maxFoundLength = Math.max(maxFoundLength, currentSequenceLength);
    }

    return maxFoundLength;
};

// --- Main Program Execution ---

// Read the entire standard input. In competitive programming, this is common.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into individual lines and remove any leading/trailing whitespace from the whole input.
const parsedInputLines = rawInputContent.trim().split("\n");

// Collection to store the maximum sequence length for each processed grid.
const resultsCollection = [];

let lineIndex = 0; // Keep track of the current line being processed from the input array.

// Process grids until a grid dimension of 0 is encountered.
while (true) {
    // Attempt to parse the grid dimension from the current line.
    // Using parseInt with radix 10 is safer than `val - 0`.
    const currentGridDimension = parseInt(parsedInputLines[lineIndex++], 10);

    // If the dimension is 0, it signals the end of input. Also handle NaN if line is empty/invalid.
    if (isNaN(currentGridDimension) || currentGridDimension === 0) {
        break;
    }

    // Initialize the 2D array (matrix) for the current grid.
    const matrixOfValues = [];
    for (let rowIndex = 0; rowIndex < currentGridDimension; rowIndex++) {
        // Each line represents a row. Split characters and convert them to numbers.
        const rowData = parsedInputLines[lineIndex++].split("").map(Number);
        matrixOfValues.push(rowData);
    }

    let globalMaximumSequence = 0; // Initialize max for the current grid

    // Iterate through every cell in the grid to find potential starting points for sequences.
    for (let rowIndex = 0; rowIndex < currentGridDimension; rowIndex++) {
        for (let colIndex = 0; colIndex < currentGridDimension; colIndex++) {
            // Only start scanning if the current cell contains a '1'.
            // A '0' cannot be the start of a sequence of '1's.
            if (matrixOfValues[rowIndex][colIndex] === 1) {
                // If it's a '1', evaluate the longest sequence starting from this cell.
                const sequenceFromCurrentCell = evaluateSequenceLength(
                    rowIndex,
                    colIndex,
                    matrixOfValues,
                    currentGridDimension
                );
                // Update the global maximum for this grid.
                globalMaximumSequence = Math.max(globalMaximumSequence, sequenceFromCurrentCell);
            }
        }
    }
    // Store the result for the current grid.
    resultsCollection.push(globalMaximumSequence);
}

// Output all collected results, each on a new line.
resultsCollection.forEach(res => console.log(res));