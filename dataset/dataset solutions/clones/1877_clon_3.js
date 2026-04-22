"use strict";

// --- Input Processing Utilities ---

// Read all raw input data from stdin
let rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw content into individual tokens (numbers or strings)
let inputTokenBuffer = rawInputContent.split(/ |\n/);
let currentBufferPointer = 0; // Index to keep track of the next token to read

/**
 * Retrieves the next token from the input buffer.
 * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
 * @returns {string|number} The next data token.
 */
function fetchNextToken(asString = false) {
    const value = inputTokenBuffer[currentBufferPointer++];
    return asString ? value : Number(value);
}

/**
 * Populates an array by reading a specified quantity of tokens.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} [returnAsStrings=false] - If true, elements are strings; otherwise, numbers.
 * @returns {Array<string|number>} An array containing the read tokens.
 */
function readTokenArray(count, returnAsStrings = false) {
    const collection = [];
    for (let i = 0; i < count; i++) {
        collection.push(returnAsStrings ? inputTokenBuffer[currentBufferPointer++] : Number(inputTokenBuffer[currentBufferPointer++]));
    }
    return collection;
}

/**
 * Reads a 2D matrix (array of arrays) from the input buffer.
 * @param {number} numRows - The number of rows for the matrix.
 * @param {number} numCols - The number of columns per row.
 * @param {boolean} [stringsOnly=false] - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} The constructed matrix.
 */
function acquireMatrixData(numRows, numCols, stringsOnly = false) {
    const constructedMatrix = [];
    for (let r = 0; r < numRows; r++) {
        const currentRow = [];
        for (let c = 0; c < numCols; c++) {
            currentRow.push(stringsOnly ? inputTokenBuffer[currentBufferPointer++] : Number(inputTokenBuffer[currentBufferPointer++]));
        }
        constructedMatrix.push(currentRow);
    }
    return constructedMatrix;
}

/**
 * Generates a multi-dimensional array initialized with a specific value.
 * This function provides a safer, recursive alternative to the original eval-based xArray.
 * @param {*} initVal - The value to fill all elements with.
 * @param {...number} dimensions - The sizes of each dimension (e.g., (0, 2, 3) for 2x3).
 * @returns {Array} The multi-dimensional array.
 */
function createN_DimensionalArray(initVal, ...dimensions) {
    if (dimensions.length === 0) {
        return initVal;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const newArrayInstance = [];

    for (let i = 0; i < currentDimensionSize; i++) {
        newArrayInstance.push(createN_DimensionalArray(initVal, ...remainingDimensions));
    }
    return newArrayInstance;
}

// --- Main Program Logic ---

/**
 * Executes the simulation of jumps and determines the final position.
 * This is the core logic, equivalent to the original 'main' function.
 * @returns {number} The 1-indexed final position after all steps.
 */
function runJumpSequenceSimulation() {
    // Read initial parameters
    const totalElements = fetchNextToken();
    let totalJumpsToPerform = BigInt(fetchNextToken()); // K is a BigInt

    // Input validation: Ensure parameters are within reasonable bounds
    if (totalElements <= 0) {
        throw new Error("Invalid input: Number of elements must be positive.");
    }
    if (totalJumpsToPerform < 0n) {
        throw new Error("Invalid input: Total jumps cannot be negative.");
    }
    // Early exit for zero jumps
    if (totalJumpsToPerform === 0n) {
        return 1; // Stays at the first element (1-indexed)
    }

    const jumpMapping = readTokenArray(totalElements); // Array 'a'
    // 'map' to store the step number when each position was first visited.
    // Initialized with -1 to indicate unvisited.
    const positionVisitTracker = createN_DimensionalArray(-1, totalElements);

    let currentPositionIndex = 0; // 'x', 0-indexed current position

    // Mark the starting position (index 0) as visited at "step 0" (before any jumps)
    positionVisitTracker[currentPositionIndex] = 0;

    let currentSimulationStep = 0n; // 'i', BigInt counter for simulation steps

    // Main loop for simulation, proceeds until all jumps are performed or a cycle is detected
    while (currentSimulationStep < totalJumpsToPerform) {
        currentSimulationStep++; // Increment step counter for the upcoming jump

        // Determine the next position based on the jump instructions
        const nextRawDestination = jumpMapping[currentPositionIndex];
        const nextZeroIndexedPosition = nextRawDestination - 1; // Convert 1-indexed instruction to 0-indexed

        // Check if this next position has been visited previously
        const priorVisitStep = positionVisitTracker[nextZeroIndexedPosition];

        if (priorVisitStep !== -1) { // Cycle detected at nextZeroIndexedPosition!
            const cycleEntryStep = BigInt(priorVisitStep); // Step when this position was first entered
            const currentCycleReentryStep = currentSimulationStep; // Current step when it's re-entered

            const detectedCycleSpan = currentCycleReentryStep - cycleEntryStep; // Length of the cycle

            // Adjust total jumps remaining by skipping full cycles
            totalJumpsToPerform -= currentCycleReentryStep; // Jumps left after reaching the cycle's second entry
            totalJumpsToPerform %= detectedCycleSpan; // Remaining jumps within the cycle

            currentPositionIndex = nextZeroIndexedPosition; // Update position to the point where cycle was detected
            break; // Exit the main simulation loop as cycle optimization has occurred
        } else {
            // No cycle yet, record the current step for the newly visited position
            positionVisitTracker[nextZeroIndexedPosition] = Number(currentSimulationStep); // Store as Number for array index
            currentPositionIndex = nextZeroIndexedPosition; // Move to the new position
        }
    }

    // After the main loop (either all steps completed or cycles skipped),
    // apply any remaining jumps if cycle optimization left some.
    for (let remainingJumpCount = 0n; remainingJumpCount < totalJumpsToPerform; remainingJumpCount++) {
        currentPositionIndex = jumpMapping[currentPositionIndex] - 1;
    }

    return currentPositionIndex + 1; // Convert back to 1-indexed result
}

// Execute the main simulation and display the outcome
const finalComputedResult = runJumpSequenceSimulation();
if (finalComputedResult !== undefined) { // Check if a result was actually produced
    console.log(finalComputedResult);
}