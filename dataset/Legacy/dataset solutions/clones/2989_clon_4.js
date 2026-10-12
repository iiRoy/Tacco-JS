let entireInput = '';

process.stdin.on('data', (segment) => {
    entireInput += segment.toString();
});

process.stdin.on('end', () => {
    const inputRows = entireInput.trim().split('\n');

    const dimensions = inputRows[0].split(' ').map(Number);
    const gridHeight = dimensions[0];
    const gridWidth = dimensions[1];

    const characterMatrix = inputRows.slice(1).map(line => line.split(''));

    const distanceMatrix = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(Infinity));
    const initialFrontier = [];

    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            if (characterMatrix[r][c] === '#') {
                distanceMatrix[r][c] = 0;
                initialFrontier.push([r, c]);
            }
        }
    }

    console.log(computeMaxDistance(gridHeight, gridWidth, initialFrontier, distanceMatrix));
});

function computeMaxDistance(hDim, wDim, startingPoints, distMap) {
    let currentLevelQueue = startingPoints;
    let currentLevelDepth = 0;
    let overallMaxDistance = 0;

    const cardinalDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // East, West, South, North

    while (currentLevelQueue.length > 0) {
        let nextLevelQueue = [];
        overallMaxDistance = Math.max(overallMaxDistance, currentLevelDepth);

        for (const currentCoords of currentLevelQueue) {
            const [yCoord, xCoord] = currentCoords;

            for (const [deltaY, deltaX] of cardinalDirections) {
                const nextY = yCoord + deltaY;
                const nextX = xCoord + deltaX;

                if (nextY >= 0 && nextY < hDim && nextX >= 0 && nextX < wDim) {
                    if (distMap[nextY][nextX] === Infinity) { // If not yet visited
                        distMap[nextY][nextX] = currentLevelDepth + 1;
                        nextLevelQueue.push([nextY, nextX]);
                    }
                }
            }
        }
        currentLevelQueue = nextLevelQueue;
        currentLevelDepth++;
    }
    return overallMaxDistance;
}
