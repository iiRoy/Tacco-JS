function identifyConflictPositions(valueSequence) {
    // This utility function determines the original indices within a given numeric sequence
    // where elements appear that are part of a set of duplicate values.
    // It is designed to work with single-digit numbers (0-9) as keys.

    if (!Array.isArray(valueSequence) || valueSequence.length === 0) {
        // Guard clause: Return an empty array for invalid or empty input sequences.
        // For the specific puzzle context, sequences are typically non-empty and fixed size.
        return [];
    }

    // Initialize an array to count frequencies of digits 0 through 9.
    // The problem context implies values are single digits, so an array is efficient.
    const digitFrequencies = new Array(10).fill(0);

    // Iterate through the input sequence to populate frequency counts for each digit.
    for (const sequenceElement of valueSequence) {
        const currentNumericValue = Number(sequenceElement); // Ensure the element is treated as a number.

        // Basic validation: Only count values within the expected digit range (0-9).
        // Values outside this range would be ignored or could indicate an input issue.
        if (currentNumericValue >= 0 && currentNumericValue <= 9) {
            digitFrequencies[currentNumericValue]++;
        }
        // No explicit else block for invalid values; they are simply not counted.
    }

    // Identify which specific digit values (e.g., 3, 7) are duplicates
    // by checking which ones appeared two or more times.
    const duplicateValueKeys = [];
    for (let digitKey = 0; digitKey < digitFrequencies.length; digitKey++) {
        if (digitFrequencies[digitKey] >= 2) {
            duplicateValueKeys.push(digitKey);
        }
    }

    // If no duplicate values were found in the sequence, there are no conflict positions.
    if (duplicateValueKeys.length === 0) {
        return [];
    }

    // Now, find all original indices where any of these duplicate values occur.
    const conflictingElementIndices = [];
    valueSequence.forEach((elementValue, elementIndex) => {
        // Check if the current element's value is among the identified duplicates.
        if (duplicateValueKeys.includes(Number(elementValue))) {
            conflictingElementIndices.push(elementIndex);
        }
    });

    return conflictingElementIndices;
}

// --- Main Program Execution ---

const fileSystem = require('fs'); // Standard Node.js module for file operations.

// Define constants for grid dimensions to improve readability and maintainability.
const GRID_DIMENSION = 9;
const BLOCK_DIMENSION = 3; // For 3x3 Sudoku blocks.

/**
 * Helper function to extract all values and their global coordinates from a 3x3 block
 * within the main Sudoku grid.
 * @param {Array<Array<number>>} grid - The 9x9 Sudoku grid.
 * @param {number} blockRowIndex - The 0-indexed row position of the 3x3 block (0, 1, or 2).
 * @param {number} blockColIndex - The 0-indexed column position of the 3x3 block (0, 1, or 2).
 * @returns {{values: Array<number>, coords: Array<Array<number>>}} An object containing
 *          an array of values in the block and an array of their corresponding [row, col] coordinates.
 */
function getBlockValuesAndCoordinates(grid, blockRowIndex, blockColIndex) {
    const blockValues = [];
    const blockGlobalCoordinates = [];

    // Calculate the starting row and column for the current 3x3 block.
    const startGlobalRow = blockRowIndex * BLOCK_DIMENSION;
    const startGlobalCol = blockColIndex * BLOCK_DIMENSION;

    for (let localRow = 0; localRow < BLOCK_DIMENSION; localRow++) {
        for (let localCol = 0; localCol < BLOCK_DIMENSION; localCol++) {
            const currentGlobalRow = startGlobalRow + localRow;
            const currentGlobalCol = startGlobalCol + localCol;

            blockValues.push(grid[currentGlobalRow][currentGlobalCol]);
            blockGlobalCoordinates.push([currentGlobalRow, currentGlobalCol]);
        }
    }
    return { values: blockValues, coords: blockGlobalCoordinates };
}

let rawInputContent;
try {
    // Attempt to read the entire input from standard input as a UTF-8 string.
    rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
} catch (error) {
    // If file reading fails, log an error and exit the process.
    console.error("Error: Failed to read input from /dev/stdin. Details:", error.message);
    process.exit(1); // Terminate with an error code.
}

// Process the raw input: trim whitespace and split into individual lines.
let processedInputLines = rawInputContent.trim().split('\n');
let outputAccumulator = ''; // Buffer to collect the formatted output for all puzzles.

// The first line of input indicates the number of puzzles to solve.
const numberOfPuzzles = parseInt(processedInputLines.shift(), 10);

// Input validation for the number of puzzles.
if (isNaN(numberOfPuzzles) || numberOfPuzzles < 0) {
    console.error("Error: Invalid or missing number of test cases in input.");
    process.exit(1);
}

