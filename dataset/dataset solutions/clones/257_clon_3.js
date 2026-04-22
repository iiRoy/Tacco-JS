const programConfig = {};
let boardGrid = [];

/**
 * Traces a path on the board grid from an initial column downwards through the rows.
 * Each element in the boardGrid at `boardGrid[rowIndex][currentColumn]` specifies the horizontal
 * movement (1 for right, -1 for left, 0 for straight) from `currentColumn` at `rowIndex`.
 *
 * @param {number} initialColumn - The starting column index (0-based) for the path.
 * @param {number} [startRow=0] - The row index (0-based) from which to begin tracing.
 * @returns {number[]} An array representing the column index at each step (row) of the traced path.
 */
const tracePathForward = (initialColumn, startRow = 0) => {
    let currentColumnPosition = initialColumn;
    const pathSegmentCollection = [currentColumnPosition]; // Stores the column history
    
    // Iterate through the board rows from the starting row to the end
    for (let rowIndex = startRow; rowIndex < boardGrid.length; rowIndex++) {
        // Update the current column based on the movement instruction from the board grid
        currentColumnPosition += boardGrid[rowIndex][currentColumnPosition];
        pathSegmentCollection.push(currentColumnPosition);
    }
    return pathSegmentCollection;
};

/**
 * Traces a "reverse" path on the board grid starting from a target column upwards,
 * then reverses the resulting path to represent a forward-ordered path that leads to the target.
 * The movement logic `currentColumnPosition += boardGrid[rowIndex][currentColumnPosition]`
 * when iterating backwards implies `boardGrid` values are designed such that this operation
 * effectively reveals the preceding column in the path that would lead to `targetColumn`.
 *
 * @param {number} targetColumn - The desired ending column index (0-based) for the path.
 * @returns {number[]} An array representing the column index at each step (row) of the path,
 *                     ordered from the top row to the bottom row, ending at `targetColumn`.
 */
const tracePathBackwardThenInvert = (targetColumn) => {
    let currentColumnPosition = targetColumn;
    const reversePathSegments = [currentColumnPosition]; // Stores column history in reverse row order

    // Iterate upwards from the last row of the board
    for (let rowIndex = boardGrid.length - 1; rowIndex >= 0; rowIndex--) {
        // Apply the movement rule. This effectively finds the column in the previous row
        // that would lead to the current column given the board's movement rules.
        currentColumnPosition += boardGrid[rowIndex][currentColumnPosition];
        reversePathSegments.push(currentColumnPosition);
    }
    // Reverse the collection to get the path in top-to-bottom row order
    return reversePathSegments.reverse();
};

// --- Input Handling Setup ---
const collectedInputLines = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event handler for incoming data chunks from standard input
process.stdin.on('data', (dataChunk) => {
    // Process each chunk by splitting it into individual lines and adding to our collection
    const linesFromChunk = dataChunk.trim().split('\n');
    collectedInputLines.push(...linesFromChunk);
});

