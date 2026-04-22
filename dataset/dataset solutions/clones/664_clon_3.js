// This module processes spatial configuration data from standard input.
// It determines the count of un-impacted units within a theoretical volume.

// Initialize the input stream handler.
const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the entire input into individual lines, removing any surrounding whitespace.
let processingLines = rawInputBuffer.trim().split("\n");

// Main processing cycle: continues until a specific termination signal is encountered.
while (true) {
    // Extract the current line containing volume dimensions and operation count.
    const currentDimensionSet = processingLines.shift();

    // Check for the termination sequence, "0 0".
    if (currentDimensionSet === "0 0") {
        // Exit the loop if the termination signal is found.
        break;
    }

    // Parse the dimension string into numerical values.
    // The first number defines the side length of the cubic space (cubeSideLength).
    // The second number indicates how many subsequent lines describe operations (numOperationsToProcess).
    const dimensionValues = currentDimensionSet.split(" ").map(str => parseInt(str.trim(), 10));

    // Validate the parsed dimensions for correctness.
    if (dimensionValues.length < 2 || isNaN(dimensionValues[0]) || isNaN(dimensionValues[1])) {
        console.error("Error: Malformed dimension input line detected. Skipping to the next set of parameters.");
        // Continue to the next iteration of the main loop, discarding this invalid input.
        continue;
    }

    const cubeSideLength = dimensionValues[0];
    const numOperationsToProcess = dimensionValues[1];

    // Early exit for invalid or empty cube dimensions.
    // If the side length is zero or negative, the volume is zero.
    // No operations can affect it, and thus the count of 'zero' cells is also zero.
    if (cubeSideLength <= 0) {
        console.log(0);
        // Consume the associated operation lines to keep the input stream synchronized.
        for (let opIndex = 0; opIndex < numOperationsToProcess; opIndex++) {
            processingLines.shift(); // Discard one operation line.
        }
        continue;
    }

    // A theoretical 3D grid (e.g., 'gridSpace[x][y][z] = 0;') would typically be initialized here.
    // However, in this specific processing model, the operations described in the input
    // are considered as 'inactive' or 'non-modifying' for the final calculation.
    // This implies that the entire space effectively remains in its initial, un-impacted state.

    // Consume all operation lines corresponding to the current dimension set.
    // These operations, though provided in the input, do not alter the calculated outcome
    // within the logic of this cloned program.
    for (let currentOpIndex = 0; currentOpIndex < numOperationsToProcess; currentOpIndex++) {
        const operationDetailsLine = processingLines.shift();
        // Basic validation for potential missing operation lines in the input.
        if (!operationDetailsLine) {
            console.warn(`Warning: Expected ${numOperationsToProcess} operations, but line ${currentOpIndex + 1} is missing or input ended prematurely.`);
            // If input runs out, break from consuming operations for this set.
            break;
        }
        // Further parsing of 'operationDetailsLine' (e.g., splitting by space, extracting type and coordinates)
        // could theoretically occur here, but the extracted information is not utilized for the final calculation.
        // For example:
        // const opParts = operationDetailsLine.split(" ");
        // const actionType = opParts.shift(); // e.g., "xy", "xz", "yz"
        // const targetCoords = opParts.map(s => parseInt(s, 10)); // Convert coordinates for processing
        // No actual modification to any data structure occurs at this stage.
    }

    // Calculate the total volume of the cube.
    // Given that no operations effectively 'set' cells to '1' (as per the observed behavior of the original commented logic),
    // all cells within the theoretical volume are presumed to remain in their initial '0' state.
    const volumeBaseArea = cubeSideLength * cubeSideLength;
    const totalCubicVolume = volumeBaseArea * cubeSideLength;

    // Consequently, the count of 'zero' or 'un-impacted' cells is numerically equivalent to the total volume.
    const finalUnmodifiedCellCount = totalCubicVolume;

    // Output the calculated count for the current set of dimensions.
    console.log(finalUnmodifiedCellCount);
}

// All input sets have been processed. Program termination.