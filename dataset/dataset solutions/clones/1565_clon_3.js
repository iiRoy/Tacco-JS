/**
 * Analyzes grid traversal paths to determine the minimum number of steps
 * required to reach each relevant row from various starting columns.
 *
 * This function processes a string input describing a grid and forbidden regions,
 * then simulates a pathfinding process. For each possible starting column in the
 * first row, it attempts to move downwards or rightwards, avoiding blocked areas.
 * The goal is to track the shortest path (in terms of steps) to reach specific
 * rows.
 *
 * @param {string} inputString The raw input data as a multi-line string.
 *   The first line contains grid dimensions (height and width).
 *   Subsequent lines describe forbidden column ranges for each row.
 */
function processGridTraversal(inputString) {
    // Basic input validation: ensure the input string is not empty or just whitespace.
    const allInputLines = inputString.trim().split("\n");
    if (allInputLines.length === 0 || allInputLines[0].length === 0) {
        // In a competitive programming context, this might be handled differently (e.g., error code or specific output).
        // For a Type III clone, adding a guard clause is a valid structural addition.
        console.error("Error: Provided input string is empty or malformed.");
        return;
    }

    // Deconstruct the input string into grid dimensions and forbidden region definitions.
    const [dimensionLine, ...regionDefinitionLines] = allInputLines;
    const [gridHeight, gridWidth] = parseNumbersFromString(dimensionLine);

    // Parse the forbidden regions for each row.
    // The original problem uses 1-based indexing for rows, but JavaScript arrays are 0-indexed.
    // We store these regions as a 0-indexed array, so `forbiddenRegions[i]` corresponds to row `i+1`.
    const forbiddenRegions = parse2DArrayFromLines(regionDefinitionLines, ' ')
        .map(rowSegments => rowSegments.map(segmentVal => +segmentVal)); // Convert string segments to numbers using unary plus.

    // Initialize an array to store the minimum steps required to reach each target row.
    // The original logic stores results for rows 2 through (gridHeight + 1) in an array of size `gridHeight`.
    // `minStepsToTargetRow[0]` corresponds to row 2, `minStepsToTargetRow[1]` to row 3, etc.
    // `minStepsToTargetRow[gridHeight - 1]` corresponds to row `gridHeight + 1`.
    // Initialize with `Infinity` to easily find minimums, later converted to -1 if unreachable.
    let minStepsToTargetRow = new Array(gridHeight).fill(Infinity);

    // Iterate through all possible starting columns from 1 to `gridWidth`.
    for (let currentStartColumn = 1; currentStartColumn <= gridWidth; ++currentStartColumn) {
        let currentXPosition = currentStartColumn; // Current column (1-based)
        let currentYPosition = 1; // Current row (1-based), always starts at the top
        let pathLength = 0; // Number of steps taken in the current traversal

        // Simulate the path traversal for the current starting column.
        // The path continues until it exits the grid boundaries.
        while (true) {
            pathLength++; // Increment step count for each move.

            // Determine if a downward movement is permitted from the current cell.
            if (isDownwardPathOpen(currentXPosition, currentYPosition, forbiddenRegions, gridHeight)) {
                currentYPosition++; // Move one row down.

                // If this move brings us to a row whose result needs to be tracked:
                // The target array `minStepsToTargetRow` uses indices `0` to `gridHeight-1`.
                // These indices map to rows `2` through `gridHeight+1`.
                // So, if `currentYPosition` is `2`, `currentYPosition - 2` is `0`.
                // If `currentYPosition` is `gridHeight+1`, `currentYPosition - 2` is `gridHeight-1`.
                if (currentYPosition >= 2 && currentYPosition <= gridHeight + 1) {
                    minStepsToTargetRow[currentYPosition - 2] = Math.min(minStepsToTargetRow[currentYPosition - 2], pathLength);
                }

                // If the path has moved beyond the bottom boundary of the grid, this path ends.
                if (currentYPosition > gridHeight) {
                    break;
                }
            } else {
                currentXPosition++; // If downward movement is blocked, attempt to move one column right.

                // If the path has moved beyond the right boundary of the grid, this path ends.
                if (currentXPosition > gridWidth) {
                    break;
                }
            }
        }
    }

    // Post-process the results: convert any `Infinity` values back to -1,
    // as per the common competitive programming convention for unreachable states.
    const finalCalculatedResults = minStepsToTargetRow.map(value => (value === Infinity ? -1 : value));
    console.log(finalCalculatedResults);

    /**
     * Helper function to check if a downward move from a specific grid cell is allowed.
     * A downward move is blocked if the current x-coordinate falls within the forbidden
     * column range for the *current* row.
     *
     * @param {number} xCoord The current column index (1-based).
     * @param {number} yCoord The current row index (1-based).
     * @param {Array<Array<number>>} blockIntervals A 0-indexed array where `blockIntervals[i]`
     *   contains `[startColumn, endColumn]` of the blocked range for row `i+1`.
     * @param {number} totalGridHeight The total height of the grid.
     * @returns {boolean} `true` if a downward move is permissible, `false` otherwise.
     */
    function isDownwardPathOpen(xCoord, yCoord, blockIntervals, totalGridHeight) {
        // If we are already at or below the last row, we can't 'go down' in terms of
        // encountering a new forbidden region for the current row.
        // The check for `yCoord > totalGridHeight` is handled by the main loop's break condition.
        // Here, we're checking if the *current* row has a block interval.
        if (yCoord < 1 || yCoord > totalGridHeight) {
            // This case should ideally not be hit if `yCoord` is always within `1` to `totalGridHeight`
            // when checking for a block. But it's a good defensive check.
            return false;
        }
        // Access the 0-indexed array for the current 1-based row.
        const [blockedColumnStart, blockedColumnEnd] = blockIntervals[yCoord - 1];

        // The path is clear below if the current x-coordinate is *outside* the blocked range.
        // i.e., currentX < blockedStart OR currentX > blockedEnd.
        return xCoord < blockedColumnStart || xCoord > blockedColumnEnd;
    }
}

