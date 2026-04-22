const puzzleConfig = { source: '/dev/stdin', lineDelimiter: '\n' };
const puzzleArea = 16;

const inputData = require('node:fs').readFileSync(puzzleConfig.source, 'ascii');

let initialValues = [];
let tempLines = inputData.split(puzzleConfig.lineDelimiter);
for (let lineTxt of tempLines) {
    let trimmedLine = lineTxt.trim();
    if (trimmedLine.length === 0) continue;
    let numbers = trimmedLine.split(' ').map(Number);
    initialValues.push(...numbers);
}

const finalArrangement = [];
for (let tileVal = 1; tileVal < puzzleArea; tileVal++) {
    finalArrangement.push(tileVal);
}
finalArrangement.push(0);

const adjacencyMap = [
    [1, 4], [0, 2, 5], [1, 3, 6], [2, 7],
    [0, 5, 8], [1, 4, 6, 9], [2, 5, 7, 10], [3, 6, 11],
    [4, 9, 12], [5, 8, 10, 13], [6, 9, 11, 14], [7, 10, 15],
    [8, 13], [9, 12, 14], [10, 13, 15], [11, 14]
];

function calculateMisplacedCount(currentLayout, goalLayout) {
    let misalignedPieces = 0;
    for (let k = 0; k < currentLayout.length; k++) {
        if (currentLayout[k] !== goalLayout[k] && currentLayout[k] !== 0) {
            misalignedPieces++;
        }
    }
    return Math.floor(misalignedPieces / 2);
}

function solvePuzzleRecursive(currentLayout, currentDepth, depthLimit, blankTileIndex) {
    if (currentDepth === depthLimit) {
        for (let k = 0; k < currentLayout.length; k++) {
            if (currentLayout[k] !== finalArrangement[k]) return false;
        }
        return true;
    }

    const heuristicEstimate = calculateMisplacedCount(currentLayout, finalArrangement);
    if (currentDepth + heuristicEstimate > depthLimit) {
        return false;
    }

    const possibleMovesFromBlank = adjacencyMap[blankTileIndex];
    for (let neighborPosition of possibleMovesFromBlank) {
        const nextLayout = currentLayout.slice(); 

        const tileToMove = nextLayout[neighborPosition];
        nextLayout[neighborPosition] = nextLayout[blankTileIndex];
        nextLayout[blankTileIndex] = tileToMove;

        if (solvePuzzleRecursive(nextLayout, currentDepth + 1, depthLimit, neighborPosition)) {
            return true;
        }
    }

    return false;
}

let finalSolutionLength = 0;
const initialBlankPosition = initialValues.indexOf(0);

for (let currentLimit = 0; currentLimit <= 45; currentLimit++) {
    if (solvePuzzleRecursive(initialValues, 0, currentLimit, initialBlankPosition)) {
        finalSolutionLength = currentLimit;
        break;
    }
}
console.log(finalSolutionLength);