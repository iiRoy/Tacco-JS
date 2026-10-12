const fileContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = fileContent.trim().split('\n');

const [gridWidth, gridHeight, maxCollectibleValue] = lineSegments.shift().split(' ').map(Number);

let entryPointCoords = [];
const initialMapGrid = lineSegments.reduce((accumulator, currentLine, rowIndex) => {
    const rowCharacters = currentLine.split('');
    const startColumnIndex = rowCharacters.indexOf('S');
    if (startColumnIndex !== -1) {
        entryPointCoords = [startColumnIndex, rowIndex];
    }
    accumulator.push(rowCharacters);
    return accumulator;
}, []);

const [initialXCoord, initialYCoord] = entryPointCoords;
initialMapGrid[initialYCoord][initialXCoord] = '.';

function findShortestPath(startX, startY, mapData, targetCollectibleCount, width, height) {
    const explorationQueue = [];
    const visitedPathStates = new Set();

    const generateStateKey = (x, y, nextP, collectedLocations) => {
        const sortedLocations = Array.from(collectedLocations).sort().join('|');
        return `${x},${y},${nextP},${sortedLocations}`;
    };

    const initialCollectedLocations = new Set();
    const startingState = {
        x: startX,
        y: startY,
        cost: 0,
        requiredPower: 1,
        collected: initialCollectedLocations
    };

    const startingStateKey = generateStateKey(startingState.x, startingState.y, startingState.requiredPower, startingState.collected);
    explorationQueue.push(startingState);
    visitedPathStates.add(startingStateKey);

    const movementVectors = [[0, -1], [-1, 0], [1, 0], [0, 1]];

    while (explorationQueue.length > 0) {
        const currentState = explorationQueue.shift();

        if (currentState.requiredPower > targetCollectibleCount) {
            return currentState.cost;
        }

        movementVectors.forEach(([deltaX, deltaY]) => {
            const nextX = currentState.x + deltaX;
            const nextY = currentState.y + deltaY;

            if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) {
                return;
            }

            const cellValue = mapData[nextY][nextX];

            if (cellValue === 'X') {
                return;
            }

            let nextRequiredPower = currentState.requiredPower;
            const newCollectedLocations = new Set(currentState.collected);

            if (cellValue === String(nextRequiredPower) && !newCollectedLocations.has(`${nextY}_${nextX}`)) {
                newCollectedLocations.add(`${nextY}_${nextX}`);
                nextRequiredPower++;
            }

            const newState = {
                x: nextX,
                y: nextY,
                cost: currentState.cost + 1,
                requiredPower: nextRequiredPower,
                collected: newCollectedLocations
            };

            const newStateKey = generateStateKey(newState.x, newState.y, newState.requiredPower, newState.collected);

            if (!visitedPathStates.has(newStateKey)) {
                visitedPathStates.add(newStateKey);
                explorationQueue.push(newState);
            }
        });
    }

    return -1;
}

const finalResult = findShortestPath(initialXCoord, initialYCoord, initialMapGrid, maxCollectibleValue, gridWidth, gridHeight);

console.log(finalResult);
