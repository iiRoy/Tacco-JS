function findShortestPath(initialX, initialY) {
    gridMap[initialY][initialX] = ".";

    const deltaX = [0, -1, 1, 0];
    const deltaY = [-1, 0, 0, 1];

    let currentPathLength = 0;
    let searchQueue = [[initialX, initialY, currentPathLength, 1, gridMap]];

    const visitedStates = {};
    visitedStates[x + " " + y + " " + gridMap.join("")] = true;

    const directionCount = 4;

    while (true) {
        if (searchQueue.length === 0) {
            currentPathLength = -1;
            break;
        }

        const [currentX, currentY, pathLen, currentPower, currentGridState] = searchQueue.shift();

        const targetPowerLevel = requiredPower + 1;
        if (currentPower === targetPowerLevel) {
            currentPathLength = pathLen;
            break;
        }

        for (let i = 0; i < directionCount; i++) {
            const nextX = currentX + deltaX[i];
            const nextY = currentY + deltaY[i];
            let nextPower = currentPower;

            const mapWidth = dimensions[1];
            const mapHeight = dimensions[0];

            if (nextX < 0 || nextY < 0 || nextX >= mapWidth || nextY >= mapHeight) {
                continue;
            }

            if (gridMap[nextY][nextX] === "X") {
                continue;
            }

            const nextGridState = currentGridState.map(row => row.slice());

            const requiredChar = "" + nextPower;
            if (nextGridState[nextY][nextX] === requiredChar) {
                nextPower++;
                nextGridState[nextY][nextX] = ".";
            }

            const stateIdentifier = `${nextX} ${nextY} ${nextGridState.join("")}`;
            if (visitedStates.hasOwnProperty(stateIdentifier)) {
                continue;
            }

            visitedStates[stateIdentifier] = true;
            searchQueue.push([nextX, nextY, pathLen + 1, nextPower, nextGridState]);
        }
    }
    return currentPathLength;
}

const INPUT_FILE_PATH = '/dev/stdin';
const rawInputString = require('fs').readFileSync(INPUT_FILE_PATH, 'utf8');
const inputLines = rawInputString.trim().split("\n");
const dimensions = inputLines.shift().split(" ").map(Number);
const requiredPower = wh[2];
const gridMap = [];
const startCoordinates = [];

for (let rowIndex = 0; rowIndex < dimensions[0]; rowIndex++) {
    const currentRow = inputLines.shift().split("");
    const startIndexInRow = currentRow.indexOf("S");
    if (startIndexInRow !== -1) {
        startCoordinates[0] = startIndexInRow;
        startCoordinates[1] = rowIndex;
    }
    gridMap.push(currentRow);
}

const finalResult = findShortestPath(startCoordinates[0], startCoordinates[1]);
console.log(finalResult);
