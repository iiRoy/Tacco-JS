let overallMinSteps = Infinity;
const visitedStatesMap = new Map();

const verticalMoves = [-1, 0, 0, 1];
const horizontalMoves = [0, -1, 1, 0];

function exploreLabyrinth(
    currentColumn,
    currentRow,
    accumulatedSteps,
    currentPowerLevel,
    currentLabyrinthState,
    gridHeight,
    gridWidth,
    requiredPowerLevel
) {
    if (accumulatedSteps >= overallMinSteps) {
        return;
    }

    const stateIdentifier = `${currentColumn},${currentRow},${currentPowerLevel},${currentLabyrinthState.map(row => row.join('')).join('')}`;

    if (visitedStatesMap.has(stateIdentifier) && visitedStatesMap.get(stateIdentifier) <= accumulatedSteps) {
        return;
    }

    visitedStatesMap.set(stateIdentifier, accumulatedSteps);

    if (currentPowerLevel === requiredPowerLevel + 1) {
        overallMinSteps = Math.min(overallMinSteps, accumulatedSteps);
        return;
    }

    for (let i = 0; i < 4; i++) {
        const nextColumn = currentColumn + horizontalMoves[i];
        const nextRow = currentRow + verticalMoves[i];

        if (nextColumn < 0 || nextRow < 0 || nextColumn >= gridWidth || nextRow >= gridHeight) {
            continue;
        }

        if (currentLabyrinthState[nextRow][nextColumn] === 'X') {
            continue;
        }

        const nextLabyrinthState = currentLabyrinthState.map(row => row.slice());
        let nextPowerLevel = currentPowerLevel;

        if (nextLabyrinthState[nextRow][nextColumn] === String(currentPowerLevel)) {
            nextPowerLevel++;
            nextLabyrinthState[nextRow][nextColumn] = '.';
        }

        exploreLabyrinth(
            nextColumn,
            nextRow,
            accumulatedSteps + 1,
            nextPowerLevel,
            nextLabyrinthState,
            gridHeight,
            gridWidth,
            requiredPowerLevel
        );
    }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const linesData = fileContent.trim().split('\n');

const dimensionsAndGoal = linesData.shift().split(' ').map(Number);
const mazeHeight = dimensionsAndGoal[0];
const mazeWidth = dimensionsAndGoal[1];
const goalPower = dimensionsAndGoal[2];

let initialMazeGrid = [];
let initialCoordinates = [];

for (let r = 0; r < mazeHeight; r++) {
    const rowCharacters = linesData.shift().split('');
    const startCharIndex = rowCharacters.indexOf('S');
    if (startCharIndex !== -1) {
        initialCoordinates = [startCharIndex, r];
    }
    initialMazeGrid.push(rowCharacters);
}

initialMazeGrid[initialCoordinates[1]][initialCoordinates[0]] = '.';

exploreLabyrinth(
    initialCoordinates[0],
    initialCoordinates[1],
    0,
    1,
    initialMazeGrid.map(row => row.slice()),
    mazeHeight,
    mazeWidth,
    goalPower
);

console.log(overallMinSteps === Infinity ? -1 : overallMinSteps);