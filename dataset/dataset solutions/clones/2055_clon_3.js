// This file contains a set of functions designed to analyze grid-like data,
// specifically to find the minimum number of cuts (both horizontal and vertical)
// required to partition a grid such that no resulting segment exceeds a specified
// count of '1's.

/**
 * A utility function to parse initial configuration parameters from the raw input lines.
 * It extracts grid dimensions (rows, columns) and the maximum allowed '1's per segment.
 * Includes robust error handling for invalid input formats.
 *
 * @param {string[]} inputLineData - An array of strings, where the first string contains space-separated configuration values.
 * @returns {{gridRows: number, gridCols: number, maxOnes: number}} An object containing the parsed configuration.
 * @throws {Error} If input data is missing, malformed, or contains non-positive values.
 */
function extractConfigurationParameters(inputLineData) {
    if (!inputLineData || inputLineData.length === 0) {
        throw new Error("Input data is entirely absent or empty.");
    }
    const configTokens = inputLineData[0].split(' ');
    if (configTokens.length < 3) {
        throw new Error("The first line of input must contain at least three space-separated configuration values.");
    }

    const totalGridRows = Number.parseInt(configTokens[0], 10);
    const totalGridColumns = Number.parseInt(configTokens[1], 10);
    const oneCountLimitPerSegment = Number.parseInt(configTokens[2], 10);

    // Perform basic validation on parsed numerical values
    if (isNaN(totalGridRows) || isNaN(totalGridColumns) || isNaN(oneCountLimitPerSegment) ||
        totalGridRows <= 0 || totalGridColumns <= 0 || oneCountLimitPerSegment <= 0) {
        throw new Error("Grid dimensions (rows, columns) and '1' count limit must be positive integers.");
    }

    return { gridRows: totalGridRows, gridCols: totalGridColumns, maxOnes: oneCountLimitPerSegment };
}

/**
 * The primary function that orchestrates the grid analysis process.
 * It parses the input, generates all possible horizontal cutting patterns,
 * evaluates each pattern for required vertical cuts, and determines the overall minimum.
 *
 * @param {string[]} rawInputDataLines - An array of strings, where the first string is config and subsequent strings are grid rows.
 */
function processGridAnalysis(rawInputDataLines) {
    let gridHeight, gridWidth, segmentOnesMaximum;

    // Safely extract configuration parameters
    try {
        const config = extractConfigurationParameters(rawInputDataLines);
        gridHeight = config.gridRows;
        gridWidth = config.gridCols;
        segmentOnesMaximum = config.maxOnes;
    } catch (error) {
        console.error("Configuration error:", error.message);
        return; // Terminate if configuration is invalid
    }

    // Verify that enough input lines are provided for the grid data itself
    if (rawInputDataLines.length < gridHeight + 1) {
        console.error(`Incomplete input data: Expected ${gridHeight} grid rows but found fewer.`);
        return;
    }

    // Populate the grid data structure from the input lines
    const gridCellData = new Array(gridHeight);
    for (let currentLineIndex = 0; currentLineIndex < gridHeight; currentLineIndex++) {
        gridCellData[currentLineIndex] = rawInputDataLines[currentLineIndex + 1];
        // Optional: Validate individual row lengths
        if (gridCellData[currentLineIndex].length !== gridWidth) {
            console.warn(`Grid row ${currentLineIndex + 1} has an inconsistent length. Expected ${gridWidth}, found ${gridCellData[currentLineIndex].length}.`);
            // Depending on strictness, could throw an error here.
        }
    }

    // Initialize the global minimum cuts to an impossibly high value.
    // This value will be updated whenever a valid and better configuration is found.
    let globalMinimumTotalCuts = Infinity;

    // Generate all combinations of horizontal cuts. For a grid with 'H' rows,
    // there are 'H-1' potential places to make a horizontal cut.
    const horizontalCutConfigurations = generateBinaryMasks(gridHeight - 1);

    // Iterate through each possible horizontal cut configuration.
    // Each configuration is then evaluated to find the minimum required vertical cuts.
    for (const currentConfig of horizontalCutConfigurations) {
        const totalCutsForThisPattern = evaluateCuttingPattern(
            gridCellData,
            currentConfig,
            segmentOnesMaximum,
            gridHeight
        );

        // If the configuration is valid (not Infinity), update the global minimum.
        if (totalCutsForThisPattern !== Infinity) {
            globalMinimumTotalCuts = Math.min(globalMinimumTotalCuts, totalCutsForThisPattern);
        }
    }

    // Display the final result. If no valid configuration was found, it remains Infinity.
    if (globalMinimumTotalCuts === Infinity) {
        console.log("No feasible cutting configuration could be determined under the given constraints.");
    } else {
        console.log(globalMinimumTotalCuts);
    }
}