// Event handler for the end of standard input stream
process.stdin.on('end', () => {
    let finalOutputString = ""; // Variable to store the final result

    // --- Initialization and Input Parsing Phase ---
    // Clear previous configuration and board state (useful if this code were to be reused)
    Object.keys(programConfig).forEach(key => delete programConfig[key]);
    boardGrid = [];

    // Define the expected order of configuration parameters from input lines
    const configurationKeyOrder = ["numColumns", "startPosition", "endPosition", "maxSteps"];
    let currentLineReadIndex = 0;

    // 1. Parse Configuration Parameters
    while (currentLineReadIndex < collectedInputLines.length && currentLineReadIndex < configurationKeyOrder.length) {
        const lineContent = collectedInputLines[currentLineReadIndex];
        const parsedNumericValue = parseInt(lineContent, 10);

        // Basic validation for numeric input
        if (isNaN(parsedNumericValue)) {
            console.error(`Error: Expected a number for config parameter '${configurationKeyOrder[currentLineReadIndex]}', but received: '${lineContent}'`);
            process.exit(1); // Terminate if configuration is malformed
        }
        programConfig[configurationKeyOrder[currentLineReadIndex]] = parsedNumericValue;
        currentLineReadIndex++;
    }

    // Adjust 1-based input positions to 0-based internal representation
    if (programConfig.startPosition !== undefined) {
        programConfig.startPosition -= 1;
    }
    if (programConfig.endPosition !== undefined) {
        programConfig.endPosition -= 1;
    }

    // 2. Parse Board Grid Data
    // Board data begins after the configuration lines
    const boardDataStartLineIndex = configurationKeyOrder.length;

    for (let boardRowDataIndex = boardDataStartLineIndex; boardRowDataIndex < collectedInputLines.length; boardRowDataIndex++) {
        const rowInputString = collectedInputLines[boardRowDataIndex];
        
        // A line containing "0" signals the end of board data input
        if (rowInputString.trim() === "0") {
            break;
        }

        const currentRowCellValues = [];
        // The input string for a row contains `numColumns - 1` characters, representing dividers.
        // `programConfig.numColumns` is the total number of available positions (0 to numColumns-1).
        const expectedDividerCount = programConfig.numColumns - 1;

        for (let charPosition = 0; charPosition < expectedDividerCount; charPosition++) {
            const charFromInput = rowInputString.charAt(charPosition);
            let cellMovementValue = parseInt(charFromInput, 10);

            // Special rule: if a '0' divider is encountered and the *previous* divider was a '1',
            // this '0' implicitly represents a '-1' movement.
            // This rule constructs the board from the input format.
            if (charPosition > 0 && cellMovementValue === 0 && currentRowCellValues[charPosition - 1] === 1) {
                cellMovementValue = -1;
            }
            currentRowCellValues.push(cellMovementValue);
        }

        // Handle the implicit value for the very last column in the row.
        // If the last processed divider was '1' (move right), the last column must implicitly move left (-1).
        // Otherwise, it stays (0).
        const lastDividerValue = currentRowCellValues[currentRowCellValues.length - 1];
        const implicitLastColumnMovement = (lastDividerValue === 1) ? -1 : 0;
        currentRowCellValues.push(implicitLastColumnMovement);
        
        boardGrid.push(currentRowCellValues);
    }
    
    // --- Core Logic: Path Finding and Solution Determination ---

    const startPathTrajectory = tracePathForward(programConfig.startPosition);
    
    // Check if the starting path already reaches the end position directly
    const finalColumnOfStartPath = startPathTrajectory[startPathTrajectory.length - 1];
    if (finalColumnOfStartPath === programConfig.endPosition) {
        finalOutputString = "0"; // Direct path found, no new bar needed
        console.log(finalOutputString);
        return; // Exit early as solution is found
    }

    // If no direct path, trace the path backward from the end position
    const endPathTrajectory = tracePathBackwardThenInvert(programConfig.endPosition);

    // Search for a 'bridge' or 'switch' point where a new bar can be inserted
    // This is done by iterating through the maximum allowed steps (rows)
    for (let currentStepRow = 0; currentStepRow < programConfig.maxSteps; currentStepRow++) {
        const currentPositionOnStartPath = startPathTrajectory[currentStepRow];
        const currentPositionOnEndPath = endPathTrajectory[currentStepRow];

        // Calculate the absolute distance between the two paths at the current row
        const horizontalDistance = Math.abs(currentPositionOnStartPath - currentPositionOnEndPath);
        
        // Retrieve the movement values for both paths at their respective columns in the current row
        const startPathCellState = boardGrid[currentStepRow][currentPositionOnStartPath];
        const endPathCellState = boardGrid[currentStepRow][currentPositionOnEndPath];

        // A 'bridge' can be formed if:
        // 1. The two paths are adjacent (distance is 1).
        // 2. Both paths are currently moving straight (value 0) at their respective columns.
        if (horizontalDistance === 1 && startPathCellState === 0 && endPathCellState === 0) {
            // Found the first suitable location for a new bar
            // Output format: (row index + 1) + " " + (minimum of the two adjacent column indices + 1)
            const outputRowNumber = currentStepRow + 1;
            const outputColumnNumber = Math.min(currentPositionOnStartPath, currentPositionOnEndPath) + 1;
            finalOutputString = `${outputRowNumber} ${outputColumnNumber}`;
            break; // Stop searching after finding the first suitable point
        }
    }

    // If no suitable bridge point was found after checking all allowed steps
    if (finalOutputString === "") {
        finalOutputString = "1"; // Indicate that no solution was found within the given constraints
    }
    
    console.log(finalOutputString);
});