const processCase = (dimensionValue) => {
    if (dimensionValue === 0) {
        return "";
    }
    if (dimensionValue === 1) {
        return "#";
    }

    let drawingSurface = Array(dimensionValue).fill(null).map(() => Array(dimensionValue).fill(" "));
    let currentPathRow = dimensionValue - 1;
    let currentPathCol = 0;
    let currentPathDirection = 0; // 0:up, 1:right, 2:down, 3:left
    
    let lastMarkedSpot = [];
    
    const rowMovementOffsets = [-1, 0, 1, 0]; // Up, Right, Down, Left
    const colMovementOffsets = [0, 1, 0, -1]; // Up, Right, Down, Left

    const jumpInstructions = [
        { rowOffset: 1, colOffset: 1, newDir: 1 }, // If moving up (0), jump to (r+1, c+1) and go right
        { rowOffset: 1, colOffset: -1, newDir: 2 }, // If moving right (1), jump to (r+1, c-1) and go down
        { rowOffset: -1, colOffset: -1, newDir: 3 }, // If moving down (2), jump to (r-1, c-1) and go left
        { rowOffset: -1, colOffset: 1, newDir: 0 }  // If moving left (3), jump to (r-1, c+1) and go up
    ];

    let pathContinues = true;
    let operationCount = 0; // Prevent infinite loops in case of logic error

    while (pathContinues && operationCount < dimensionValue * dimensionValue * 5) { // Upper bound for operations
        operationCount++;
        pathContinues = false;

        let potentialNextRow = currentPathRow + rowMovementOffsets[currentPathDirection];
        let potentialNextCol = currentPathCol + colMovementOffsets[currentPathDirection];

        const isOutOfBounds = potentialNextRow < 0 || potentialNextCol < 0 || potentialNextRow >= dimensionValue || potentialNextCol >= dimensionValue;

        if (isOutOfBounds) {
            // Change direction, retry from current position
            currentPathDirection = (currentPathDirection + 1) % 4;
            pathContinues = true; // Still trying to find a path
            continue; 
        }

        if (drawingSurface[potentialNextRow][potentialNextCol] === '#') {
            // Collision with an already drawn segment
            drawingSurface[currentPathRow][currentPathCol] = ' '; // Clear the current spot

            const jump = jumpInstructions[currentPathDirection];
            currentPathRow += jump.rowOffset;
            currentPathCol += jump.colOffset;
            currentPathDirection = jump.newDir;
            
            // Check if the jump lands out of bounds or on an already marked cell, which would terminate the path
            const jumpedOutOfBounds = currentPathRow < 0 || currentPathCol < 0 || currentPathRow >= dimensionValue || currentPathCol >= dimensionValue;
            if (jumpedOutOfBounds || drawingSurface[currentPathRow][currentPathCol] === '#') {
                break; // Path terminates
            }
            pathContinues = true; // Successfully jumped, continue exploring from new spot
            
        } else {
            // Move to the next empty cell
            drawingSurface[currentPathRow][currentPathCol] = '#';
            lastMarkedSpot = [currentPathRow, currentPathCol];
            
            currentPathRow = potentialNextRow;
            currentPathCol = potentialNextCol;
            pathContinues = true; // Successfully moved, continue exploring
        }
    }

    // Final adjustment for even-sized grids
    if (dimensionValue % 2 === 0 && lastMarkedSpot.length > 0) {
        drawingSurface[lastMarkedSpot[0]][lastMarkedSpot[1]] = ' ';
    }

    return drawingSurface.map(row => row.join('')).join('\n');
};

const acquiredData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = acquiredData.trim().split('\n');
let totalCases = parseInt(dataLines.shift());
let collectedOutputs = [];

for (let caseIndex = 0; caseIndex < totalCases; caseIndex++) {
    let currentGridSize = parseInt(dataLines.shift());
    collectedOutputs.push(processCase(currentGridSize));
}

console.log(collectedOutputs.join('\n'));