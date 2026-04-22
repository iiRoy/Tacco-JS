"use strict";

// This script processes input from standard input to simulate a light propagation problem.
// It uses a custom set of utility functions for reading various data types from the input stream.

// Read the entire standard input content as a UTF-8 string.
const rawInputDataContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw input string into an array of individual tokens (numbers or words).
// Delimiters are spaces or newlines. Filters out any empty strings resulting from multiple delimiters.
const inputTokenBuffer = rawInputDataContent.split(/ |\n/).filter(token => token.length > 0);

// A mutable index that points to the next token to be read from `inputTokenBuffer`.
let currentTokenPointer = 0;

/**
 * Extracts and returns the next token from the input buffer as a number.
 * Throws an error if no more tokens are available.
 * @returns {number} The parsed integer value.
 */
function retrieveNextInteger() {
    if (currentTokenPointer >= inputTokenBuffer.length) {
        throw new Error("Input stream exhausted. Cannot retrieve next integer.");
    }
    // Explicit conversion to Number for clarity, equivalent to unary plus operator.
    return Number(inputTokenBuffer[currentTokenPointer++]);
}

/**
 * Extracts and returns the next token from the input buffer as a string.
 * Throws an error if no more tokens are available.
 * @returns {string} The string value of the next token.
 */
function retrieveNextString() {
    if (currentTokenPointer >= inputTokenBuffer.length) {
        throw new Error("Input stream exhausted. Cannot retrieve next string.");
    }
    return inputTokenBuffer[currentTokenPointer++];
}

/**
 * Extracts and returns the next token from the input buffer as a BigInt.
 * Throws an error if no more tokens are available.
 * @returns {BigInt} The parsed BigInt value.
 */
function retrieveNextBigInt() {
    if (currentTokenPointer >= inputTokenBuffer.length) {
        throw new Error("Input stream exhausted. Cannot retrieve next BigInt.");
    }
    return BigInt(inputTokenBuffer[currentTokenPointer++]);
}

/**
 * Reads a specified quantity of tokens and converts them into an array of numbers.
 * @param {number} elementCount - The number of elements (integers) to read.
 * @returns {number[]} An array containing the parsed integer values.
 * @throws {Error} If `elementCount` is negative or if insufficient tokens are available.
 */
function getIntegerArrayFromInput(elementCount) {
    if (elementCount < 0) {
        throw new Error("Requested array size cannot be negative.");
    }
    if (currentTokenPointer + elementCount > inputTokenBuffer.length) {
        throw new Error(`Not enough tokens to read an array of ${elementCount} integers.`);
    }

    const slicedTokens = inputTokenBuffer.slice(currentTokenPointer, currentTokenPointer + elementCount);
    currentTokenPointer += elementCount; // Advance the global token pointer.
    return slicedTokens.map(Number); // Convert each sliced token to a number.
}

/**
 * Reads a specified quantity of tokens and converts them into an array of BigInts.
 * @param {number} elementCount - The number of elements (BigInts) to read.
 * @returns {BigInt[]} An array containing the parsed BigInt values.
 * @throws {Error} If `elementCount` is negative or if insufficient tokens are available.
 */
function getBigIntArrayFromInput(elementCount) {
    if (elementCount < 0) {
        throw new Error("Requested array size cannot be negative.");
    }
    if (currentTokenPointer + elementCount > inputTokenBuffer.length) {
        throw new Error(`Not enough tokens to read an array of ${elementCount} BigInts.`);
    }

    const slicedTokens = inputTokenBuffer.slice(currentTokenPointer, currentTokenPointer + elementCount);
    currentTokenPointer += elementCount;
    return slicedTokens.map(BigInt);
}

/**
 * Reads a 2D grid (matrix) of tokens from the input buffer.
 * @param {number} numRows - The number of rows in the matrix.
 * @param {number} numCols - The number of columns per row.
 * @param {boolean} [asStrings=false] - If true, elements are returned as strings; otherwise, as numbers.
 * @returns {Array<Array<number|string>>} The parsed matrix.
 * @throws {Error} If dimensions are negative or if insufficient tokens are available.
 */
function readInputMatrix(numRows, numCols, asStrings = false) {
    if (numRows < 0 || numCols < 0) {
        throw new Error("Matrix dimensions cannot be negative.");
    }
    const resultMatrix = [];
    for (let r = 0; r < numRows; r++) {
        if (currentTokenPointer + numCols > inputTokenBuffer.length) {
            throw new Error(`Insufficient tokens to read row ${r + 1} of the matrix.`);
        }
        const rowTokens = inputTokenBuffer.slice(currentTokenPointer, currentTokenPointer + numCols);
        currentTokenPointer += numCols;
        resultMatrix.push(asStrings ? rowTokens : rowTokens.map(Number));
    }
    return resultMatrix;
}

