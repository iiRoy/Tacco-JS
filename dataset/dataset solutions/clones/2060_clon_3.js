'use strict'

// Core function to process grid pathfinding input and determine the minimum obstacles.
const processGridTraversal = (inputDataSource) => {

    /**
     * Generates a collection of binary strings that represent valid paths.
     * A path is considered valid if it has a specific, fixed number of '1's (down moves).
     * This ensures all generated path strings correspond to a fixed number of vertical and horizontal steps.
     * @param {string} lowerBoundBinary - The binary string representing the path with fewest '1's (e.g., "0011").
     * @param {string} upperBoundBinary - The binary string representing the path with most '1's (e.g., "1100").
     * @returns {string[]} An array of binary strings, each representing a unique valid path.
     */
    const synthesizePathEncodings = (lowerBoundBinary, upperBoundBinary) => {
        // Calculate the target count of '1's (vertical moves) from the lower bound binary string.
        // This count must be consistent for all valid paths from start to end.
        const requiredOneBits = (lowerBoundBinary.match(/1/g) || []).length;
        
        // Convert the binary string bounds into integer values for numerical iteration.
        const numericStart = Number.parseInt(lowerBoundBinary, 2);
        const numericEnd = Number.parseInt(upperBoundBinary, 2);

        // Initialize an array to store the binary strings that pass validation.
        const validPathEncodings = [];

        // Iterate through all integer values within the defined range.
        for (let currentNumericValue = numericStart; currentNumericValue <= numericEnd; currentNumericValue++) {
            let currentBinaryRepresentation = currentNumericValue.toString(2);

            // If the current binary string doesn't have the exact number of '1's required,
            // it cannot represent a valid path, so we skip it.
            if ((currentBinaryRepresentation.match(/1/g) || []).length !== requiredOneBits) {
                continue;
            }

            // Pad the current binary string with leading zeros to match the total length of the
            // upper bound binary string. This standardizes the length of all path encodings.
            const paddingAmount = upperBoundBinary.length - currentBinaryRepresentation.length;
            const leadingZeros = Array.from({ length: paddingAmount }).fill('0').join('');
            
            validPathEncodings.push(leadingZeros + currentBinaryRepresentation);
        }

        return validPathEncodings;
    };

    // --- Configuration Constants for Grid Elements and Movement Directions ---
    const GRID_PASSAGE_CHAR = '.';          // Character for an open, traversable cell.
    const GRID_WALL_CHAR = '#';             // Character for an obstacle cell.
    const GRID_PASSAGE_VALUE = 1;           // Numerical value for an open cell.
    const GRID_WALL_VALUE = 0;              // Numerical value for an obstacle cell.
    const MOVE_DOWN_CODE = '1';             // Binary code representing a step downwards (row increment).
    const MOVE_RIGHT_CODE = '0';            // Binary code representing a step rightwards (column increment).

    // --- Input Processing and Grid Construction ---

    // Trim whitespace and split the entire input string into individual lines.
    const rawInputLines = inputDataSource.trim().split('\n');

    // Parse the grid dimensions (Height, Width) from the first line of input.
    // Using array destructuring for clear assignment.
    const [gridRows, gridColumns] = rawInputLines[0].split(' ').map(Number.parseInt);

    // Guard clause: Basic validation for grid dimensions.
    if (isNaN(gridRows) || isNaN(gridColumns) || gridRows <= 0 || gridColumns <= 0) {
        console.error("Error: Grid dimensions must be positive integers. Exiting.");
        return; // Terminate if dimensions are invalid.
    }

    // Construct the initial grid layout from the input lines.
    // Each character is converted to its numerical representation (0 for wall, 1 for passage).
    const gridLayoutData = rawInputLines.slice(1, gridRows + 1) // Extract only the grid data rows.
        .map((rowString, rowIndex) => {
            // Pre-processing for robust row parsing:
            // If a row is shorter than expected, pad it with wall characters.
            if (rowString.length < gridColumns) {
                console.warn(`Warning: Input row ${rowIndex + 1} is shorter than grid width (${gridColumns}). Padding with walls.`);
                rowString = rowString.padEnd(gridColumns, GRID_WALL_CHAR);
            }
            return rowString.split('')
                .slice(0, gridColumns) // Ensure row doesn't exceed grid width.
                .map(cellCharacter => cellCharacter === GRID_PASSAGE_CHAR ? GRID_PASSAGE_VALUE : GRID_WALL_VALUE);
        });
    
    // Determine the coordinates of the final destination cell (bottom-right).
    const destinationRow = gridRows - 1;
    const destinationColumn = gridColumns - 1;

    // --- Binary Path Pattern Generation Setup ---

    // Construct the binary strings that define the range for path encoding generation.
    // A path from (0,0) to (R-1,C-1) always consists of (R-1) 'down' moves and (C-1) 'right' moves.
    // The total path length (number of steps) is (R-1) + (C-1).
    
    // lowerBoundEncoding: All 'right' moves first, then all 'down' moves (e.g., "00...011...1").
    const lowerBoundEncoding = Array.from({ length: destinationColumn }).fill(MOVE_RIGHT_CODE).join('') +
                               Array.from({ length: destinationRow }).fill(MOVE_DOWN_CODE).join('');
    
    // upperBoundEncoding: All 'down' moves first, then all 'right' moves (e.g., "11...100...0").
    const upperBoundEncoding = Array.from({ length: destinationRow }).fill(MOVE_DOWN_CODE).join('') +
                               Array.from({ length: destinationColumn }).fill(MOVE_RIGHT_CODE).join('');
    
    // Generate all distinct binary strings that represent possible paths.
    const allValidPathEncodings = synthesizePathEncodings(lowerBoundEncoding, upperBoundEncoding);

    // Initialize a variable to track the minimum obstacle count found across all paths.
    // `null` indicates that no valid path has been processed yet.
    let globalMinimumObstacles = null;

    // --- Path Traversal and Obstacle Evaluation ---

    // Iterate through each generated path encoding.
    for (const currentPathString of allValidPathEncodings) {
        // Convert the binary path string into an array of individual step actions.
        const pathSteps = currentPathString.split('');
        
        let currentPathObstacles = 0;
        let currentX = 0; // Current column index (starts at 0)
        let currentY = 0; // Current row index (starts at 0)

        // Initial check for the starting cell (0,0).
        // It's crucial to check if the start cell itself is an obstacle.
        if (gridLayoutData[currentY] === undefined || gridLayoutData[currentY][currentX] === undefined) {
             console.error("Critical Error: Start cell (0,0) is out of grid bounds. Review input parsing.");
             continue; // Skip this path as the grid is malformed for it.
        }
        if (gridLayoutData[currentY][currentX] === GRID_WALL_VALUE) {
            currentPathObstacles++;
        }

        // Traverse each step defined in the current path encoding.
        for (const stepAction of pathSteps) {
            // Type III Addition: Early exit optimization.
            // If the current path already has more obstacles than the best path found so far,
            // there's no need to continue evaluating this path.
            if (globalMinimumObstacles !== null && currentPathObstacles >= globalMinimumObstacles) {
                currentPathObstacles = Infinity; // Mark as non-optimal.
                break; // Exit the inner loop for this path.
            }

            // Update current position based on the step direction.
            if (stepAction === MOVE_DOWN_CODE) {
                currentY++; // Move downwards (increment row index).
            } else if (stepAction === MOVE_RIGHT_CODE) {
                currentX++; // Move rightwards (increment column index).
            } else {
                // Type III Addition: Robustness check for unexpected step codes.
                console.warn(`Unexpected path step '${stepAction}' in encoding '${currentPathString}'. Path marked as invalid.`);
                currentPathObstacles = Infinity; // Mark path as invalid/unfeasible.
                break; 
            }

            // Type III Addition: Boundary check after each move.
            // If the path goes outside the grid boundaries, it's an invalid path.
            if (currentY > destinationRow || currentX > destinationColumn) {
                currentPathObstacles = Infinity; // Mark path as invalid.
                break; 
            }

            // If the current cell (after the move) is a wall, increment the obstacle count.
            if (gridLayoutData[currentY][currentX] === GRID_WALL_VALUE) {
                currentPathObstacles++;
            }
        }
        
        // Final validation for the path: it must end exactly at the destination cell.
        const successfullyReachedDestination = (currentY === destinationRow && currentX === destinationColumn);

        if (currentPathObstacles === Infinity || !successfullyReachedDestination) {
            continue; // Skip this path if it was invalid, out of bounds, or didn't reach the end.
        }

        // Update the global minimum obstacle count if the current path is better.
        // This uses a ternary operator for a concise update, handling the first valid path found.
        globalMinimumObstacles = (globalMinimumObstacles === null) 
                                ? currentPathObstacles 
                                : Math.min(globalMinimumObstacles, currentPathObstacles);
    }

    // --- Output Final Result ---

    // Print the final minimum obstacle count.
    // If no valid path was found (globalMinimumObstacles remains null), output -1.
    console.log(globalMinimumObstacles !== null ? globalMinimumObstacles : -1); 
};

// Initiate the grid traversal process by reading input from standard input.
processGridTraversal(require('fs').readFileSync('/dev/stdin', 'utf8'));