/**
 * Evaluates a specific combination of horizontal cuts and determines the
 * minimum number of vertical cuts needed to satisfy the '1' count limit per segment.
 * This function simulates traversing the grid column by column, adding vertical cuts
 * as necessary.
 *
 * @param {string[]} gridInputMatrix - The 2D grid data, represented as an array of strings (rows).
 * @param {{setBitCount: number, binaryMaskString: string}} activeSliceConfig - An object describing the horizontal cuts (count and binary string).
 * @param {number} maxSegmentOnes - The maximum allowed count of '1's in any single segment.
 * @param {number} currentGridHeight - The number of rows in the grid.
 * @returns {number} The sum of horizontal and vertical cuts for this pattern, or Infinity if impossible.
 */
function evaluateCuttingPattern(gridInputMatrix, activeSliceConfig, maxSegmentOnes, currentGridHeight) {
    let currentTotalCuts = activeSliceConfig.setBitCount; // Start with the number of horizontal cuts
    const gridColumnLength = gridInputMatrix[0].length; // The width of the grid

    // An array to keep track of the accumulated '1's within each horizontal segment.
    // Each index corresponds to a segment created by horizontal cuts.
    let segmentOneAccumulations = [];

    // Flags to manage the complex retry logic when a column causes an overflow.
    // `columnAttemptSucceeded` acts like the original `flg`.
    // `verticalCutApplied` acts like the original `add`.
    let columnAttemptSucceeded = false;
    let verticalCutApplied = false;

    // Iterate through each column of the grid.
    // The `columnTraversal` label allows `continue` to jump to the next column iteration.
    columnTraversal: for (let columnIndex = 0; columnIndex < gridColumnLength; columnIndex++) {
        columnAttemptSucceeded = false; // Reset for each new column iteration (or retry of the same column)
        let segmentBlockIdentifier = 0; // Index for the current segment block being processed within the column

        // Iterate through each row in the current column to update segment '1' counts.
        for (let rowIndex = 0; rowIndex < currentGridHeight; rowIndex++) {
            // If the current cell contains '1', increment its corresponding segment's accumulator.
            if (gridInputMatrix[rowIndex][columnIndex] === '1') {
                segmentOneAccumulations[segmentBlockIdentifier] = (segmentOneAccumulations[segmentBlockIdentifier] || 0) + 1;
            }

            // Check if the current segment block has exceeded its maximum allowed '1's.
            if (segmentOneAccumulations[segmentBlockIdentifier] > maxSegmentOnes) {
                // An overflow has occurred. We need to add a vertical cut *before* this column.

                // Critical check: If `columnAttemptSucceeded` is still `false` here, it implies that
                // this is the second consecutive time this *same column* has caused an overflow
                // without a successful segment fitting in between (due to `columnIndex--` in a prior step).
                // In such a case, this entire horizontal cut configuration is impossible.
                if (!columnAttemptSucceeded) {
                    return Infinity; // Indicate an impossible configuration
                }

                // A vertical cut is required. Increment the total cut count, reset segment accumulators,
                // and re-process this *same column* from scratch.
                columnAttemptSucceeded = false; // Mark for next retry check
                verticalCutApplied = true;       // Flag that a vertical cut was just made
                columnIndex--;                   // Decrement to re-evaluate the current column
                segmentOneAccumulations = [];    // Clear all segment accumulators
                continue columnTraversal;        // Jump to the next iteration of the outer loop (for the same column)
            }

            // If the horizontal cut configuration indicates a cut at this row,
            // move to the next segment block identifier for subsequent rows in this column.
            if (activeSliceConfig.binaryMaskString[rowIndex] === '1') {
                segmentBlockIdentifier++;
            }
        }

        // If the inner loop (row iteration) completes without any segment overflow,
        // it means this column was successfully processed with the current segments.
        columnAttemptSucceeded = true;

        // If a vertical cut was applied in the previous iteration (which means `columnIndex` was decremented),
        // we now account for it in the `currentTotalCuts`.
        if (verticalCutApplied) {
            currentTotalCuts++;
            verticalCutApplied = false; // Reset the flag
        }
    }
    return currentTotalCuts; // Return the total cuts for this specific horizontal configuration
}

