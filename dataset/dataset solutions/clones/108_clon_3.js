const fileSystemInterface = require('fs');
const Buffer = require('buffer').Buffer;

// Determine the byte size of standard input.
// This is typically non-zero for piped input but often 0 for interactive terminals.
let inputStreamByteCount = 0;
try {
    const streamDescriptorStats = fileSystemInterface.fstatSync(process.stdin.fd);
    inputStreamByteCount = streamDescriptorStats.size;
} catch (error) {
    // Log a warning if stdin size cannot be determined, then use a default buffer size.
    console.error("Input stream size check failed. Assuming default buffer size. Error:", error.message);
    inputStreamByteCount = 4096; // Fallback to a common page size.
}

// Ensure a minimum buffer capacity, especially if the determined size was 0.
if (inputStreamByteCount <= 0) {
    inputStreamByteCount = 4096; // Default to 4KB if the size is unknown or invalid.
}

// Allocate a buffer to store data read from standard input.
const incomingDataBuffer = Buffer.alloc(inputStreamByteCount);

// Read binary data from standard input into the allocated buffer.
let actualBytesReceived = 0;
try {
    actualBytesReceived = fileSystemInterface.readSync(process.stdin.fd, incomingDataBuffer, 0, inputStreamByteCount, 0);
} catch (error) {
    console.error("Fatal error during standard input read operation:", error.message);
    process.exit(1); // Terminate execution if input cannot be read.
}

// Convert the received bytes into a UTF-8 string, then split into individual lines.
// Lines are trimmed and empty ones are filtered out to ensure clean processing.
const parsedInputRecords = incomingDataBuffer
    .toString('utf8', 0, actualBytesReceived)
    .split('\n')
    .filter(lineContent => lineContent.trim().length > 0); // Exclude any blank lines.

// Initiate the primary data processing routine with the prepared input.
processCoordinateData(parsedInputRecords);

/**
 * Orchestrates the primary analysis of coordinate data.
 * It initializes a grid, processes each input record to update grid cells,
 * and then computes and outputs two key metrics from a sub-section of the grid.
 * @param {string[]} recordLines - An array of strings, each representing a single input record.
 */
