function findDuplicateIndices(sourceArray) {
    const DIGIT_RANGE_MAX = 10;
    const MIN_OCCURRENCE_FOR_DUPLICATE = 2;

    let digitCounts = new Array(DIGIT_RANGE_MAX).fill(0);
    sourceArray.forEach(function(currentValue) {
        const numericValue = Number(currentValue);
        if (numericValue >= 0 && numericValue < DIGIT_RANGE_MAX) {
            digitCounts[numericValue]++;
        }
    });

    let repeatedDigits = [];
    digitCounts.forEach(function(count, digit) {
        if (count >= MIN_OCCURRENCE_FOR_DUPLICATE) {
            repeatedDigits.push(digit);
        }
    });

    let indicesOfRepeatedDigits = [];
    sourceArray.forEach(function(currentValue, currentIndex) {
        const numericValue = Number(currentValue);
        if (repeatedDigits.includes(numericValue)) {
            indicesOfRepeatedDigits.push(currentIndex);
        }
    });
    return indicesOfRepeatedDigits;
}

function getColumnValues(grid, colIndex) {
    const column = [];
    const GRID_DIMENSION = 9;
    for (let r = 0; r < GRID_DIMENSION; r++) {
        column.push(grid[r][colIndex]);
    }
    return column;
}

function getBlockValues(grid, blockCoordinatesList) {
    const blockValues = [];
    blockCoordinatesList.forEach(coord => {
        const [row, col] = coord;
        blockValues.push(grid[row][col]);
    });
    return blockValues;
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLinesArray = rawInputData.trim().split("\n");

const numberOfTestCases = Number(inputLinesArray.shift());
const SUDOKU_GRID_DIMENSION = 9;
const SUDOKU_BLOCK_SIZE = 3;

for (let testCaseIterator = 0; testCaseIterator < numberOfTestCases; testCaseIterator++) {
    if (testCaseIterator !== 0) {
        console.log("\n");
    }

    let currentSudokuGrid = [];
    let errorMarkingGrid = Array.from({ length: SUDOKU_GRID_DIMENSION }, () => new Array(SUDOKU_GRID_DIMENSION).fill(0));

    for (let rowIdx = 0; rowIdx < SUDOKU_GRID_DIMENSION; rowIdx++) {
        const rowValues = inputLinesArray.shift().split(" ").map(val => Number(val));
        currentSudokuGrid.push(rowValues);
    }

    for (let rowIdx = 0; rowIdx < SUDOKU_GRID_DIMENSION; rowIdx++) {
        const rowErrors = findDuplicateIndices(currentSudokuGrid[rowIdx]);
        rowErrors.forEach(function(colIdx) {
            errorMarkingGrid[rowIdx][colIdx]++;
        });
    }

    for (let colIdx = 0; colIdx < SUDOKU_GRID_DIMENSION; colIdx++) {
        const columnValues = getColumnValues(currentSudokuGrid, colIdx);
        const columnErrors = findDuplicateIndices(columnValues);
        columnErrors.forEach(function(rowIdx) {
            errorMarkingGrid[rowIdx][colIdx]++;
        });
    }

    for (let blockRowOffset = 0; blockRowOffset < SUDOKU_BLOCK_SIZE; blockRowOffset++) {
        for (let blockColOffset = 0; blockColOffset < SUDOKU_BLOCK_SIZE; blockColOffset++) {
            const startRow = blockRowOffset * SUDOKU_BLOCK_SIZE;
            const startCol = blockColOffset * SUDOKU_BLOCK_SIZE;

            const blockCellCoordinates = [
                [startRow, startCol], [startRow, startCol + 1], [startRow, startCol + 2],
                [startRow + 1, startCol], [startRow + 1, startCol + 1], [startRow + 1, startCol + 2],
                [startRow + 2, startCol], [startRow + 2, startCol + 1], [startRow + 2, startCol + 2]
            ];
            const blockValues = getBlockValues(currentSudokuGrid, blockCellCoordinates);
            const blockErrors = findDuplicateIndices(blockValues);

            blockErrors.forEach(function(errorLocalIndex) {
                const [globalRow, globalCol] = blockCellCoordinates[errorLocalIndex];
                errorMarkingGrid[globalRow][globalCol]++;
            });
        }
    }

    const formattedGridRows = currentSudokuGrid.map((gridRow, rowIdx) => {
        return gridRow.map((cellValue, colIdx) => {
            const prefixCharacter = errorMarkingGrid[rowIdx][colIdx] >= 1 ? "*" : " ";
            return prefixCharacter + cellValue;
        }).join("");
    });

    console.log(formattedGridRows.join("\n"));
}