/**
 * Generates a list of objects, each representing a binary mask up to a given length.
 * Each mask corresponds to a unique combination of horizontal cuts.
 *
 * @param {number} maskBitLength - The number of potential cut points (e.g., H-1 for H rows).
 * @returns {Array<{setBitCount: number, binaryMaskString: string}>} A collection of mask details.
 */
function generateBinaryMasks(maskBitLength) {
    const maskOptionsCollection = [];

    // Handle edge cases for mask length
    if (maskBitLength < 0) { // If H=1, maskBitLength is 0, meaning no horizontal cuts are possible.
        maskOptionsCollection.push({ setBitCount: 0, binaryMaskString: "" });
        return maskOptionsCollection;
    }
    if (maskBitLength > 20) { // Arbitrary limit to prevent excessively large computation (2^20 is ~1 million)
        console.warn(`Warning: Mask bit length ${maskBitLength} is substantial. This may lead to very long processing times.`);
        // Consider throwing an error or applying a stricter limit based on expected performance.
    }

    const totalPossibleMasks = 1 << maskBitLength; // Faster than Math.pow(2, maskBitLength)
    for (let currentMaskValue = 0; currentMaskValue < totalPossibleMasks; currentMaskValue++) {
        // Convert the integer mask value to its binary string representation,
        // ensuring it's padded with leading zeros to match the maskBitLength.
        const binaryStringRepresentation = currentMaskValue.toString(2).padStart(maskBitLength, '0');

        maskOptionsCollection.push({
            setBitCount: calculateSetBits(currentMaskValue), // Count the number of '1's in the mask
            binaryMaskString: binaryStringRepresentation
        });
    }
    // The original code sorted these by setBitCount. This optimization is removed for a Type III change
    // as it's not strictly necessary for correctness, just potentially for performance pruning.
    return maskOptionsCollection;
}

/**
 * Counts the number of set bits (1s) in a 32-bit integer.
 * This uses a highly efficient bit manipulation algorithm (SWAR - SIMD Within A Register).
 *
 * @param {number} integerValue - The integer for which to count the set bits.
 * @returns {number} The count of set bits.
 */
function calculateSetBits(integerValue) {
    // This algorithm efficiently counts set bits in a 32-bit integer.
    // It works by cleverly grouping bits and summing them.
    integerValue = integerValue - ((integerValue >> 1) & 0x55555555);
    integerValue = (integerValue & 0x33333333) + ((integerValue >> 2) & 0x33333333);
    return ((integerValue + (integerValue >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
}

// Standard entry point for competitive programming environments.
// Reads input from standard input, processes it, and prints the result.
if (typeof require !== 'undefined' && require.main === module) {
    const fileSystemModule = require("fs");
    const stdInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8").trim().split("\n");
    processGridAnalysis(stdInputData);
}