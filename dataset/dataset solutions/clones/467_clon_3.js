/**
 * Rotates a square 2D matrix 90 degrees clockwise.
 *
 * @param {number[][]} sourceMatrix - The matrix to rotate. Assumed to be square.
 * @returns {number[][]} A new matrix representing the 90-degree clockwise rotation of the source.
 */
const performMatrixRotation = (sourceMatrix) => {
    // Implement a guard clause for empty or invalid input matrices.
    if (!sourceMatrix || sourceMatrix.length === 0 || !Array.isArray(sourceMatrix[0])) {
        return []; // Return an empty array for invalid input.
    }

    const matrixDimension = sourceMatrix.length;
    // An additional check to ensure rows are of consistent length, although problem implies square.
    if (matrixDimension > 0 && sourceMatrix[0].length !== matrixDimension) {
        // For Type III, we can add a warning or handle non-square matrices differently.
        // For this problem, we assume square matrices based on context.
    }

    const lastIndex = matrixDimension - 1; // Calculate the last valid index once.

    // Create a new matrix of the same size, pre-filled with a default value (e.g., 0).
    // This is a common way to initialize a 2D array in JavaScript.
    const rotatedOutputMatrix = Array.from({ length: matrixDimension }, () => Array(matrixDimension).fill(0));

    // Iterate through each cell of the *new* (rotated) matrix.
    for (let newRowCoordinate = 0; newRowCoordinate < matrixDimension; newRowCoordinate++) {
        for (let newColCoordinate = 0; newColCoordinate < matrixDimension; newColCoordinate++) {
            // Apply the 90-degree clockwise rotation formula:
            // new_matrix[new_row][new_col] = original_matrix[last_index - new_col][new_row]
            rotatedOutputMatrix[newRowCoordinate][newColCoordinate] = sourceMatrix[lastIndex - newColCoordinate][newRowCoordinate];
        }
    }
    return rotatedOutputMatrix;
};

/**
 * Attempts to find a pattern (submatrix) within a larger grid at a specific offset.
 * Returns the top-left coordinates of the first non-negative pattern element
 * relative to the main grid's origin if a match is found, otherwise returns `null`.
 *
 * @param {number[][]} mainGrid - The larger grid to search within.
 * @param {number[][]} patternGrid - The smaller submatrix (pattern) to find.
 * @param {number} rowOffset - The starting row offset for the pattern within the main grid.
 * @param {number} colOffset - The starting column offset for the pattern within the main grid.
 * @returns {number[]|null} An array [absoluteRow, absoluteCol] of the first non-negative
 *                          pattern element's position if a match occurs, or `null` if no match.
 */
const findPatternMatchOffset = (mainGrid, patternGrid, rowOffset, colOffset) => {
    // Add guard clauses for invalid inputs to improve robustness.
    if (!mainGrid || mainGrid.length === 0 || !patternGrid || patternGrid.length === 0) {
        return null; // A match is impossible with empty grids.
    }

    const patternDimension = patternGrid.length;
    const mainGridRows = mainGrid.length;
    const mainGridCols = mainGrid[0] ? mainGrid[0].length : 0; // Defensive check for empty mainGrid[0]

    // Early exit if the pattern cannot fit within the main grid at the given offset.
    if (rowOffset + patternDimension > mainGridRows || colOffset + patternDimension > mainGridCols) {
        return null;
    }

    let firstSignificantElementCoordinates = null; // Use null for no match, array for match.

    // Iterate through each element of the pattern matrix.
    for (let patternRowIndex = 0; patternRowIndex < patternDimension; patternRowIndex++) {
        for (let patternColIndex = 0; patternColIndex < patternDimension; patternColIndex++) {
            const currentPatternValue = patternGrid[patternRowIndex][patternColIndex];

            // If the pattern element is -1, it's considered a "wildcard" and matches anything.
            if (currentPatternValue === -1) {
                continue; // Skip comparison for wildcard elements.
            }

            // Calculate the absolute coordinates in the main grid for the current pattern element.
            const absoluteMainGridRow = rowOffset + patternRowIndex;
            const absoluteMainGridCol = colOffset + patternColIndex;

            // Check if the coordinates are within bounds of the main grid (defensive programming).
            if (absoluteMainGridRow >= mainGridRows || absoluteMainGridCol >= mainGridCols) {
                return null; // Pattern extends out of bounds for a non-wildcard element.
            }

            // Record the coordinates of the *first* non-wildcard pattern element found.
            // This is the anchor point for reporting the match location.
            if (firstSignificantElementCoordinates === null) {
                firstSignificantElementCoordinates = [absoluteMainGridRow, absoluteMainGridCol];
            }

            // Compare the pattern element with the corresponding main grid element.
            if (mainGrid[absoluteMainGridRow][absoluteMainGridCol] !== currentPatternValue) {
                return null; // Mismatch found; this pattern placement is invalid.
            }
        }
    }
    // If all non-wildcard elements matched, return the coordinates of the first significant element.
    return firstSignificantElementCoordinates;
};

// --- Main Program Execution ---

// Define constants for file path and sentinel values.
const INPUT_FILE_PATH = '/dev/stdin';
// Using Infinity as a sentinel for "no match found yet" for coordinates.
const NO_MATCH_FOUND_SENTINEL = [Infinity, Infinity];

/**
 * Helper function to parse a line of space-separated numbers into an array.
 * @param {string} line - The input string line.
 * @returns {number[]} An array of parsed numbers.
 */
