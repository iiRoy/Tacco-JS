function findDuplicateIndices(dataValues) {
    const MAX_POSSIBLE_VALUE_INDEX = 9; // Corresponds to Sudoku numbers 0-9 (0 if present, 1-9 for actual numbers)
    let valueCounts = new Array(MAX_POSSIBLE_VALUE_INDEX + 1).fill(0); // Array to hold counts for indices 0 through 9

    // Iterate through the input data to count occurrences of each number
    for (let k = 0; k < dataValues.length; k++) {
        const currentVal = Number(dataValues[k]); // Explicit conversion to number
        // Only count values that fall within the expected index range (0-9)
        if (currentVal >= 0 && currentVal <= MAX_POSSIBLE_VALUE_INDEX) {
            valueCounts[currentVal]++;
        }
    }

    let problematicNumbers = []; // Stores numbers that appear two or more times
    // Identify which numbers are duplicates
    for (let val = 0; val <= MAX_POSSIBLE_VALUE_INDEX; val++) {
        if (valueCounts[val] >= 2) {
            problematicNumbers.push(val);
        }
    }

    let violatingPositions = []; // Stores the original indices of duplicate numbers
    // Find the positions in the original array where problematic numbers occur
    for (let index = 0; index < dataValues.length; index++) {
        const elementAsNumber = Number(dataValues[index]);
        if (problematicNumbers.includes(elementAsNumber)) {
            violatingPositions.push(index);
        }
    }

    return violatingPositions;
}

const fs = require('fs');
const SUDOKU_GRID_DIMENSION = 9;
const SUBGRID_BLOCK_DIMENSION = 3;

// Helper function to create and initialize a 2D array
function createInitializedGrid(rows, cols, initialValue = 0) {
    let grid = [];
    for (let r = 0; r < rows; r++) {
        grid.push(new Array(cols).fill(initialValue));
    }
    return grid;
}

let rawInputLines = fs.readFileSync('/dev/stdin', 'utf8').trim().split("\n");

let numTestCases = Number(rawInputLines.shift()); // Extract the number of test cases

for (let caseIndex = 0; caseIndex < numTestCases; caseIndex++) {
    let sudokuGrid = []; // Stores the current 9x9 Sudoku grid
    // violationFlags grid tracks which cells are part of a violation (row, column, or block)
    let violationFlags = createInitializedGrid(SUDOKU_GRID_DIMENSION, SUDOKU_GRID_DIMENSION, 0);

    // Read and parse the 9x9 Sudoku grid for the current test case
    for (let rowIdx = 0; rowIdx < SUDOKU_GRID_DIMENSION; rowIdx++) {
        let lineValues = rawInputLines.shift().split(" ").map(Number);
        sudokuGrid.push(lineValues);
    }

    // A reusable function to apply violation markers based on a set of values and their grid coordinates
    const applyViolationMarkers = (valuesToCheck, markerGrid, coordinateMapper) => {
        const detectedViolationIndices = findDuplicateIndices(valuesToCheck);
        detectedViolationIndices.forEach(localIndex => {
            const [gridRow, gridCol] = coordinateMapper(localIndex); // Map local index to global grid coordinates
            markerGrid[gridRow][gridCol]++; // Increment violation count for this cell
        });
    };

    // Validate each row for duplicate numbers
    for (let r = 0; r < SUDOKU_GRID_DIMENSION; r++) {
        applyViolationMarkers(sudokuGrid[r], violationFlags, (idx) => [r, idx]);
    }

    // Validate each column for duplicate numbers
    for (let c = 0; c < SUDOKU_GRID_DIMENSION; c++) {
        let currentColumnValues = [];
        for (let r = 0; r < SUDOKU_GRID_DIMENSION; r++) {
            currentColumnValues.push(sudokuGrid[r][c]);
        }
        applyViolationMarkers(currentColumnValues, violationFlags, (idx) => [idx, c]);
    }

    // Validate each 3x3 subgrid (block) for duplicate numbers
    for (let blockRowOffset = 0; blockRowOffset < SUBGRID_BLOCK_DIMENSION; blockRowOffset++) {
        for (let blockColOffset = 0; blockColOffset < SUBGRID_BLOCK_DIMENSION; blockColOffset++) {
            const startRow = blockRowOffset * SUBGRID_BLOCK_DIMENSION;
            const startCol = blockColOffset * SUBGRID_BLOCK_DIMENSION;

            let subgridCellCoordinates = []; // Stores global coordinates for cells in the current block
            let subgridCellValues = [];     // Stores values for cells in the current block

            // Extract values and coordinates for the current 3x3 block
            for (let rInner = 0; rInner < SUBGRID_BLOCK_DIMENSION; rInner++) {
                for (let cInner = 0; cInner < SUBGRID_BLOCK_DIMENSION; cInner++) {
                    const actualRow = startRow + rInner;
                    const actualCol = startCol + cInner;
                    subgridCellCoordinates.push([actualRow, actualCol]);
                    subgridCellValues.push(sudokuGrid[actualRow][actualCol]);
                }
            }
            applyViolationMarkers(subgridCellValues, violationFlags, (idx) => subgridCellCoordinates[idx]);
        }
    }

    // Format the output grid: prepend "*" to violating cells, " " otherwise
    let finalOutputLines = [];
    sudokuGrid.forEach((gridRow, rIndex) => {
        let formattedCellsInRow = [];
        gridRow.forEach((cellValue, cIndex) => {
            const prefixChar = (violationFlags[rIndex][cIndex] > 0) ? "*" : " ";
            formattedCellsInRow.push(prefixChar + cellValue);
        });
        finalOutputLines.push(formattedCellsInRow.join("")); // Join cells in a row without commas
    });
    console.log(finalOutputLines.join("\n")); // Join rows with newlines for final output
}
