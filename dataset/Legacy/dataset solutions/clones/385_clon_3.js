const FILE_PATH_STDIN = '/dev/stdin';
const EMPTY_CELL_CHAR = "+";
const PATH_CELL_CHAR = "#";
const NUM_DIRECTIONS = 4;

// Helper function for the recursive path generation
function generatePath(currentRow, currentCol, currentDirection, gridMatrix, gridSize, lastVisitedCellRef) {
    // Guard clause: If the current cell is already part of the path, stop.
    if (gridMatrix[currentRow][currentCol] !== EMPTY_CELL_CHAR) {
        return;
    }

    // Direction vectors (row offsets, column offsets)
    const rowOffsets = [-1, 0, 1, 0]; // 0:Up, 1:Right, 2:Down, 3:Left
    const colOffsets = [0, 1, 0, -1];

    // Calculate next potential position
    let nextRow = currentRow + rowOffsets[currentDirection];
    let nextCol = currentCol + colOffsets[currentDirection];

    // Check for out-of-bounds
    const isOutOfBounds = nextRow < 0 || nextCol < 0 || nextRow >= gridSize || nextCol >= gridSize;

    if (isOutOfBounds) {
        // If out of bounds, change direction and try again from the current cell
        const newDirection = (currentDirection + 1) % NUM_DIRECTIONS;
        generatePath(currentRow, currentCol, newDirection, gridMatrix, gridSize, lastVisitedCellRef);
    } else {
        // Check if the next cell is already part of the path (collision)
        if (gridMatrix[nextRow][nextCol] === PATH_CELL_CHAR) {
            // Backtrack one step from the collision point and clear it
            const backtrackRow = nextRow - rowOffsets[currentDirection];
            const backtrackCol = nextCol - colOffsets[currentDirection];
            gridMatrix[backtrackRow][backtrackCol] = EMPTY_CELL_CHAR;

            // Define adjustments for recursive call after collision
            // Indexed by original currentDirection (z in original code)
            const collisionRecurseAdjustments = [
                { yAdj: 0, xAdj: 1, newDir: 1 }, // if currentDirection was 0 (Up)
                { yAdj: 1, xAdj: 0, newDir: 2 }, // if currentDirection was 1 (Right)
                { yAdj: 0, xAdj: -1, newDir: 3 }, // if currentDirection was 2 (Down)
                { yAdj: -1, xAdj: 0, newDir: 0 }  // if currentDirection was 3 (Left)
            ];

            const adjustment = collisionRecurseAdjustments[currentDirection];
            const recurseBaseRow = nextRow - (2 * rowOffsets[currentDirection]);
            const recurseBaseCol = nextCol - (2 * colOffsets[currentDirection]);

            generatePath(recurseBaseRow + adjustment.yAdj, recurseBaseCol + adjustment.xAdj, adjustment.newDir, gridMatrix, gridSize, lastVisitedCellRef);

        } else {
            // No collision, mark current cell as path and move to the next
            gridMatrix[currentRow][currentCol] = PATH_CELL_CHAR;
            lastVisitedCellRef[0] = currentRow;
            lastVisitedCellRef[1] = currentCol;
            generatePath(nextRow, nextCol, currentDirection, gridMatrix, gridSize, lastVisitedCellRef);
        }
    }
}

// Read input from stdin
const fileContent = require('fs').readFileSync(FILE_PATH_STDIN, 'utf8');
const inputNumbers = fileContent.trim().split("\n").map(Number);

let testCaseCount = inputNumbers.shift();

// Process each test case
while (testCaseCount--) {
    const currentGridSize = inputNumbers.shift();

    // Handle special cases for grid size
    if (currentGridSize === 0) {
        console.log("");
        continue;
    }
    if (currentGridSize === 1) {
        console.log(PATH_CELL_CHAR);
        continue;
    }

    // Initialize the grid with empty cells
    const gridMatrix = [];
    for (let rowIndex = 0; rowIndex < currentGridSize; rowIndex++) {
        gridMatrix[rowIndex] = [];
        for (let colIndex = 0; colIndex < currentGridSize; colIndex++) {
            gridMatrix[rowIndex][colIndex] = EMPTY_CELL_CHAR;
        }
    }

    // `lastVisitedCellRef` is an array passed by reference to store the last marked cell
    const lastVisitedCellRef = [];

    // Start path generation from bottom-left corner (n-1, 0), moving up (direction 0)
    generatePath(currentGridSize - 1, 0, 0, gridMatrix, currentGridSize, lastVisitedCellRef);

    // Conditional modification for even-sized grids: revert the last marked cell
    if (currentGridSize % 2 === 0) {
        gridMatrix[lastVisitedCellRef[0]][lastVisitedCellRef[1]] = EMPTY_CELL_CHAR;
    }

    // Format and print the output grid
    const formattedOutput = gridMatrix
        .map(row => row.join("").replace(new RegExp(EMPTY_CELL_CHAR, 'g'), " ")) // Join row elements, replace '+' with ' '
        .join("\n"); // Join rows with newline

    console.log(formattedOutput);
}
