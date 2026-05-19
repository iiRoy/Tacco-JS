function findShortestPath(initialX, initialY) {
    const movementVectors = [
        { deltaX: 0, deltaY: -1 }, // Up
        { deltaX: -1, deltaY: 0 }, // Left
        { deltaX: 1, deltaY: 0 },  // Right
        { deltaX: 0, deltaY: 1 }   // Down
    ];

    const initialGridSnapshot = initialGridMap.map(row => [...row]);
    initialGridSnapshot[initialY][initialX] = ".";

    const explorationQueue = [];
    const visitedStates = new Set();

    const firstState = {
        xCoord: initialX,
        yCoord: initialY,
        currentSteps: 0,
        requiredPowerLevel: 1,
        gridConfiguration: initialGridSnapshot
    };

    const firstStateKey = `${firstState.xCoord} ${firstState.yCoord} ${firstState.gridConfiguration.map(r => r.join('')).join('')}`;
    visitedStates.add(firstStateKey);
    explorationQueue.push(firstState);

    let finalPathLength = -1;

    while (explorationQueue.length > 0) {
        const currentState = explorationQueue.shift();
        const { xCoord, yCoord, currentSteps, requiredPowerLevel, gridConfiguration } = currentState;

        if (requiredPowerLevel === maxPowerLevel + 1) {
            finalPathLength = currentSteps;
            break;
        }

        for (const vector of movementVectors) {
            const nextX = xCoord + vector.deltaX;
            const nextY = yCoord + vector.deltaY;
            let nextRequiredPowerLevel = requiredPowerLevel;
            const nextGridConfiguration = gridConfiguration.map(row => [...row]);

            if (nextX < 0 || nextY < 0 || nextX >= dimensionsAndPower[1] || nextY >= dimensionsAndPower[0]) {
                continue;
            }

            if (gridConfiguration[nextY][nextX] === "X") {
                continue;
            }

            if (nextGridConfiguration[nextY][nextX] === String(nextRequiredPowerLevel)) {
                nextRequiredPowerLevel++;
                nextGridConfiguration[nextY][nextX] = ".";
            }

            const stateIdentifier = `${nextX} ${nextY} ${nextGridConfiguration.map(r => r.join('')).join('')}`;

            if (!visitedStates.has(stateIdentifier)) {
                visitedStates.add(stateIdentifier);
                explorationQueue.push({
                    xCoord: nextX,
                    yCoord: nextY,
                    currentSteps: currentSteps + 1,
                    requiredPowerLevel: nextRequiredPowerLevel,
                    gridConfiguration: nextGridConfiguration
                });
            }
        }
    }
    return finalPathLength;
}

const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const lineSegments = rawInputData.trim().split("\n");

const dimensionsAndPower = lineSegments.shift().split(" ").map(Number);
const maxPowerLevel = dimensionsAndPower[2];

const initialGridMap = [];
let initialPosition = [];

for (let rowIdx = 0; rowIdx < dimensionsAndPower[0]; rowIdx++) {
    const gridRow = lineSegments.shift().split("");
    const startColumnIdx = gridRow.indexOf("S");
    if (startColumnIdx !== -1) {
        initialPosition = [startColumnIdx, rowIdx];
    }
    initialGridMap.push(gridRow);
}

const resultPathLength = findShortestPath(initialPosition[0], initialPosition[1]);
console.log(resultPathLength);
