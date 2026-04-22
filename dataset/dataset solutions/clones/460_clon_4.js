let _collectedInput = '';

const _sysInputChannel = process.stdin;
_sysInputChannel.resume();
_sysInputChannel.setEncoding('utf8');
_sysInputChannel.on('data', function(dataChunk) {
    _collectedInput += dataChunk;
});
_sysInputChannel.on('end', function() {
    executeAllScenarios(_collectedInput);
});

function executeAllScenarios(rawScenarioData) {
    const scenarioLines = rawScenarioData.trim().split('\n');

    for (const currentScenario of scenarioParser(scenarioLines)) {
        const { gridWidth, gridHeight, initialX, initialY, finalX, finalY, obstructionSpecs } = currentScenario;

        const surfaceLayout = constructSurface(gridWidth, gridHeight);

        for (const spec of obstructionSpecs) {
            placeObstruction(surfaceLayout, spec, gridWidth, gridHeight);
        }

        const pathOutcome = canTraverse(surfaceLayout, gridWidth, gridHeight, initialX, initialY, finalX, finalY);
        console.log(pathOutcome ? "OK" : "NO");
    }
}

function* scenarioParser(lines) {
    let currentLineIndex = 0;
    while (true) {
        const dimensions = extractNumbers(lines[currentLineIndex++]);
        if (isTerminationSignal(dimensions)) {
            break;
        }

        const entryCoords = extractNumbers(lines[currentLineIndex++]);
        const exitCoords = extractNumbers(lines[currentLineIndex++]);

        const obstacleQuantity = parseInt(lines[currentLineIndex++]);
        const obstacleDetails = [];
        for (let k = 0; k < obstacleQuantity; k++) {
            obstacleDetails.push(extractNumbers(lines[currentLineIndex++]));
        }

        yield {
            gridWidth: dimensions[0],
            gridHeight: dimensions[1],
            initialX: entryCoords[0] - 1,
            initialY: entryCoords[1] - 1,
            finalX: exitCoords[0] - 1,
            finalY: exitCoords[1] - 1,
            obstructionSpecs: obstacleDetails
        };
    }
}

function constructSurface(widthVal, heightVal) {
    const layoutMap = new Map();
    for (let xCoord = 0; xCoord < widthVal; xCoord++) {
        for (let yCoord = 0; yCoord < heightVal; yCoord++) {
            layoutMap.set(`${xCoord},${yCoord}`, 0);
        }
    }
    return layoutMap;
}

function placeObstruction(layoutMap, obstructionSpec, totalWidth, totalHeight) {
    const isWide = !obstructionSpec[1];
    const extentWidth = isWide ? 4 : 2;
    const extentHeight = isWide ? 2 : 4;
    const startX = obstructionSpec[2] - 1;
    const startY = obstructionSpec[3] - 1;
    const blockIdentifier = obstructionSpec[0];

    for (let currentX = startX; currentX < startX + extentWidth; currentX++) {
        for (let currentY = startY; currentY < startY + extentHeight; currentY++) {
            if (currentX >= 0 && currentX < totalWidth && currentY >= 0 && currentY < totalHeight) {
                layoutMap.set(`${currentX},${currentY}`, blockIdentifier);
            }
        }
    }
}

function canTraverse(layoutMap, totalWidth, totalHeight, originX, originY, destinationX, destinationY) {
    if (originX === destinationX && originY === destinationY) {
        return true;
    }

    const startKey = `${originX},${originY}`;
    const initialSegmentId = layoutMap.get(startKey);

    if (initialSegmentId === undefined) {
        return false;
    }

    const explorationQueue = [[originX, originY]];
    const visitedLocations = new Set();
    visitedLocations.add(startKey);

    const adjacentOffsets = [
        [-1, -1], [1, -1], [-1, 1], [1, 1]
    ];

    while (explorationQueue.length > 0) {
        const [currentX, currentY] = explorationQueue.shift();

        if (currentX === destinationX && currentY === destinationY) {
            return true;
        }

        for (const [deltaX, deltaY] of adjacentOffsets) {
            const nextX = currentX + deltaX;
            const nextY = currentY + deltaY;
            const nextLocationKey = `${nextX},${nextY}`;

            if (nextX >= 0 && nextX < totalWidth &&
                nextY >= 0 && nextY < totalHeight &&
                !visitedLocations.has(nextLocationKey)) {

                const neighborSegmentId = layoutMap.get(nextLocationKey);

                if (neighborSegmentId !== undefined && neighborSegmentId === initialSegmentId) {
                    visitedLocations.add(nextLocationKey);
                    explorationQueue.push([nextX, nextY]);
                }
            }
        }
    }

    return false;
}

function extractNumbers(textString) {
    return textString.split(' ').map(Number);
}

function isTerminationSignal(coordinatesArray) {
    return coordinatesArray[0] === 0 && coordinatesArray[1] === 0;
}