"use strict";

// Modules required for file system operations.
const fileSystemInterface = require("fs");

// Read all input data from standard input.
const rawInputContent = fileSystemInterface.readFileSync("/dev/stdin", "utf8");

// Split the entire input into individual tokens using any whitespace.
// Filter out any empty strings that might result from multiple consecutive spaces.
let inputTokenBuffer = rawInputContent.split(/\s+/).filter(Boolean);
// Initialize a pointer to keep track of the current position in the token buffer.
let currentTokenIndex = 0;

// --- Utility Functions for Input Parsing ---

/**
 * Reads the next token from the input buffer and converts it to an integer.
 * Throws an error if no more tokens are available.
 * @returns {number} The parsed integer.
 */
function readNextInteger() {
    if (currentTokenIndex >= inputTokenBuffer.length) {
        throw new Error("Input token stream exhausted. Cannot read an integer.");
    }
    return Number(inputTokenBuffer[currentTokenIndex++]);
}

/**
 * Reads the next token from the input buffer as a string.
 * Throws an error if no more tokens are available.
 * @returns {string} The string token.
 */
function readNextString() {
    if (currentTokenIndex >= inputTokenBuffer.length) {
        throw new Error("Input token stream exhausted. Cannot read a string.");
    }
    return inputTokenBuffer[currentTokenIndex++];
}

/**
 * Reads the next token from the input buffer and converts it to a BigInt.
 * Throws an error if no more tokens are available.
 * @returns {BigInt} The parsed BigInt.
 */
function readNextBigInteger() {
    if (currentTokenIndex >= inputTokenBuffer.length) {
        throw new Error("Input token stream exhausted. Cannot read a BigInt.");
    }
    return BigInt(inputTokenBuffer[currentTokenIndex++]);
}

/**
 * Reads a specified number of tokens from the input buffer.
 * By default, converts them to numbers; can optionally return as strings.
 * Throws an error if not enough tokens are available.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} [returnAsStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array of the read tokens.
 */
function readMultipleValues(count, returnAsStrings = false) {
    // Validate if enough tokens exist for the requested count.
    if (currentTokenIndex + count > inputTokenBuffer.length) {
        throw new Error(`Insufficient tokens remaining to read ${count} values.`);
    }
    const collectedValues = [];
    for (let i = 0; i < count; i++) {
        collectedValues.push(returnAsStrings ? inputTokenBuffer[currentTokenIndex++] : Number(inputTokenBuffer[currentTokenIndex++]));
    }
    return collectedValues;
}

/**
 * Generates a multi-dimensional array initialized with a given default value.
 * This function is a complete replacement for the original 'xArray' which used 'eval'.
 * @param {*} defaultValue - The value to populate the array elements with.
 * @param {...number} dimensions - The sizes of each dimension of the array.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createN_DimensionalArray(defaultValue, ...dimensions) {
    // Base case: if no more dimensions, return the default value for the innermost element.
    if (dimensions.length === 0) {
        return defaultValue;
    }

    const currentDimensionLength = dimensions[0];
    // Basic input validation for dimension size.
    if (currentDimensionLength < 0 || !Number.isInteger(currentDimensionLength)) {
        throw new Error(`Invalid dimension size provided: ${currentDimensionLength}. Dimension sizes must be non-negative integers.`);
    }

    const remainingDimensions = dimensions.slice(1);
    const newArrayInstance = new Array(currentDimensionLength);

    // Recursively build the array for each dimension.
    for (let i = 0; i < currentDimensionLength; i++) {
        newArrayInstance[i] = createN_DimensionalArray(defaultValue, ...remainingDimensions);
    }
    return newArrayInstance;
}

// --- Main Program Execution Flow ---

// Invoke the primary logic function and store its result.
const finalSolution = solveGridTraversal();

// Output the computed result to the console if it's not undefined.
if (finalSolution !== undefined) {
    console.log(String(finalSolution));
}

// --- Core Breadth-First Search (BFS) Logic ---
/**
 * Solves a grid traversal problem using BFS, finding the shortest path
 * from a start to a goal position with multi-step movements.
 * @returns {number} The minimum number of moves, or -1 if the goal is unreachable.
 */
