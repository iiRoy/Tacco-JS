// This script processes grid data from standard input to find a specific pattern.
const filesystemModule = require('node:fs');

// Read all incoming text data from the standard input stream.
// It assumes the input is UTF-8 encoded and splits it by newline characters.
const rawInputLines = filesystemModule.readFileSync('/proc/self/fd/0', 'utf8').split('\n');

// The first line of input specifies the square matrix dimension.
// Parse it as an integer in base 10.
const matrixDimension = parseInt(rawInputLines[0], 10);

// The remaining lines form the character grid.
const charGrid = rawInputLines.slice(1);

/**
 * Checks for a specific rotational symmetry pattern within the character grid.
 * It compares characters at two shifted positions.
 * @param {number} rowOffset - The vertical shift to apply to row indices.
 * @param {number} colOffset - The horizontal shift to apply to column indices.
 * @returns {number} Returns 1 if the pattern holds for all elements, 0 otherwise.
 */
function verifyPattern(rowOffset, colOffset) {
    // Iterate through each cell of the conceptual matrix.
    for (let currentY = 0; currentY < matrixDimension; ++currentY) {
        for (let currentX = 0; currentX < matrixDimension; ++currentX) {
            // Calculate the first shifted coordinate.
            const firstRowIdx = (currentY + rowOffset) % matrixDimension;
            const firstColIdx = (currentX + colOffset) % matrixDimension;

            // Calculate the second shifted coordinate (transposed relative to the first).
            const secondRowIdx = (currentX + rowOffset) % matrixDimension;
            const secondColIdx = (currentY + colOffset) % matrixDimension;

            // Compare characters at these two positions.
            // If they are not equal, the pattern is broken.
            if (charGrid[firstRowIdx][firstColIdx] !== charGrid[secondRowIdx][secondColIdx]) {
                return 0; // Pattern mismatch found.
            }
        }
    }
    return 1; // Pattern holds true for all positions.
}

let cumulativeSum = 0; // Initialize a variable to accumulate the final result.

// Iterate through possible row shifts (column shift is fixed at 0 for this calculation).
for (let currentShiftValue = 0; currentShiftValue < matrixDimension; ++currentShiftValue) {
    // Call the symmetry verification function.
    // If the pattern holds (returns 1), add matrixDimension to the sum.
    cumulativeSum += verifyPattern(currentShiftValue, 0) * matrixDimension;
}

// Output the final computed sum to the console.
console.log(cumulativeSum);