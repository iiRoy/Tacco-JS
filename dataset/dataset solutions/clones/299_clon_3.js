const NEIGHBOR_OFFSETS_ROW = [-1, -1, 0];
const NEIGHBOR_OFFSETS_COL = [-1, 0, -1];
const OBSTACLE_CHARACTER = "*";

function calculateCellDistance(targetRow, targetCol, distanceGrid, currentGridDimension) {
    if (distanceGrid[targetRow][targetCol] === OBSTACLE_CHARACTER) {
        distanceGrid[targetRow][targetCol] = 0;
        return;
    }

    let minPredecessorValue = Infinity;

    for (let offsetIndex = 0; offsetIndex < 3; offsetIndex++) {
        const prevRow = targetRow + NEIGHBOR_OFFSETS_ROW[offsetIndex];
        const prevCol = targetCol + NEIGHBOR_OFFSETS_COL[offsetIndex];

        const isPredecessorOutOfBounds = (
            prevRow < 0 || prevRow >= currentGridDimension ||
            prevCol < 0 || prevCol >= currentGridDimension
        );

        if (isPredecessorOutOfBounds) {
            distanceGrid[targetRow][targetCol] = 1;
            return;
        }

        minPredecessorValue = Math.min(minPredecessorValue, distanceGrid[prevRow][prevCol]);
    }

    distanceGrid[targetRow][targetCol] = minPredecessorValue + 1;
}

const fileSystem = require('fs');
const readInputFile = (filePath) => fileSystem.readFileSync(filePath, 'utf8');

const rawInputData = readInputFile('/dev/stdin');
let inputDataLines = rawInputData.trim().split("\n");

while (true) {
    const currentGridDimension = Number(inputDataLines.shift());

    if (currentGridDimension === 0) {
        break;
    }

    let overallMaxDistance = 0;
    let distanceMap = [];

    for (let rowIndex = 0; rowIndex < currentGridDimension; rowIndex++) {
        const rowString = inputDataLines.shift();
        distanceMap.push(rowString.split(""));
    }

    for (let r = 0; r < currentGridDimension; r++) {
        for (let c = 0; c < currentGridDimension; c++) {
            calculateCellDistance(r, c, distanceMap, currentGridDimension);
            overallMaxDistance = Math.max(overallMaxDistance, distanceMap[r][c]);
        }
    }

    console.log(overallMaxDistance);
}
