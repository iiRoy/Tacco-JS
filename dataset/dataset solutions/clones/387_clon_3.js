let gridSize; // Represents 'n' from the original code
let lastVisitedCell = []; // Represents 'last' from the original code
let pathMap = []; // Represents 'yx' from the original code

// Constants for path marks and directions
const FILLED_PATH_MARK = '#';
const EMPTY_CELL_MARK = '+';
const NUM_DIRECTIONS = 4;

// Direction indices for better readability (0=Up, 1=Right, 2=Down, 3=Left)
const DIRECTION_UP = 0;
const DIRECTION_RIGHT = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 3;

// Delta coordinates for each direction: [Up, Right, Down, Left]
const DELTA_COORDS = [
    { dr: -1, dc: 0 }, // Up
    { dr: 0, dc: 1 },  // Right
    { dr: 1, dc: 0 },  // Down
    { dr: 0, dc: -1 }  // Left
];

/**
 * Recursively generates a spiral path on a grid.
 * This function is a Type III clone of the original 'bomb' function.
 *
 * @param {number} currentRow - The current row index.
 * @param {number} currentCol - The current column index.
 * @param {number} currentDirectionIndex - The index of the current direction (0-3).
 */
function generateSpiralPath(currentRow, currentCol, currentDirectionIndex) {
    // Early exit: if the current cell is not empty, stop traversing this path.
    if (pathMap[currentRow][currentCol] !== EMPTY_CELL_MARK) {
        return;
    }

    // Determine the coordinates of the next cell based on the current direction.
    const deltaRow = DELTA_COORDS[currentDirectionIndex].dr;
    const deltaCol = DELTA_COORDS[currentDirectionIndex].dc;

    const nextRow = currentRow + deltaRow;
    const nextCol = currentCol + deltaCol;

    // Check if the next cell is out of grid boundaries.
    if (nextRow < 0 || nextCol < 0 || nextRow >= gridSize || nextCol >= gridSize) {
        // If out of bounds, change direction (turn clockwise) and retry from the current cell.
        const nextDirectionIndex = (currentDirectionIndex + 1) % NUM_DIRECTIONS;
        generateSpiralPath(currentRow, currentCol, nextDirectionIndex);
        return; // Ensure no further processing in this call after a turn.
    }

    // If the next cell is within bounds, check its content.
    if (pathMap[nextRow][nextCol] === FILLED_PATH_MARK) {
        // If the next cell is already filled, it means we've hit an existing path.
        // This is a key step for the spiral generation logic.
        // The current cell (before moving to nextRow/nextCol) is reset to empty.
        pathMap[currentRow][currentCol] = EMPTY_CELL_MARK;

        // Based on the current direction, we recursively call the function
        // to restart the path from a specific "inner" cell, effectively turning inwards.
        // The new starting coordinates are derived from the current position (currentRow, currentCol)
        // and the direction, adjusted for the spiral's inward movement.
        switch (currentDirectionIndex) {
            case DIRECTION_UP: // Original z=0
                generateSpiralPath(currentRow + 1, currentCol + 1, DIRECTION_RIGHT);
                break;
            case DIRECTION_RIGHT: // Original z=1
                generateSpiralPath(currentRow + 1, currentCol - 1, DIRECTION_DOWN);
                break;
            case DIRECTION_DOWN: // Original z=2
                generateSpiralPath(currentRow - 1, currentCol - 1, DIRECTION_LEFT);
                break;
            case DIRECTION_LEFT: // Original z=3
                generateSpiralPath(currentRow - 1, currentCol + 1, DIRECTION_UP);
                break;
            default:
                // This case should ideally not be reached if directionIndex is always 0-3.
                console.error("Unknown direction encountered!");
                break;
        }
        return; // Ensure no further processing in this call.
    } else {
        // If the next cell is empty, mark the current cell as part of the path.
        pathMap[currentRow][currentCol] = FILLED_PATH_MARK;
        // Record this cell as the last one marked, used for an edge case adjustment later.
        lastVisitedCell = [currentRow, currentCol];
        // Continue traversing the path in the same direction.
        generateSpiralPath(nextRow, nextCol, currentDirectionIndex);
    }
}

// --- Main execution block ---

// Read raw input from stdin
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process input: trim whitespace, split by newlines, convert to numbers
const processedNumbers = fileContent.trim().split('\n').map(Number);

// The first number in the input is the total number of test cases
let totalTestCases = processedNumbers.shift();

// Loop through each test case
while (totalTestCases-- > 0) {
    // The next number is the grid size for the current test case
    gridSize = processedNumbers.shift();

    // Input validation: Ensure grid size is non-negative
    if (gridSize < 0) {
        console.error("Error: Grid size cannot be negative. Skipping test case.");
        continue;
    }

    // Handle small grid sizes as special cases for efficiency or specific patterns
    if (gridSize === 0) {
        console.log(""); // An empty grid prints an empty line
        continue;
    }
    if (gridSize === 1) {
        console.log(FILLED_PATH_MARK); // A 1x1 grid has a single filled cell
        continue;
    }
    if (gridSize === 2) {
        // A 2x2 grid has a specific pattern:
        // ##
        // #
        console.log(`${FILLED_PATH_MARK}${FILLED_PATH_MARK}\n${FILLED_PATH_MARK} `);
        continue;
    }

    // Initialize the path map (grid) for the current test case
    pathMap = [];
    for (let rIndex = 0; rIndex < gridSize; rIndex++) {
        // Create each row as an array filled with empty cell marks
        const rowArray = new Array(gridSize).fill(EMPTY_CELL_MARK);
        pathMap.push(rowArray);
    }

    // Clear the last visited cell tracking before starting a new spiral
    lastVisitedCell = [];

    // Start the spiral generation from the bottom-left corner, moving upwards (direction 0)
    // (gridSize - 1) is the last row index, 0 is the first column index.
    generateSpiralPath(gridSize - 1, 0, DIRECTION_UP);

    // Post-processing adjustment for even-sized grids:
    // If the grid size is even, the 'lastVisitedCell' might need to be reset to empty.
    // This corrects a specific anomaly in the spiral pattern for even dimensions.
    if (gridSize % 2 === 0 && lastVisitedCell.length === 2) {
        pathMap[lastVisitedCell[0]][lastVisitedCell[1]] = EMPTY_CELL_MARK;
    }

    // Format the generated path map for output:
    // 1. Join cells in each row to form a string (e.g., "++#+").
    // 2. Replace all '+' (empty cells) with ' ' (space) for final display.
    // 3. Join all formatted rows with newline characters.
    const outputLines = pathMap.map(row => row.join('').replace(/\+/g, ' '));
    console.log(outputLines.join('\n'));
}