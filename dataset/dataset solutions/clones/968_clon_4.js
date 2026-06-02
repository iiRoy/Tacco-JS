const appSettings = { input: '/dev/stdin', newline: '\n' };

const assertionModule = require('assert');

const gridDimensionSquared = 16;
const gridSideLength = Math.sqrt(gridDimensionSquared);

const noPriorMove = 0;
const N = 1;
const S = 2;
const W = 3;
const E = 4;

const initialPuzzleState = require('fs').readFileSync(appSettings.input, 'ascii')
    .trim()
    .split(appSettings.newline)
    .flatMap(line => line.split(' ').map(Number));

const targetArrangement = Array.from({ length: gridDimensionSquared }, (_, idx) => (idx + 1) % gridDimensionSquared);

function findSolutionDepth(initialBoardConfiguration, initialEmptyTileLocation) {

    const areConfigurationsEquivalent = (configA, configB) => {
        for (let k = 0; k < gridDimensionSquared; k++) {
            if (configA[k] !== configB[k]) return false;
        }
        return true;
    };

    const determineNextEmptyIndex = (currentEmptyIdx, movementDirection) => {
        const rowCoord = Math.floor(currentEmptyIdx / gridSideLength);
        const colCoord = currentEmptyIdx % gridSideLength;

        switch (movementDirection) {
            case N:
                if (rowCoord > 0) return (rowCoord - 1) * gridSideLength + colCoord;
                break;
            case S:
                if (rowCoord < gridSideLength - 1) return (rowCoord + 1) * gridSideLength + colCoord;
                break;
            case W:
                if (colCoord > 0) return rowCoord * gridSideLength + (colCoord - 1);
                break;
            case E:
                if (colCoord < gridSideLength - 1) return rowCoord * gridSideLength + (colCoord + 1);
                break;
        }
        return null;
    };

    for (let maxSearchDepth = 0; maxSearchDepth <= 45; maxSearchDepth++) {
        const searchFrontier = [];
        searchFrontier.push([initialBoardConfiguration.slice(), 0, initialEmptyTileLocation, noPriorMove]);

        while (searchFrontier.length > 0) {
            const [currentBoard, currentSearchDepth, emptyTileLocation, lastMoveDirection] = searchFrontier.pop();

            if (currentSearchDepth === maxSearchDepth) {
                if (areConfigurationsEquivalent(currentBoard, targetArrangement)) {
                    return maxSearchDepth;
                }
                continue;
            }

            const possibleMoveDirections = [
                { direction: E, opposite: W },
                { direction: W, opposite: E },
                { direction: S, opposite: N },
                { direction: N, opposite: S }
            ];

            for (const { direction, opposite } of possibleMoveDirections) {
                if (lastMoveDirection === opposite) continue;

                const nextEmptyLocation = determineNextEmptyIndex(emptyTileLocation, direction);

                if (nextEmptyLocation !== null) {
                    const nextBoardConfiguration = currentBoard.slice();
                    nextBoardConfiguration[emptyTileLocation] = nextBoardConfiguration[nextEmptyLocation];
                    nextBoardConfiguration[nextEmptyLocation] = 0;

                    searchFrontier.push([nextBoardConfiguration, currentSearchDepth + 1, nextEmptyLocation, direction]);
                }
            }
        }
    }
    return -1;
}

const initialEmptyTilePosition = initialPuzzleState.indexOf(0);

const solutionDepth = findSolutionDepth(initialPuzzleState, initialEmptyTilePosition);

console.log(solutionDepth);
