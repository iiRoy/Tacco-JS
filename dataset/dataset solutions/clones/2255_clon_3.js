"use strict";

const main = (rawInputString) => {
    const processGridInput = (inputLines) => {
        const [dimensionsLine, ...gridContentLines] = inputLines;
        const [heightStr, widthStr] = dimensionsLine.split(" ");
        const gridHeight = parseInt(heightStr, 10);
        const gridWidth = parseInt(widthStr, 10);
        const gridMap = gridContentLines.slice(0, gridHeight).map(rowString => rowString.split(""));
        return { gridHeight, gridWidth, gridMap };
    };

    const inputLines = rawInputString.trim().split("\n");
    const { gridHeight, gridWidth, gridMap } = processGridInput(inputLines);

    const calculateMaxReachableDistanceBFS = (startY, startX, currentGrid, hDim, wDim) => {
        const movementVectors = [
            [-1, 0], // Up: deltaY, deltaX
            [0, 1],  // Right
            [1, 0],  // Down
            [0, -1]  // Left
        ];

        const distanceTracker = Array.from({ length: hDim }, () => Array(wDim).fill(-1));
        const bfsQueue = [];
        let maxDistanceInCurrentBFS = 0;

        bfsQueue.push([startY, startX]);
        distanceTracker[startY][startX] = 0;

        const isWithinGridBounds = (y, x) => x >= 0 && x < wDim && y >= 0 && y < hDim;
        const isGridCellAWall = (y, x) => currentGrid[y][x] === '#';
        const hasBeenVisited = (y, x) => distanceTracker[y][x] !== -1;

        while (bfsQueue.length > 0) {
            const [currentY, currentX] = bfsQueue.shift();
            const currentPathLength = distanceTracker[currentY][currentX];

            for (const [deltaY, deltaX] of movementVectors) {
                const nextY = currentY + deltaY;
                const nextX = currentX + deltaX;

                if (!isWithinGridBounds(nextY, nextX)) {
                    continue;
                }
                if (isGridCellAWall(nextY, nextX)) {
                    continue;
                }
                if (hasBeenVisited(nextY, nextX)) {
                    continue;
                }

                distanceTracker[nextY][nextX] = currentPathLength + 1;
                bfsQueue.push([nextY, nextX]);
                maxDistanceInCurrentBFS = Math.max(maxDistanceInCurrentBFS, distanceTracker[nextY][nextX]);
            }
        }
        return maxDistanceInCurrentBFS;
    };

    let overallMaxDistance = 0;

    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            if (gridMap[rowIdx][colIdx] === "#") {
                continue;
            }
            const currentPathMax = calculateMaxReachableDistanceBFS(rowIdx, colIdx, gridMap, gridHeight, gridWidth);
            overallMaxDistance = Math.max(overallMaxDistance, currentPathMax);
        }
    }

    console.log(overallMaxDistance);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
