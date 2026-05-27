const serializeGridState = (gridLayout) => gridLayout.map(row => row.join('')).join('');

const isCoordinateOutOfBounds = (currentX, currentY, gridWidth, gridHeight) => {
    return currentX < 0 || currentY < 0 || currentX >= gridWidth || currentY >= gridHeight;
};

function findShortestPath(initialX, initialY, initialMazeLayout, requiredPowerLevel) {
    const workingGridState = initialMazeLayout.map(row => row.slice());
    workingGridState[initialY][initialX] = ".";

    const movementDirections = [
        { deltaX: 0, deltaY: -1 }, // Up
        { deltaX: -1, deltaY: 0 }, // Left
        { deltaX: 1, deltaY: 0 },  // Right
        { deltaX: 0, deltaY: 1 }   // Down
    ];
    const NUMBER_OF_DIRECTIONS = movementDirections.length;

    let currentPathLength = 0;
    const searchFrontier = [];
    const visitedStates = {};

    const initialGridKey = initialX + " " + initialY + " " + serializeGridState(workingGridState);
    visitedStates[initialGridKey] = true;
    searchFrontier.push({
        xCoord: initialX,
        yCoord: initialY,
        pathLen: currentPathLength,
        powerLevel: 1,
        gridSnapshot: workingGridState
    });

    while (searchFrontier.length > 0) {
        const currentSearchNode = searchFrontier.shift();
        const { xCoord, yCoord, pathLen, powerLevel, gridSnapshot } = currentSearchNode;

        if (powerLevel === requiredPowerLevel + 1) {
            return pathLen;
        }

        const currentGridHeight = gridSnapshot.length;
        const currentGridWidth = gridSnapshot[0].length;

        for (let i = 0; i < NUMBER_OF_DIRECTIONS; i++) {
            const { deltaX, deltaY } = movementDirections[i];
            const nextXCoord = xCoord + deltaX;
            const nextYCoord = yCoord + deltaY;
            let nextPowerLevel = powerLevel;

            if (isCoordinateOutOfBounds(nextXCoord, nextYCoord, currentGridWidth, currentGridHeight)) {
                continue;
            }

            if (gridSnapshot[nextYCoord][nextXCoord] === "X") {
                continue;
            }

            const nextGridSnapshot = gridSnapshot.map(row => row.slice());

            if (nextGridSnapshot[nextYCoord][nextXCoord] === String(nextPowerLevel)) {
                nextPowerLevel++;
                nextGridSnapshot[nextYCoord][nextXCoord] = ".";
            }

            const stateKey = nextXCoord + " " + nextYCoord + " " + serializeGridState(nextGridSnapshot);

            if (visitedStates.hasOwnProperty(stateKey)) {
                continue;
            }

            visitedStates[stateKey] = true;
            searchFrontier.push({
                xCoord: nextXCoord,
                yCoord: nextYCoord,
                pathLen: pathLen + 1,
                powerLevel: nextPowerLevel,
                gridSnapshot: nextGridSnapshot
            });
        }
    }

    return -1;
}

const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const inputLinesArray = rawInputContent.trim().split("\n");

const dimensionsAndPowerData = inputLinesArray.shift().split(" ").map(Number);
const mazeHeight = dimensionsAndPowerData[0];
const mazeWidth = dimensionsAndPowerData[1];
const maxRequiredPower = dimensionsAndPowerData[2];

const initialGridConfiguration = [];
let startingPointCoordinates = [];

for (let rowIdx = 0; rowIdx < mazeHeight; rowIdx++) {
    const rowCharactersArray = inputLinesArray.shift().split("");
    const startCharacterIndex = rowCharactersArray.indexOf("S");
    if (startCharacterIndex !== -1) {
        startingPointCoordinates = [startCharacterIndex, rowIdx];
    }
    initialGridConfiguration.push(rowCharactersArray);
}

const finalResult = findShortestPath(startingPointCoordinates[0], startingPointCoordinates[1], initialGridConfiguration, maxRequiredPower);

console.log(finalResult);
