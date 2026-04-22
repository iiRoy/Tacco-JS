// This function calculates the maximum length of a continuous sequence of a target value (1)
// starting from a given cell (initialRow, initialCol) in a square grid.
// It checks in four predefined directions: right, down-left, down, and down-right.
//
// Parameters:
//   initialRow: The starting row index for sequence checking.
//   initialCol: The starting column index for sequence checking.
//   matrixSize: The dimension (N) of the N x N square grid.
//   binaryMatrix: The 2D array (grid) containing binary values (0 or 1).
//
// Returns:
//   The maximum length of a sequence of the target value found in any of the four directions.
function determineMaxLine(initialRow, initialCol, matrixSize, binaryMatrix) {
    // Define the relative row and column offsets for the four scanning directions.
    // Each object represents a (delta_row, delta_col) vector.
    // Original directions: (0,1), (1,-1), (1,0), (1,1)
    const directionalVectors = [
        { rowChange: 0, colChange: 1 },   // Scan horizontally to the right
        { rowChange: 1, colChange: -1 },  // Scan diagonally down and to the left
        { rowChange: 1, colChange: 0 },   // Scan vertically downwards
        { rowChange: 1, colChange: 1 }    // Scan diagonally down and to the right
    ];

    // The specific value we are looking for to form a sequence.
    const TARGET_SEQUENCE_VALUE = 1;

    // --- Input Validation / Guard Clause ---
    // If the starting coordinates are out of bounds or the starting cell
    // does not contain the target value, no sequence can start here.
    // (While the main loop already filters this, adding it here makes the function self-contained and robust).
    if (initialRow < 0 || initialRow >= matrixSize ||
        initialCol < 0 || initialCol >= matrixSize ||
        binaryMatrix[initialRow][initialCol] !== TARGET_SEQUENCE_VALUE) {
        return 0;
    }

    let currentOverallMaxLength = 0; // Tracks the longest sequence found across all directions.

    // Iterate through each defined scanning direction.
    for (let directionIndex = 0; directionIndex < directionalVectors.length; ++directionIndex) {
        let currentPathLength = 0; // Resets for each new direction.
        const { rowChange, colChange } = directionalVectors[directionIndex];

        // Iterate along the current direction.
        // The loop runs for matrixSize + 1 steps to match the original code's `j <= n` iteration count,
        // allowing checks slightly beyond the grid boundary which are then caught by the boundary checks.
        for (let stepOffset = 0; stepOffset <= matrixSize; ++stepOffset) {
            const evaluatedRow = initialRow + (rowChange * stepOffset);
            const evaluatedCol = initialCol + (colChange * stepOffset);

            // Check if the current position is outside the grid boundaries.
            if (evaluatedRow < 0 || evaluatedRow >= matrixSize ||
                evaluatedCol < 0 || evaluatedCol >= matrixSize) {
                break; // If out of bounds, this sequence path ends.
            }

            // Check if the cell at the current position contains the target value.
            if (binaryMatrix[evaluatedRow][evaluatedCol] !== TARGET_SEQUENCE_VALUE) {
                break; // If the value doesn't match, the sequence is broken.
            }

            // If within bounds and matches the target value, increment the sequence length.
            currentPathLength++;
        }

        // Update the maximum sequence length found so far.
        currentOverallMaxLength = Math.max(currentOverallMaxLength, currentPathLength);
    }

    return currentOverallMaxLength;
}

// --- Main Program Logic ---

// Constant for the standard input file path.
const STD_INPUT_FILE_PATH = '/dev/stdin';

// Read all input data from the standard input stream.
const rawFileData = require('fs').readFileSync(STD_INPUT_FILE_PATH, 'utf8');

// Process the raw input: trim whitespace and split into an array of lines.
let inputLineBuffer = rawFileData.trim().split('\n');

let processedTestCaseCount = 0; // Counter for the number of test cases processed.

// Loop indefinitely to process multiple test cases until a termination condition is met.
while (true) {
    processedTestCaseCount++; // Increment test case counter.

    // Extract the grid dimension (N) for the current test case from the input buffer.
    // Use Number() for explicit type conversion.
    const currentMatrixDimension = Number(inputLineBuffer.shift());

    // Termination condition: if the dimension is 0, exit the loop.
    if (currentMatrixDimension === 0) {
        break;
    }

    // --- Input Validation ---
    // Ensure the grid dimension is a positive integer.
    if (currentMatrixDimension < 1 || isNaN(currentMatrixDimension)) {
        console.error(`Warning: Invalid or non-positive matrix dimension (${currentMatrixDimension}) detected for test case ${processedTestCaseCount}. Skipping this test case.`);
        // To handle potential malformed input, we might need to consume remaining lines for this
        // invalid test case, but for typical competitive programming, we assume well-formed input.
        continue;
    }

    // Initialize an empty 2D array to store the binary grid for the current test case.
    const binaryValueGrid = [];

    // Populate the grid row by row from the input lines.
    for (let rowIndex = 0; rowIndex < currentMatrixDimension; ++rowIndex) {
        // --- Input Robustness Check ---
        // Ensure there are enough lines available in the buffer for the grid data.
        if (inputLineBuffer.length === 0) {
            console.error(`Error: Insufficient input lines for grid data in test case ${processedTestCaseCount}. Expected ${currentMatrixDimension} rows, but ran out of input.`);
            // This is a critical input error; could throw or exit. For now, continue to next test case.
            // This might lead to an incomplete grid being processed.
            break;
        }

        // Take the next line, split it into characters, and convert each character to a number.
        binaryValueGrid[rowIndex] = inputLineBuffer.shift()
                                                   .split('')
                                                   .map(Number);
    }

    let highestSequenceInGrid = 0; // Stores the maximum sequence length found in the current grid.

    // Iterate through every cell in the grid.
    for (let rowScan = 0; rowScan < currentMatrixDimension; ++rowScan) {
        for (let colScan = 0; colScan < currentMatrixDimension; ++colScan) {
            // Only initiate a sequence check if the current cell contains the target value (1).
            // This avoids unnecessary function calls for cells that cannot start a sequence.
            if (binaryValueGrid[rowScan][colScan] === 1) {
                // Call the helper function to find the maximum sequence starting from this cell.
                const sequenceFromCell = determineMaxLine(
                    rowScan,
                    colScan,
                    currentMatrixDimension,
                    binaryValueGrid
                );
                // Update the overall maximum sequence found in the grid.
                highestSequenceInGrid = Math.max(highestSequenceInGrid, sequenceFromCell);
            }
        }
    }

    // Output the result for the current test case.
    console.log(highestSequenceInGrid);
}