function solveGridTraversal() {
    // Define a constant representing an unvisited or unreachable cell.
    const DISTANCE_INFINITY = 1_000_000_007; // Renamed from 'inf', value slightly modified.

    // Define movement vectors for 4 cardinal directions (North, East, South, West).
    // (row_delta, col_delta)
    const rowMovementDeltas = [-1, 0, 1, 0]; // Renamed from 'dy'
    const colMovementDeltas = [0, 1, 0, -1]; // Renamed from 'dx'
    const totalDirections = 4; // Renamed from 'dd'

    // Read grid dimensions (height, width) and the maximum number of steps per move (k).
    const [gridHeight, gridWidth, maxMoveRange] = readMultipleValues(3); // Renamed h,w,k

    // Read the starting and ending coordinates (row, column).
    const [initialRow, initialCol, targetRow, targetCol] = readMultipleValues(4); // Renamed sy,sx,gy,gx

    // --- Grid Map Initialization with Padded Borders ---
    // Create an expanded grid map with a border of obstacle symbols.
    // This simplifies boundary checks during traversal by avoiding explicit edge conditions.
    const borderedGridMap = new Array(gridHeight + 2); // Renamed 'c'
    const obstacleCharacter = '@'; // Renamed boundary character.

    // Construct the top border row.
    borderedGridMap[0] = obstacleCharacter.repeat(gridWidth + 2);

    // Populate the main grid rows, adding left and right border characters.
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        const currentGridRowData = readNextString(); // Original: nextstr()
        // Type III addition: Basic validation for input row length.
        if (currentGridRowData.length !== gridWidth) {
            console.warn(`Input Warning: Grid row ${rowIndex} has length ${currentGridRowData.length}, expected ${gridWidth}.`);
        }
        borderedGridMap[rowIndex + 1] = obstacleCharacter + currentGridRowData + obstacleCharacter;
    }

    // Construct the bottom border row.
    borderedGridMap[gridHeight + 1] = obstacleCharacter.repeat(gridWidth + 2);

    // --- Distance Matrix Initialization ---
    // Create a 2D array to store the shortest distance to each cell, initialized to infinity.
    const shortestPathMatrix = createN_DimensionalArray(DISTANCE_INFINITY, gridHeight + 2, gridWidth + 2); // Renamed 'dist'

    // The distance to the starting cell is 0.
    shortestPathMatrix[initialRow][initialCol] = 0;

    // --- BFS Queue Setup ---
    // The queue stores objects representing cells: { r: row_index, c: col_index }.
    // This approach is more descriptive than a flattened array of coordinates.
    let currentLevelQueue = [{ r: initialRow, c: initialCol }]; // Renamed 'q'
    let currentTraversalDepth = 0; // Renamed 'd', represents the current BFS level/distance.

    // --- Main BFS Traversal Loop ---
    // Continue as long as there are cells to process at the current level.
    while (currentLevelQueue.length > 0) {
        // Initialize a new queue to hold all cells discovered for the next BFS level.
        let nextLevelQueue = []; // Renamed 'p'

        // Process every cell from the current level's queue.
        // Using `for...of` loop with destructuring for clearer iteration.
        for (const { r: presentRow, c: presentCol } of currentLevelQueue) { // Renamed x,y
            // Explore all four possible movement directions.
            for (let directionIdx = 0; directionIdx < totalDirections; directionIdx++) { // Renamed i
                let explorerRow = presentRow;
                let explorerCol = presentCol;

                // Attempt to move up to `maxMoveRange` steps in the chosen direction.
                for (let stepCounter = 0; stepCounter < maxMoveRange; stepCounter++) { // Renamed j
                    explorerRow += rowMovementDeltas[directionIdx];
                    explorerCol += colMovementDeltas[directionIdx];

                    // Check if the current explored position hits an obstacle.
                    if (borderedGridMap[explorerRow][explorerCol] === obstacleCharacter) {
                        break; // Cannot move further in this direction due to an obstacle.
                    }

                    // Check if a path to this cell has already been found that is
                    // shorter than or equal to the current traversal depth.
                    // If true, this K-step path segment is not optimal for this cell or beyond.
                    if (shortestPathMatrix[explorerRow][explorerCol] <= currentTraversalDepth) {
                        break; // Stop exploring further along this specific K-step path segment.
                    }

                    // If this cell is currently marked as UNREACHABLE, it means
                    // we've found the shortest path to it at `currentTraversalDepth + 1`.
                    if (shortestPathMatrix[explorerRow][explorerCol] === DISTANCE_INFINITY) {
                        shortestPathMatrix[explorerRow][explorerCol] = currentTraversalDepth + 1;
                        nextLevelQueue.push({ r: explorerRow, c: explorerCol });
                    }
                    // If shortestPathMatrix[explorerRow][explorerCol] is already `currentTraversalDepth + 1`,
                    // it means another K-step path from this `currentTraversalDepth` level has already
                    // discovered and queued this cell. In this case, we don't re-add it to `nextLevelQueue`,
                    // but we DO continue exploring further `k` steps from `explorerRow, explorerCol`
                    // because it might lead to new, undiscovered cells.
                }
            }
        }

        // If no new cells were discovered for the next level, the BFS is complete
        // (either all reachable cells found, or goal unreachable).
        if (nextLevelQueue.length === 0) {
            break;
        }

        // Increment the traversal depth for the next level.
        currentTraversalDepth++;
        // Replace the current level's queue with the newly discovered cells.
        currentLevelQueue = nextLevelQueue;
    }

    // --- Final Result Determination ---
    const finalDistanceToTarget = shortestPathMatrix[targetRow][targetCol];
    // If the target cell's distance is still infinity, it means it's unreachable.
    return finalDistanceToTarget === DISTANCE_INFINITY ? -1 : finalDistanceToTarget;
}