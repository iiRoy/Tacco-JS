'use strict';

/**
 * Parses a string value into an integer. Handles potential non-numeric inputs gracefully
 * by returning 0 and logging an error, though in competitive programming contexts,
 * inputs are typically guaranteed valid.
 * @param {string} value - The string to parse.
 * @returns {number} The parsed integer.
 */
const parseNumericInput = (value) => {
    const parsedNumber = parseInt(value, 10);
    // Basic validation for robustness, though often not strictly necessary for contest problems.
    if (isNaN(parsedNumber)) {
        console.error("Error: Received non-numeric input where an integer was expected:", value);
        return 0; // Default to 0 or handle error appropriately
    }
    return parsedNumber;
};

/**
 * Simulates a robot's movement on a grid, considering both the robot's intended
 * moves and the grid's counter-actions. It determines if the robot can stay
 * within the grid boundaries throughout a sequence of moves.
 *
 * @param {string} rawInputData - A string containing space-separated input values:
 *                                gridHeight, gridWidth, totalMoves, startRow, startCol,
 *                                robotAttemptSequence, gridCorrectionSequence.
 */
function navigateRobotSimulation(rawInputData) {

    // Split the entire input string into an array of individual tokens
    const inputTokens = rawInputData.split(/\s+/);
    let currentTokenIndex = 0; // Pointer to the current token being processed

    // Helper function to extract and parse the next integer token from the input stream
    const extractNextInteger = () => parseNumericInput(inputTokens[currentTokenIndex++]);
    // Helper function to extract the next string token from the input stream
    const extractNextString = () => inputTokens[currentTokenIndex++];

    // --- Parse Initial Configuration ---

    // Grid dimensions
    const gridHeight = extractNextInteger();
    const gridWidth = extractNextInteger();
    // Total number of movement steps to simulate
    const totalMovementSteps = extractNextInteger();

    // Robot's starting coordinates
    const initialRobotRow = extractNextInteger();
    const initialRobotColumn = extractNextInteger();

    // Sequences of moves for the robot and grid
    const robotMovementPattern = extractNextString(); // 'S' in original
    const gridInteractionPattern = extractNextString(); // 'T' in original

    // --- Define Grid Boundary Constants ---

    // Minimum valid coordinate for both rows and columns
    const MIN_GRID_COORD = 1;
    // Maximum valid row coordinate
    const MAX_GRID_ROW = gridHeight;
    // Maximum valid column coordinate
    const MAX_GRID_COL = gridWidth;

    // --- Initialize Simulation State ---

    // This array will store the possible range of coordinates the robot could occupy
    // at each step. Each entry is an array: [minColumn, maxColumn, minRow, maxRow].
    let trajectoryHistory = [];

    // The robot starts at a single point, so its initial possible range is just that point.
    let currentMinColumn = initialRobotColumn;
    let currentMaxColumn = initialRobotColumn;
    let currentMinRow = initialRobotRow;
    let currentMaxRow = initialRobotRow;

    // Store the initial state
    trajectoryHistory.push([currentMinColumn, currentMaxColumn, currentMinRow, currentMaxRow]);

    // Flag to indicate if the robot has ever moved out of bounds
    let hasRobotFallenOff = false;

    // --- Simulate Movement Steps ---

    // Iterate through each movement step from 0 to totalMovementSteps - 1
    for (let step = 0; step < totalMovementSteps; step++) {

        // Retrieve the possible position range from the *previous* step
        const previousPossibleRange = trajectoryHistory[step];
        currentMinColumn = previousPossibleRange[0];
        currentMaxColumn = previousPossibleRange[1];
        currentMinRow = previousPossibleRange[2];
        currentMaxRow = previousPossibleRange[3];

        // --- Apply Robot's Intended Move (from robotMovementPattern) ---
        // This step expands the possible area the robot could be in.
        const robotAction = robotMovementPattern[step];
        switch (robotAction) {
            case 'L': // Robot attempts to move Left: The leftmost possible column decreases by 1.
                currentMinColumn--;
                break;
            case 'R': // Robot attempts to move Right: The rightmost possible column increases by 1.
                currentMaxColumn++;
                break;
            case 'U': // Robot attempts to move Up: The topmost possible row decreases by 1.
                currentMinRow--;
                break;
            case 'D': // Robot attempts to move Down: The bottommost possible row increases by 1.
                currentMaxRow++;
                break;
            // No default case needed, as problem implies valid move characters.
        }

        // --- Check for immediate fall-off after robot's move ---
        // If any boundary goes beyond the grid limits (e.g., minCol < 1 or maxCol > gridWidth),
        // the robot would have fallen off at this point.
        if (currentMinColumn < MIN_GRID_COORD ||
            currentMaxColumn > MAX_GRID_COL ||
            currentMinRow < MIN_GRID_COORD ||
            currentMaxRow > MAX_GRID_ROW) {
            hasRobotFallenOff = true;
            break; // No need to continue simulation, robot is already out.
        }

        // --- Apply Grid's Counter-Action (from gridInteractionPattern) ---
        // This step constricts the possible area, pushing the robot back towards the center.
        const gridAction = gridInteractionPattern[step];
        switch (gridAction) {
            case 'L': // Grid pushes from the Right: The rightmost possible column decreases by 1.
                currentMaxColumn--;
                break;
            case 'R': // Grid pushes from the Left: The leftmost possible column increases by 1.
                currentMinColumn++;
                break;
            case 'U': // Grid pushes from the Bottom: The bottommost possible row decreases by 1.
                currentMaxRow--;
                break;
            case 'D': // Grid pushes from the Top: The topmost possible row increases by 1.
                currentMinRow++;
                break;
            // No default case needed.
        }

        // --- Clamp Boundaries to Grid Limits ---
        // Ensure that the possible range never extends beyond the physical grid dimensions (1 to W/H).
        // The grid's counter-action might push the boundaries 'too far' inwards.
        currentMinColumn = Math.max(currentMinColumn, MIN_GRID_COORD);
        currentMaxColumn = Math.min(currentMaxColumn, MAX_GRID_COL);
        currentMinRow = Math.max(currentMinRow, MIN_GRID_COORD);
        currentMaxRow = Math.min(currentMaxRow, MAX_GRID_ROW);

        // --- Final Validity Check for Current Range ---
        // After all adjustments, if the minimum boundary exceeds the maximum boundary
        // in any dimension (e.g., minCol > maxCol), it means there's no possible
        // position for the robot left, implying it has effectively fallen off.
        if (currentMinColumn > currentMaxColumn || currentMinRow > currentMaxRow) {
            hasRobotFallenOff = true;
            break; // Robot cannot exist in this state, simulation ends.
        }

        // Store the newly calculated possible range for the next iteration
        trajectoryHistory.push([currentMinColumn, currentMaxColumn, currentMinRow, currentMaxRow]);
    }

    // --- Output Result ---
    // Based on whether the robot ever fell off the grid during the simulation.
    if (hasRobotFallenOff) {
        console.log('NO');
    } else {
        console.log('YES');
    }
}

// Entry point for execution: Reads input from standard input and calls the main simulation function.
navigateRobotSimulation(require('fs').readFileSync('/dev/stdin', 'utf8'));