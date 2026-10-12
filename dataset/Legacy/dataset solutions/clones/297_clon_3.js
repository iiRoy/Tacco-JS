function calculateCellDistance(r, c, grid, size) {
    const OBSTACLE_MARKER = "*";
    const OUT_OF_BOUNDS_VALUE = 1;
    const INITIAL_OBSTACLE_DISTANCE = 0;

    if (grid[r][c] === OBSTACLE_MARKER) {
        grid[r][c] = INITIAL_OBSTACLE_DISTANCE;
        return;
    }

    const neighborOffsets = [
        [-1, -1], // top-left
        [-1, 0],  // top
        [0, -1]   // left
    ];

    let minimumNeighborDistance = size; // Initialize with a value larger than any possible distance

    for (let i = 0; i < neighborOffsets.length; i++) {
        const [dr, dc] = neighborOffsets[i];
        const neighborR = r + dr;
        const neighborC = c + dc;

        // Check if neighbor is out of bounds
        if (neighborR < 0 || neighborR >= size || neighborC < 0 || neighborC >= size) {
            grid[r][c] = OUT_OF_BOUNDS_VALUE;
            return;
        }
        minimumNeighborDistance = Math.min(minimumNeighborDistance, grid[neighborR][neighborC]);
    }
    grid[r][c] = minimumNeighborDistance + 1;
}

const fileSystem = require('fs');
const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = inputData.trim().split("\n");

let linePointer = 0; // Helper variable to manage inputLines

function readNextGridSize() {
    return Number(inputLines[linePointer++]);
}

function readGridRows(numRows) {
    const grid = [];
    for (let i = 0; i < numRows; i++) {
        grid.push(inputLines[linePointer++].split(""));
    }
    return grid;
}

while (true) {
    const currentGridSize = readNextGridSize();
    if (currentGridSize === 0) {
        break;
    }

    let overallMaxDistance = 0;
    const currentDistanceGrid = readGridRows(currentGridSize);

    // Iterate through the grid to calculate distances
    for (let row = 0; row < currentGridSize; row++) {
        for (let col = 0; col < currentGridSize; col++) {
            calculateCellDistance(row, col, currentDistanceGrid, currentGridSize);
            overallMaxDistance = Math.max(overallMaxDistance, currentDistanceGrid[row][col]);
        }
    }
    console.log(overallMaxDistance);
}
