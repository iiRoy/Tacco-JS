const determineFinalColumn = (initialRowIdentifier, initialColumnIdentifier, gridLayout, totalGridColumns) => {
    const cellDesignation = gridLayout[initialRowIdentifier][initialColumnIdentifier];
    if (cellDesignation === 1) {
        let scanColumn = initialColumnIdentifier;
        while (scanColumn < totalGridColumns && gridLayout[initialRowIdentifier][scanColumn] === 1) {
            scanColumn++;
        }
        return scanColumn - 1;
    } else if (cellDesignation === 2) {
        let scanColumn = initialColumnIdentifier;
        while (scanColumn >= 0 && gridLayout[initialRowIdentifier][scanColumn] === 2) {
            scanColumn--;
        }
        return scanColumn + 1;
    }
    return initialColumnIdentifier;
};

const findMinimumSteps = (gridLayout, totalGridColumns) => {
    let traversalQueue = [{ r: 0, c: 0, s: 0 }, { r: 1, c: 0, s: 0 }];
    const visitedCoordinates = new Set();

    let shortestPathLength = "NA";

    let queueHeadPointer = 0;

    while (queueHeadPointer < traversalQueue.length) {
        const { r: currentR, c: currentC, s: currentS } = traversalQueue[queueHeadPointer++];

        const coordinateKey = `${currentR},${currentC}`;
        if (visitedCoordinates.has(coordinateKey)) {
            continue;
        }
        visitedCoordinates.add(coordinateKey);

        if (currentC === totalGridColumns - 1 && gridLayout[currentR][currentC] !== 2) {
            shortestPathLength = currentS;
            break;
        }

        const effectiveColumnAfterMovement = determineFinalColumn(currentR, currentC, gridLayout, totalGridColumns);

        for (let columnOffset = 0; columnOffset <= 2; columnOffset++) {
            const nextRowIndex = 1 - currentR;
            const nextColumnIndex = effectiveColumnAfterMovement + columnOffset;
            traversalQueue.push({ r: nextRowIndex, c: nextColumnIndex, s: currentS + 1 });
        }
    }
    return shortestPathLength;
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split('\n');
let currentLineIndex = 0;

while (true) {
    const currentGridWidth = parseInt(inputLines[currentLineIndex++], 10);
    if (currentGridWidth === 0) break;

    const gameGrid = [];
    gameGrid[0] = inputLines[currentLineIndex++].split(' ').map(Number);
    gameGrid[1] = inputLines[currentLineIndex++].split(' ').map(Number);

    console.log(findMinimumSteps(gameGrid, currentGridWidth));
}
