var rawInput = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    rawInput += chunk;
});
process.stdin.on('end', function() {
    processInput(rawInput);
});

function processInput(fullText){
    const lines = fullText.trim().split('\n');
    let lineCursor = 0;

    while(true) {
        const dimensionsStr = lines[lineCursor++];
        const [gridWidth, gridHeight] = dimensionsStr.split(' ').map(Number);

        if(gridWidth === 0 && gridHeight === 0) break;

        const blockGrid = new Map(); // Stores "col,row" -> blockID
        
        const originStr = lines[lineCursor++];
        const [startX, startY] = originStr.split(' ').map(Number);

        const destinationStr = lines[lineCursor++];
        const [goalX, goalY] = destinationStr.split(' ').map(Number);

        const obstacleCount = parseInt(lines[lineCursor++], 10);
        for(let k = 0; k < obstacleCount; k += 1){
            const obstacleDetailsStr = lines[lineCursor++];
            const obstacleDetails = obstacleDetailsStr.split(' ').map(Number);
            placeObstacle(blockGrid, obstacleDetails);
        }

        const pathFound = findPathBFS(blockGrid, startX - 1, startY - 1, goalX - 1, goalY - 1, gridWidth, gridHeight);
        console.log(pathFound ? "OK" : "NO");
    }
}

function placeObstacle(gridMap, details){
    const [obstacleID, orientationFlag, coordX, coordY] = details;
    const isWide = (orientationFlag === 0); // 0 for horizontal (4x2), 1 for vertical (2x4)
    
    const effectiveWidth = isWide ? 4 : 2;
    const effectiveHeight = isWide ? 2 : 4;
    
    const startCol = coordX - 1;
    const startRow = coordY - 1;

    for(let col = startCol; col < startCol + effectiveWidth; col += 1){
        for(let row = startRow; row < startRow + effectiveHeight; row += 1){
            gridMap.set(`${col},${row}`, obstacleID);
        }
    }
}

function findPathBFS(gridMap, initialX, initialY, targetX, targetY, maxWidth, maxHeight){
    if (initialX === targetX && initialY === targetY) {
        return true;
    }

    const startKey = `${initialX},${initialY}`;
    const segmentID = gridMap.has(startKey) ? gridMap.get(startKey) : 0; // 0 for empty space

    const traversalQueue = [];
    traversalQueue.push([initialX, initialY]);

    const visitedCells = new Set();
    visitedCells.add(startKey);

    const deltaCoords = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Diagonal movements

    while(traversalQueue.length > 0){
        const [currentX, currentY] = traversalQueue.shift();

        if(currentX === targetX && currentY === targetY){
            return true;
        }

        for(const [dx, dy] of deltaCoords){
            const nextX = currentX + dx;
            const nextY = currentY + dy;
            const nextKey = `${nextX},${nextY}`;

            // Boundary check
            if(nextX < 0 || nextX >= maxWidth || nextY < 0 || nextY >= maxHeight){
                continue;
            }

            // Visited check
            if(visitedCells.has(nextKey)){
                continue;
            }

            const neighborSegmentID = gridMap.has(nextKey) ? gridMap.get(nextKey) : 0;

            // Block ID check (must be same segmentID)
            if(neighborSegmentID === segmentID){
                visitedCells.add(nextKey);
                traversalQueue.push([nextX, nextY]);
            }
        }
    }

    return false;
}
