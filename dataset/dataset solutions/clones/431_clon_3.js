const GRID_BOUNDARY_MARKER = "X";
const EMPTY_CELL_MARKER = 0;
const OUTPUT_EMPTY_REPLACEMENT = "#";

/**
 * Attempts to place a given character into the first available empty cell in the grid.
 * An empty cell is identified by EMPTY_CELL_MARKER (0).
 * The search excludes the boundary markers at the start and end of the grid.
 * @param {string} itemToPlace - The single character string to place in the grid.
 * @param {Array<string|number>} currentGrid - The grid array to modify.
 * @returns {boolean} - True if placement was successful, false otherwise.
 */
function placeFirstAvailable(itemToPlace, currentGrid) {
    // Basic validation for the item to place: must be a single character string.
    if (typeof itemToPlace !== 'string' || itemToPlace.length !== 1) {
        // Log a warning for invalid input and indicate failure.
        console.warn(`Attempted to place invalid item: '${itemToPlace}'. Skipping operation.`);
        return false;
    }

    // Iterate from the second-to-last element down to the second element.
    // This range effectively excludes the fixed boundary markers at index 0 and currentGrid.length - 1.
    for (let currentIdx = currentGrid.length - 2; currentIdx >= 1; currentIdx--) {
        if (currentGrid[currentIdx] === EMPTY_CELL_MARKER) {
            currentGrid[currentIdx] = itemToPlace; // Place the item.
            return true; // Placement successful.
        }
    }
    return false; // No empty spot found in the designated area.
}

/**
 * Helper function to determine if a grid cell contains an 'A' unit.
 * @param {string|number} cellValue - The value of the cell to check.
 * @returns {boolean} - True if the cell contains 'A', false otherwise.
 */
const isAUnit = (cellValue) => cellValue === "A";

/**
 * Implements a specific placement strategy for 'B' units.
 * A 'B' unit is placed in an empty cell if that cell is not directly adjacent to an 'A' unit.
 * If no such suitable spot is found, it falls back to placing 'B' using the `placeFirstAvailable` strategy.
 * @param {Array<string|number>} currentGrid - The grid array to modify.
 * @returns {void}
 */
function strategizePlacementB(currentGrid) {
    // Iterate through the main part of the grid, excluding boundary markers.
    // The loop runs from the second-to-last element down to the second element.
    for (let currentIdx = currentGrid.length - 2; currentIdx >= 1; currentIdx--) {
        const currentCellContent = currentGrid[currentIdx];
        const leftNeighborContent = currentGrid[currentIdx - 1];
        const rightNeighborContent = currentGrid[currentIdx + 1];

        // Check if the current cell is empty AND its immediate neighbors are NOT 'A' units.
        if (currentCellContent === EMPTY_CELL_MARKER &&
            !isAUnit(leftNeighborContent) &&
            !isAUnit(rightNeighborContent)) {
            currentGrid[currentIdx] = "B"; // Place 'B'.
            return; // Placement successful, exit the function.
        }
    }

    // Fallback strategy: if no suitable non-adjacent spot for 'B' is found,
    // place it in the first available empty cell.
    placeFirstAvailable("B", currentGrid);
}

/**
 * Helper function to determine if a grid cell is occupied by any character (i.e., not empty).
 * @param {string|number} cellValue - The value of the cell to check.
 * @returns {boolean} - True if the cell is occupied, false otherwise.
 */
const isCellOccupied = (cellValue) => cellValue !== EMPTY_CELL_MARKER;

/**
 * Implements a specific placement strategy for 'C' units.
 * A 'C' unit is placed in an empty cell that is directly adjacent to an already occupied cell.
 * If no such spot is found, it places 'C' in a specific calculated middle position based on the grid's original size.
 * @param {Array<string|number>} currentGrid - The grid array to modify.
 * @param {number} originalGridSize - The original size of the grid (corresponds to 'n' from input, excluding boundaries).
 * @returns {void}
 */
