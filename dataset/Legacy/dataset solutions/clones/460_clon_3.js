var accumulatedInput = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
    accumulatedInput += dataChunk;
});
process.stdin.on('end', function() {
    processInput(accumulatedInput);
});

function processInput(fullInputString){
    var inputLines = fullInputString.trim().split('\n');

    var currentLinePointer = 0;
    for (;;) {
        var mapDimensions = parseNumbers(inputLines[currentLinePointer++]);
        if(isZeroDimensions(mapDimensions)) {
            break;
        }

        var currentGrid = [];
        initializeGrid(mapDimensions, currentGrid);

        var startCoordinates = parseNumbers(inputLines[currentLinePointer++]);
        var targetCoordinates = parseNumbers(inputLines[currentLinePointer++]);

        var numberOfObstacles = parseInt(inputLines[currentLinePointer++], 10);
        for(var obstacleIndex = 0; obstacleIndex < numberOfObstacles; obstacleIndex += 1){
            var obstacleDefinition = parseNumbers(inputLines[currentLinePointer++]);
            placeObstacle(currentGrid, obstacleDefinition);
        }

        var adjustedStartX = startCoordinates[0] - 1;
        var adjustedStartY = startCoordinates[1] - 1;
        var adjustedTargetX = targetCoordinates[0] - 1;
        var adjustedTargetY = targetCoordinates[1] - 1;

        var pathFoundResult = checkPathReachability(currentGrid, adjustedStartX, adjustedStartY, adjustedTargetX, adjustedTargetY);
        console.log(pathFoundResult ? "OK" : "NO");
    }
}

function initializeGrid(dimensionsArray, targetGrid){
    const gridRows = dimensionsArray[0];
    const gridCols = dimensionsArray[1];

    for(let r = 0; r < gridRows; r += 1){
        let rowData = [];
        for(let c = 0; c < gridCols; c += 1){
            rowData.push(0);
        }
        targetGrid.push(rowData);
    }
}

function placeObstacle(targetGrid, obstacleDetails){
    const obstacleId = obstacleDetails[0];
    const orientationIsHorizontal = (obstacleDetails[1] === 0);

    const blockWidth = orientationIsHorizontal ? 4 : 2;
    const blockHeight = orientationIsHorizontal ? 2 : 4;

    const startXPosition = obstacleDetails[2] - 1;
    const startYPosition = obstacleDetails[3] - 1;

    for(let currentX = startXPosition; currentX < startXPosition + blockWidth; currentX += 1){
        for(let currentY = startYPosition; currentY < startYPosition + blockHeight; currentY += 1){
            targetGrid[currentX][currentY] = obstacleId;
        }
    }
}

function checkPathReachability(currentGrid, currentX, currentY, targetX, targetY){
    if(currentX === targetX && currentY === targetY){
        return true;
    }

    const segmentId = currentGrid[currentX][currentY];
    currentGrid[currentX][currentY] = -2;

    let foundPathSegment = false;

    const deltaOffsets = [-1, 1];

    for (let dxIndex = 0; dxIndex < deltaOffsets.length; dxIndex++) {
        const dx = deltaOffsets[dxIndex];
        for (let dyIndex = 0; dyIndex < deltaOffsets.length; dyIndex++) {
            const dy = deltaOffsets[dyIndex];

            const nextX = currentX + dx;
            const nextY = currentY + dy;

            if (nextX >= 0 && nextX < currentGrid.length &&
                nextY >= 0 && nextY < currentGrid[0].length &&
                currentGrid[nextX][nextY] === segmentId) {
                foundPathSegment = foundPathSegment || checkPathReachability(currentGrid, nextX, nextY, targetX, targetY);
            }
        }
    }
    return foundPathSegment;
}

function parseNumbers(inputString){
    return inputString.split(' ').map(val => parseInt(val, 10));
}

function isZeroDimensions(dimensionsArray){
    if (dimensionsArray.length < 2) {
        return false;
    }
    return dimensionsArray[0] === 0 && dimensionsArray[1] === 0;
}
