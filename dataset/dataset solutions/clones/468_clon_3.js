// This module is designed to solve a 2D pattern matching problem,
// where a smaller "pattern" grid (currentPatternGrid) is searched within a
// larger "main" grid (mainSearchGrid). The pattern can be rotated 90 degrees
// clockwise multiple times. The goal is to find the 1-indexed coordinates
// of the top-left corner of the pattern's first non-wildcard element
// that results in the lexicographically smallest (row, then column) match.

// --- Helper function: Rotates a 2D square matrix 90 degrees clockwise ---
// Given a square 2D array (matrix), this function generates and returns
// a new 2D array that represents the input matrix after a 90-degree
// clockwise rotation. It ensures that the original matrix is not modified.
function spinGridClockwise(inputMatrix) {
    // Perform basic validation to ensure the input is an array and not empty.
    // If the input is invalid, an empty array is returned to prevent errors
    // in subsequent operations, assuming graceful handling by the caller.
    if (!Array.isArray(inputMatrix) || inputMatrix.length === 0 || !Array.isArray(inputMatrix[0])) {
        console.warn("Warning: Attempted to rotate an invalid or empty matrix.");
        return [];
    }

    // Determine the dimension of the square matrix.
    // It's assumed that `inputMatrix` is always a square matrix (N x N).
    const matrixDimension = inputMatrix.length;

    // Initialize a new matrix of the same dimensions to store the rotated result.
    // Each element is pre-filled with a placeholder (e.g., 0) before actual values are assigned.
    let rotatedOutputMatrix = Array.from({ length: matrixDimension }, () => new Array(matrixDimension).fill(0));

    // Iterate over each element of the original matrix.
    // The transformation rule for a 90-degree clockwise rotation (from (r, c) to (r', c')) is:
    // r' = c
    // c' = (N - 1) - r
    for (let originalRowIdx = 0; originalRowIdx < matrixDimension; originalRowIdx++) {
        for (let originalColIdx = 0; originalColIdx < matrixDimension; originalColIdx++) {
            // Calculate the new row and column indices for the current element in the rotated matrix.
            const newRowPosition = originalColIdx;
            const newColPosition = (matrixDimension - 1) - originalRowIdx;

            // Assign the value from the original matrix to its new position in the rotated matrix.
            rotatedOutputMatrix[newRowPosition][newColPosition] = inputMatrix[originalRowIdx][originalColIdx];
        }
    }

    // Return the newly created and populated rotated matrix.
    return rotatedOutputMatrix;
}

// --- Helper function: Compares a pattern subgrid against a section of the main grid ---
// This function checks if the `currentPatternGrid` matches a specific region
// within the `mainSearchGrid`, starting at `rowOffset` and `colOffset`.
// A match occurs if all non-wildcard (-1) elements of the pattern align with
// identical values in the main grid.
// It returns `false` if a mismatch is found or if the pattern extends out of bounds.
// If a full match is found, it returns an array `[relativeRow, relativeCol]`
// indicating the 0-indexed position within the pattern of the *first* non-wildcard element.
function compareSubgrid(rowOffset, colOffset) {
    // Variable to store the 0-indexed relative coordinates [y, x] of the first
    // non-wildcard element encountered in the pattern that successfully matched.
    let firstSignificantElementRelativePos = null;

    // Iterate through each cell of the `currentPatternGrid`.
    // `patternSize` is a global variable representing the dimension 'm'.
    for (let patternRowIdx = 0; patternRowIdx < patternSize; patternRowIdx++) {
        for (let patternColIdx = 0; patternColIdx < patternSize; patternColIdx++) {
            const patternCellContent = currentPatternGrid[patternRowIdx][patternColIdx];

            // If the pattern cell contains a wildcard value (-1), it can match any value
            // in the main grid. So, we skip this cell and move to the next.
            if (patternCellContent === -1) {
                continue;
            }

            // Calculate the absolute coordinates in the `mainSearchGrid` corresponding
            // to the current pattern cell, based on the provided `rowOffset` and `colOffset`.
            const mainGridTargetRow = rowOffset + patternRowIdx;
            const mainGridTargetCol = colOffset + patternColIdx;

            // Guard clause: Check if the calculated target position in the main grid
            // falls outside its boundaries. If so, the pattern cannot fully fit here.
            // `gridRowsCount` is a global variable representing the dimension 'n'.
            if (mainGridTargetRow < 0 || mainGridTargetRow >= gridRowsCount ||
                mainGridTargetCol < 0 || mainGridTargetCol >= gridRowsCount) {
                return false; // Pattern extends beyond main grid boundaries, thus no match.
            }

            // If this is the very first non-wildcard element we've encountered in the pattern
            // during this comparison, record its relative position within the pattern itself.
            if (firstSignificantElementRelativePos === null) {
                firstSignificantElementRelativePos = [patternRowIdx, patternColIdx];
            }

            // Compare the non-wildcard pattern cell's value with the corresponding
            // cell's value in the `mainSearchGrid`.
            if (mainSearchGrid[mainGridTargetRow][mainGridTargetCol] !== patternCellContent) {
                return false; // Mismatch found, the pattern does not fit at this offset.
            }
        }
    }

    // If the loops complete without returning `false`, it means all non-wildcard
    // pattern elements successfully matched. Return the recorded position of the
    // first significant element relative to the pattern's top-left corner.
    return firstSignificantElementRelativePos;
}

