const PATH_LEFT_CROSSBAR = 1;      // Represents a crossbar segment to the left
const PATH_RIGHT_CROSSBAR = -1;     // Represents a crossbar segment to the right
const PATH_NO_CROSSBAR = 0;       // Represents no crossbar segment
const RESULT_PATH_EXISTS = "0";     // Output code when a path already exists
const RESULT_NO_SOLUTION = "1";     // Output code when no single modification can create a path

// Stores the parsed problem configuration (e.g., grid dimensions, start/end points)
let problemConfiguration = {};
// Represents the 2D grid of path segments, where each cell indicates a horizontal shift
let pathAdjacencyGrid = [];

/**
 * Safely parses a string into an integer, providing a default value and logging a warning on failure.
 * @param {string} inputValue - The string to parse.
 * @param {number} [fallbackValue=0] - The value to return if parsing fails.
 * @param {string} [contextDescription="unknown value"] - A description for logging purposes.
 * @returns {number} The parsed integer or the fallback value.
 */
const parseNumericInput = (inputValue, fallbackValue = 0, contextDescription = "unknown value") => {
    const parsedValue = parseInt(inputValue, 10);
    if (isNaN(parsedValue)) {
        console.warn(`Warning: Could not convert "${inputValue}" to a number for ${contextDescription}. Using default: ${fallbackValue}`);
        return fallbackValue;
    }
    return parsedValue;
};

/**
 * Traces a path through the grid from a given starting column, moving downwards.
 * @param {number} initialColumnIndex - The 0-indexed starting column.
 * @param {number} [startRowIndex=0] - The 0-indexed row from which to begin tracing.
 * @returns {number[]} An array of column indices representing the path at each row.
 */
const tracePathDownwards = (initialColumnIndex, startRowIndex = 0) => {
    let currentColumn = initialColumnIndex;
    const pathCoordinates = [currentColumn]; // Store the column position for each row

    // Traverse each row from the starting point to the end of the grid
    for (let rowIndex = startRowIndex; rowIndex < pathAdjacencyGrid.length; rowIndex++) {
        // Update the current column based on the crossbar value in the grid cell
        currentColumn += pathAdjacencyGrid[rowIndex][currentColumn];
        pathCoordinates.push(currentColumn);
    }
    return pathCoordinates;
};

/**
 * Traces a path through the grid from a given target column, moving upwards (then reverses the path).
 * This effectively gives the path from the start to the target if traversed backwards.
 * @param {number} targetColumnIndex - The 0-indexed target column.
 * @returns {number[]} An array of column indices representing the path at each row, in forward order.
 */
const tracePathUpwardsAndReverse = (targetColumnIndex) => {
    let currentColumn = targetColumnIndex;
    const reversedPathCoordinates = [currentColumn]; // Store column positions in reverse row order

    // Traverse each row from the bottom of the grid upwards
    for (let rowIndex = pathAdjacencyGrid.length - 1; rowIndex >= 0; rowIndex--) {
        // Update the current column based on the crossbar value
        currentColumn += pathAdjacencyGrid[rowIndex][currentColumn];
        reversedPathCoordinates.push(currentColumn);
    }
    // Reverse the collected path to present it in the natural (top-down) row order
    return reversedPathCoordinates.reverse();
};

// Array to accumulate all raw input strings from standard input
let collectedRawInputLines = [];

// Configure standard input stream
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event handler for receiving data chunks from stdin
process.stdin.on('data', (dataChunk) => {
    // Split the chunk into individual lines, trim whitespace, and filter out empty strings
    dataChunk.trim().split('\n').filter(Boolean).forEach(lineContent => {
        collectedRawInputLines.push(lineContent);
    });
});

