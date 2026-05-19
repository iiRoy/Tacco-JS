function rotateMatrix(inputMatrix) {
    const MATRIX_DIMENSION = 8;
    let outputMatrix = [];

    for (let rowIndex = 0; rowIndex < MATRIX_DIMENSION; rowIndex++) {
        outputMatrix.push([]);
    }

    for (let rowIndex = 0; rowIndex < MATRIX_DIMENSION; rowIndex++) {
        for (let colIndex = 0; colIndex < MATRIX_DIMENSION; colIndex++) {
            const sourceColIndex = MATRIX_DIMENSION - 1 - colIndex;
            outputMatrix[rowIndex][colIndex] = inputMatrix[sourceColIndex][rowIndex];
        }
    }
    return outputMatrix;
}

const GRID_SIZE = 8;

function readAndParseInitialGrid() {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const trimmedContent = fileContent.trim();
    const lineData = trimmedContent.split("\n");
    let initialGrid = [];
    for (let gridRowIndex = 0; gridRowIndex < GRID_SIZE; gridRowIndex++) {
        initialGrid.push(lineData[gridRowIndex].split(""));
    }
    return initialGrid;
}

function processAndDisplayRotation(gridToProcess) {
    const transformedGrid = rotateMatrix(gridToProcess);
    console.log(transformedGrid.join("\n"));
    return transformedGrid;
}

let currentGrid = readAndParseInitialGrid();

const TOTAL_ROTATION_CYCLES = 3;
for (let cycleCount = 0; cycleCount < TOTAL_ROTATION_CYCLES; cycleCount++) {
    currentGrid = processAndDisplayRotation(currentGrid);
}