function strategizePlacementC(currentGrid, originalGridSize) {
    // A grid must have at least 3 elements ([X, 0, X]) to have internal cells.
    if (currentGrid.length < 3) {
        placeFirstAvailable("C", currentGrid); // Fallback for very small grids.
        return;
    }

    // Iterate through the main part of the grid, excluding boundary markers.
    for (let currentIdx = 1; currentIdx < currentGrid.length - 1; currentIdx++) {
        const currentCellValue = currentGrid[currentIdx];
        const rightNeighborValue = currentGrid[currentIdx + 1];
        const leftNeighborValue = currentGrid[currentIdx - 1];

        // Check if the current cell is occupied and its right neighbor is empty.
        if (isCellOccupied(currentCellValue) && rightNeighborValue === EMPTY_CELL_MARKER) {
            currentGrid[currentIdx + 1] = "C"; // Place 'C' to the right.
            return; // Placement successful.
        }
        // Check if the current cell is occupied and its left neighbor is empty.
        if (isCellOccupied(currentCellValue) && leftNeighborValue === EMPTY_CELL_MARKER) {
            currentGrid[currentIdx - 1] = "C"; // Place 'C' to the left.
            return; // Placement successful.
        }
    }

    // Fallback strategy: If no adjacent empty spot found, place 'C' in a calculated middle position.
    // The original logic `arr[(n-1)/2+1]` for odd `n` and `arr[n/2+1]` for even `n`
    // can be simplified to `Math.floor(n / 2) + 1` when `n` is `originalGridSize`.
    let targetMiddleIndex = Math.floor(originalGridSize / 2) + 1;

    // Ensure the calculated index is within the valid range for placing items (excluding boundaries).
    if (targetMiddleIndex >= 1 && targetMiddleIndex < currentGrid.length - 1) {
        currentGrid[targetMiddleIndex] = "C";
    } else {
        // If the calculated index is out of bounds (e.g., n=1), use the first available strategy.
        placeFirstAvailable("C", currentGrid);
    }
}

/**
 * Helper function to determine if a grid cell contains any of the known unit types (A, B, C, D).
 * @param {string|number} cellValue - The value of the cell to check.
 * @returns {boolean} - True if the cell is a known unit, false otherwise.
 */
const isKnownUnit = (cellValue) => typeof cellValue === 'string' && /[ABCD]/.test(cellValue);

/**
 * Implements a specific placement strategy for 'D' units.
 * It searches for an empty cell that allows for the largest symmetric expansion (radius)
 * without hitting boundary markers ('X') or other known units (A, B, C, D).
 * 'D' is placed at the center of the empty cell that provides the maximum such radius.
 * If no suitable spot is found, it falls back to placing 'D' using the `placeFirstAvailable` strategy.
 * @param {Array<string|number>} currentGrid - The grid array to modify.
 * @returns {void}
 */
function strategizePlacementD(currentGrid) {
    // A grid must have at least 3 elements ([X, 0, X]) for this strategy to be meaningful.
    if (currentGrid.length < 3) {
        placeFirstAvailable("D", currentGrid); // Fallback for very small grids.
        return;
    }

    // Object to store details of the empty cell that allows the largest expansion.
    // `centerIndex` stores the original index `i` of the empty cell.
    // `radius` stores the maximum symmetric distance it can expand.
    let maxExpansionDetails = { centerIndex: 0, radius: 0 };

    // Iterate through each potential empty cell within the grid (excluding boundaries).
    for (let potentialCenterIdx = 1; potentialCenterIdx < currentGrid.length - 1; potentialCenterIdx++) {
        if (currentGrid[potentialCenterIdx] !== EMPTY_CELL_MARKER) {
            continue; // Only consider empty cells as potential centers.
        }

        let leftProbe = potentialCenterIdx;
        let rightProbe = potentialCenterIdx;
        let currentRadius = 0; // Represents the 'cnt' from the original code.

        // Expand outwards from the `potentialCenterIdx` symmetrically.
        while (true) {
            let movedLeft = false;
            let movedRight = false;

            // Attempt to move the left probe one step to the left, if not at a boundary.
            if (currentGrid[leftProbe] !== GRID_BOUNDARY_MARKER) {
                leftProbe--;
                movedLeft = true;
            }
            // Attempt to move the right probe one step to the right, if not at a boundary.
            if (currentGrid[rightProbe] !== GRID_BOUNDARY_MARKER) {
                rightProbe++;
                movedRight = true;
            }

            // Break condition 1: Both probes have hit boundary markers.
            if (currentGrid[leftProbe] === GRID_BOUNDARY_MARKER && currentGrid[rightProbe] === GRID_BOUNDARY_MARKER) {
                break;
            }

            // Break condition 2: Either probe has encountered an 'ABCD' unit.
            if (isKnownUnit(currentGrid[leftProbe]) || isKnownUnit(currentGrid[rightProbe])) {
                break;
            }

            // If neither probe moved (which would happen if both were already at boundaries),
            // or if we couldn't expand further, then break.
            if (!movedLeft && !movedRight) {
                break;
            }

            // If expansion was successful (at least one probe moved) and no 'ABCD' unit was hit,
            // increment the current radius.
            currentRadius++;

            // Update the maximum expansion details if the current radius is greater.
            if (maxExpansionDetails.radius < currentRadius) {
                maxExpansionDetails.radius = currentRadius;
                maxExpansionDetails.centerIndex = potentialCenterIdx; // Store the original center index.
            }
        }
    }

    // After checking all potential centers, if a suitable spot with a positive radius was found.
    if (maxExpansionDetails.radius > 0) {
        currentGrid[maxExpansionDetails.centerIndex] = "D"; // Place 'D' at the best center.
        return;
    } else {
        // Fallback strategy: if no spot satisfies the 'D' placement conditions,
        // place it in the first available empty cell.
        placeFirstAvailable("D", currentGrid);
    }
}

