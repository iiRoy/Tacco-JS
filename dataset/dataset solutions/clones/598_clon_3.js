const parseGameInput = (inputStringContent) => {
    const processedLines = inputStringContent.trim().split('\n');
    const dimensionAndPowerLine = processedLines.shift();
    const [gridHeight, gridWidth, requiredPowerLevel] = dimensionAndPowerLine.split(' ').map(Number);

    const gameGridMap = [];
    let startPosition = [];

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        const currentRowCharacters = processedLines.shift().split('');
        const startColumnIndex = currentRowCharacters.indexOf('S');
        if (startColumnIndex !== -1) {
            startPosition = [startColumnIndex, rowIndex];
        }
        gameGridMap.push(currentRowCharacters);
    }

    return {
        mapHeight: gridHeight,
        mapWidth: gridWidth,
        targetPowerLevel: requiredPowerLevel,
        gridData: gameGridMap,
        initialCoordinates: startPosition
    };
};

function findOptimalPath(initialX, initialY, mapWidth, mapHeight, targetPowerLevel, gridData) {
    const moveDeltaX = [0, -1, 1, 0];
    const moveDeltaY = [-1, 0, 0, 1];
    const numberOfDirections = moveDeltaX.length;

    let totalMinimumSteps = 0;
    const traversalQueue = [[initialX, initialY, 0, 1]];

    const visitedStates = Array(mapWidth).fill(null).map(() => Array(mapHeight).fill(0));

    const isCoordinateValid = (checkX, checkY) => {
        return checkX >= 0 && checkY >= 0 && checkX < mapWidth && checkY < mapHeight;
    };

    let queueReadPointer = 0;
    while (queueReadPointer < traversalQueue.length) {
        const currentPathNode = traversalQueue[queueReadPointer];
        queueReadPointer++;

        const currentX = currentPathNode[0];
        const currentY = currentPathNode[1];
        const currentSteps = currentPathNode[2];
        const currentPower = currentPathNode[3];

        if (currentPower === targetPowerLevel + 1) {
            totalMinimumSteps = currentSteps;
            break;
        }

        for (let directionIndex = 0; directionIndex < numberOfDirections; directionIndex++) {
            const nextX = currentX + moveDeltaX[directionIndex];
            const nextY = currentY + moveDeltaY[directionIndex];
            let nextPower = currentPower;

            if (!isCoordinateValid(nextX, nextY)) {
                continue;
            }

            const cellValue = gridData[nextY][nextX];

            if (cellValue === "X") {
                continue;
            }

            if (cellValue === String(nextPower)) {
                nextPower++;
            }

            if (visitedStates[nextX][nextY] >= nextPower) {
                continue;
            }

            visitedStates[nextX][nextY] = nextPower;
            traversalQueue.push([nextX, nextY, currentSteps + 1, nextPower]);
        }
    }
    return totalMinimumSteps;
}

const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const parsedGameData = parseGameInput(rawInputContent);

const {
    initialCoordinates: [startX, startY],
    mapWidth,
    mapHeight,
    targetPowerLevel,
    gridData
} = parsedGameData;

const finalCalculatedSteps = findOptimalPath(
    startX,
    startY,
    mapWidth,
    mapHeight,
    targetPowerLevel,
    gridData
);

console.log(finalCalculatedSteps);
