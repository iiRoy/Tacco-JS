// This script analyzes a square character matrix to count how many distinct
// row shifts result in a diagonally symmetric matrix. The problem context
// implies that if a matrix is symmetric for a given row shift and zero column shift,
// it will also be symmetric for that same row shift and any column shift.

// Load the Node.js file system module for reading input.
const fileSystemInterface = require('fs');

/**
 * Computes a modular index, ensuring the result is always non-negative.
 * JavaScript's '%' operator can return negative results for negative dividends,
 * which is undesirable for array indexing.
 * @param {number} value - The number to apply modulo to.
 * @param {number} modulus - The modulus. Must be positive.
 * @returns {number} The positive modular index.
 */
const getPositiveModulo = (value, modulus) => {
    return (value % modulus + modulus) % modulus;
};

// Read all data from standard input ('/dev/stdin') as a UTF-8 string.
let rawInputContent = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

// Split the content into an array of strings, one for each line.
let inputLineArray = rawInputContent.split('\n');

// The first line contains the dimension (N) of the N x N character matrix.
// Use Number.parseInt with radix 10 for explicit integer conversion.
const gridDimension = Number.parseInt(inputLineArray[0], 10);

// Implement a basic guard clause for invalid dimension input.
if (Number.isNaN(gridDimension) || gridDimension <= 0) {
    console.error("Error: Provided matrix dimension is invalid or not positive.");
    process.exit(1); // Terminate execution with an error code.
}

// Extract the character grid data from the remaining lines.
// Filter out any potential empty lines that might arise from trailing newlines in the input.
const charMatrix = inputLineArray.slice(1)
                                 .filter(line => line.length > 0 && line.length === gridDimension);

// Another validation: Ensure the number of rows in the actual grid matches the declared dimension.
if (charMatrix.length !== gridDimension) {
    console.error(`Error: Expected ${gridDimension} rows, but found ${charMatrix.length}.`);
    process.exit(1);
}

/**
 * Determines if a square character matrix becomes diagonally symmetric after
 * applying specified row and column shifts.
 *
 * Diagonal symmetry means that for every cell (r, c), its character is equal to
 * the character at the mirrored position (c, r).
 * This function checks this property on a *shifted* version of the matrix.
 *
 * @param {number} currentRowsOffset - The number of positions to shift rows circularly.
 * @param {number} currentColsOffset - The number of positions to shift columns circularly.
 * @returns {boolean} True if the matrix is symmetric after shifts, false otherwise.
 */
const checkShiftedSymmetry = (currentRowsOffset, currentColsOffset) => {
    // Iterate through all possible original row and column indices (from 0 to N-1).
    for (let originalRowIdx = 0; originalRowIdx < gridDimension; ++originalRowIdx) {
        for (let originalColIdx = 0; originalColIdx < gridDimension; ++originalColIdx) {

            // Calculate the effective row and column for the first cell (originalRowIdx, originalColIdx)
            // after applying the shifts and wrapping around the matrix boundaries.
            const effectiveRowForFirst = getPositiveModulo(originalRowIdx + currentRowsOffset, gridDimension);
            const effectiveColForFirst = getPositiveModulo(originalColIdx + currentColsOffset, gridDimension);

            // Calculate the effective row and column for the second cell (originalColIdx, originalRowIdx)
            // which is the symmetric counterpart, after applying the shifts.
            const effectiveRowForSecond = getPositiveModulo(originalColIdx + currentRowsOffset, gridDimension);
            const effectiveColForSecond = getPositiveModulo(originalRowIdx + currentColsOffset, gridDimension);

            // Retrieve the characters at these two positions.
            const characterAtFirstLocation = charMatrix[effectiveRowForFirst][effectiveColForFirst];
            const characterAtSecondLocation = charMatrix[effectiveRowForSecond][effectiveColForSecond];

            // If the characters do not match, the matrix is not symmetric for these shifts.
            if (characterAtFirstLocation !== characterAtSecondLocation) {
                return false; // Immediately return false as soon as an asymmetry is found.
            }
        }
    }
    return true; // If the loops complete, all positions are symmetric.
};

// Initialize a variable to accumulate the total count of symmetric configurations.
let totalSymmetricShiftCombinations = 0;

// Iterate through all possible row shifts.
// The problem statement implies that if a matrix is symmetric with a given row shift
// and *zero* column shift, it remains symmetric for that same row shift with *any*
// column shift (0 to N-1). This is why we only test colShift = 0 and multiply by N.
for (let currentRowShiftCandidate = 0; currentRowShiftCandidate < gridDimension; ++currentRowShiftCandidate) {
    // Test for symmetry with the current row shift and a zero column shift.
    if (checkShiftedSymmetry(currentRowShiftCandidate, 0)) {
        // If it's symmetric, it means all 'gridDimension' column shifts for this
        // particular row shift will also result in a symmetric matrix.
        totalSymmetricShiftCombinations += gridDimension;
    }
}

// Output the final computed total.
console.log(totalSymmetricShiftCombinations);