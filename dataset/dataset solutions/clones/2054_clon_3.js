// Entry point for processing the grid data
const executeMatrixSegmentation = (rawInputData) => {
    // Validate the input data structure before proceeding
    if (!Array.isArray(rawInputData) || rawInputData.length === 0) {
        console.error("Error: Input data is empty or malformed.");
        return;
    }

    // Helper function to parse the first line of input
    const parseGridDimensions = (lineString) => {
        const parts = lineString.split(" ");
        // Explicitly parse integers with radix 10
        const parsedHeight = parseInt(parts[0], 10);
        const parsedWidth = parseInt(parts[1], 10);
        const parsedThreshold = parseInt(parts[2], 10);

        // Basic validation for parsed values
        if (isNaN(parsedHeight) || isNaN(parsedWidth) || isNaN(parsedThreshold) ||
            parsedHeight <= 0 || parsedWidth <= 0 || parsedThreshold <= 0) {
            console.error("Error: Invalid grid dimensions or threshold value.");
            return { gridRowCount: 0, gridColCount: 0, maxOnesPerSection: 0 };
        }
        return {
            gridRowCount: parsedHeight,
            gridColCount: parsedWidth,
            maxOnesPerSection: parsedThreshold
        };
    };

    // Extracting grid parameters from the first line
    const { gridRowCount, gridColCount, maxOnesPerSection } = parseGridDimensions(rawInputData[0]);

    if (gridRowCount === 0) { // If parsing failed
        return;
    }

    // Constructing the 2D matrix (grid) from subsequent input lines
    const inputGridMatrix = [];
    for (let rowIndex = 1; rowIndex <= gridRowCount; rowIndex++) {
        // Ensure that the row data exists before attempting to assign
        if (rawInputData[rowIndex]) {
            inputGridMatrix[rowIndex - 1] = rawInputData[rowIndex];
        } else {
            console.error(`Error: Missing grid row data for index ${rowIndex}.`);
            return; // Abort if grid data is incomplete
        }
    }

    // Initialize the overall minimum number of cuts required to a very large value
    // This will be updated as valid partitioning strategies are found.
    let overallMinClices = Number.MAX_SAFE_INTEGER;

    // Generate all possible horizontal partition masks for the grid.
    // We need (gridRowCount - 1) possible cut points between rows.
    const horizontalPartitionMasks = createHorizontalMasks(gridRowCount - 1);

    // Iterate through each generated horizontal partition strategy
    // Sorting by segmentCount (bit count) might help find simpler solutions faster,
    // but isn't strictly necessary for correctness.
    for (const currentPartition of horizontalPartitionMasks) {
        // Evaluate the current horizontal partitioning strategy
        // This function returns Number.MAX_SAFE_INTEGER if the strategy is impossible.
        const currentStrategyCuts = assessPartitionStrategy(
            inputGridMatrix,
            currentPartition,
            maxOnesPerSection,
            gridRowCount
        );

        // Update the overall minimum if a more efficient (or first valid) strategy is found
        overallMinClices = Math.min(overallMinClices, currentStrategyCuts);
    }

    // Output the final result. If no valid partition was found, it will still be MAX_SAFE_INTEGER.
    if (overallMinClices === Number.MAX_SAFE_INTEGER) {
        console.log("No valid partitioning strategy found.");
    } else {
        console.log(overallMinClices);
    }
};

/**
 * Evaluates a given horizontal partitioning strategy to determine the minimum
 * vertical cuts needed, or if the strategy is impossible.
 *
 * @param {string[]} matrixData - The 2D grid as an array of strings.
 * @param {object} currentPartition - Contains `segmentCount` (number of horizontal cuts)
 *                                    and `binaryMaskString` (binary representation of cuts).
 * @param {number} threshold - The maximum number of '1's allowed in any section.
 * @param {number} numRows - The total number of rows in the grid.
 * @returns {number} The total cuts (horizontal + vertical) for this strategy,
 *                   or Number.MAX_SAFE_INTEGER if impossible.
 */
