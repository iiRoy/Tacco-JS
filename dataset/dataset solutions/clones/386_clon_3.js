const fileSystem = require('fs');

// --- Global Configuration and Constants ---
// Define constants for path characters and grid elements
const PATH_MARKER_CHAR = '#';         // Character used to mark the path
const EMPTY_CELL_CHAR = '+';          // Character representing an unvisited, empty cell
const FINAL_DISPLAY_SPACE_CHAR = ' '; // Character used to display empty cells in the final output

// Direction vectors: [Up, Right, Down, Left] corresponding to directionIndex 0, 1, 2, 3
const DELTA_ROW_COORDS = [-1, 0, 1, 0]; // Change in row for each direction
const DELTA_COL_COORDS = [0, 1, 0, -1]; // Change in column for each direction
const NUMBER_OF_DIRECTIONS = 4;        // Total possible directions

// --- Variables managed per test case (effectively global to the recursive function) ---
let gridMapForCurrentCase = [];      // The 2D array representing the grid (renamed from 'yx')
let currentGridDimension = 0;        // The size of the square grid (renamed from 'n')
let lastPathSegmentCoords = [];      // Stores the [row, col] of the last cell added to the path (renamed from 'last')

/**
 * Recursively explores and marks a path on the grid.
 * This function is the core logic, generating a spiral-like pattern.
 *
 * @param {number} currentRow        The current row coordinate.
 * @param {number} currentCol        The current column coordinate.
 * @param {number} currentDirectionIndex The index representing the current direction (0=Up, 1=Right, 2=Down, 3=Left).
 */
function exploreGridPath(
    currentRow,
    currentCol,
    currentDirectionIndex
) {
    // Guard clause: If the current cell is not an empty space, it means we've
    // either already visited it or it's an invalid starting point. Terminate this recursive branch.
    // This prevents drawing over existing path segments or infinite loops.
    if (gridMapForCurrentCase[currentRow][currentCol] !== EMPTY_CELL_CHAR) {
        return;
    }

    // Calculate the potential coordinates of the next cell based on the current direction
    const potentialNextRow = currentRow + DELTA_ROW_COORDS[currentDirectionIndex];
    const potentialNextCol = currentCol + DELTA_COL_COORDS[currentDirectionIndex];

    // Check if the potential next cell is outside the grid boundaries
    const isNextCellOutOfBounds =
        potentialNextRow < 0 ||
        potentialNextCol < 0 ||
        potentialNextRow >= currentGridDimension ||
        potentialNextCol >= currentGridDimension;

    if (isNextCellOutOfBounds) {
        // If the next cell is out of bounds, we need to turn clockwise and try again
        // from the *current* position.
        const nextDirectionIndex = (currentDirectionIndex + 1) % NUMBER_OF_DIRECTIONS;
        exploreGridPath(currentRow, currentCol, nextDirectionIndex);
    } else {
        // The potential next cell is within the grid boundaries.
        // Now, check if this next cell is already part of the path (an obstacle).
        if (gridMapForCurrentCase[potentialNextRow][potentialNextCol] === PATH_MARKER_CHAR) {
            // We've hit an existing path segment, indicating a turning point or a dead end for this segment.
            // Reset the cell *before* the hit to an empty space. This is a form of backtracking
            // or adjusting the path visually.
            const previousRowBeforeHit = potentialNextRow - DELTA_ROW_COORDS[currentDirectionIndex];
            const previousColBeforeHit = potentialNextCol - DELTA_COL_COORDS[currentDirectionIndex];

            // Ensure the calculated previous coordinates are valid before modification
            if (
                previousRowBeforeHit >= 0 &&
                previousRowBeforeHit < currentGridDimension &&
                previousColBeforeHit >= 0 &&
                previousColBeforeHit < currentGridDimension
            ) {
                gridMapForCurrentCase[previousRowBeforeHit][previousColBeforeHit] = EMPTY_CELL_CHAR;
            }

            // Perform a complex recursive call based on the current direction.
            // This logic is specific to the spiral generation pattern, involving
            // moving two steps back from the hit point, then one step in a new direction,
            // and changing the starting direction for the new path segment.
            let newStartRowForRecursion, newStartColForRecursion, newPathDirection;

            // Calculate coordinates two steps back from the hit point
            const twoStepsBackRow = potentialNextRow - 2 * DELTA_ROW_COORDS[currentDirectionIndex];
            const twoStepsBackCol = potentialNextCol - 2 * DELTA_COL_COORDS[currentDirectionIndex];

            switch (currentDirectionIndex) {
                case 3: // Original direction 'Left' (z=3)
                    // Move two steps back, then one step 'Up', start new path 'Up' (0)
                    newStartRowForRecursion = twoStepsBackRow - 1;
                    newStartColForRecursion = twoStepsBackCol;
                    newPathDirection = 0; // Up
                    break;
                case 0: // Original direction 'Up' (z=0)
                    // Move two steps back, then one step 'Right', start new path 'Right' (1)
                    newStartRowForRecursion = twoStepsBackRow;
                    newStartColForRecursion = twoStepsBackCol + 1;
                    newPathDirection = 1; // Right
                    break;
                case 1: // Original direction 'Right' (z=1)
                    // Move two steps back, then one step 'Down', start new path 'Down' (2)
                    newStartRowForRecursion = twoStepsBackRow + 1;
                    newStartColForRecursion = twoStepsBackCol;
                    newPathDirection = 2; // Down
                    break;
                case 2: // Original direction 'Down' (z=2)
                    // Move two steps back, then one step 'Left', start new path 'Left' (3)
                    newStartRowForRecursion = twoStepsBackRow;
                    newStartColForRecursion = twoStepsBackCol - 1;
                    newPathDirection = 3; // Left
                    break;
                default:
                    // This case should ideally not be reached due to modulo arithmetic for directionIndex.
                    // If it does, it indicates an unexpected state, so we exit this branch.
                    console.error("Invalid direction index encountered during path exploration!");
                    return;
            }
            // Execute the specific recursive call with new starting coordinates and direction
            exploreGridPath(newStartRowForRecursion, newStartColForRecursion, newPathDirection);

        } else {
            // The next cell is empty and within bounds. Mark the current cell as part of the path
            // and proceed recursively to the next cell in the same direction.
            gridMapForCurrentCase[currentRow][currentCol] = PATH_MARKER_CHAR;
            // Update the global tracker for the last visited path segment
            lastPathSegmentCoords[0] = currentRow;
            lastPathSegmentCoords[1] = currentCol;
            // Continue the path in the same direction
            exploreGridPath(potentialNextRow, potentialNextCol, currentDirectionIndex);
        }
    }
}