// The original `xArray` function is not utilized in the main simulation logic
// and employs `eval`, which is generally discouraged for security and maintainability.
// As a Type III modification, this unused and potentially problematic function is removed.

// Execute the primary simulation and output its result to the console.
console.log(executeLightSimulation());

/**
 * Orchestrates the light propagation simulation.
 * This function models how a set of light sources (bulbs) illuminate a linear grid,
 * and how this illumination pattern evolves over a series of time steps.
 *
 * Each light source `i` has an associated range `currentLightRanges[i]`.
 * It illuminates cells from `i - currentLightRanges[i]` to `i + currentLightRanges[i]`,
 * with boundaries clamped by the grid dimensions.
 *
 * In each iteration, the `currentLightRanges` array is updated based on the
 * total illumination each cell receives in the previous step.
 *
 * @returns {string} A space-separated string representing the final illumination levels
 *                   of the grid after all iterations or early stabilization.
 */
function executeLightSimulation() {
    // Read the size of the grid (N) and the total number of simulation iterations (K).
    const gridCellCount = retrieveNextInteger();
    const totalSimulationSteps = retrieveNextInteger();

    // `currentLightRanges` stores the illumination range for each light source for the current step.
    // Initially, it's populated from the input.
    let currentLightRanges = getIntegerArrayFromInput(gridCellCount);

    // `nextIlluminationLevels` will store the illumination level of each cell for the upcoming step.
    // It's initialized as an array of the appropriate size.
    let nextIlluminationLevels = new Array(gridCellCount);

    // Main simulation loop, iterating through each time step.
    for (let currentStep = 0; currentStep < totalSimulationSteps; currentStep++) {
        // Reset the illumination levels for the new step to zero across all cells.
        nextIlluminationLevels.fill(0);

        // Initialize a variable to track the minimum illumination level detected in this round.
        // Set to a value higher than any possible illumination (max is `gridCellCount`)
        // to ensure the first comparison correctly sets the minimum.
        let minimumIlluminationInThisRound = gridCellCount + 1;

        // Iterate through each light source (bulb) on the grid.
        for (let bulbIndex = 0; bulbIndex < gridCellCount; bulbIndex++) {
            const bulbLightRange = currentLightRanges[bulbIndex];

            // Calculate the start index of the current bulb's illumination coverage.
            // It's `bulbIndex - bulbLightRange`, clamped to be no less than 0 (the first cell).
            const coverageBeginIndex = Math.max(bulbIndex - bulbLightRange, 0);

            // Calculate the end index of the current bulb's illumination coverage.
            // It's `bulbIndex + bulbLightRange`, clamped to be no more than `gridCellCount - 1` (the last cell).
            const coverageEndIndex = Math.min(bulbIndex + bulbLightRange, gridCellCount - 1);

            // Increment the illumination count for every cell covered by the current bulb.
            for (let coveredCellIdx = coverageBeginIndex; coveredCellIdx <= coverageEndIndex; coveredCellIdx++) {
                nextIlluminationLevels[coveredCellIdx]++;
            }
        }

        // After all bulbs have contributed to `nextIlluminationLevels` for this step,
        // determine the absolute minimum illumination level across the entire grid.
        // This is a Type III modification: The original code's `Bmin` calculation was
        // ambiguously placed; this clarifies the intent to find the minimum across the *full* array
        // after it's been computed, which is crucial for the stabilization check.
        for (let checkGridIndex = 0; checkGridIndex < gridCellCount; checkGridIndex++) {
            minimumIlluminationInThisRound = Math.min(minimumIlluminationInThisRound, nextIlluminationLevels[checkGridIndex]);
        }

        // Update the `currentLightRanges` for the next simulation step.
        // Using the spread operator (`...`) creates a shallow copy, effectively making `nextIlluminationLevels`
        // the new `currentLightRanges` for the subsequent iteration.
        currentLightRanges = [...nextIlluminationLevels];

        // Early Termination Condition (Optimization):
        // If the simulation has run for a sufficient number of steps (e.g., 40, an empirical constant)
        // and all cells have reached the maximum possible illumination level (equal to `gridCellCount`),
        // then the state has stabilized, and further iterations will not change the result.
        // This allows for early exit, saving computation time for very large `totalSimulationSteps`.
        if (currentStep >= 40) { // The constant 40 is an arbitrary but common threshold in such problems.
            if (minimumIlluminationInThisRound >= gridCellCount) {
                break; // All cells are fully illuminated; the simulation has stabilized.
            }
        }
    }

    // Convert the final illumination levels array into a space-separated string.
    return currentLightRanges.join(" ");
}