const assessPartitionStrategy = (matrixData, currentPartition, threshold, numRows) => {
    let currentStrategyCuts = currentPartition.segmentCount; // Start with horizontal cuts
    const matrixWidth = matrixData[0].length; // Number of columns

    // `sectionOnesTallies` stores the cumulative sum of '1's for each horizontal strip
    // from the last vertical cut up to the current column being processed.
    let sectionOnesTallies = new Array(numRows).fill(0);

    // Flag to detect if we're re-evaluating the same column after a vertical cut.
    // If true and a cut is still needed, it means this column is impossible to satisfy.
    let recheckAttempted = false;

    // Iterate through each column of the matrix
    for (let colIdx = 0; colIdx < matrixWidth; colIdx++) {
        let currentSectionIdx = 0; // Tracks which horizontal section we're currently in for this column
        let columnRequiresVerticalCut = false; // Flag to indicate if this column's data makes any section exceed threshold

        // First, add the current column's '1's to the cumulative section sums
        for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
            if (parseInt(matrixData[rowIdx][colIdx], 10) === 1) {
                sectionOnesTallies[currentSectionIdx]++;
            }
            // If the mask indicates a horizontal cut after this row, move to the next section
            if (currentPartition.binaryMaskString[rowIdx] === "1") {
                currentSectionIdx++;
            }
        }

        // After processing all rows for the current column, check if any section
        // (with the added values from this column) now exceeds the threshold.
        // We iterate up to `currentSectionIdx` because that's the maximum index
        // that could have been affected by this column's values.
        for (let s = 0; s <= currentSectionIdx; s++) {
            if (sectionOnesTallies[s] > threshold) {
                columnRequiresVerticalCut = true;
                break; // A cut is needed, no need to check further sections for this column
            }
        }

        if (columnRequiresVerticalCut) {
            // If we've already tried to make a vertical cut for this specific column
            // and it still causes a section to exceed the threshold, then this
            // horizontal partitioning strategy is impossible.
            if (recheckAttempted) {
                return Number.MAX_SAFE_INTEGER; // Indicate an invalid configuration
            }

            // A vertical cut is needed before this column. Increment the total cuts.
            currentStrategyCuts++;

            // Reset all section sums as a new vertical segment starts.
            // This effectively "cuts" the accumulated sums.
            sectionOnesTallies.fill(0);

            // Decrement `colIdx` to re-process the current column.
            // This is crucial because the cut was made *before* this column,
            // so this column's '1's now start fresh in the new vertical segment.
            colIdx--;

            // Mark that we've attempted a vertical cut for this column.
            recheckAttempted = true;
        } else {
            // If no vertical cut was needed for this column, reset the recheck flag
            // for the next column.
            recheckAttempted = false;
        }
    }

    // If the loop completes, it means this horizontal partitioning strategy
    // is valid and `currentStrategyCuts` holds the total cuts (horizontal + vertical).
    return currentStrategyCuts;
};

/**
 * Generates a list of all possible binary masks representing horizontal cuts.
 * Each mask indicates where horizontal cuts can be made between rows.
 *
 * @param {number} numberOfPotentialCuts - The number of possible cut points (numRows - 1).
 * @returns {Array<object>} A sorted list of objects, each containing:
 *                          - `segmentCount`: The number of '1's in the binary mask (number of cuts).
 *                          - `binaryMaskString`: The binary string representation of the mask.
 */
const createHorizontalMasks = (numberOfPotentialCuts) => {
    const maskDetailsList = [];
    // Iterate from 0 up to 2^(numberOfPotentialCuts) - 1 to generate all combinations
    for (let i = 0; i < Math.pow(2, numberOfPotentialCuts); i++) {
        // Convert integer `i` to its binary string representation
        // Pad with leading zeros to ensure the string has `numberOfPotentialCuts` length.
        const binaryString = i.toString(2).padStart(numberOfPotentialCuts, '0');

        maskDetailsList.push({
            segmentCount: countSetBitsInInteger(i), // Count of '1's in the mask
            binaryMaskString: binaryString
        });
    }
    // Optionally sort the masks by the number of cuts (segmentCount) for potential optimization
    // (though not strictly required for correctness).
    return maskDetailsList.sort((maskA, maskB) => maskA.segmentCount - maskB.segmentCount);
};

/**
 * Counts the number of set bits (1s) in a 32-bit integer using a fast bit manipulation algorithm.
 * This is a standard population count (popcount) implementation.
 *
 * @param {number} valueToCount - The integer whose set bits are to be counted.
 * @returns {number} The number of set bits.
 */
const countSetBitsInInteger = (valueToCount) => {
  // Subtracting (n >> 1) & 0x55555555 counts bits in pairs (01 -> 1, 10 -> 1, 11 -> 2)
  valueToCount = valueToCount - ((valueToCount >> 1) & 0x55555555);
  // Summing adjacent pairs (0011 -> 01, 1001 -> 10)
  valueToCount = (valueToCount & 0x33333333) + ((valueToCount >> 2) & 0x33333333);
  // Summing adjacent nibbles (4 bits)
  return ((valueToCount + (valueToCount >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
};

// Standard competitive programming input handling:
// Reads input from stdin, converts it to a string, trims whitespace, splits by newline,
// and then passes the resulting array of strings to the main processing function.
executeMatrixSegmentation(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));