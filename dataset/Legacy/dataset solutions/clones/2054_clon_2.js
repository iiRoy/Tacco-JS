// This script processes grid data to find the minimum number of cuts.
function ProcessInput(inputData) {
    // Parse grid dimensions and maximum allowed '1's per segment from the first line.
    var GridHeight = inputData[0].split(" ")[0] - 0;
    var GridWidth = inputData[0].split(" ")[1] - 0;
    var MaxOnes = inputData[0].split(" ")[2] - 0;

    // Initialize an array to store the grid rows.
    var GridData = [];
    for (var rowIdx = 0; rowIdx < GridHeight; rowIdx++) {
        GridData[rowIdx] = inputData[rowIdx + 1];
    }

    // Initialize the global minimum cuts with a worst-case scenario (all cells cut).
    MinCuts = GridHeight * GridWidth;

    // Generate all possible horizontal cut combinations.
    var BitCombinations = GenerateBitmasks(GridHeight - 1);

    // Iterate through each combination of horizontal cuts.
    BitCombinations.forEach(CurrentCombination => {
        EvaluateConfiguration(GridData, CurrentCombination, MaxOnes, GridHeight);
    });

    // Output the final minimum number of cuts found.
    console.log(MinCuts);
}

// Global variable to store the minimum number of cuts found across all configurations.
var MinCuts = 0;

/**
 * Evaluates a specific configuration of horizontal cuts to determine the required vertical cuts.
 * @param {string[]} gridMatrix - The grid data as an array of strings.
 * @param {object} currentMask - An object containing the bitmask count and value.
 * @param {number} maxAllowedOnes - The maximum number of '1's allowed in a segment.
 * @param {number} matrixHeight - The height of the grid.
 * @returns {number} The number of cuts for this configuration, or undefined if it's invalid.
 */
function EvaluateConfiguration(gridMatrix, currentMask, maxAllowedOnes, matrixHeight) {
    // Initialize the number of cuts for the current configuration with the horizontal cuts count.
    var CurrentCuts = currentMask.cnt;
    // Get the width of the grid (number of columns).
    var ColumnLength = gridMatrix[0].length;

    // Array to store the sum of '1's in each segment for the current column.
    var SegmentSums = [];
    // Counter for a specific retry mechanism.
    var PreviousCount = 0;

    // Loop through each column of the grid.
    ColumnIteration: for (var currentColumnIndex = 0; currentColumnIndex < ColumnLength; currentColumnIndex++) {
        var SegmentIndex = 0; // Index for the current segment.
        // Loop through each row in the current column.
        for (var currentRowIndex = 0; currentRowIndex < matrixHeight; currentRowIndex++) {
            // Initialize segment sum if not already present.
            if (!SegmentSums[SegmentIndex]) {
                SegmentSums[SegmentIndex] = 0;
            }
            // If the current cell contains '1', add it to the current segment's sum.
            if (gridMatrix[currentRowIndex][currentColumnIndex] === "1") {
                SegmentSums[SegmentIndex] += 1;
            }
            // If a horizontal cut is defined at this row, move to the next segment.
            if (currentMask.v[currentRowIndex] === "1") {
                SegmentIndex++;
            }
            // If any segment's sum exceeds the maximum allowed '1's.
            if (SegmentSums[SegmentIndex] > maxAllowedOnes) {
                CurrentCuts++; // Increment vertical cuts.
                SegmentSums = []; // Reset segment sums for a new set of segments.
                currentColumnIndex--; // Re-process the current column.

                // Check for a specific retry condition.
                if (PreviousCount > 0) {
                    PreviousCount = 0; // Reset retry counter.
                    continue ColumnIteration; // Continue to the next column (after re-processing current).
                } else {
                    return; // This configuration is invalid, return early.
                }
            }
        }
        // If we successfully processed the last column without exceeding MaxOnes.
        if (currentColumnIndex === ColumnLength - 1) {
            MinCuts = Math.min(MinCuts, CurrentCuts); // Update the global minimum cuts.
        }
    }
    return CurrentCuts; // Return the total cuts for this configuration.
}

/**
 * Generates a list of bitmask objects for horizontal cuts.
 * Each object contains the count of set bits (cuts) and the binary string representation.
 * @param {number} length - The number of potential cut positions (H-1).
 * @returns {Array<object>} A sorted list of bitmask objects.
 */
function GenerateBitmasks(length) {
    var MaskList = [];
    // Iterate from 0 to 2^length - 1 to generate all bit combinations.
    for (var maskValue = 0; maskValue < Math.pow(2, length); maskValue++) {
        // Add an object with the bit count and the padded binary string.
        MaskList.push({
            cnt: CountSetBits(maskValue),
            v: ('0'.repeat(10) + maskValue.toString(2)).slice(-length)
        });
    }
    // Sort the list by the number of set bits (cuts) in ascending order.
    return MaskList.sort((maskA, maskB) => maskA.cnt - maskB.cnt);
}

/**
 * Counts the number of set bits (1s) in a 32-bit integer using a bit manipulation trick.
 * @param {number} inputNumber - The integer to count set bits for.
 * @returns {number} The number of set bits.
 */
function CountSetBits(inputNumber) {
    inputNumber = inputNumber - ((inputNumber >> 1) & 0x55555555);
    inputNumber = (inputNumber & 0x33333333) + ((inputNumber >> 2) & 0x33333333);
    return ((inputNumber + (inputNumber >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
}

// Entry point: Read input from stdin, process it, and call the main function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
