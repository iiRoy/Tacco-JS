function rotateMatrixClockwise(sourceMatrix) {
    const MATRIX_DIMENSION = 8;
    const targetMatrix = Array.from({ length: MATRIX_DIMENSION }, () => Array(MATRIX_DIMENSION).fill(null));

    for (let targetRowIndex = 0; targetRowIndex < MATRIX_DIMENSION; targetRowIndex++) {
        for (let targetColIndex = 0; targetColIndex < MATRIX_DIMENSION; targetColIndex++) {
            const originalRow = MATRIX_DIMENSION - 1 - targetColIndex;
            const originalCol = targetRowIndex;
            targetMatrix[targetRowIndex][targetColIndex] = sourceMatrix[originalRow][originalCol];
        }
    }
    return targetMatrix;
}

function displayRotatedGrid(rotationDegree, gridData) {
    const formattedGridString = gridData.map(row => row.join('')).join('\n');
    console.log(`${rotationDegree}\n${formattedGridString}`);
}

const fileSystemModule = require('fs');
const inputFilePath = '/dev/stdin';
const fileContent = fileSystemModule.readFileSync(inputFilePath, 'utf8');

const trimmedContent = fileContent.trim();
const inputLines = trimmedContent.split('\n');

const GRID_SIZE = 8;
let currentGrid = inputLines.slice(0, GRID_SIZE).map(line => line.split(''));

currentGrid = rotateMatrixClockwise(currentGrid);
displayRotatedGrid(90, currentGrid);

currentGrid = rotateMatrixClockwise(currentGrid);
displayRotatedGrid(180, currentGrid);

currentGrid = rotateMatrixClockwise(currentGrid);
displayRotatedGrid(270, currentGrid);
