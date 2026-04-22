const fileSystemModule = require("fs");


let rawInputLines = fileSystemModule.readFileSync("/dev/stdin", "utf8").split("\n");

let matrixDimension = rawInputLines[0] | 0; // Coerce first line to integer for grid size

let characterGrid = rawInputLines.slice(1); // The rest of the lines form the character grid

/**
 * Evaluates if a specific grid transformation exhibits symmetry.
 * This function determines if, after applying a given row and column translation,
 * the element at (row, col) in the transformed grid is identical to the element
 * at (col, row) in the transformed grid, for all possible original (row, col) pairs.
 *
 * @param {number} rowTranslation - The horizontal shift applied to row indices.
 * @param {number} colTranslation - The vertical shift applied to column indices.
 * @returns {number} Returns 1 if the transformation is perfectly symmetric across all cells, otherwise returns 0.
 */
function isTransformSymmetric( rowTranslation, colTranslation ) {

    for ( let currentRowIdx = 0; currentRowIdx < matrixDimension; ++currentRowIdx ) {
        for ( let currentColIdx = 0; currentColIdx < matrixDimension; ++currentColIdx ) {
            // Compute the first transformed coordinate pair using modulo arithmetic to wrap around the grid.
            const firstTransformedRow = ( currentRowIdx + rowTranslation ) % matrixDimension;
            const firstTransformedCol = ( currentColIdx + colTranslation ) % matrixDimension;

            // Compute the second transformed coordinate pair, with original indices swapped before translation.
            const secondTransformedRow = ( currentColIdx + rowTranslation ) % matrixDimension;
            const secondTransformedCol = ( currentRowIdx + colTranslation ) % matrixDimension;

            // Compare the characters at the two calculated positions.
            // If they are not identical, the current transformation is not symmetric.
            if ( characterGrid[firstTransformedRow][firstTransformedCol] !== characterGrid[secondTransformedRow][secondTransformedCol] ) {
                return 0; // Indicate non-symmetry immediately.
            }
        }
    }
    return 1; // All positions checked and found to be symmetric for this transformation.
}


let symmetricCount = 0; // Accumulator for the total number of symmetric transformations.

// Loop through all possible row translation offsets.
for ( let xOffset = 0; xOffset < matrixDimension; ++xOffset ) {
    // Loop through all possible column translation offsets.
    for ( let yOffset = 0; yOffset < matrixDimension; ++yOffset ) {
        // Call the symmetry checker function for each unique (xOffset, yOffset) pair
        // and add its boolean result (0 or 1) to the running total.
        symmetricCount += isTransformSymmetric( xOffset, yOffset );
    }
}

// Print the final count of transformations that resulted in a symmetric grid.
console.log( symmetricCount );