function* inputTokenGenerator() {
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf-8");
    const processedTokens = rawInputContent.trim().split(/\n|\s/);
    yield* processedTokens;
}

function fetchMultipleValues(numToRetrieve, sourceIterator) {
    const currentDataSource = sourceIterator || this.dataStream || (this.dataStream = inputTokenGenerator());
    const retrievedItems = [];
    for (let currentIteration = 0; currentIteration < numToRetrieve; currentIteration += 1) {
        retrievedItems.push(currentDataSource.next().value);
    }
    return retrievedItems;
}

(() => {
    // Retrieve grid dimensions (height, width) and the maximum jump distance (stepLimit).
    const [ gridHeight, gridWidth, stepLimit ] = fetchMultipleValues(3).map(inputStr => parseInt(inputStr));

    // Get starting and ending coordinates, adjusting them to be 0-indexed.
    const [ startRow, startCol, endRow, endCol ] = fetchMultipleValues(4).map(inputStr => parseInt(inputStr) - 1);

    // Initialize the character grid based on input.
    const characterGrid = [];
    for (let rIndex = 0; rIndex < gridHeight; rIndex += 1) {
        const currentRowChars = fetchMultipleValues(1)[0].split('');
        characterGrid.push([ ...currentRowChars ]);
    }

    // Create a matrix to store path distances for BFS.
    const pathDistanceMatrix = [];
    for (let rIndex = 0; rIndex < gridHeight; rIndex += 1) {
        pathDistanceMatrix.push([]);
        for (let cIndex = 0; cIndex < gridWidth; cIndex += 1) {
            // Mark obstacles ('@') with -1, and unvisited cells with null.
            if (characterGrid[rIndex][cIndex] == '@') {
                pathDistanceMatrix[rIndex].push(-1);
            } else {
                pathDistanceMatrix[rIndex].push(null);
            }
        }
    }

    // Set the starting point's distance to 0 and initialize the BFS queue.
    pathDistanceMatrix[startRow][startCol] = 0;
    let traversalQueue = [[ startRow, startCol ]];

    // Helper function to update a cell's value in the distance matrix safely.
    const updateCellPath = (targetR, targetC, cellValue) => {
        if (targetR >= 0 && targetC >= 0 && targetR < gridHeight && targetC < gridWidth) {
            pathDistanceMatrix[targetR][targetC] = cellValue;
        }
    };

    // Helper function to retrieve a cell's value safely, returning undefined for out-of-bounds.
    const retrieveCellPath = (queryR, queryC) => {
        const rowData = pathDistanceMatrix[queryR];
        if (rowData) return rowData[queryC];
        return undefined;
    };

    // Debugging function (currently disabled).
    const printDebugLayout = () => {
        return;
        console.log();
        for (const rowContent of pathDistanceMatrix) console.log(rowContent);
    };

    // Main BFS loop.
    while (true) {
        const currentPoint = traversalQueue.shift();
        if (!currentPoint) break; // Exit if the queue is empty.

        const [ currentR, currentC ] = currentPoint;
        const futureStepCount = retrieveCellPath(currentR, currentC) + 1;

        // Explore moves in four directions (down, up, right, left) up to stepLimit distance.

        // Move Down
        for (let stepOffset = 1; stepOffset <= stepLimit; stepOffset += 1) {
            const nextR = currentR + stepOffset;
            const nextC = currentC;
            // Break if out-of-bounds or obstacle.
            if (retrieveCellPath(nextR, nextC) === undefined || retrieveCellPath(nextR, nextC) === -1) break;
            // If unvisited, update distance and enqueue.
            if (retrieveCellPath(nextR, nextC) === null) {
                updateCellPath(nextR, nextC, futureStepCount);
                traversalQueue.push([ nextR, nextC ]);
            }
            printDebugLayout();
        }

        // Move Up
        for (let stepOffset = 1; stepOffset <= stepLimit; stepOffset += 1) {
            const nextR = currentR - stepOffset;
            const nextC = currentC;
            if (retrieveCellPath(nextR, nextC) === undefined || retrieveCellPath(nextR, nextC) === -1) break;
            if (retrieveCellPath(nextR, nextC) === null) {
                updateCellPath(nextR, nextC, futureStepCount);
                traversalQueue.push([ nextR, nextC ]);
            }
            printDebugLayout();
        }

        // Move Right
        for (let stepOffset = 1; stepOffset <= stepLimit; stepOffset += 1) {
            const nextR = currentR;
            const nextC = currentC + stepOffset;
            if (retrieveCellPath(nextR, nextC) === undefined || retrieveCellPath(nextR, nextC) === -1) break;
            if (retrieveCellPath(nextR, nextC) === null) {
                updateCellPath(nextR, nextC, futureStepCount);
                traversalQueue.push([ nextR, nextC ]);
            }
            printDebugLayout();
        }

        // Move Left
        for (let stepOffset = 1; stepOffset <= stepLimit; stepOffset += 1) {
            const nextR = currentR;
            const nextC = currentC - stepOffset;
            if (retrieveCellPath(nextR, nextC) === undefined || retrieveCellPath(nextR, nextC) === -1) break;
            if (retrieveCellPath(nextR, nextC) === null) {
                updateCellPath(nextR, nextC, futureStepCount);
                traversalQueue.push([ nextR, nextC ]);
            }
            printDebugLayout();
        }
    }

    // Output the result: distance to target or -1 if unreachable.
    if (retrieveCellPath(endRow, endCol) == null) {
        console.log('-1');
    } else {
        console.log(retrieveCellPath(endRow, endCol));
    }
})();