// --- Main Program Execution Flow ---
try {
    // Read raw input data from standard input, assuming UTF-8 encoding
    const rawInputBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Process input:
    // 1. Trim any leading/trailing whitespace.
    // 2. Split the string into an array of lines.
    // 3. Convert each line (which should be a number) into a numeric type.
    const inputNumericLines = rawInputBuffer
        .trim()
        .split('\n')
        .map(Number);

    // The first number in the input is the total count of test cases
    let remainingTestCaseCount = inputNumericLines.shift();

    // Iterate through each test case provided in the input
    while (remainingTestCaseCount > 0) {
        remainingTestCaseCount--; // Decrement the counter for the current test case

        // The next number in the input array is the grid dimension for this test case
        currentGridDimension = inputNumericLines.shift();

        // --- Handle edge cases for small grid dimensions directly ---
        if (currentGridDimension === 0) {
            console.log(''); // An empty string for a 0x0 grid
            continue; // Proceed to the next test case
        }
        if (currentGridDimension === 1) {
            console.log(PATH_MARKER_CHAR); // A single '#' for a 1x1 grid
            continue;
        }
        if (currentGridDimension === 2) {
            // A predefined pattern for a 2x2 grid
            const specificTwoByTwoPattern = `${PATH_MARKER_CHAR}${PATH_MARKER_CHAR}\n${PATH_MARKER_CHAR} `;
            console.log(specificTwoByTwoPattern);
            continue;
        }

        // --- Initialize the grid for the current test case ---
        // Create a 2D array (matrix) of the specified dimension,
        // filling all cells with the EMPTY_CELL_CHAR ('+')
        gridMapForCurrentCase = Array(currentGridDimension)
            .fill(null) // Create an array of 'currentGridDimension' nulls first
            .map(() => Array(currentGridDimension).fill(EMPTY_CELL_CHAR)); // Then map each null to a new row, filled with empty chars

        // Initialize the coordinates tracker for the last path segment
        lastPathSegmentCoords = [0, 0]; // Set default values; will be updated by exploreGridPath

        // --- Start the path exploration ---
        // The path generation typically starts from the bottom-left corner, moving upwards.
        const startingRow = currentGridDimension - 1; // Bottom-most row
        const startingCol = 0;                      // Left-most column
        const initialDirection = 0;                 // Direction index 0 corresponds to 'Up'

        exploreGridPath(startingRow, startingCol, initialDirection);

        // --- Post-processing adjustment for even-sized grids ---
        // For even dimensions, the last recorded path coordinate is reset to an empty space.
        // This is a specific visual correction for the output pattern.
        if (currentGridDimension % 2 === 0) {
            const finalPathRow = lastPathSegmentCoords[0];
            const finalPathCol = lastPathSegmentCoords[1];

            // Add a safety check, though these coordinates should always be valid at this point
            if (
                finalPathRow >= 0 && finalPathRow < currentGridDimension &&
                finalPathCol >= 0 && finalPathCol < currentGridDimension
            ) {
                gridMapForCurrentCase[finalPathRow][finalPathCol] = EMPTY_CELL_CHAR;
            }
        }

        // --- Format the grid for final output ---
        // 1. Map each row array to a string by joining its characters (removes internal commas).
        // 2. Join the resulting row strings with newline characters to form the full grid string.
        // 3. Replace all remaining EMPTY_CELL_CHAR ('+') with FINAL_DISPLAY_SPACE_CHAR (' ') for output.
        const formattedGridOutput = gridMapForCurrentCase
            .map(rowArray => rowArray.join('')) // Converts ['#', '+'] to "#+"
            .join('\n')                         // Converts ["#+", "+#"] to "#+\n+#"
            .replace(new RegExp(EMPTY_CELL_CHAR, 'g'), FINAL_DISPLAY_SPACE_CHAR); // Replaces all '+' with ' '

        console.log(formattedGridOutput);
    }
} catch (error) {
    // Basic error handling for file reading or unexpected issues
    console.error("An error occurred during program execution:", error.message);
}