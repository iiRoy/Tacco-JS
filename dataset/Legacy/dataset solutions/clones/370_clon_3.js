const fs = require('fs');

const GRID_DIMENSION = 9;
const SUBGRID_DIMENSION = 3;
const MAX_DIGIT_VALUE = 9; // Assuming digits 0-9 for Sudoku

function findDuplicateIndices(inputArray) {
    const digitCounts = new Array(MAX_DIGIT_VALUE + 1).fill(0);

    for (let k = 0; k < inputArray.length; k++) {
        const currentDigit = Number(inputArray[k]);
        // Basic bounds check, though input is assumed valid for Sudoku digits
        if (currentDigit >= 0 && currentDigit <= MAX_DIGIT_VALUE) {
            digitCounts[currentDigit]++;
        }
    }

    const repeatedDigits = [];
    for (let digit = 0; digit <= MAX_DIGIT_VALUE; digit++) {
        if (digitCounts[digit] >= 2) {
            repeatedDigits.push(digit);
        }
    }

    const resultIndices = [];
    for (let k = 0; k < inputArray.length; k++) {
        const currentDigit = Number(inputArray[k]);
        if (repeatedDigits.includes(currentDigit)) {
            resultIndices.push(k);
        }
    }
    return resultIndices;
}

const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputData.trim().split("\n");
let outputAccumulator = "";

const numTestCases = Number(inputLines.shift());

for (let testCaseIdx = 0; testCaseIdx < numTestCases; testCaseIdx++) {
    const currentGrid = [];
    const errorMarkers = [];

    for (let rowIdx = 0; rowIdx < GRID_DIMENSION; rowIdx++) {
        const rowValues = inputLines.shift().split(" ").map(Number);
        currentGrid.push(rowValues);
        errorMarkers.push(new Array(GRID_DIMENSION).fill(0));
    }

    for (let k = 0; k < GRID_DIMENSION; k++) {
        // Process rows for duplicates
        const rowDuplicates = findDuplicateIndices(currentGrid[k]);
        rowDuplicates.forEach(function(colIndex) {
            errorMarkers[k][colIndex]++;
        });

        // Process columns for duplicates
        const columnValues = [];
        for (let rowIdx = 0; rowIdx < GRID_DIMENSION; rowIdx++) {
            columnValues.push(currentGrid[rowIdx][k]);
        }
        const colDuplicates = findDuplicateIndices(columnValues);
        colDuplicates.forEach(function(rowIndex) {
            errorMarkers[rowIndex][k]++;
        });

        // Process 3x3 subgrids (boxes) for duplicates
        const boxRowOffset = Math.floor(k / SUBGRID_DIMENSION) * SUBGRID_DIMENSION;
        const boxColOffset = (k % SUBGRID_DIMENSION) * SUBGRID_DIMENSION;

        const boxCellCoordinates = [];
        for (let r = 0; r < SUBGRID_DIMENSION; r++) {
            for (let c = 0; c < SUBGRID_DIMENSION; c++) {
                boxCellCoordinates.push([boxRowOffset + r, boxColOffset + c]);
            }
        }

        const boxValues = [];
        boxCellCoordinates.forEach(function(coords) {
            boxValues.push(currentGrid[coords[0]][coords[1]]);
        });

        const boxDuplicates = findDuplicateIndices(boxValues);
        boxDuplicates.forEach(function(localIndex) {
            const [globalRow, globalCol] = boxCellCoordinates[localIndex];
            errorMarkers[globalRow][globalCol]++;
        });
    }

    for (let rowIdx = 0; rowIdx < GRID_DIMENSION; rowIdx++) {
        for (let colIdx = 0; colIdx < GRID_DIMENSION; colIdx++) {
            const cellValue = currentGrid[rowIdx][colIdx];
            currentGrid[rowIdx][colIdx] = (errorMarkers[rowIdx][colIdx] >= 1) ? `*${cellValue}` : ` ${cellValue}`;
        }
    }

    let formattedGridString = currentGrid.join("\n");
    formattedGridString = formattedGridString.replace(/,/g, "");
    outputAccumulator += formattedGridString + "\n\n";
}

console.log(outputAccumulator.trim());