// --- Main Program Execution Flow ---
// Read all input data from standard input synchronously. This approach is common
// in competitive programming environments where input is provided as a single block.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into an array of individual lines.
let inputLines = rawInputData.trim().split('\n');

// Define constants for initial minimum coordinate values and the "NA" output condition.
// These values are used to track the best match and determine if no match was found.
const INITIAL_MIN_COORDINATE_VALUE = 101; // A value guaranteed to be larger than any valid 1-indexed coordinate (1-100).
const NO_MATCH_INDICATION_STRING = "101101"; // Concatenation of initial min coordinates, used for output check.

// Declare global variables that will hold the current grid dimensions and grid data.
// These are updated for each test case within the main processing loop.
let gridRowsCount;         // Corresponds to 'n', the number of rows/columns in the main grid.
let patternSize;           // Corresponds to 'm', the number of rows/columns in the pattern grid.
let mainSearchGrid = [];   // The larger grid where the pattern is searched.
let currentPatternGrid = []; // The pattern grid, which undergoes rotations.

// Start the main processing loop. This loop continues to process test cases
// until a specific termination condition (n=0, m=0) is met.
while (true) {
    // Robustness check: If there are no more lines in the input, it's an unexpected end.
    if (inputLines.length === 0) {
        console.error("Error: Unexpected end of input data while expecting dimensions.");
        break; // Exit the loop if input is exhausted prematurely.
    }

    // Read the first line of the current test case, which contains 'n' and 'm'.
    // `shift()` removes the line from `inputLines` and returns it.
    const dimensionsLine = inputLines.shift();
    const dimensionsArray = dimensionsLine.split(' ').map(Number);

    // Extract the main grid size (n) and pattern grid size (m).
    gridRowsCount = dimensionsArray[0];
    patternSize = dimensionsArray[1];

    // Check for the termination condition: if both n and m are 0, stop processing.
    if (gridRowsCount === 0 && patternSize === 0) {
        break;
    }

    // Initialize/clear the grid arrays for the new test case.
    mainSearchGrid = [];
    currentPatternGrid = [];

    // Read the `mainSearchGrid` (n x n) from the input lines.
    for (let rowIdx = 0; rowIdx < gridRowsCount; rowIdx++) {
        if (inputLines.length === 0) {
            console.error(`Error: Not enough lines for main grid (expected ${gridRowsCount}, got ${rowIdx}).`);
            // Depending on problem constraints, might `break` or `throw`. Here, we'll break.
            break;
        }
        const valuesInRow = inputLines.shift().split(' ').map(Number);
        mainSearchGrid.push(valuesInRow);
    }

    // Read the `currentPatternGrid` (m x m) from the input lines.
    for (let rowIdx = 0; rowIdx < patternSize; rowIdx++) {
        if (inputLines.length === 0) {
            console.error(`Error: Not enough lines for pattern grid (expected ${patternSize}, got ${rowIdx}).`);
            break;
        }
        const valuesInRow = inputLines.shift().split(' ').map(Number);
        currentPatternGrid.push(valuesInRow);
    }

    // Initialize `optimalMatchPos` to track the best match found.
    // It stores the 1-indexed (row, col) coordinates of the first significant
    // element of the pattern that results in the lexicographically smallest match.
    // Initialized to values larger than any possible valid coordinate.
    let optimalMatchPos = [INITIAL_MIN_COORDINATE_VALUE, INITIAL_MIN_COORDINATE_VALUE];

    // Optimization/Guard: If the pattern grid is larger than the main grid,
    // no match is possible. We can skip the search loops.
    if (patternSize > gridRowsCount) {
        // The `optimalMatchPos` will remain at its initial value,
        // which will correctly trigger "NA" output later.
        // No need to explicitly print "NA" here, as the final `console.log` handles it.
    } else {
        // Iterate through four possible rotations of the pattern (0, 90, 180, 270 degrees).
        for (let rotationIndex = 0; rotationIndex < 4; rotationIndex++) {
            // Determine the maximum valid row and column offsets for the pattern's
            // top-left corner within the main grid. This ensures the pattern
            // does not extend beyond the main grid's boundaries.
            const maxAllowedRowOffset = gridRowsCount - patternSize;
            const maxAllowedColOffset = gridRowsCount - patternSize;

            // Iterate through all possible top-left placement positions (currentSearchRow, currentSearchCol)
            // for the pattern within the `mainSearchGrid`.
            for (let currentSearchRow = 0; currentSearchRow <= maxAllowedRowOffset; currentSearchRow++) {
                for (let currentSearchCol = 0; currentSearchCol <= maxAllowedColOffset; currentSearchCol++) {
                    // Attempt to find a match at the current offset using the `compareSubgrid` function.
                    // `matchResult` will be `false` on mismatch, or `[relativeRow, relativeCol]` on success.
                    const matchResult = compareSubgrid(currentSearchRow, currentSearchCol);

                    // If `matchResult` is not `false`, a valid match has been found.
                    if (matchResult !== false) {
                        // Calculate the 1-indexed absolute coordinates of the top-left corner
                        // of the pattern in the main grid.
                        const patternAbsoluteTopLeftRow = currentSearchRow + 1;
                        const patternAbsoluteTopLeftCol = currentSearchCol + 1;

                        // Calculate the 1-indexed absolute coordinates of the *first significant element*
                        // of the pattern in the main grid. This is what we need to minimize.
                        const firstSignificantElementActualRow = patternAbsoluteTopLeftRow + matchResult[0];
                        const firstSignificantElementActualCol = patternAbsoluteTopLeftCol + matchResult[1];

                        // Update `optimalMatchPos` if the current match is better.
                        // The criteria for "better" is:
                        // 1. Smaller row coordinate.
                        // 2. If rows are equal, smaller column coordinate.
                        if (firstSignificantElementActualRow < optimalMatchPos[0]) {
                            // This match has a smaller row, so it's the new best.
                            optimalMatchPos[0] = firstSignificantElementActualRow;
                            optimalMatchPos[1] = firstSignificantElementActualCol;
                        } else if (firstSignificantElementActualRow === optimalMatchPos[0]) {
                            // Rows are the same, check columns.
                            if (firstSignificantElementActualCol < optimalMatchPos[1]) {
                                // This match has a smaller column in the same best row.
                                optimalMatchPos[0] = firstSignificantElementActualRow;
                                optimalMatchPos[1] = firstSignificantElementActualCol;
                            }
                        }
                    }
                }
            }
            // After checking all possible positions for the current rotation,
            // rotate the pattern grid 90 degrees clockwise for the next iteration.
            currentPatternGrid = spinGridClockwise(currentPatternGrid);
        }
    }

    // Format and output the result for the current test case.
    // If `optimalMatchPos` is still at its initial `[101, 101]` value, it means no match was found.
    // The original problem uses string concatenation ("101"+"101") to check this condition.
    const finalOutputString = (optimalMatchPos[0].toString() + optimalMatchPos[1].toString() === NO_MATCH_INDICATION_STRING) ?
        "NA" : `${optimalMatchPos[1]} ${optimalMatchPos[0]}`; // Output format is Col then Row (1-indexed).

    console.log(finalOutputString);
}