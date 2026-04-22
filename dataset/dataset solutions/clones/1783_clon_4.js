"use strict";

// Custom Input Processing Class
class DataFeeder {
    constructor(sourceData) {
        // Split input by any whitespace and filter out empty strings
        this.inputTokens = sourceData.split(/\s+/).filter(Boolean);
        this.tokenPointer = 0;
    }

    // Retrieves the next integer from the input stream
    fetchInteger() {
        return parseInt(this.inputTokens[this.tokenPointer++], 10);
    }

    // Retrieves the next string token from the input stream
    fetchText() {
        return this.inputTokens[this.tokenPointer++];
    }

    // Retrieves a specified count of integers
    retrieveIntegers(count) {
        const numbers = [];
        for (let i = 0; i < count; i++) {
            numbers.push(this.fetchInteger());
        }
        return numbers;
    }
}

// Function to create a multi-dimensional array filled with a specific value
function constructGrid(rows, columns, initialValue) {
    const freshGrid = new Array(rows);
    for (let r = 0; r < rows; r++) {
        freshGrid[r] = new Array(columns).fill(initialValue);
    }
    return freshGrid;
}

// Main processing logic
function solutionKernel() {
    const MAXIMUM_COST = 1e9 + 7; // A large value representing infinity
    const ROW_OFFSETS = [-1, 0, 1, 0]; // Corresponds to North, East, South, West changes in row index
    const COL_OFFSETS = [0, 1, 0, -1]; // Corresponds to North, East, South, West changes in column index
    const DIRECTION_COUNT = 4;

    const dataStream = new DataFeeder(require("fs").readFileSync("/dev/stdin", "utf8"));

    const [mapHeight, mapWidth, maxJumpDistance] = dataStream.retrieveIntegers(3);
    const [initialRow, initialCol, finalRow, finalCol] = dataStream.retrieveIntegers(4);

    // Create the map layout with padding for boundaries using '@'
    const mapLayout = constructGrid(mapHeight + 2, mapWidth + 2, '@');
    for (let r = 0; r < mapHeight; r++) {
        const rowString = dataStream.fetchText();
        for (let c = 0; c < mapWidth; c++) {
            mapLayout[r + 1][c + 1] = rowString[c]; // Fill inner part of the map
        }
    }

    // Initialize minimum costs grid with MAXIMUM_COST
    const minimumCosts = constructGrid(mapHeight + 2, mapWidth + 2, MAXIMUM_COST);
    minimumCosts[initialRow][initialCol] = 0; // Starting point has 0 cost

    // BFS Queue: stores objects { r, c, cost }
    const explorationQueue = [{ row: initialRow, col: initialCol, pathCost: 0 }];
    let queueHead = 0; // Manual pointer for queue optimization (avoids Array.shift performance overhead)

    while (queueHead < explorationQueue.length) {
        const { row: currentRow, col: currentCol, pathCost: currentPathCost } = explorationQueue[queueHead++];

        // If a shorter path to this cell has already been found and processed, skip
        if (currentPathCost > minimumCosts[currentRow][currentCol]) {
            continue;
        }

        // Explore all four cardinal directions
        for (let dirIndex = 0; dirIndex < DIRECTION_COUNT; ++dirIndex) {
            let tempRow = currentRow;
            let tempCol = currentCol;

            // Try jumping up to maxJumpDistance steps in the current direction
            for (let stepIndex = 0; stepIndex < maxJumpDistance; ++stepIndex) {
                tempRow += ROW_OFFSETS[dirIndex];
                tempCol += COL_OFFSETS[dirIndex];

                // If obstacle or boundary, stop exploring further in this direction
                if (mapLayout[tempRow][tempCol] === '@') {
                    break;
                }

                // The cost to reach this new cell is one "jump" more than the current cell's path cost
                const nextPathCost = currentPathCost + 1;

                // Crucial optimization: If this cell has already been reached with a cost
                // equal to or less than the current cell's path cost, then any path extending
                // through this cell from the current cell won't be optimal. Break early.
                if (minimumCosts[tempRow][tempCol] <= currentPathCost) {
                    break;
                }

                // If a shorter path to (tempRow, tempCol) is found
                if (nextPathCost < minimumCosts[tempRow][tempCol]) {
                    minimumCosts[tempRow][tempCol] = nextPathCost;
                    explorationQueue.push({ row: tempRow, col: tempCol, pathCost: nextPathCost });
                }
            }
        }
    }

    const finalCost = minimumCosts[finalRow][finalCol];
    return finalCost === MAXIMUM_COST ? -1 : finalCost;
}

const outputVal = solutionKernel();
if (outputVal !== undefined) {
    console.log(String(outputVal));
}