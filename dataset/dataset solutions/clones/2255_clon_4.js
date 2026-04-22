"use strict";

function CustomQueue() {
    let collection = [];
    let frontPointer = 0;

    this.deposit = function(item) {
        collection.push(item);
    };

    this.extract = function() {
        if (this.isEmpty()) {
            return undefined;
        }
        const item = collection[frontPointer];
        frontPointer++;
        return item;
    };

    this.isEmpty = function() {
        return frontPointer >= collection.length;
    };
}

const processGridTraversal = initialInput => {
    const processedSegments = initialInput.trim().split(/\r?\n/).filter(segment => segment.length > 0);

    const sizeTokens = processedSegments[0].match(/\d+/g);
    const gridHeight = Number(sizeTokens[0]);
    const gridWidth = Number(sizeTokens[1]);

    const gridLayout = processedSegments.slice(1).map(line => line.split(''));

    const determineMaxPassageLength = (startingY, startingX, layoutData, layoutH, layoutW) => {
        const yMoves = [-1, 0, 1, 0]; // North, East, South, West
        const xMoves = [0, 1, 0, -1];

        const pathDistanceRegistry = new Map(); // Key: "y_x", Value: distance from starting point
        const explorationQueue = new CustomQueue();
        let currentMaxPath = 0;

        const originKey = `${startingY}_${startingX}`;
        explorationQueue.deposit({ y: startingY, x: startingX });
        pathDistanceRegistry.set(originKey, 0);

        while (!explorationQueue.isEmpty()) {
            const currentCell = explorationQueue.extract();
            const currentCellDistance = pathDistanceRegistry.get(`${currentCell.y}_${currentCell.x}`);

            for (let moveIndex = 0; moveIndex < 4; moveIndex++) {
                const nextYCoordinate = currentCell.y + yMoves[moveIndex];
                const nextXCoordinate = currentCell.x + xMoves[moveIndex];
                const nextCellKey = `${nextYCoordinate}_${nextXCoordinate}`;

                // Check for out-of-bounds, obstacle, or already-visited in this BFS
                const isOutOfBounds = nextXCoordinate < 0 || layoutW <= nextXCoordinate ||
                                      nextYCoordinate < 0 || layoutH <= nextYCoordinate;
                const isObstacle = !isOutOfBounds && layoutData[nextYCoordinate][nextXCoordinate] === '#';
                const alreadyRecorded = pathDistanceRegistry.has(nextCellKey);

                if (isOutOfBounds || isObstacle || alreadyRecorded) {
                    continue;
                }

                pathDistanceRegistry.set(nextCellKey, currentCellDistance + 1);
                explorationQueue.deposit({ y: nextYCoordinate, x: nextXCoordinate });
                currentMaxPath = Math.max(currentMaxPath, currentCellDistance + 1);
            }
        }
        return currentMaxPath;
    };

    const allCellCoordinates = Array.from({ length: gridHeight }, (_, r) =>
        Array.from({ length: gridWidth }, (_, c) => ({ y: r, x: c }))
    ).flat();

    const overallMaximumDistance = allCellCoordinates.reduce((accumulatedMax, cellLocation) => {
        if (gridLayout[cellLocation.y][cellLocation.x] !== '#') {
            const distanceFromThisCell = determineMaxPassageLength(cellLocation.y, cellLocation.x, gridLayout, gridHeight, gridWidth);
            return Math.max(accumulatedMax, distanceFromThisCell);
        }
        return accumulatedMax;
    }, 0);

    console.log(overallMaximumDistance);
};

processGridTraversal(require('fs').readFileSync('/dev/stdin', 'utf8'));