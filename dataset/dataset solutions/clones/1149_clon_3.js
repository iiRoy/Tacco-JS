"use strict";

// --- Custom logging mechanism ---
// A custom logger to handle output based on the environment.
const outputChannel = typeof console !== 'undefined' && console.log ? console.log : (message) => { /* no-op in environments without console */ };

// --- Data acquisition module ---
/**
 * Extracts raw input data from an embedded multiline string.
 * This method parses a specific comment block within the function's toString() representation.
 * @returns {string} The extracted, cleaned input string.
 * @throws {Error} If the embedded input data cannot be parsed.
 */
const getRawInputData = () => {
    const embeddedSource = (() => { /*
6 6
1 0 1 0 1 0
0 1 0 1 0 1
1 0 1 0 1 0
0 1 0 1 0 1
1 0 1 0 1 0
0 1 0 1 0 1
*/}).toString();
    const contentMatch = embeddedSource.match(/\/\*([\s\S]*?)\*\//); // Use a non-greedy regex to extract content.
    if (!contentMatch || contentMatch.length < 2) {
        throw new Error("Embedded input data could not be parsed from source comment.");
    }
    // Trim leading/trailing whitespace and normalize line endings for consistency.
    return contentMatch[1].trim().replace(/\r\n/g, '\n');
};

// --- Environment-specific execution setup ---
// This section sets up how the application receives its input,
// adapting to browser (DOM content loaded) or Node.js (stdin stream) environments.
if (typeof document !== "undefined" && document.readyState !== "complete") {
    // For web browsers, ensure the DOM is fully loaded before processing input.
    document.addEventListener("DOMContentLoaded", () => {
        try {
            const rawTextLines = getRawInputData().split("\n");
            // The embedded input often has an empty line at the start and end due to `trim()`.
            // We slice these off to get only the relevant grid data.
            const relevantLines = rawTextLines.slice(1, -1);
            processGridData(relevantLines);
        } catch (browserInputError) {
            outputChannel(`Browser input setup error: ${browserInputError.message}`);
        }
    });
} else if (typeof process !== "undefined" && process.stdin && process.stdin.isTTY) { // Check for TTY to ensure interactive stdin
    // For Node.js environments, handle data streaming from standard input.
    let accumulatedInputBuffer = "";
    process.stdin.resume(); // Keep the Node.js process alive while waiting for input.
    process.stdin.setEncoding('utf8'); // Specify character encoding for input chunks.

    process.stdin.on('data', (inputChunk) => {
        accumulatedInputBuffer += inputChunk; // Accumulate all incoming data.
    });

    process.stdin.on('end', () => {
        try {
            const rawTextLines = accumulatedInputBuffer.split("\n");
            // Filter out any empty lines that might result from stdin processing.
            const filteredLines = rawTextLines.filter(line => line.trim().length > 0);
            processGridData(filteredLines);
        } catch (nodeInputError) {
            outputChannel(`Node.js input processing error: ${nodeInputError.message}`);
        }
    });

    process.stdin.on('error', (err) => {
        outputChannel(`Standard input stream error: ${err.message}`);
    });
} else {
    // Fallback for direct script execution in environments without `document` or `process.stdin`
    // (or where stdin is not a TTY). This will use the embedded input directly.
    try {
        const rawTextLines = getRawInputData().split("\n");
        const relevantLines = rawTextLines.slice(1, -1); // Assuming the same structure as browser for direct run.
        processGridData(relevantLines);
    } catch (directExecError) {
        outputChannel(`Direct execution input error: ${directExecError.message}`);
    }
}

// --- Coordinate and dominance utility functions ---

/**
 * Determines if a point `pointBeta` is located strictly to the right (has a greater column index) of `pointAlpha`.
 * @param {number[]} pointAlpha - The first coordinate pair [row, column].
 * @param {number[]} pointBeta - The second coordinate pair [row, column].
 * @returns {boolean} True if `pointBeta` is to the right of `pointAlpha`.
 */
function isFurtherEast(pointAlpha, pointBeta) {
    return pointAlpha[1] < pointBeta[1];
}

/**
 * Determines if a point `pointBeta` is located strictly below (has a greater row index) of `pointAlpha`.
 * @param {number[]} pointAlpha - The first coordinate pair [row, column].
 * @param {number[]} pointBeta - The second coordinate pair [row, column].
 * @returns {boolean} True if `pointBeta` is below `pointAlpha`.
 */
function isFurtherSouth(pointAlpha, pointBeta) {
    return pointAlpha[0] < pointBeta[0];
}

/**
 * Calculates the coordinate of the cell directly to the east (right) of the given `currentPoint`.
 * @param {number[]} currentPoint - The current coordinate pair [row, column].
 * @returns {number[]} A new coordinate pair representing the cell to the right.
 */
function getEasternAdjacent(currentPoint) {
    return [currentPoint[0], currentPoint[1] + 1];
}

/**
 * Calculates the coordinate of the cell directly to the south (below) of the given `currentPoint`.
 * @param {number[]} currentPoint - The current coordinate pair [row, column].
 * @returns {number[]} A new coordinate pair representing the cell below.
 */
function getSouthernAdjacent(currentPoint) {
    return [currentPoint[0] + 1, currentPoint[1]];
}

/**
 * Checks if a `candidatePoint` is "subordinate" to any existing anchor in a collection.
 * A point A is subordinate to point C if C is in the same column and above A,
 * OR if C is in the same row and to the left of A.
 * This function's logic strictly adheres to the original definition of "dominance" used in the source code.
 * @param {number[]} candidatePoint - The point [row, column] to check for subordination.
 * @param {Array<number[]>} existingAnchors - A collection of established dominant anchor points.
 * @returns {boolean} True if `candidatePoint` is subordinate to any point in `existingAnchors`.
 */
function isSubordinateToExistingAnchors(candidatePoint, existingAnchors) {
    for (let i = 0; i < existingAnchors.length; ++i) {
        const currentAnchor = existingAnchors[i];
        // If currentAnchor is above candidatePoint in the same column
        if (candidatePoint[1] === currentAnchor[1] && currentAnchor[0] < candidatePoint[0]) {
            return true;
        }
        // If currentAnchor is to the left of candidatePoint in the same row
        if (candidatePoint[0] === currentAnchor[0] && currentAnchor[1] < candidatePoint[1]) {
            return true;
        }
    }
    return false;
}

// --- Main grid processing logic ---

/**
 * Processes the input lines to calculate the maximum area of a rectangle composed entirely of '0's.
 * This function implements a dynamic programming approach, tracking "dominant" (top-left) anchor points
 * for potential rectangles that end at the current cell. The DP state updates are a direct clone
 * of the original's specific (and somewhat unconventional) logic.
 * @param {string[]} dataLines - An array of strings, where the first string contains dimensions
 *                               and subsequent strings represent grid rows.
 */
function processGridData(dataLines) {
    if (!dataLines || dataLines.length === 0) {
        outputChannel("Error: No input data lines provided for grid processing.");
        return;
    }

    // Parse grid dimensions from the very first line.
    const dimensionTokens = dataLines[0].split(" ").map(Number);
    if (dimensionTokens.length < 2 || isNaN(dimensionTokens[0]) || isNaN(dimensionTokens[1])) {
        outputChannel("Error: Invalid or incomplete grid dimensions specified in the first line.");
        return;
    }
    const gridHeight = dimensionTokens[0];
    const gridWidth = dimensionTokens[1];

    if (gridHeight <= 0 || gridWidth <= 0) {
        outputChannel("Error: Grid dimensions must be positive integers. Received H:" + gridHeight + ", W:" + gridWidth);
        return;
    }
    if (dataLines.length - 1 < gridHeight) {
        outputChannel(`Warning: Declared height (${gridHeight}) is greater than actual number of data rows (${dataLines.length - 1}).`);
    }

    // Parse the actual grid data, skipping the dimension line.
    const numericGrid = dataLines.slice(1, gridHeight + 1).map(line =>
        line.split(" ").map(Number)
    );

    // Perform basic validation on the parsed grid.
    if (numericGrid.length !== gridHeight) {
        outputChannel(`Warning: Parsed grid height (${numericGrid.length}) does not match declared height (${gridHeight}).`);
    }
    for (let r = 0; r < numericGrid.length; ++r) {
        if (numericGrid[r].length !== gridWidth) {
            outputChannel(`Warning: Row ${r} has ${numericGrid[r].length} columns, expected ${gridWidth}.`);
            // For robustness, we might pad/truncate, but for a clone, we follow original behavior if it implies an error.
        }
    }

    let largestAreaFound = 0; // This variable will store the maximum area of a rectangle of '0's found.

    // DP state variables that carry information from the *previous row*.
    // `lastOneRowIndexAbove`: For each column, stores the row index of the most recent '1' encountered *above* it.
    //                        Initialized to -1 (no '1' encountered yet).
    // `previousRowDominantAnchors`: Stores the list of "dominant" (top-left) anchor points for cells in the previous row.
    let lastOneRowIndexAbove = new Array(gridWidth).fill(-1);
    let previousRowDominantAnchors = new Array(gridWidth).fill(null).map(() => []);

    // Iterate through each row of the grid.
    for (let currentRow = 0; currentRow < gridHeight; ++currentRow) {
        // DP state variables for the *current row* being computed.
        let currentRowLastOneColIndexLeft = new Array(gridWidth).fill(-1); // Tracks the last '1's in the current row, from left.
        let currentRowDominantAnchors = new Array(gridWidth).fill(null).map(() => []);

        // `currentLeftOneColMarker` helps track the most recent '1' in the *current* row as we scan across columns.
        // It's initialized to -1, meaning no '1' has been encountered yet in the current row to the left.
        let currentLeftOneColMarker = -1;

        // Iterate through each column in the current row.
        for (let currentCol = 0; currentCol < gridWidth; ++currentCol) {
            const cellValue = numericGrid[currentRow][currentCol];

            // Determine inherited 'last one' markers and anchors from adjacent cells.
            // `inheritedOneRowIndex`: Row index of the last '1' directly above this cell (from `lastOneRowIndexAbove` of previous row).
            // `inheritedOneColIndex`: Column index of the last '1' directly to the left of this cell (from `currentRowLastOneColIndexLeft` of current row).
            // `inheritedAnchorsFromLeft`: Dominant anchors from the cell immediately to the left.
            const inheritedOneRowIndex = (currentRow === 0) ? -1 : lastOneRowIndexAbove[currentCol];
            const inheritedOneColIndex = (currentCol === 0) ? -1 : currentRowLastOneColIndexLeft[currentCol - 1];
            const inheritedAnchorsFromLeft = (currentRow === 0 || currentCol === 0) ? [] : currentRowDominantAnchors[currentCol - 1];

            if (cellValue === 0) {
                // If the current cell is '0', it can extend existing rectangles or start new ones.
                // Update the 'last one' markers for this cell based on values from above and left.
                lastOneRowIndexAbove[currentCol] = inheritedOneRowIndex; // This is a misnomer; it's the *current* cell's inherited value.
                currentRowLastOneColIndexLeft[currentCol] = inheritedOneColIndex;

                let candidateDominantAnchors = [];

                // `pointXRef` represents a reference point based on the last '1' above: `[inheritedOneRowIndex, currentCol]`
                // `pointYRef` represents a reference point based on the last '1' to the left: `[currentRow, inheritedOneColIndex]`

                // Process anchors inherited from the cell to the left (`inheritedAnchorsFromLeft`).
                // The original logic for mapping these anchors is quite specific, especially due to `lastOneRowIndexAbove`
                // being reset each row, making `inheritedOneRowIndex` effectively always -1 for `currentRow > 0`.
                // This simplifies the original `isdown` checks to always be false.
                for (const existingAnchorPoint of inheritedAnchorsFromLeft) {
                    // Original map function simplified logic:
                    // `!isFurtherSouth([inheritedOneRowIndex, currentCol], existingAnchorPoint)` (original `!isdown(x_c, e)`)
                    // This condition `!(-1 < existingAnchorPoint[0])` is always false because `existingAnchorPoint[0]` is always >= 0.
                    // Thus, branches involving `!isFurtherSouth` are never taken for `currentRow > 0`.
                    // The only remaining condition is `!isFurtherEast([currentRow, inheritedOneColIndex], existingAnchorPoint)`.
                    if (!isFurtherEast([currentRow, inheritedOneColIndex], existingAnchorPoint)) {
                        // If the existing anchor is to the left of or in the same column as `inheritedOneColIndex`,
                        // its column boundary is adjusted to `inheritedOneColIndex + 1`.
                        candidateDominantAnchors.push([existingAnchorPoint[0], inheritedOneColIndex + 1]);
                    } else {
                        // Otherwise, the anchor point is carried over unchanged.
                        candidateDominantAnchors.push(existingAnchorPoint);
                    }
                }

                // Add two new primary anchor points for the current cell:
                // 1. One derived from the `inheritedOneColIndex` (last '1' to the left in the current row).
                // 2. One derived from the `inheritedOneRowIndex` (last '1' above in the current column).
                candidateDominantAnchors.push(getEasternAdjacent([currentRow, inheritedOneColIndex]));
                candidateDominantAnchors.push(getSouthernAdjacent([inheritedOneRowIndex, currentCol])); // This will be [0, currentCol] for currentRow > 0

                // Filter the `candidateDominantAnchors` to remove duplicates and subordinate points.
                // Step 1: Remove exact duplicates using a Map for efficiency.
                const uniqueAnchorMap = new Map();
                for (const anchor of candidateDominantAnchors) {
                    const key = `${anchor[0]},${anchor[1]}`;
                    uniqueAnchorMap.set(key, anchor);
                }
                let preliminaryFilteredAnchors = Array.from(uniqueAnchorMap.values());

                // Step 2: Filter out points that are subordinate to other points in the set.
                const finalDominantAnchors = [];
                for (const currentCandidate of preliminaryFilteredAnchors) {
                    let isCurrentCandidateSubordinate = false;
                    for (const otherAnchor of preliminaryFilteredAnchors) {
                        // A point cannot be subordinate to itself.
                        if (currentCandidate[0] === otherAnchor[0] && currentCandidate[1] === otherAnchor[1]) {
                            continue;
                        }
                        // Apply the specific dominance rule:
                        // `currentCandidate` is subordinate if `otherAnchor` is above it in the same column,
                        // OR if `otherAnchor` is to its left in the same row.
                        if (currentCandidate[1] === otherAnchor[1] && otherAnchor[0] < currentCandidate[0]) {
                            isCurrentCandidateSubordinate = true;
                            break;
                        }
                        if (currentCandidate[0] === otherAnchor[0] && otherAnchor[1] < currentCandidate[1]) {
                            isCurrentCandidateSubordinate = true;
                            break;
                        }
                    }
                    if (!isCurrentCandidateSubordinate) {
                        finalDominantAnchors.push(currentCandidate);
                    }
                }
                currentRowDominantAnchors[currentCol] = finalDominantAnchors;

            } else { // cellValue === 1
                // If the current cell is '1', it acts as a barrier, resetting rectangle possibilities.
                // The 'last one' markers are updated to the current cell's position.
                lastOneRowIndexAbove[currentCol] = currentRow;
                currentRowLastOneColIndexLeft[currentCol] = currentCol;
                // No dominant anchors can pass through a '1', so the list is cleared.
                currentRowDominantAnchors[currentCol] = [];
            }

            // After processing the cell and determining its dominant anchors,
            // calculate the areas of all possible rectangles that have their top-left
            // corner as one of the `currentRowDominantAnchors[currentCol]`
            // and their bottom-right corner at the current cell `(currentRow, currentCol)`.
            for (const topCornerPoint of currentRowDominantAnchors[currentCol]) {
                const rectangleHeight = currentRow - topCornerPoint[0] + 1;
                const rectangleWidth = currentCol - topCornerPoint[1] + 1;
                const calculatedArea = rectangleHeight * rectangleWidth;
                if (calculatedArea > largestAreaFound) {
                    largestAreaFound = calculatedArea;
                }
            }
        } // End of column loop

        // Update the DP state for the next row.
        // The original code reset `lastOneRowIndexAbove` (original `n_x`) to all -1s at the end of each row.
        // This implies that rectangles cannot truly "extend upwards" beyond row 0, as `inheritedOneRowIndex`
        // will always be -1 for any `currentRow > 0`. This is a unique characteristic of the original algorithm.
        lastOneRowIndexAbove = new Array(gridWidth).fill(-1); // Clone of original reset behavior.
        previousRowDominantAnchors = currentRowDominantAnchors; // Carry over anchors for the next row.
    } // End of row loop

    outputChannel(largestAreaFound); // Output the final maximum area found.
}