// Event handler for when all standard input has been received
process.stdin.on('end', () => {
    /**
     * Encapsulates the entire logic for processing a single challenge instance.
     * @param {string[]} challengeInputLines - An array of input strings for the current challenge.
     * @returns {string|undefined} The final result string, or `undefined` if processing was aborted.
     */
    const executeChallengeProcessor = (challengeInputLines) => {
        // Reset global state for the new challenge instance
        problemConfiguration = {};
        pathAdjacencyGrid = [];

        let inputLineCursor = 0; // Tracks the current line being parsed from the input array

        // --- Initial Input Validation and Parsing of Configuration ---
        // Mimic original code's abrupt exit: if the first line is "0", stop processing entirely.
        if (challengeInputLines.length === 0 || challengeInputLines[0] === "0") {
            return; // Aborts execution without any output
        }

        // Define the ordered keys for configuration values expected from input
        const orderedConfigKeys = ['ladderWidth', 'startColumn', 'endColumn', 'ladderHeight'];
        
        // Parse the initial 4 configuration lines
        for (let i = 0; i < orderedConfigKeys.length; i++) {
            if (inputLineCursor >= challengeInputLines.length) {
                console.error("Error: Not enough configuration lines provided in input.");
                return RESULT_NO_SOLUTION; // Indicate a problem with input
            }
            const currentLineString = challengeInputLines[inputLineCursor];
            // Mimic original code's abrupt exit: if any config line is "0", stop processing.
            if (currentLineString === "0") {
                return; // Aborts execution without any output
            }
            problemConfiguration[orderedConfigKeys[i]] = parseNumericInput(currentLineString, 0, orderedConfigKeys[i]);
            inputLineCursor++;
        }

        // --- Validate Core Configuration Values ---
        if (problemConfiguration.ladderWidth <= 0 || problemConfiguration.ladderHeight <= 0) {
            console.error("Validation Error: Invalid ladder dimensions (width or height must be positive).");
            return RESULT_NO_SOLUTION;
        }
        // Validate 1-based column indices against the ladder width
        if (problemConfiguration.startColumn < 1 || problemConfiguration.startColumn > problemConfiguration.ladderWidth ||
            problemConfiguration.endColumn < 1 || problemConfiguration.endColumn > problemConfiguration.ladderWidth) {
            console.error("Validation Error: Start or end column index is out of bounds for the specified ladder width.");
            return RESULT_NO_SOLUTION;
        }

        // --- Parse Ladder Grid Data ---
        // Each row of the ladder grid is provided as a string of '0's and '1's
        for (let rowIndex = 0; rowIndex < problemConfiguration.ladderHeight; rowIndex++) {
            if (inputLineCursor >= challengeInputLines.length) {
                console.error(`Error: Insufficient ladder grid data lines. Expected ${problemConfiguration.ladderHeight} rows, but only found ${rowIndex}.`);
                return RESULT_NO_SOLUTION;
            }
            const currentGridRowString = challengeInputLines[inputLineCursor];
            // Mimic original code's abrupt exit: if any grid line is "0", stop processing.
            if (currentGridRowString === "0") {
                return; // Aborts execution without any output
            }
            const processedGridRow = [];
            // The input string defines `ladderWidth - 1` potential crossbar positions.
            // Each character `c` is either '0' or '1'.
            // '1' indicates a crossbar segment to the left (PATH_LEFT_CROSSBAR).
            // '0' indicates no crossbar segment (PATH_NO_CROSSBAR),
            // UNLESS the previous segment was a '1', in which case this '0' implies a segment to the right (PATH_RIGHT_CROSSBAR).
            for (let charIndex = 0; charIndex < problemConfiguration.ladderWidth - 1; charIndex++) {
                const characterDigit = parseNumericInput(currentGridRowString.charAt(charIndex), PATH_NO_CROSSBAR, `grid char at row ${rowIndex}, position ${charIndex}`);
                let cellAdjacencyValue = characterDigit; // Default: '0' -> 0, '1' -> 1

                // If current char is '0' and the previous cell in this row was a '1' (PATH_LEFT_CROSSBAR),
                // then this '0' actually represents a PATH_RIGHT_CROSSBAR (-1).
                if (charIndex > 0 && characterDigit === PATH_NO_CROSSBAR && processedGridRow[charIndex - 1] === PATH_LEFT_CROSSBAR) {
                    cellAdjacencyValue = PATH_RIGHT_CROSSBAR;
                }
                processedGridRow.push(cellAdjacencyValue);
            }
            // Add the final cell of the row: If the last processed cell was PATH_LEFT_CROSSBAR,
            // the very last cell in the row must be PATH_RIGHT_CROSSBAR; otherwise, it's PATH_NO_CROSSBAR.
            processedGridRow.push((processedGridRow[processedGridRow.length - 1] === PATH_LEFT_CROSSBAR) ? PATH_RIGHT_CROSSBAR : PATH_NO_CROSSBAR);
            pathAdjacencyGrid.push(processedGridRow);
            inputLineCursor++;
        }

        // --- Adjust Column Indices to Be 0-based for Internal Logic ---
        problemConfiguration.startColumn--; // Convert from 1-based to 0-based
        problemConfiguration.endColumn--;   // Convert from 1-based to 0-based

        // --- Main Pathfinding Algorithm ---
        let finalOutputResult = "";

        // 1. Trace the path from the designated start column downwards
        const forwardPathTrajectory = tracePathDownwards(problemConfiguration.startColumn);

        // Check if the forward path already successfully reaches the target column
        const finalForwardPosition = forwardPathTrajectory[forwardPathTrajectory.length - 1];
        if (finalForwardPosition === problemConfiguration.endColumn) {
            return RESULT_PATH_EXISTS; // No modification needed
        }

        // 2. Trace a 'reverse' path from the target column upwards (then reversed to be top-down)
        const backwardPathTrajectory = tracePathUpwardsAndReverse(problemConfiguration.endColumn);

        // 3. Iterate through each row (step) to find a potential "bridge" modification
        // A bridge can be created if the forward and backward paths are adjacent at a row,
        // and both positions in that row are currently free (no crossbar).
        for (let currentStepIndex = 0; currentStepIndex < problemConfiguration.ladderHeight; currentStepIndex++) {
            const positionInForwardPath = forwardPathTrajectory[currentStepIndex];
            const positionInBackwardPath = backwardPathTrajectory[currentStepIndex];

            // Determine if the paths are currently adjacent (differ by exactly 1 column)
            const pathsAreAdjacent = Math.abs(positionInForwardPath - positionInBackwardPath) === 1;

            // Check if the grid cells at these positions are clear (no existing crossbar)
            const isForwardPathCellClear = pathAdjacencyGrid[currentStepIndex][positionInForwardPath] === PATH_NO_CROSSBAR;
            const isBackwardPathCellClear = pathAdjacencyGrid[currentStepIndex][positionInBackwardPath] === PATH_NO_CROSSBAR;

            // If all conditions are met, a new crossbar can be added here
            if (pathsAreAdjacent && isForwardPathCellClear && isBackwardPathCellClear) {
                const outputRowNumber = currentStepIndex + 1; // Convert back to 1-indexed row
                // The crossbar is placed at the minimum of the two adjacent column indices
                const outputColumnNumber = Math.min(positionInForwardPath, positionInBackwardPath) + 1; // Convert to 1-indexed column
                finalOutputResult = `${outputRowNumber} ${outputColumnNumber}`;
                break; // Found the first valid modification, no need to search further
            }
        }

        // If after checking all steps, no suitable modification point was found
        if (finalOutputResult === "") {
            finalOutputResult = RESULT_NO_SOLUTION; // No single crossbar can connect the paths
        }
        
        return finalOutputResult;
    };

    // Execute the main challenge logic with all collected input lines
    const executionOutcome = executeChallengeProcessor(collectedRawInputLines);
    
    // Only print the result if the execution didn't abort (i.e., didn't return undefined)
    if (executionOutcome !== undefined) {
        console.log(executionOutcome);
    }
});