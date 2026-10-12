let currentNum;
let maxNum;
let gridSize;
let gridData;

function getWrappedCoordinate(coordValue, limitValue) {
    if (coordValue < 0) {
        return limitValue - 1;
    }
    if (coordValue >= limitValue) {
        return 0;
    }
    return coordValue;
}

function formatNumberForGrid(numberToFormat) {
    const paddedString = "   " + numberToFormat;
    return paddedString.slice(-4);
}

function fillGrid(rowCoord, colCoord) {
    // Guard clause: stop recursion if all numbers are placed
    if (currentNum === maxNum) {
        return;
    }

    // Calculate the effective (wrapped) coordinates for grid access
    const effectiveCol = getWrappedCoordinate(colCoord, gridSize);
    const effectiveRow = getWrappedCoordinate(rowCoord, gridSize);

    // Check if the target cell is already occupied
    if (gridData[effectiveRow][effectiveCol] !== -1) {
        // If occupied, move to the next position: one row down, one column left
        const nextRowIfOccupied = rowCoord + 1;
        const nextColIfOccupied = colCoord - 1;
        fillGrid(nextRowIfOccupied, nextColIfOccupied);
    } else {
        // If empty, fill the cell with the current number
        gridData[effectiveRow][effectiveCol] = formatNumberForGrid(currentNum);
        currentNum++; // Increment the number for the next cell

        // Then move to the next position: one row down, one column right
        const nextRowIfEmpty = rowCoord + 1;
        const nextColIfEmpty = colCoord + 1;
        fillGrid(nextRowIfEmpty, nextColIfEmpty);
    }
}

function createEmptyGrid(size) {
    const newGridStructure = [];
    for (let rIdx = 0; rIdx < size; rIdx++) {
        const row = [];
        for (let cIdx = 0; cIdx < size; cIdx++) {
            row.push(-1); // Initialize each cell with -1
        }
        newGridStructure.push(row);
    }
    return newGridStructure;
}

function formatGridOutput(gridToFormat) {
    // Join each row's elements directly (removing commas) and then join rows with newlines
    return gridToFormat.map(row => row.join("")).join("\n");
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

const rawInputData = fileSystemModule.readFileSync(standardInputPath, 'utf8');
const processedSizeInputs = rawInputData.trim().split("\n").map(Number);

for (let inputIndex = 0; inputIndex < processedSizeInputs.length; inputIndex++) {
    const currentGridSize = processedSizeInputs[inputIndex];

    // Break condition for input processing
    if (currentGridSize === 0) {
        break;
    }

    // Initialize global variables for the current grid generation
    gridSize = currentGridSize;
    maxNum = (gridSize * gridSize) + 1;
    currentNum = 1;
    gridData = createEmptyGrid(gridSize);

    // Calculate the initial starting coordinates for the fill process
    const initialRowOffset = Math.floor(gridSize / 2) + 1;
    const initialColOffset = Math.floor(gridSize / 2);

    // Begin the recursive grid filling
    fillGrid(initialRowOffset, initialColOffset);

    // Output the final formatted grid
    console.log(formatGridOutput(gridData));
}