const parseNumericLine = (line) => {
    // Add a basic validation for the input line.
    if (typeof line !== 'string' || line.trim() === '') {
        return [];
    }
    return line.split(" ").map(Number);
};

try {
    // Read the entire input file synchronously.
    const rawInputContent = require('fs').readFileSync(INPUT_FILE_PATH, 'utf8');
    // Split the content into an array of lines, removing any leading/trailing whitespace.
    let inputLinesBuffer = rawInputContent.trim().split("\n");

    // Loop indefinitely to process multiple test cases until a termination condition is met.
    while (true) {
        const dimensionsString = inputLinesBuffer.shift(); // Get the next line for dimensions.

        // If no more lines are available, it's an unexpected end of input.
        if (dimensionsString === undefined || dimensionsString === null) {
            break; // Exit the loop.
        }

        const [mainGridSize, patternGridSize] = parseNumericLine(dimensionsString);

        // The problem's specified termination condition.
        if (mainGridSize === 0 && patternGridSize === 0) {
            break; // Exit the main processing loop.
        }

        // Add robust validation for dimensions.
        if (mainGridSize < 0 || patternGridSize < 0 || patternGridSize > mainGridSize) {
            console.error(`Error: Invalid grid dimensions (${mainGridSize}, ${patternGridSize}). Skipping this test case.`);
            // Consume remaining lines for this invalid test case to avoid disrupting subsequent cases.
            // This is a Type III addition for error handling.
            for (let i = 0; i < mainGridSize; i++) inputLinesBuffer.shift(); // Skip main grid lines
            for (let i = 0; i < patternGridSize; i++) inputLinesBuffer.shift(); // Skip pattern grid lines
            continue; // Move to the next test case.
        }

        // Read the main search grid.
        const mainSearchGrid = [];
        for (let r = 0; r < mainGridSize; r++) {
            const line = inputLinesBuffer.shift();
            if (line === undefined) {
                console.error("Error: Unexpected end of input while reading main search grid.");
                // Handle critical error, perhaps by breaking or throwing.
                throw new Error("Incomplete input data.");
            }
            mainSearchGrid.push(parseNumericLine(line));
        }

        // Read the pattern submatrix.
        let currentPatternMatrix = []; // This matrix will be rotated.
        for (let r = 0; r < patternGridSize; r++) {
            const line = inputLinesBuffer.shift();
            if (line === undefined) {
                console.error("Error: Unexpected end of input while reading pattern matrix.");
                throw new Error("Incomplete input data.");
            }
            currentPatternMatrix.push(parseNumericLine(line));
        }

        // Initialize the best match position with the sentinel value.
        let bestMatchPosition = [...NO_MATCH_FOUND_SENTINEL]; // Use spread to create a new array.

        // Iterate through four possible rotations (0, 90, 180, 270 degrees).
        const numberOfRotations = 4;
        for (let rotationCycle = 0; rotationCycle < numberOfRotations; rotationCycle++) {
            // Determine the maximum possible top-left offsets for the pattern within the main grid.
            const maxRowSearchOffset = mainGridSize - patternGridSize;
            const maxColSearchOffset = mainGridSize - patternGridSize;

            // Iterate through all possible starting positions (offsets) in the main grid.
            // Loop condition `i <= maxOffset` correctly handles cases where `mainGridSize === patternGridSize`.
            for (let currentSearchRowOffset = 0; currentSearchRowOffset <= maxRowSearchOffset; currentSearchRowOffset++) {
                for (let currentSearchColOffset = 0; currentSearchColOffset <= maxColSearchOffset; currentSearchColOffset++) {
                    // Attempt to find a match using the current pattern rotation and offset.
                    const potentialMatchResult = findPatternMatchOffset(
                        mainSearchGrid,
                        currentPatternMatrix,
                        currentSearchRowOffset,
                        currentSearchColOffset
                    );

                    // If a match is successfully found.
                    if (potentialMatchResult !== null) {
                        const [matchedAnchorRow, matchedAnchorCol] = potentialMatchResult;

                        // The problem output requires 1-indexed coordinates.
                        const candidateRowOutput = matchedAnchorRow + 1;
                        const candidateColOutput = matchedAnchorCol + 1;

                        // Apply the specific comparison logic from the original code:
                        // `if(min[0] >= flag[0]+1 && min[1] > flag[1]+1) min = [flag[0]+1, flag[1]+1];`
                        // This means update if current best row is >= candidate row AND current best col is > candidate col.
                        if (bestMatchPosition[0] >= candidateRowOutput && bestMatchPosition[1] > candidateColOutput) {
                            bestMatchPosition = [candidateRowOutput, candidateColOutput];
                        }
                    }
                }
            }
            // Rotate the pattern matrix for the next iteration, unless it's the last one.
            if (rotationCycle < numberOfRotations - 1) {
                currentPatternMatrix = performMatrixRotation(currentPatternMatrix);
            }
        }

        // Output the result for the current test case.
        // Check if the sentinel value indicates no match was found across all rotations.
        if (bestMatchPosition[0] === Infinity) {
            console.log("NA");
        } else {
            // Output format is "column row" (min[1] min[0] from original).
            console.log(`${bestMatchPosition[1]} ${bestMatchPosition[0]}`);
        }
    }
} catch (error) {
    // Centralized error handling for file operations or unexpected data issues.
    console.error("An unrecoverable error occurred during execution:", error.message);
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}