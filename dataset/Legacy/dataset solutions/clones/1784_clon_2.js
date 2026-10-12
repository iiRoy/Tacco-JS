function*inputLineIterator(){
    const fileData = require("fs").readFileSync("/dev/stdin", "utf-8").trim().split(/\n|\s/);
    yield* fileData;
}

function obtainMultiple(itemCount, sourceIterator) {
    const activeIterator = sourceIterator || this.inputSource || (this.inputSource = inputLineIterator());
    const collectedItems = [];
    for (let idx = 0; idx < itemCount; idx += 1) {
        collectedItems.push(activeIterator.next().value);
    }
    return collectedItems;
}

(() => {
    // Read grid dimensions and maximum movement distance
    const [ gridHeight, gridWidth, maxMoveDistance ] = obtainMultiple(3).map(it => parseInt(it));
    // Read start and end coordinates, adjusting to 0-indexed
    const [ initialX, initialY, targetX, targetY ] = obtainMultiple(4).map(it => parseInt(it) - 1);

    // Initialize the level layout from input
    const levelLayout = [];
    for (let rowCounter = 0; rowCounter < gridHeight; rowCounter += 1) {
        const currentLineContent = obtainMultiple(1)[0].split('');
        levelLayout.push([ ...currentLineContent ]);
    }

    // Initialize the distance matrix for BFS
    const distanceMatrix = [];
    for (let matrixRow = 0; matrixRow < gridHeight; matrixRow += 1) {
        distanceMatrix.push([]);
        for (let matrixCol = 0; matrixCol < gridWidth; matrixCol += 1) {
            if (levelLayout[matrixRow][matrixCol] === '@') {
                distanceMatrix[matrixRow].push(-1); // Mark obstacles
            } else {
                distanceMatrix[matrixRow].push(null); // Unvisited cells
            }
        }
    }

    // Set starting point distance and initialize BFS queue
    distanceMatrix[initialX][initialY] = 0;
    let processingQueue = [[ initialX, initialY ]];

    // Helper function to safely update a cell's distance
    const updateCellDistance = (cellX, cellY, distValue) => {
        if (cellX >= 0 && cellY >= 0 && cellX < gridHeight && cellY < gridWidth) {
            distanceMatrix[cellX][cellY] = distValue;
        }
    };

    // Helper function to safely retrieve a cell's distance
    const retrieveCellDistance = (queryXCoord, queryYCoord) => {
        const tempRowRef = distanceMatrix[queryXCoord];
        if (tempRowRef) {
            return tempRowRef[queryYCoord];
        }
        return undefined; // Return undefined for out-of-bounds access
    };

    // Debugging function (not used in final output)
    const displayDistanceMatrix = () => {
        console.log();
        for (const matrixRowData of distanceMatrix) {
            console.log(matrixRowData);
        }
    };

    // Main Breadth-First Search loop
    while (true) {
        const currentPosition = processingQueue.shift();
        if (!currentPosition) {
            break; // Queue is empty, no more paths to explore
        }

        const [ currentPosX, currentPosY ] = currentPosition;
        const nextPathLength = retrieveCellDistance(currentPosX, currentPosY) + 1;

        // If target reached, we can stop
        if (currentPosX === targetX && currentPosY === targetY) {
            break;
        }

        // Explore moves in four cardinal directions
        // Move Down (positive X)
        for (let stepIncrement = 1; stepIncrement <= maxMoveDistance; stepIncrement += 1) {
            const nextPosX = currentPosX + stepIncrement;
            const nextPosY = currentPosY;
            const cellStatus = retrieveCellDistance(nextPosX, nextPosY);
            if (cellStatus === undefined || cellStatus === -1) {
                break; // Out of bounds or hit an obstacle
            }
            if (cellStatus === null) {
                updateCellDistance(nextPosX, nextPosY, nextPathLength);
                processingQueue.push([ nextPosX, nextPosY ]);
            }
        }

        // Move Up (negative X)
        for (let stepIncrement = 1; stepIncrement <= maxMoveDistance; stepIncrement += 1) {
            const nextPosX = currentPosX - stepIncrement;
            const nextPosY = currentPosY;
            const cellStatus = retrieveCellDistance(nextPosX, nextPosY);
            if (cellStatus === undefined || cellStatus === -1) {
                break; // Out of bounds or hit an obstacle
            }
            if (cellStatus === null) {
                updateCellDistance(nextPosX, nextPosY, nextPathLength);
                processingQueue.push([ nextPosX, nextPosY ]);
            }
        }

        // Move Right (positive Y)
        for (let stepIncrement = 1; stepIncrement <= maxMoveDistance; stepIncrement += 1) {
            const nextPosX = currentPosX;
            const nextPosY = currentPosY + stepIncrement;
            const cellStatus = retrieveCellDistance(nextPosX, nextPosY);
            if (cellStatus === undefined || cellStatus === -1) {
                break; // Out of bounds or hit an obstacle
            }
            if (cellStatus === null) {
                updateCellDistance(nextPosX, nextPosY, nextPathLength);
                processingQueue.push([ nextPosX, nextPosY ]);
            }
        }

        // Move Left (negative Y)
        for (let stepIncrement = 1; stepIncrement <= maxMoveDistance; stepIncrement += 1) {
            const nextPosX = currentPosX;
            const nextPosY = currentPosY - stepIncrement;
            const cellStatus = retrieveCellDistance(nextPosX, nextPosY);
            if (cellStatus === undefined || cellStatus === -1) {
                break; // Out of bounds or hit an obstacle
            }
            if (cellStatus === null) {
                updateCellDistance(nextPosX, nextPosY, nextPathLength);
                processingQueue.push([ nextPosX, nextPosY ]);
            }
        }
    }

    // Output the result
    if (retrieveCellDistance(targetX, targetY) === null) {
        console.log('-1'); // Target unreachable
    } else {
        console.log(retrieveCellDistance(targetX, targetY)); // Print minimum steps
    }
})();
