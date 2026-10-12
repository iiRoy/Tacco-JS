function generateStateKey(col, row, grid) {
    return `${col} ${row} ${grid.join("")}`;
}

const DIRECTION_OFFSETS = [
    { deltaCol: 0, deltaRow: -1 },
    { deltaCol: -1, deltaRow: 0 },
    { deltaCol: 1, deltaRow: 0 },
    { deltaCol: 0, deltaRow: 1 }
];

function calculateShortestPath(startCol, startRow, initialGridConfiguration, gridWidth, gridHeight, requiredPowerLevel) {
    initialGridConfiguration[startRow][startCol] = ".";

    let stepsTaken = 0;
    const pathQueue = [[startCol, startRow, stepsTaken, 1, initialGridConfiguration]];

    const visitedPathStates = new Set();
    visitedPathStates.add(generateStateKey(startCol, startRow, initialGridConfiguration));

    let finalPathLength = -1;

    while (pathQueue.length > 0) {
        const [currentCol, currentRow, currentSteps, currentPower, gridSnapshot] = pathQueue.shift();

        if (currentPower === requiredPowerLevel + 1) {
            finalPathLength = currentSteps;
            break;
        }

        for (const offset of DIRECTION_OFFSETS) {
            const nextCol = currentCol + offset.deltaCol;
            const nextRow = currentRow + offset.deltaRow;
            let nextPower = currentPower;

            if (nextCol < 0 || nextRow < 0 || nextCol >= gridWidth || nextRow >= gridHeight) {
                continue;
            }

            if (gridSnapshot[nextRow][nextCol] === "X") {
                continue;
            }

            const nextGridState = gridSnapshot.map(row => row.slice());

            if (nextGridState[nextRow][nextCol] === String(nextPower)) {
                nextPower++;
                nextGridState[nextRow][nextCol] = ".";
            }

            const stateIdentifierKey = generateStateKey(nextCol, nextRow, nextGridState);

            if (!visitedPathStates.has(stateIdentifierKey)) {
                visitedPathStates.add(stateIdentifierKey);
                pathQueue.push([nextCol, nextRow, currentSteps + 1, nextPower, nextGridState]);
            }
        }
    }
    return finalPathLength;
}

const fs = require('fs');
const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputData.trim().split("\n");

const gridDimensionsAndPower = inputLinesArray.shift().split(" ").map(Number);
const gridWidth = gridDimensionsAndPower[0];
const gridHeight = gridDimensionsAndPower[1];
const requiredPowerLevel = gridDimensionsAndPower[2];

const initialGridMap = [];
let startingCoordinates = [];

for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
    const currentRowChars = inputLinesArray.shift().split("");
    if (currentRowChars.includes("S")) {
        startingCoordinates = [currentRowChars.indexOf("S"), rowIndex];
    }
    initialGridMap.push(currentRowChars);
}

const finalPathLength = calculateShortestPath(
    startingCoordinates[0],
    startingCoordinates[1],
    initialGridMap,
    gridWidth,
    gridHeight,
    requiredPowerLevel
);

console.log(finalPathLength);
