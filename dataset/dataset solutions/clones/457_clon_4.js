var rawInput = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    rawInput += chunk;
});
process.stdin.on('end', function() {
    processScenarios(rawInput);
});

function processScenarios(fullInput) {
    const lineSegments = fullInput.trim().split('\n');
    let currentLineIndex = 0;

    while (true) {
        const dimensions = parseNumbers(lineSegments[currentLineIndex++]);
        if (isTerminalCondition(dimensions)) break;

        const gridWidth = dimensions[0];
        const gridHeight = dimensions[1];
        const gridData = new Uint32Array(gridWidth * gridHeight);

        const originCoords = parseNumbers(lineSegments[currentLineIndex++]);
        const targetCoords = parseNumbers(lineSegments[currentLineIndex++]);

        const blockQuantity = parseInt(lineSegments[currentLineIndex++]);
        for (let k = 0; k < blockQuantity; k++) {
            const blockDetails = parseNumbers(lineSegments[currentLineIndex++]);
            applyBlockToGrid(gridData, gridWidth, gridHeight, blockDetails);
        }

        const outcome = findPathBFS(
            gridData, gridWidth, gridHeight,
            originCoords[0] - 1, originCoords[1] - 1,
            targetCoords[0] - 1, targetCoords[1] - 1
        );
        console.log(outcome ? "OK" : "NO");
    }
}

function applyBlockToGrid(grid, gridW, gridH, blockInfo) {
    const blockIdentifier = blockInfo[0];
    const isHorizontalOrientation = !blockInfo[1];
    const effectiveBlockWidth = isHorizontalOrientation ? 4 : 2;
    const effectiveBlockHeight = isHorizontalOrientation ? 2 : 4;
    const startX = blockInfo[2] - 1;
    const startY = blockInfo[3] - 1;

    for (let currentX = startX; currentX < startX + effectiveBlockWidth; currentX++) {
        for (let currentY = startY; currentY < startY + effectiveBlockHeight; currentY++) {
            grid[currentX * gridH + currentY] = blockIdentifier;
        }
    }
}

function findPathBFS(grid, gridW, gridH, startX, startY, endX, endY) {
    if (startX === endX && startY === endY) {
        return true;
    }

    const traversalQueue = [];
    const visitedCoordinates = new Set();

    const initialKey = `${startX},${startY}`;
    traversalQueue.push([startX, startY]);
    visitedCoordinates.add(initialKey);

    const movementVectors = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    while (traversalQueue.length > 0) {
        const [currentX, currentY] = traversalQueue.shift();

        if (currentX === endX && currentY === endY) {
            return true;
        }

        const currentCellValue = grid[currentX * gridH + currentY];

        for (const [deltaX, deltaY] of movementVectors) {
            const nextX = currentX + deltaX;
            const nextY = currentY + deltaY;

            if (nextX < 0 || nextX >= gridW || nextY < 0 || nextY >= gridH) {
                continue;
            }

            const nextCellKey = `${nextX},${nextY}`;

            if (!visitedCoordinates.has(nextCellKey) && grid[nextX * gridH + nextY] === currentCellValue) {
                visitedCoordinates.add(nextCellKey);
                traversalQueue.push([nextX, nextY]);
            }
        }
    }

    return false;
}

function parseNumbers(inputString) {
    return inputString.split(' ').map(Number);
}

function isTerminalCondition(inputArray) {
    return inputArray[0] === 0 && inputArray[1] === 0;
}
