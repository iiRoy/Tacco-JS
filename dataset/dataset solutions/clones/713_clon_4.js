function analyzeTerrain(widthDim, heightDim, terrainGrid) {
    let regionCount = 0;

    const displacementVectors = [
        { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
        { row: 0, col: -1 },                      { row: 0, col: 1 },
        { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
    ];

    for (let currentY = 0; currentY < heightDim; currentY++) {
        for (let currentX = 0; currentX < widthDim; currentX++) {
            if (terrainGrid[currentY][currentX] === 1) {
                regionCount++;
                
                const explorationQueue = [{ y: currentY, x: currentX }];
                terrainGrid[currentY][currentX] = 0; // Mark as visited by changing its value

                let queueReadPointer = 0; 
                while (queueReadPointer < explorationQueue.length) {
                    const { y: processingY, x: processingX } = explorationQueue[queueReadPointer++];

                    for (const offset of displacementVectors) {
                        const nextY = processingY + offset.row;
                        const nextX = processingX + offset.col;

                        if (
                            nextY >= 0 && nextY < heightDim &&
                            nextX >= 0 && nextX < widthDim &&
                            terrainGrid[nextY][nextX] === 1
                        ) {
                            terrainGrid[nextY][nextX] = 0; // Mark as visited
                            explorationQueue.push({ y: nextY, x: nextX });
                        }
                    }
                }
            }
        }
    }
    return regionCount;
}

function processGeographicDataAndLog(rawData) {
    const inputLines = rawData.trim().split("\n");
    let linePointer = 0;

    while (true) {
        const dimensionsLine = inputLines[linePointer++].split(" ").map(Number);
        const currentWidth = dimensionsLine[0];
        const currentHeight = dimensionsLine[1];

        if (currentWidth === 0 && currentHeight === 0) {
            break;
        }

        const currentTerrain = [];
        for (let rowIdx = 0; rowIdx < currentHeight; rowIdx++) {
            currentTerrain.push(inputLines[linePointer++].split(" ").map(Number));
        }

        const islandsFound = analyzeTerrain(currentWidth, currentHeight, currentTerrain);
        console.log(islandsFound);
    }
}

processGeographicDataAndLog(require("fs").readFileSync("/dev/stdin","utf8"));