// Main loop to process each puzzle instance.
for (let puzzleCounter = 0; puzzleCounter < numberOfPuzzles; puzzleCounter++) {
    const currentPuzzleGrid = []; // Stores the 9x9 grid of numbers for the current puzzle.
    // This grid will be used to mark cells involved in conflicts.
    // A value of 0 means no conflict detected for that cell, 1 or more indicates a conflict.
    const conflictTrackerGrid = Array.from({ length: GRID_DIMENSION },
                                            () => new Array(GRID_DIMENSION).fill(0));

    // Read the 9x9 grid data for the current puzzle from input lines.
    for (let rowReadIndex = 0; rowReadIndex < GRID_DIMENSION; rowReadIndex++) {
        const gridRowDataString = processedInputLines.shift();
        if (!gridRowDataString) {
             // If we run out of input lines prematurely, it's an error.
             console.error(`Error: Premature end of input while reading grid data for puzzle ${puzzleCounter + 1}.`);
             process.exit(1);
        }
        // Split the row string by spaces and convert each part to an integer.
        const parsedNumericRow = gridRowDataString.split(' ').map(strVal => parseInt(strVal, 10));
        currentPuzzleGrid.push(parsedNumericRow);
    }

    // Analyze each row, column, and 3x3 block for duplicate values.
    // The outer loop iterates 9 times, once for each row, column, and block type.
    for (let iterationIndex = 0; iterationIndex < GRID_DIMENSION; iterationIndex++) {
        // --- 1. Analyze Rows for Conflicts ---
        const currentRowValues = currentPuzzleGrid[iterationIndex];
        const rowConflictColumnIndices = identifyConflictPositions(currentRowValues);
        // Increment the conflict tracker for each cell identified as conflicting in this row.
        rowConflictColumnIndices.forEach(colIndexToMark => {
            conflictTrackerGrid[iterationIndex][colIndexToMark]++;
        });

        // --- 2. Analyze Columns for Conflicts ---
        const currentColumnValues = [];
        for (let rowScanIndex = 0; rowScanIndex < GRID_DIMENSION; rowScanIndex++) {
            currentColumnValues.push(currentPuzzleGrid[rowScanIndex][iterationIndex]);
        }
        const colConflictRowIndices = identifyConflictPositions(currentColumnValues);
        // Increment the conflict tracker for each cell identified as conflicting in this column.
        colConflictRowIndices.forEach(rowIndexToMark => {
            conflictTrackerGrid[rowIndexToMark][iterationIndex]++;
        });

        // --- 3. Analyze 3x3 Blocks for Conflicts ---
        // Determine the 0-indexed block coordinates (0-2 for row and col) based on the iterationIndex.
        const blockGridRowOffset = Math.floor(iterationIndex / BLOCK_DIMENSION);
        const blockGridColOffset = iterationIndex % BLOCK_DIMENSION;

        // Extract values and their global coordinates from the current 3x3 block.
        const { values: blockCellValues, coords: blockCellGlobalCoordinates } =
            getBlockValuesAndCoordinates(currentPuzzleGrid, blockGridRowOffset, blockGridColOffset);

        const blockConflictLocalIndices = identifyConflictPositions(blockCellValues);
        // Increment the conflict tracker for each cell identified as conflicting in this block.
        blockConflictLocalIndices.forEach(localBlockPosition => {
            // Use the stored global coordinates to mark the correct cell in the tracker grid.
            const [globalConflictRow, globalConflictCol] = blockCellGlobalCoordinates[localBlockPosition];
            conflictTrackerGrid[globalConflictRow][globalConflictCol]++;
        });
    }

    // Format the final output grid based on the conflict tracker.
    const formattedGridOutputRows = [];
    for (let r = 0; r < GRID_DIMENSION; r++) {
        const currentRowFormattedCells = [];
        for (let c = 0; c < GRID_DIMENSION; c++) {
            const cellOriginalValue = currentPuzzleGrid[r][c];
            // If the conflict tracker for this cell is 1 or more, it means its value
            // was part of a duplicate set in at least one of its row, column, or block checks.
            const formattedCellString = (conflictTrackerGrid[r][c] >= 1)
                                  ? `*${cellOriginalValue}` // Mark with an asterisk if conflicting.
                                  : ` ${cellOriginalValue}`; // Prepend with a space for alignment if not conflicting.
            currentRowFormattedCells.push(formattedCellString);
        }
        // Join the cells of the current row directly, without any separators.
        formattedGridOutputRows.push(currentRowFormattedCells.join(''));
    }

    // Append the formatted grid for the current puzzle to the accumulator.
    // Each grid is separated by two newlines.
    outputAccumulator += formattedGridOutputRows.join('\n') + '\n\n';
}

// Print the accumulated output for all puzzles, removing any trailing newlines
// that might occur after the very last puzzle block.
console.log(outputAccumulator.trim());