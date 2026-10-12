var rawData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    rawData += chunk;
});
process.stdin.on('end', function() {
    processInputData(rawData);
});

function parseNumbersFromString(inputString) {
    return inputString.split(' ').map(Number);
}

const TERMINATION_DIMENSIONS = [0, 0];
function isTerminationCondition(dimensionsArray) {
    return dimensionsArray[0] === TERMINATION_DIMENSIONS[0] && dimensionsArray[1] === TERMINATION_DIMENSIONS[1];
}

function initializeGrid(dimensions, targetGrid) {
    const [gridWidth, gridHeight] = dimensions;
    for (let x = 0; x < gridWidth; x++) {
        targetGrid.push(Array(gridHeight).fill(0));
    }
}

function getBlockDimensions(blockTypeIndicator) {
    const isBlockHorizontal = !blockTypeIndicator;
    const width = isBlockHorizontal ? 4 : 2;
    const height = isBlockHorizontal ? 2 : 4;
    return { width, height };
}

function placeBlockOnGrid(gridMatrix, blockData) {
    const [blockColor, blockTypeIndicator, blockRawX, blockRawY] = blockData;
    const blockStartX = blockRawX - 1;
    const blockStartY = blockRawY - 1;

    const { width: blockWidth, height: blockHeight } = getBlockDimensions(blockTypeIndicator);

    for (let gridX = blockStartX; gridX < blockStartX + blockWidth; gridX++) {
        for (let gridY = blockStartY; gridY < blockStartY + blockHeight; gridY++) {
            gridMatrix[gridX][gridY] = blockColor;
        }
    }
}

function areCoordsValid(x, y, grid) {
    return x >= 0 && y >= 0 && x < grid.length && y < grid[0].length;
}

function checkPathExistence(gridMatrix, currentX, currentY, targetX, targetY) {
    if (currentX === targetX && currentY === targetY) {
        return true;
    }

    if (!areCoordsValid(currentX, currentY, gridMatrix)) {
        return false;
    }

    const cellColor = gridMatrix[currentX][currentY];
    if (cellColor === -2) {
        return false;
    }

    gridMatrix[currentX][currentY] = -2;

    let pathFound = false;
    const neighborDeltas = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [deltaX, deltaY] of neighborDeltas) {
        const nextX = currentX + deltaX;
        const nextY = currentY + deltaY;

        if (areCoordsValid(nextX, nextY, gridMatrix) && gridMatrix[nextX][nextY] === cellColor) {
            pathFound = pathFound || checkPathExistence(gridMatrix, nextX, nextY, targetX, targetY);
            if (pathFound) {
                break;
            }
        }
    }
    return pathFound;
}

function handleSingleTestCase(inputLines, currentLineIndex) {
    const gridMatrix = [];
    const dimensions = parseNumbersFromString(inputLines[currentLineIndex++]);

    if (isTerminationCondition(dimensions)) {
        return { shouldTerminate: true, nextIndex: currentLineIndex };
    }

    initializeGrid(dimensions, gridMatrix);

    const startCoords = parseNumbersFromString(inputLines[currentLineIndex++]);
    const targetCoords = parseNumbersFromString(inputLines[currentLineIndex++]);

    const numBlocks = Number(inputLines[currentLineIndex++]);
    for (let j = 0; j < numBlocks; j++) {
        const currentBlockData = parseNumbersFromString(inputLines[currentLineIndex++]);
        placeBlockOnGrid(gridMatrix, currentBlockData);
    }

    const reachabilityResult = checkPathExistence(
        gridMatrix,
        startCoords[0] - 1,
        startCoords[1] - 1,
        targetCoords[0] - 1,
        targetCoords[1] - 1
    );
    console.log(reachabilityResult ? "OK" : "NO");

    return { shouldTerminate: false, nextIndex: currentLineIndex };
}

function processInputData(inputContent) {
    const inputLines = inputContent.trim().split('\n');
    let lineIndex = 0;

    while (true) {
        const result = handleSingleTestCase(inputLines, lineIndex);
        lineIndex = result.nextIndex;
        if (result.shouldTerminate) {
            break;
        }
    }
}
