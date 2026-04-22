/**
 * This script processes a grid of data to find the minimum number of cuts required
 * to satisfy a capacity constraint for each horizontal section.
 * The problem involves partitioning the grid rows and then checking column-wise sums.
 */

// Global variable to store the minimum number of cuts found across all partition schemes.
let minCuts = 0;

/**
 * Main entry point for the program execution.
 * Reads input data, parses dimensions and capacity, then iterates through
 * various row partitioning schemes to find the optimal solution.
 *
 * @param {string[]} dataSource - An array of strings representing the input data.
 *                                The first string contains dimensions and capacity.
 *                                Subsequent strings are the grid rows.
 */
function ExecuteProgram(dataSource) {
    // Parse grid dimensions and the maximum capacity from the first line of input.
    const dimensions = dataSource[0].split(" ");
    const rowDim = parseInt(dimensions[0], 10); // Number of rows in the grid.
    const colDim = parseInt(dimensions[1], 10); // Number of columns in the grid.
    const maxCapacity = parseInt(dimensions[2], 10); // Maximum allowed sum for a section.

    // Initialize the grid data structure from the input.
    const gridData = [];
    for (let rowIndex = 1; rowIndex <= rowDim; rowIndex++) {
        gridData[rowIndex - 1] = dataSource[rowIndex];
    }

    // Initialize the minimum cuts with a worst-case scenario (all cells are cuts).
    minCuts = rowDim * colDim;

    // Generate all possible horizontal partitioning schemes for the grid.
    // There are 2^(rowDim-1) ways to cut the rows.
    const partitionOptions = generatePartitions(rowDim - 1);

    // Iterate through each generated partitioning scheme.
    partitionOptions.forEach(partitionScheme => {
        // Process the grid with the current partition scheme to evaluate cuts.
        processGrid(gridData, partitionScheme, maxCapacity, rowDim);
    });

    // Output the final minimum number of cuts.
    console.log(minCuts);
}

/**
 * Processes the grid for a given horizontal partitioning scheme to count necessary cuts.
 * This function iterates column by column, accumulating sums for each section
 * defined by the partition scheme. If a section's sum exceeds capacity, a cut is made.
 *
 * @param {string[]} gridData - The 2D grid of data (each string represents a row).
 * @param {object} partitionScheme - An object describing the current row partitioning.
 *                                   Contains 'count' (initial cuts) and 'vector' (binary string indicating cuts).
 * @param {number} maxCapacity - The maximum allowed sum for any section.
 * @param {number} rowDim - The number of rows in the grid.
 */
function processGrid(gridData, partitionScheme, maxCapacity, rowDim) {
    // Initialize temporary cuts with the number of horizontal cuts defined by the scheme.
    let tempCuts = partitionScheme.count;
    const gridWidth = gridData[0].length; // Number of columns in the grid.

    // Array to store the current sums for each horizontal section.
    let sectionSums = [];
    // Counter for a specific conditional logic block (previous count, often used for retry mechanisms).
    let previousCount = 0;

    // Iterate through each column of the grid.
    columnIteration: for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
        // Reset the current section index for each new column.
        let currentSection = 0;

        // Iterate through each cell in the current column.
        for (let cellIndex = 0; cellIndex < rowDim; cellIndex++) {
            // Initialize section sum if it doesn't exist.
            if (!sectionSums[currentSection]) {
                sectionSums[currentSection] = 0;
            }

            // If the cell contains '1', add it to the current section's sum.
            if (gridData[cellIndex][colIndex] === "1") {
                sectionSums[currentSection]++;
            }

            // If the partition scheme indicates a cut below this cell, move to the next section.
            if (partitionScheme.vector[cellIndex] === "1") {
                currentSection++;
            }

            // If any section's sum exceeds the maximum capacity...
            if (sectionSums[currentSection] > maxCapacity) {
                tempCuts++; // Increment the number of cuts.
                sectionSums = []; // Reset all section sums.
                colIndex--; // Re-process the current column after making a cut.

                // Handle a specific retry condition based on previousCount.
                if (previousCount > 0) {
                    previousCount = 0;
                    continue columnIteration; // Restart column iteration from the current (decremented) column.
                } else {
                    // If no retry condition, this partition scheme is invalid, so return.
                    return;
                }
            }
        }

        // If this is the last column, update the global minimum cuts.
        if (colIndex === gridWidth - 1) {
            minCuts = Math.min(minCuts, tempCuts);
        }
    }

    return tempCuts; // Return the total cuts for this specific scheme.
}

/**
 * Generates a list of all possible binary partitioning schemes for a given length.
 * Each scheme includes the number of '1's (cuts) and the binary string representation.
 *
 * @param {number} lengthParam - The number of potential cut points (e.g., H-1 for H rows).
 * @returns {Array<object>} A sorted list of partition scheme objects.
 */
function generatePartitions(lengthParam) {
    const schemeList = []; // Initialize an array to hold all generated schemes.

    // Iterate from 0 up to 2^lengthParam - 1 to generate all binary combinations.
    for (let iter = 0; iter < Math.pow(2, lengthParam); iter++) {
        // Convert the integer to a binary string, padded with leading zeros.
        const binaryString = ("0000000000" + iter.toString(2)).slice(-lengthParam);
        schemeList.push({
            count: countSetBits(iter), // Number of set bits (cuts) in this scheme.
            vector: binaryString // The binary string representing the cut positions.
        });
    }

    // Sort the schemes by their cut count in ascending order.
    return schemeList.sort((schemeA, schemeB) => schemeA.count - schemeB.count);
}

/**
 * Counts the number of set bits (1s) in a 32-bit unsigned integer using a bit manipulation trick.
 * This is a highly optimized way to count bits.
 *
 * @param {number} numVal - The integer for which to count set bits.
 * @returns {number} The number of set bits.
 */
function countSetBits(numVal) {
    // Subtract (n >> 1) & 0x55555555: groups of 2 bits (e.g., 10_01 -> 1_0_0_1)
    numVal = numVal - ((numVal >>> 1) & 0x55555555);
    // Add (n >> 2) & 0x33333333 to (n & 0x33333333): groups of 4 bits (e.g., 1010_0101 -> 10_10_01_01)
    numVal = (numVal & 0x33333333) + ((numVal >>> 2) & 0x33333333);
    // Sum groups of 8 bits, then 16, then 32, and extract the final sum.
    return ((numVal + (numVal >>> 4) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}

// Execute the main program by reading input from standard input.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));