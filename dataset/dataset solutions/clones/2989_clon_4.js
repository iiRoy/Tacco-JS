const collectedInput = [];
const inputReaderModule = require('readline');

const ioInterface = inputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioInterface.on('line', (currentLineData) => {
    collectedInput.push(currentLineData);
});

ioInterface.on('close', () => {
    const gridDimensions = collectedInput.splice(0, 1)[0].split(' ').map(s => parseInt(s, 10));
    const gridHeight = gridDimensions[0];
    const gridWidth = gridDimensions[1];

    const gridContent = collectedInput.map(rowStr => rowStr.split(''));

    const initialSources = [];
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            if (gridContent[rowIdx][colIdx] === '#') {
                initialSources.push([rowIdx, colIdx]);
            }
        }
    }

    console.log(calculateMaxPropagation(initialSources, gridHeight, gridWidth));
});

function calculateMaxPropagation(initialSources, height, width) {
    const propagationMap = Array.from({ length: height }, () => Array(width).fill(Infinity));
    let currentLevelCells = [];
    let peakDistance = 0;

    for (const source of initialSources) {
        const [r, c] = source;
        if (propagationMap[r][c] === Infinity) {
            propagationMap[r][c] = 0;
            currentLevelCells.push([r, c]);
        }
    }

    let currentDistance = 0;
    const neighborDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    while (currentLevelCells.length > 0) {
        let nextLevelCells = [];
        peakDistance = Math.max(peakDistance, currentDistance);

        for (const [cellRow, cellCol] of currentLevelCells) {
            for (const [dr, dc] of neighborDirections) {
                const neighborRow = cellRow + dr;
                const neighborCol = cellCol + dc;

                if (neighborRow >= 0 && neighborRow < height &&
                    neighborCol >= 0 && neighborCol < width) {
                    
                    if (propagationMap[neighborRow][neighborCol] === Infinity) {
                        propagationMap[neighborRow][neighborCol] = currentDistance + 1;
                        nextLevelCells.push([neighborRow, neighborCol]);
                    }
                }
            }
        }
        currentLevelCells = nextLevelCells;
        currentDistance++;
    }
    return peakDistance;
}