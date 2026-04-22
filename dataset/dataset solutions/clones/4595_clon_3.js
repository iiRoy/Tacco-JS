// This module provides utility functions for processing grid-based data.
// It simulates a spreading process and calculates the minimum steps to reach a boundary.

// Helper function to read input from stdin
const obtainInputData = (sourcePath = "/dev/stdin") => {
    try {
        // Using Node.js built-in file system module
        const fileSystem = require("fs");
        // Read the entire file synchronously and decode as UTF-8
        const rawContent = fileSystem.readFileSync(sourcePath, "utf8");
        // Split into lines, filter out empty lines, and trim whitespace from each line
        return rawContent.split('\n').filter(line => line.trim() !== '').map(line => line.trim());
    } catch (error) {
        console.error("Error reading input data:", error.message);
        // In a real application, you might throw or return a specific error code
        return []; // Return an empty array on error
    }
};

// Validates if a given coordinate (row, col) is within the grid boundaries
const checkBoundaryValidity = (rowCoord, colCoord, totalRows, totalCols) => {
    return rowCoord >= 0 && rowCoord < totalRows &&
           colCoord >= 0 && colCoord < totalCols;
};

// Calculates the minimum distance from a cell to any of the four grid boundaries
const computeBoundaryProximity = (rowCoord, colCoord, totalRows, totalCols) => {
    // The distance to each side
    const distanceToTop = rowCoord;
    const distanceToBottom = totalRows - 1 - rowCoord;
    const distanceToLeft = colCoord;
    const distanceToRight = totalCols - 1 - colCoord;

    // Return the smallest of these distances
    return Math.min(distanceToTop, distanceToBottom, distanceToLeft, distanceToRight);
};

/**
 * Core processing function for the grid simulation.
 * @param {string[]} inputLines - An array of strings, where the first string contains dimensions
 *                                and subsequent strings represent the grid rows.
 */
function simulateAndEvaluateGrid(inputLines) {
    // Ensure input lines are provided
    if (!inputLines || inputLines.length === 0) {
        console.error("No input data provided for simulation.");
        return; // Exit if no input
    }

    // Parse grid dimensions and spread parameters from the first line
    const dimensionTokens = inputLines[0].split(' ').map(token => parseInt(token, 10));

    // Validate parsed dimensions
    if (dimensionTokens.length < 3 || dimensionTokens.some(isNaN)) {
        console.error("Invalid dimension data in the first input line. Expected: H W K");
        return;
    }

    const [numRows, numCols, spreadEffectiveness] = dimensionTokens;

    // Additional validation for dimensions
    if (numRows <= 0 || numCols <= 0 || spreadEffectiveness <= 0) {
        console.error("Grid dimensions (H, W) or spread effectiveness (K) must be positive integers.");
        return;
    }

    // Initialize the grid state from the remaining input lines
    // Using Array.from for robust grid creation, handling potential different line endings.
    const currentGridState = Array.from({ length: numRows }, (_, rowIndex) => {
        if (rowIndex + 1 >= inputLines.length) {
            console.error(`Missing grid row data for row ${rowIndex}. Filling with default '.' characters.`);
            // Fallback to a row of '.' characters if input is incomplete
            return Array(numCols).fill('.');
        }
        return Array.from(inputLines[rowIndex + 1]);
    });

    let activeSpreadPoints = []; // Stores coordinates [row, col] of 'S' cells

    // Search for the initial 'S' starting point within the grid
    let startPointFound = false;
    scanGridForStart:
    for (let r = 0; r < numRows; ++r) {
        for (let c = 0; c < numCols; ++c) {
            if (currentGridState[r][c] === 'S') {
                activeSpreadPoints.push([r, c]);
                startPointFound = true;
                break scanGridForStart; // Exit both loops once 'S' is found
            }
        }
    }

    // If 'S' was not found, there's nothing to spread
    if (!startPointFound || activeSpreadPoints.length === 0) {
        console.error("Initial 'S' cell not found in the grid. Exiting simulation.");
        return;
    }

    // Define cardinal directions for spreading (up, down, left, right)
    const directionalOffsets = [
        [-1, 0], // Represents moving Up (row - 1, col)
        [1, 0],  // Represents moving Down (row + 1, col)
        [0, -1], // Represents moving Left (row, col - 1)
        [0, 1]   // Represents moving Right (row, col + 1)
    ];

    // Simulate the spreading process for 'spreadEffectiveness' iterations
    for (let currentIteration = 0; currentIteration < spreadEffectiveness; ++currentIteration) {
        let newlyActivatedPoints = []; // Collects cells that become 'S' in this iteration

        if (activeSpreadPoints.length === 0) {
            // Optimization: if no points are active, no further spreading will occur.
            // This can happen if all 'S' cells are surrounded by non-'.' cells.
            break;
        }

        for (const [currentRow, currentCol] of activeSpreadPoints) {
            for (const [deltaRow, deltaCol] of directionalOffsets) {
                const neighborRow = currentRow + deltaRow;
                const neighborCol = currentCol + deltaCol;

                // Check if the neighbor is within bounds and is a '.' (empty/spreadable) cell
                if (checkBoundaryValidity(neighborRow, neighborCol, numRows, numCols) &&
                    currentGridState[neighborRow][neighborCol] === '.') {
                    
                    // Mark the cell as 'S' and add it to the list of newly activated points
                    currentGridState[neighborRow][neighborCol] = 'S';
                    newlyActivatedPoints.push([neighborRow, neighborCol]);
                }
            }
        }
        // Update the set of active spread points for the next iteration
        activeSpreadPoints = newlyActivatedPoints;
    }

    // --- Phase 2: Calculate minimum steps to reach a boundary from any 'S' cell ---
    let overallMinStepsToBoundary = Number.MAX_SAFE_INTEGER;
    let immediateBoundaryFound = false; // Flag to optimize if an 'S' cell is directly on a boundary

    evaluateSpreadGrid:
    for (let r = 0; r < numRows; ++r) {
        for (let c = 0; c < numCols; ++c) {
            // Only consider cells that have become 'S' during the simulation
            if (currentGridState[r][c] === 'S') {
                const currentCellBoundaryDistance = computeBoundaryProximity(r, c, numRows, numCols);

                if (currentCellBoundaryDistance === 0) {
                    // If an 'S' cell is directly on a boundary, the answer is 1 step.
                    // This is the absolute minimum possible, so we can stop early.
                    overallMinStepsToBoundary = 1;
                    immediateBoundaryFound = true;
                    break evaluateSpreadGrid; // Exit all loops
                }
                
                // Calculate total steps required from this cell:
                // 1 (for the initial 'S' state) + number of spread cycles needed to cover the distance.
                // Each cycle (K iterations) effectively covers 'spreadEffectiveness' units of distance.
                const additionalCyclesNeeded = Math.ceil(currentCellBoundaryDistance / spreadEffectiveness);
                const totalStepsFromThisCell = additionalCyclesNeeded + 1;

                // Update the overall minimum if this cell offers a better path to a boundary
                overallMinStepsToBoundary = Math.min(overallMinStepsToBoundary, totalStepsFromThisCell);
            }
        }
    }

    // Output the final computed minimum steps
    console.log(overallMinStepsToBoundary);
}

// Entry point: Read input data from standard input and then initiate the grid simulation.
simulateAndEvaluateGrid(obtainInputData());