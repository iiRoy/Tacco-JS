// This module is designed to process grid data and count specific configurations.
// It analyzes subsets of a grid by excluding rows and columns based on bitmasks.

/**
 * Helper function to determine if a specific bit at 'position' is set within 'mask'.
 * This is crucial for checking if a row or column should be excluded from consideration.
 * @param {number} mask - The bitmask representing selections/exclusions.
 * @param {number} position - The zero-indexed position of the bit to check.
 * @returns {boolean} True if the bit at the given position is set, false otherwise.
 */
const isPositionBitSet = (mask, position) => {
    // A bit is considered set if the bitwise AND operation with a mask
    // that has only the bit at 'position' set results in a non-zero value.
    return (mask & (1 << position)) !== 0;
};

/**
 * Auxiliary function to count the number of '#' characters in a subgrid.
 * The subgrid is defined by applying row and column exclusion masks to the full grid.
 * This function encapsulates the nested loops that iterate through the grid cells.
 * @param {string[]} grid - The original grid data, where each element is a string representing a row.
 * @param {number} height - The number of rows in the grid.
 * @param {number} width - The number of columns in the grid.
 * @param {number} rowExclusionMask - A bitmask where a set bit indicates an excluded row.
 * @param {number} colExclusionMask - A bitmask where a set bit indicates an excluded column.
 * @returns {number} The total count of '#' characters within the selected subgrid.
 */
function calculateHashesInSubgrid(grid, height, width, rowExclusionMask, colExclusionMask) {
    let currentCountOfHashes = 0; // Accumulator for '#' characters in the current subgrid.

    // Iterate over each row of the grid using its index.
    for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        // Before processing the row, check if it's marked for exclusion by the rowExclusionMask.
        if (isPositionBitSet(rowExclusionMask, rowIndex)) {
            continue; // If the row is excluded, skip to the next row.
        }

        // If the row is included, iterate over each column within this row.
        for (let colIndex = 0; colIndex < width; colIndex++) {
            // Before checking the cell, determine if the current column is marked for exclusion.
            if (isPositionBitSet(colExclusionMask, colIndex)) {
                continue; // If the column is excluded, skip to the next column in this row.
            }

            // If both the row and the column are included, inspect the cell content.
            // Check if the character at the current grid cell is a '#'.
            if (grid[rowIndex][colIndex] === '#') {
                currentCountOfHashes++; // Increment the counter if a '#' is found.
            }
        }
    }
    return currentCountOfHashes; // Return the final count for the current subgrid configuration.
}

/**
 * Main processing function for grid analysis.
 * It reads raw input, parses grid dimensions and data, then iterates through
 * all possible combinations of row and column exclusions to find configurations
 * that result in a specific number of '#' characters.
 * @param {string} rawInputString - The complete input string read from stdin.
 */
function analyzeGridCombinations(rawInputString) {
    // --- Input Validation and Parsing ---

    // Initial validation: check if the input string is valid and not empty.
    if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Error: Provided input data is empty or not a string.");
        return; // Exit if input is invalid.
    }

    // Split the raw input into individual lines and remove any leading/trailing whitespace.
    // Also, filter out any completely empty lines that might result from splitting.
    const processedLines = rawInputString.trim().split(/\r?\n/g).filter(line => line.length > 0);

    // Ensure that there is at least one line for dimensions.
    if (processedLines.length < 1) {
        console.error("Error: Insufficient input lines to parse grid dimensions.");
        return;
    }

    // Parse the first line to extract grid height, width, and the target hash count.
    const dimensionsAndTarget = processedLines[0].split(' ').map(Number);

    // Destructure the parsed numbers for clarity.
    const [gridHeight, gridWidth, targetHashCount] = dimensionsAndTarget;

    // Validate that the parsed values are indeed non-negative integers.
    if (!Number.isInteger(gridHeight) || !Number.isInteger(gridWidth) || !Number.isInteger(targetHashCount) ||
        gridHeight < 0 || gridWidth < 0 || targetHashCount < 0) {
        console.error("Error: Invalid grid dimensions or target hash count. Values must be non-negative integers.");
        return;
    }

    // Extract the actual grid data from the remaining lines of input.
    const gridMatrix = processedLines.slice(1);

    // Validate that the number of grid rows matches the declared gridHeight.
    if (gridMatrix.length !== gridHeight) {
        console.error(`Error: Grid height mismatch. Expected ${gridHeight} rows, but received ${gridMatrix.length}.`);
        return;
    }

    // Optional: Validate the width of each row against the declared gridWidth.
    for (let r = 0; r < gridHeight; r++) {
        if (gridMatrix[r].length !== gridWidth) {
            console.error(`Error: Grid width mismatch in row ${r}. Expected ${gridWidth} columns, but row has ${gridMatrix[r].length}.`);
            return;
        }
    }

    // --- Core Logic for Combination Analysis ---

    // Initialize a counter to store the number of grid configurations that match the target hash count.
    let matchingConfigurationsCount = 0;

    // Pre-calculate the total number of combinations for row and column exclusions.
    // This is 2^H for rows and 2^W for columns, efficiently calculated using bit shifts.
    const totalRowCombinations = 1 << gridHeight;
    const totalColCombinations = 1 << gridWidth;

    // Outer loop: Iterate through all possible subsets of rows to exclude.
    // Each value of 'currentRowExclusionMask' represents a unique combination of rows to be excluded.
    for (let currentRowExclusionMask = 0; currentRowExclusionMask < totalRowCombinations; currentRowExclusionMask++) {
        // Inner loop: Iterate through all possible subsets of columns to exclude.
        // Each value of 'currentColExclusionMask' represents a unique combination of columns to be excluded.
        for (let currentColExclusionMask = 0; currentColExclusionMask < totalColCombinations; currentColExclusionMask++) {
            // Call the helper function to count '#' characters in the subgrid defined by the current masks.
            const hashesInSelection = calculateHashesInSubgrid(
                gridMatrix,
                gridHeight,
                gridWidth,
                currentRowExclusionMask,
                currentColExclusionMask
            );

            // Compare the calculated hash count with the desired target.
            if (hashesInSelection === targetHashCount) {
                matchingConfigurationsCount++; // Increment the counter if they match.
            }
        }
    }

    // --- Output Result ---

    // Output the final count of matching configurations to standard output.
    // Using process.stdout.write ensures only the number is printed, followed by a newline.
    process.stdout.write(String(matchingConfigurationsCount) + '\n');
}

// --- Program Entry Point and Error Handling ---

// This block handles reading input from /dev/stdin and calling the main analysis function.
// It includes robust error handling for file operations.
try {
    // Dynamically require the file system module.
    const fileSystemModule = require("fs");
    // Define the standard input file path for typical Unix-like environments.
    const inputFilePath = "/dev/stdin";
    // Read the entire file content synchronously and decode it as UTF-8.
    const fileContent = fileSystemModule.readFileSync(inputFilePath, "utf8");
    // Execute the main analysis function with the obtained file content.
    analyzeGridCombinations(fileContent);
} catch (error) {
    // Catch any potential errors that occur during file reading or subsequent processing.
    console.error("An error occurred during input reading or processing:", error.message);
    // Exit the process with a non-zero status code to indicate an error.
    process.exit(1);
}