// --- Global Utility Functions (modified for Type III cloning) ---

/**
 * Converts a string of space-separated numeric values into an array of numbers.
 * This is a common parsing utility for competitive programming inputs.
 *
 * @param {string} inputDataString The string to parse (e.g., "5 8").
 * @param {string} [separator=' '] The delimiter used to split the string.
 * @returns {Array<number>} An array of numbers.
 */
function parseNumbersFromString(inputDataString, separator = ' ') {
    // Basic validation for the input string.
    if (!inputDataString || inputDataString.length === 0) {
        return [];
    }
    return inputDataString.split(separator).map(valueStr => +valueStr); // Use unary plus for concise number conversion.
}

/**
 * Transforms an array of strings, where each string represents a row of data,
 * into a two-dimensional array of strings. Each row string is split by a specified separator.
 *
 * @param {Array<string>} lineCollection An array of strings, each being a line of data.
 * @param {string} [separator=' '] The character used to split each line string.
 * @returns {Array<Array<string>>} A 2D array where inner arrays contain string elements.
 */
function parse2DArrayFromLines(lineCollection, separator = ' ') {
    // Guard against empty or invalid input collection.
    if (!lineCollection || lineCollection.length === 0) {
        return [];
    }
    return lineCollection.map(currentLine => currentLine.split(separator));
}

// --- Standard I/O Handling (kept similar but with updated comments) ---
// This section is typically provided by the execution environment in competitive programming.
// It ensures that the main processing function receives the entire input.

// Do not modify the code below this line; it handles reading from standard input
// and invoking the primary grid traversal processing function.
processGridTraversal(require("fs").readFileSync("/dev/stdin", "utf8"));