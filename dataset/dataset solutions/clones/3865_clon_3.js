const fileSystem = require("fs");

const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const inputContentLines = rawInputContent.split("\n");

const matrixSize = Number.parseInt(inputContentLines[0], 10);
const charMatrix = inputContentLines.slice(1);

function getWrappedCoordinate(baseIndex, offsetValue, dimensionLimit) {
    return (baseIndex + offsetValue) % dimensionLimit;
}

function isShiftSymmetric(rowOffset, colOffset) {
    let currentRow = 0;
    while (currentRow < matrixSize) {
        let currentCol = 0;
        while (currentCol < matrixSize) {
            const firstShiftedRow = getWrappedCoordinate(currentRow, rowOffset, matrixSize);
            const firstShiftedCol = getWrappedCoordinate(currentCol, colOffset, matrixSize);
            const secondShiftedRow = getWrappedCoordinate(currentCol, rowOffset, matrixSize);
            const secondShiftedCol = getWrappedCoordinate(currentRow, colOffset, matrixSize);

            const charAtFirstPosition = charMatrix[firstShiftedRow][firstShiftedCol];
            const charAtSecondPosition = charMatrix[secondShiftedRow][secondShiftedCol];

            if (charAtFirstPosition !== charAtSecondPosition) {
                return 0;
            }
            currentCol++;
        }
        currentRow++;
    }
    return 1;
}

let symmetricShiftCount = 0;
let currentAOffset = 0;
while (currentAOffset < matrixSize) {
    let currentBOffset = 0;
    while (currentBOffset < matrixSize) {
        const currentShiftSymmetryResult = isShiftSymmetric(currentAOffset, currentBOffset);
        symmetricShiftCount = symmetricShiftCount + currentShiftSymmetryResult;
        currentBOffset++;
    }
    currentAOffset++;
}

console.log(symmetricShiftCount);
