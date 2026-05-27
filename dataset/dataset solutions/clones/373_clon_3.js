function rotateMatrix(sourceMatrix) {
    const MATRIX_DIMENSION = 8;
    let targetMatrix = [];

    for (let r = 0; r < MATRIX_DIMENSION; r++) {
        targetMatrix.push(new Array(MATRIX_DIMENSION));
    }

    for (let rowIndex = 0; rowIndex < MATRIX_DIMENSION; rowIndex++) {
        for (let colIndex = 0; colIndex < MATRIX_DIMENSION; colIndex++) {
            const sourceRowIndex = MATRIX_DIMENSION - 1 - colIndex;
            const sourceColIndex = rowIndex;
            targetMatrix[rowIndex][colIndex] = sourceMatrix[sourceRowIndex][sourceColIndex];
        }
    }
    return targetMatrix;
}

function parseInputGrid(inputStringContent) {
    const GRID_DIMENSION = 8;
    const trimmedContent = inputStringContent.trim();
    const inputLinesArray = trimmedContent.split("\n");
    let initialGrid = [];

    for (let lineIndex = 0; lineIndex < GRID_DIMENSION; lineIndex++) {
        initialGrid.push(inputLinesArray[lineIndex].split(""));
    }
    return initialGrid;
}

const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

let currentGridState = parseInputGrid(rawInputData);

const TOTAL_ROTATIONS = 3;
let rotationDegrees = 90;

for (let rotationStep = 0; rotationStep < TOTAL_ROTATIONS; rotationStep++) {
    currentGridState = rotateMatrix(currentGridState);
    console.log(rotationDegrees + "\n" + currentGridState.join("\n"));
    rotationDegrees += 90;
}
