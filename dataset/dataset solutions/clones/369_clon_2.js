/*
 * This JavaScript module is designed to analyze 9x9 grids, typically representing Sudoku puzzles.
 * It identifies and marks numbers that appear as duplicates within rows, columns, or 3x3 subgrids.
 * The output grid will have an asterisk prepended to any number found to be a duplicate.
 */

/**
 * Scans a numerical array to pinpoint the original indices of any values
 * that occur two or more times within that array. This is useful for
 * detecting violations in number constraints, like those in Sudoku.
 *
 * @param {Array<number>} numericalSequence The array of numbers to be examined.
 *                                          Assumed to contain single-digit numbers (0-9).
 * @returns {Array<number>} An array of indices from the input `numericalSequence`.
 *                          Each index corresponds to a number that was part of a duplicate set.
 */
function FindDuplicatesIndices(numericalSequence) {
    // A frequency array to tally occurrences of digits from 0 to 9.
    // Initialized to all zeros.
    const digitOccurrenceCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Increment the count for each number encountered in the input sequence.
    numericalSequence.forEach(function (currentValue) {
        digitOccurrenceCounts[Number(currentValue)]++;
    });

    // Identify which specific digits have a count of two or more.
    const repeatedNumericValues = [];
    digitOccurrenceCounts.forEach(function (countOfValue, valueDigit) {
        if (countOfValue >= 2) {
            repeatedNumericValues.push(valueDigit);
        }
    });

    // Now, find the original positions (indices) in the input `numericalSequence`
    // where these repeated numeric values are located.
    const identifiedProblematicPositions = [];
    numericalSequence.forEach(function (valueInSequence, sequencePosition) {
        if (repeatedNumericValues.indexOf(valueInSequence) !== -1) {
            identifiedProblematicPositions.push(sequencePosition);
        }
    });

    return identifiedProblematicPositions;
}

// --- Main Application Flow ---

// Read all input data from standard input.
// Using 'node:fs' for explicit Node.js built-in module access.
const allInputContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Clean up input: remove leading/trailing whitespace and split into an array of lines.
const inputDataLines = allInputContent.trim().split("\n");

// The very first line of input specifies how many test cases follow.
const totalNumberOfTestCases = parseInt(inputDataLines.shift());

// Iterate through each test case provided in the input.
for (let testCaseIterator = 0; testCaseIterator < totalNumberOfTestCases; testCaseIterator++) {

    // `puzzleMatrix` will store the 9x9 grid of numbers for the current test case.
    let puzzleMatrix = [];
    // `errorTrackingMatrix` will store flags indicating duplicate values at each cell.
    // A value of 1 or more means a duplicate was detected for that cell.
    let errorTrackingMatrix = [];

    // Initialize the puzzle matrix and the error tracking matrix for a 9x9 grid.
    for (let rowInitializationIndex = 0; rowInitializationIndex < 9; rowInitializationIndex++) {
        // Parse the current line of input into an array of numbers.
        const rowInputValues = inputDataLines.shift().split(" ").map(Number);
        puzzleMatrix.push(rowInputValues);
        // Each cell in the error tracking matrix starts at 0 (no errors).
        errorTrackingMatrix.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    // --- Phase 1: Check for duplicates within each row of the grid ---
    for (let currentRowScanIndex = 0; currentRowScanIndex < 9; currentRowScanIndex++) {
        // Find indices of numbers that are duplicated in the current row.
        const rowDuplicateIndices = FindDuplicatesIndices(puzzleMatrix[currentRowScanIndex]);
        // For each identified duplicate, mark its position in the error tracking matrix.
        rowDuplicateIndices.forEach(function (problematicValueIndex) {
            errorTrackingMatrix[currentRowScanIndex][problematicValueIndex]++;
        });
    }

    // --- Phase 2: Check for duplicates within each column of the grid ---
    for (let currentColScanIndex = 0; currentColScanIndex < 9; currentColScanIndex++) {
        // Construct a temporary array representing the current column.
        const temporaryColumnData = [];
        for (let rowIndexForColumn = 0; rowIndexForColumn < 9; rowIndexForColumn++) {
            temporaryColumnData.push(puzzleMatrix[rowIndexForColumn][currentColScanIndex]);
        }
        // Find indices of numbers that are duplicated in this temporary column.
        const columnDuplicateIndices = FindDuplicatesIndices(temporaryColumnData);
        // For each identified duplicate, mark its corresponding grid position.
        columnDuplicateIndices.forEach(function (problematicValueIndex) {
            errorTrackingMatrix[problematicValueIndex][currentColScanIndex]++;
        });
    }

    // --- Phase 3: Check for duplicates within each 3x3 subgrid (block) ---
    // Iterate through the 3 major rows of 3x3 blocks.
    for (let blockYCoordinate = 0; blockYCoordinate < 3; blockYCoordinate++) {
        // Iterate through the 3 major columns of 3x3 blocks.
        for (let blockXCoordinate = 0; blockXCoordinate < 3; blockXCoordinate++) {
            // Determine the top-left corner coordinates of the current 3x3 block.
            const blockStartingRow = blockYCoordinate * 3;
            const blockStartingColumn = blockXCoordinate * 3;

            // Define the grid coordinates for all 9 cells within this 3x3 block.
            const blockCellGlobalCoordinates = [
                [blockStartingRow + 0, blockStartingColumn + 0], [blockStartingRow + 0, blockStartingColumn + 1], [blockStartingRow + 0, blockStartingColumn + 2],
                [blockStartingRow + 1, blockStartingColumn + 0], [blockStartingRow + 1, blockStartingColumn + 1], [blockStartingRow + 1, blockStartingColumn + 2],
                [blockStartingRow + 2, blockStartingColumn + 0], [blockStartingRow + 2, blockStartingColumn + 1], [blockStartingRow + 2, blockStartingColumn + 2]
            ];

            // Extract the actual numeric values for the cells in the current block.
            const blockCellValues = [];
            blockCellGlobalCoordinates.forEach(function (gridCoordinatePair) {
                blockCellValues.push(puzzleMatrix[gridCoordinatePair[0]][gridCoordinatePair[1]]);
            });

            // Find indices of numbers that are duplicated within this block's values.
            const blockDuplicateIndices = FindDuplicatesIndices(blockCellValues);
            // Mark the corresponding global grid positions in the error tracking matrix.
            blockDuplicateIndices.forEach(function (localDuplicateIndex) {
                const originalGridRow = blockCellGlobalCoordinates[localDuplicateIndex][0];
                const originalGridCol = blockCellGlobalCoordinates[localDuplicateIndex][1];
                errorTrackingMatrix[originalGridRow][originalGridCol]++;
            });
        }
    }

    // --- Final Output Formatting ---
    // Iterate through the `puzzleMatrix` to apply formatting based on `errorTrackingMatrix`.
    puzzleMatrix.forEach(function (currentOutputRow, outputRowIndex) {
        currentOutputRow.forEach(function (cellContent, outputColIndex) {
            // If the cell at `[outputRowIndex][outputColIndex]` has been marked as a duplicate
            // in any check (row, column, or block), prepend an asterisk.
            // Otherwise, prepend a space for consistent alignment.
            puzzleMatrix[outputRowIndex][outputColIndex] =
                (errorTrackingMatrix[outputRowIndex][outputColIndex] >= 1) ? ("*" + cellContent) : (" " + cellContent);
        });
    });

    // Print the formatted grid to standard output.
    // Rows are joined by newlines, and commas (from default array.join()) are removed.
    console.log(puzzleMatrix.join("\n").replace(/,/g, ""));
}