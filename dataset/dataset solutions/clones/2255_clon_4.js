const processInput = (rawInput) => {
    const lines = rawInput.trim().split("\n");
    const dimensions = lines[0].split(" ");
    const gridRows = parseInt(dimensions[0]);
    const gridCols = parseInt(dimensions[1]);
    const terrainGrid = lines.slice(1, gridRows + 1).map(lineSegment => lineSegment.split(""));
    
    const calculateMaxPathFromOrigin = (startYCoord, startXCoord, totalRows, totalCols, mapData) => {
        const pathLengths = Array.from({ length: totalRows }, () => Array(totalCols).fill(null));
        let currentLevelNodes = [[startYCoord, startXCoord]];
        pathLengths[startYCoord][startXCoord] = 0;
        let currentMaxDistance = 0;
        
        const movementDeltas = [[-1, 0], [0, 1], [1, 0], [0, -1]];
        
        while (currentLevelNodes.length > 0) {
            let nextLevelNodes = [];
            for (const [currentY, currentX] of currentLevelNodes) {
                const distanceToCurrent = pathLengths[currentY][currentX];
                
                for (const [deltaY, deltaX] of movementDeltas) {
                    const nextY = currentY + deltaY;
                    const nextX = currentX + deltaX;
                    
                    if (nextX < 0 || nextX >= totalCols) continue;
                    if (nextY < 0 || nextY >= totalRows) continue;
                    if (mapData[nextY][nextX] === '#') continue;
                    if (pathLengths[nextY][nextX] !== null) continue;
                    
                    pathLengths[nextY][nextX] = distanceToCurrent + 1;
                    currentMaxDistance = Math.max(currentMaxDistance, pathLengths[nextY][nextX]);
                    nextLevelNodes.push([nextY, nextX]);
                }
            }
            currentLevelNodes = nextLevelNodes;
        }
        
        return currentMaxDistance;
    };
    
    let overallMaximumDistance = 0;
    
    const allPossibleStarts = Array.from({ length: gridRows }, (_, r) =>
        Array.from({ length: gridCols }, (_, c) => [r, c])
    ).flat();

    overallMaximumDistance = allPossibleStarts.reduce((currentGlobalMax, [rowCoord, colCoord]) => {
        if (terrainGrid[rowCoord][colCoord] === "#") {
            return currentGlobalMax;
        }
        const distanceForThisStart = calculateMaxPathFromOrigin(rowCoord, colCoord, gridRows, gridCols, terrainGrid);
        return Math.max(currentGlobalMax, distanceForThisStart);
    }, 0);
    
    console.log(overallMaximumDistance);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