function processCoordinateData(recordLines) {
    // Define the fixed dimensions for our internal processing grid.
    const GRID_MATRIX_DIM = 14;
    // Create and initialize a square grid (2D array) with all values set to zero.
    // This grid accumulates "impact" values based on input coordinates.
    let impactScoreMatrix = Array.from({ length: GRID_MATRIX_DIM }, () => Array(GRID_MATRIX_DIM).fill(0));

    // Helper function to safely increment a cell's value within the grid boundaries.
    const incrementGridValue = (matrix, row, col) => {
        if (row >= 0 && row < GRID_MATRIX_DIM && col >= 0 && col < GRID_MATRIX_DIM) {
            matrix[row][col]++;
        }
    };

    // Iterate through the input records in reverse order, matching original logic.
    // The original loop `for (; len--;)` effectively processed `input[length-2]` down to `input[0]`.
    const totalRecords = recordLines.length;
    for (let currentEntryIdx = totalRecords - 1; currentEntryIdx >= 0; --currentEntryIdx) {
        const currentDataString = recordLines[currentEntryIdx];

        // Perform basic validation on the input string's structure.
        // Expected format: "X Y T" where X, Y are coords and T is a type.
        if (currentDataString.length < 5 || currentDataString.charAt(1) !== ' ' || currentDataString.charAt(3) !== ' ') {
            // Skip records that don't conform to the expected minimal structure.
            // This is a Type III addition for robustness.
            continue;
        }

        // Extract and parse the coordinate and type characters from fixed positions.
        const charForX = currentDataString[0];
        const charForY = currentDataString[2];
        const charForType = currentDataString[4];

        const parsedCoordX = parseInt(charForX, 10);
        const parsedCoordY = parseInt(charForY, 10);

        // Validate that parsed coordinates are indeed numbers.
        if (isNaN(parsedCoordX) || isNaN(parsedCoordY)) {
            continue; // Skip if coordinates are not valid numbers.
        }

        // Apply a fixed offset to the parsed coordinates as per the original algorithm.
        const effectiveCoordX = parsedCoordX + 2;
        const effectiveCoordY = parsedCoordY + 2;

        // Apply impacts to the grid based on the 'type' character.
        // The original code used a switch with fall-through logic. This is replicated with if-else if.
        // Type '3' implies actions for '3', '2', and '1'.
        // Type '2' implies actions for '2' and '1'.
        // Type '1' implies only actions for '1'.
        if (charForType === '3') {
            incrementGridValue(impactScoreMatrix, effectiveCoordY + 2, effectiveCoordX);
            incrementGridValue(impactScoreMatrix, effectiveCoordY - 2, effectiveCoordX);
            incrementGridValue(impactScoreMatrix, effectiveCoordY, effectiveCoordX - 2);
            incrementGridValue(impactScoreMatrix, effectiveCoordY, effectiveCoordX + 2);
            // Fall-through behavior for '3' continues to '2' and '1' logic.
        }
        if (charForType === '3' || charForType === '2') {
            incrementGridValue(impactScoreMatrix, effectiveCoordY + 1, effectiveCoordX - 1);
            incrementGridValue(impactScoreMatrix, effectiveCoordY + 1, effectiveCoordX + 1);
            incrementGridValue(impactScoreMatrix, effectiveCoordY - 1, effectiveCoordX - 1);
            incrementGridValue(impactScoreMatrix, effectiveCoordY - 1, effectiveCoordX + 1);
            // Fall-through behavior for '2' continues to '1' logic.
        }
        if (charForType === '3' || charForType === '2' || charForType === '1') {
            incrementGridValue(impactScoreMatrix, effectiveCoordY + 1, effectiveCoordX);
            incrementGridValue(impactScoreMatrix, effectiveCoordY, effectiveCoordX - 1);
            incrementGridValue(impactScoreMatrix, effectiveCoordY, effectiveCoordX);
            incrementGridValue(impactScoreMatrix, effectiveCoordY, effectiveCoordX + 1);
            incrementGridValue(impactScoreMatrix, effectiveCoordY - 1, effectiveCoordX);
        }
        // Records with other charForType values are ignored, matching original behavior.
    }

    // --- Compute Final Statistics ---
    let unaffectedCellCount = 0; // Counts cells with a value of zero.
    let peakImpactValue = 0;     // Stores the highest value found in any cell.

    // Define the bounds for the sub-grid analysis (a 10x10 area within the larger grid).
    const ANALYSIS_SUBGRID_SIZE = 10;
    const SUBGRID_START_OFFSET = 2; // Analysis starts from index [2][2] in the larger grid.

    for (let r = 0; r < ANALYSIS_SUBGRID_SIZE; ++r) {
        for (let c = 0; c < ANALYSIS_SUBGRID_SIZE; ++c) {
            // Access cells within the specified 10x10 sub-grid.
            const currentCellScore = impactScoreMatrix[r + SUBGRID_START_OFFSET][c + SUBGRID_START_OFFSET];

            // Check if the current cell's impact score is zero.
            if (currentCellScore === 0) {
                unaffectedCellCount++;
            }
            // Update the maximum impact value if the current cell's score is higher.
            peakImpactValue = findMaximum(currentCellScore, peakImpactValue);
        }
    }

    // Output the two calculated statistics.
    console.log(unaffectedCellCount);
    console.log(peakImpactValue);
}

/**
 * A utility function to determine the greater of two numeric values.
 * This replaces the bitwise max trick from the original code with a more standard approach.
 * @param {number} val1 - The first number.
 * @param {number} val2 - The second number.
 * @returns {number} The larger of the two input numbers.
 */
function findMaximum(val1, val2) {
    return Math.max(val1, val2);
}