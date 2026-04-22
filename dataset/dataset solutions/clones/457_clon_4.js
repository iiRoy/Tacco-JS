let collectedInput = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (segment) => {
    collectedInput += segment;
});
process.stdin.on('end', () => {
    initiateProcessing(collectedInput);
});

const extractNumbers = (textLine) => textLine.split(' ').map(Number);

const isSignalToHalt = (values) => values[0] === 0 && values[1] === 0;

const establishZone = (width, height) => Array.from({ length: width }, () => Array.from({ length: height }, () => 0));

const fillSection = (gridRef, sectionInfo) => {
    const sectionIdentifier = sectionInfo[0];
    const isHorizontalLayout = sectionInfo[1] === 0;
    const regionWidth = isHorizontalLayout ? 4 : 2;
    const regionHeight = isHorizontalLayout ? 2 : 4;
    const startX = sectionInfo[2] - 1;
    const startY = sectionInfo[3] - 1;

    for (let currentX = startX; currentX < startX + regionWidth; currentX++) {
        for (let currentY = startY; currentY < startY + regionHeight; currentY++) {
            // Ensure coordinates are within grid boundaries before assignment
            if (currentX >= 0 && currentX < gridRef.length &&
                currentY >= 0 && currentY < gridRef[0].length) {
                gridRef[currentX][currentY] = sectionIdentifier;
            }
        }
    }
};

const seekConnection = (zoneMatrix, startCoordX, startCoordY, endCoordX, endCoordY) => {
    if (startCoordX === endCoordX && startCoordY === endCoordY) {
        return true;
    }

    // Check initial coordinates are within bounds and accessible
    if (startCoordX < 0 || startCoordX >= zoneMatrix.length ||
        startCoordY < 0 || startCoordY >= zoneMatrix[0].length) {
        return false;
    }

    const initialColor = zoneMatrix[startCoordX][startCoordY];
    const explorationQueue = [[startCoordX, startCoordY]];
    const visitedLocations = new Set();
    visitedLocations.add(`${startCoordX},${startCoordY}`);

    const neighborDisplacements = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    const maxGridX = zoneMatrix.length;
    const maxGridY = zoneMatrix[0].length;

    while (explorationQueue.length > 0) {
        const [currentX, currentY] = explorationQueue.shift();

        for (const [dx, dy] of neighborDisplacements) {
            const nextX = currentX + dx;
            const nextY = currentY + dy;

            if (nextX < 0 || nextX >= maxGridX || nextY < 0 || nextY >= maxGridY) {
                continue;
            }

            const nextCoordKey = `${nextX},${nextY}`;
            if (visitedLocations.has(nextCoordKey)) {
                continue;
            }

            if (zoneMatrix[nextX][nextY] === initialColor) {
                if (nextX === endCoordX && nextY === endCoordY) {
                    return true;
                }
                visitedLocations.add(nextCoordKey);
                explorationQueue.push([nextX, nextY]);
            }
        }
    }
    return false;
};

const initiateProcessing = (completeText) => {
    const rawLines = completeText.trim().split('\n');
    let currentLineIndex = 0;

    while (true) {
        const dimensions = extractNumbers(rawLines[currentLineIndex++]);
        if (isSignalToHalt(dimensions)) break;

        const gridWidth = dimensions[0];
        const gridHeight = dimensions[1];
        const currentZone = establishZone(gridWidth, gridHeight);

        const entryPoint = extractNumbers(rawLines[currentLineIndex++]);
        const exitPoint = extractNumbers(rawLines[currentLineIndex++]);

        const totalObstructions = parseInt(rawLines[currentLineIndex++], 10);
        for (let k = 0; k < totalObstructions; k++) {
            const obstructionData = extractNumbers(rawLines[currentLineIndex++]);
            fillSection(currentZone, obstructionData);
        }

        const pathFound = seekConnection(
            currentZone,
            entryPoint[0] - 1, entryPoint[1] - 1,
            exitPoint[0] - 1, exitPoint[1] - 1
        );
        console.log(pathFound ? "OK" : "NO");
    }
};