// --- Main Execution Block ---

// Define constants for file path and encoding for robustness.
const INPUT_FILE_PATH = '/dev/stdin';
const INPUT_FILE_ENCODING = 'utf8';

// Use `const` for the file system module.
const fileSystem = require('fs');

// Read all input data at once and split it into an array of lines.
const rawInputData = fileSystem.readFileSync(INPUT_FILE_PATH, INPUT_FILE_ENCODING);
let inputLines = rawInputData.trim().split("\n");

let currentLineIndex = 0; // Maintain an explicit index for processing input lines.

// Main loop to process multiple grid configurations until a termination condition is met.
while (true) {
    // Read the current line for grid dimensions.
    const dimensionsLine = inputLines[currentLineIndex++];
    if (!dimensionsLine) {
        // This indicates an unexpected end of file or malformed input.
        console.error("Error: Unexpected end of input or malformed dimension line.");
        break;
    }

    // Parse grid size (n) and number of operations (m).
    const parsedDimensions = dimensionsLine.split(" ").map(Number);
    const gridSize = parsedDimensions[0]; // Corresponds to original 'n'.
    const operationCount = parsedDimensions[1]; // Corresponds to original 'm'.

    // Termination condition: n=0 and m=0.
    if (gridSize === 0 && operationCount === 0) {
        break;
    }

    // Input validation for grid dimensions.
    if (gridSize < 1 || operationCount < 0) {
        console.warn(`Warning: Skipping invalid grid configuration (n=${gridSize}, m=${operationCount}).`);
        // Skip the corresponding operation lines for this invalid configuration.
        currentLineIndex += operationCount;
        continue;
    }

    // Initialize the working grid.
    // Create an array of `gridSize` zeros, then add boundary markers.
    let currentWorkingGrid = new Array(gridSize).fill(EMPTY_CELL_MARKER);
    currentWorkingGrid.unshift(GRID_BOUNDARY_MARKER); // Add left boundary.
    currentWorkingGrid.push(GRID_BOUNDARY_MARKER);   // Add right boundary.

    // Process each command for the current grid configuration.
    for (let opIdx = 0; opIdx < operationCount; opIdx++) {
        const commandType = inputLines[currentLineIndex++];
        if (!commandType) {
            console.error(`Error: Missing command for operation ${opIdx + 1} at line ${currentLineIndex}.`);
            break; // Stop processing commands for this grid if input is incomplete.
        }

        // Use a switch statement for clearer command handling.
        switch (commandType) {
            case "A":
                placeFirstAvailable("A", currentWorkingGrid);
                break;
            case "B":
                strategizePlacementB(currentWorkingGrid);
                break;
            case "C":
                strategizePlacementC(currentWorkingGrid, gridSize); // Pass original 'n'
                break;
            case "D":
                strategizePlacementD(currentWorkingGrid);
                break;
            default:
                console.warn(`Warning: Unknown command received: '${commandType}'. Skipping operation.`);
                break;
        }
    }

    // Prepare the final grid for output.
    // Remove the temporary boundary markers by slicing the array.
    const finalDisplaySegment = currentWorkingGrid.slice(1, currentWorkingGrid.length - 1);

    // Join the elements into a string and replace empty markers (0) with '#' for display.
    console.log(finalDisplaySegment.join("").replace(new RegExp(EMPTY_CELL_MARKER, 'g'), OUTPUT_EMPTY_REPLACEMENT));
}