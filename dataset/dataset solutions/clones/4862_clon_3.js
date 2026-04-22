"use strict"; // Enforce strict mode for cleaner code execution

// Global constant for the specific string we are searching for within the grid.
const SEARCH_KEYWORD = "snuke";

/**
 * Reads raw input data from standard input.
 * @returns {string} The complete raw string data from stdin.
 */
const acquireSystemInput = () => {
    // Utilize Node.js 'fs' module to synchronously read the content of /dev/stdin.
    // The 'utf8' encoding ensures proper character interpretation.
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

/**
 * Displays the final result of the grid search operation.
 * @param {object | null} foundPosition - An object { row: number, column: number } if found, otherwise null.
 * @param {string[]} colDesignations - An array of single-character strings used as column labels (e.g., ['A', 'B', ...]).
 */
const presentOutput = (foundPosition, colDesignations) => {
    // Check if the target keyword was successfully located within the grid.
    if (foundPosition) {
        // Construct the output string using the column designation and 1-indexed row number.
        // The column index is used to retrieve the corresponding character from colDesignations.
        // The row index is incremented by 1 because it's 0-indexed internally but 1-indexed for display.
        console.log(`${colDesignations[foundPosition.column]}${foundPosition.row + 1}`);
    } else {
        // If no location was found, inform the user.
        console.log("Target keyword not found in the provided grid data.");
    }
};

/**
 * Generates an array of alphabetical column designators up to a certain limit.
 * For example, if limit is 10, it returns ['A', 'B', 'C', ..., 'J'].
 * @param {number} limit - The maximum number of column designators to generate.
 * @returns {string[]} An array of single-character strings.
 */
const generateColumnDesignators = (limit) => {
    const designations = [];
    for (let i = 0; i < limit; i++) {
        // 'A'.charCodeAt(0) is 65. Adding i gives us successive ASCII values.
        // String.fromCharCode converts the ASCII value back to a character.
        designations.push(String.fromCharCode('A'.charCodeAt(0) + i));
    }
    return designations;
};

/**
 * Main function to process the input, search the grid, and display the result.
 * This function orchestrates the entire logic flow.
 * @param {string} rawInputContent - The raw string input read from stdin.
 */
const processGridSearch = (rawInputContent) => {
    // Clean and split the input into individual lines for easier parsing.
    const structuredLines = rawInputContent.trim().split("\n");

    // Extract grid dimensions from the first line of input.
    // The first line is expected to contain two space-separated integers: Height and Width.
    const dimensionTokens = structuredLines[0].split(" ");

    // Validate and parse the grid height.
    const gridRowsCount = Number(dimensionTokens[0]);
    // Validate and parse the grid width.
    const gridColsCount = Number(dimensionTokens[1]);

    // --- Input Validation: Dimensions ---
    // Ensure that the parsed dimensions are valid positive numbers.
    if (isNaN(gridRowsCount) || isNaN(gridColsCount) || gridRowsCount <= 0 || gridColsCount <= 0) {
        console.error("Error: Invalid grid dimensions provided. Height and Width must be positive integers.");
        return; // Exit if dimensions are invalid.
    }

    // Prepare the column designators (e.g., 'A', 'B', 'C', ...) based on the grid width.
    // This array will be used to convert column indices to alphabetical labels.
    const colDesignations = generateColumnDesignators(gridColsCount);

    // Extract the actual grid data lines, skipping the dimension line.
    // Use slice to get lines from the second one (index 1) up to the specified height.
    const gridDataLines = structuredLines.slice(1, gridRowsCount + 1);

    // --- Input Validation: Grid Data Count ---
    // Verify that the number of data lines matches the declared grid height.
    if (gridDataLines.length !== gridRowsCount) {
        console.error(`Error: Expected ${gridRowsCount} data rows but found ${gridDataLines.length}.`);
        return; // Exit if grid data is incomplete or excessive.
    }

    // Parse each grid data line into an array of tokens (words).
    // This creates a 2D array representing the grid content.
    const parsedGridContent = gridDataLines.map(line => line.split(" "));

    // Variable to store the coordinates of the found keyword.
    // Initialized to null; will be updated if the keyword is found.
    let foundLocation = null;

    // Flag to optimize search: stop iterating once the keyword is found.
    let targetDiscovered = false;

    // Iterate through each row of the parsed grid content.
    for (let rIndex = 0; rIndex < gridRowsCount; rIndex++) {
        // If the target has already been found, break out of the outer loop.
        if (targetDiscovered) {
            break;
        }

        // --- Input Validation: Row Width ---
        // Ensure each row has the expected number of columns.
        if (parsedGridContent[rIndex].length !== gridColsCount) {
            console.error(`Warning: Row ${rIndex + 1} has ${parsedGridContent[rIndex].length} columns, expected ${gridColsCount}.`);
            // Continue processing, but this indicates potentially malformed input.
        }

        // Iterate through each column in the current row.
        for (let cIndex = 0; cIndex < gridColsCount; cIndex++) {
            // Check if the current cell's content matches the target keyword.
            if (parsedGridContent[rIndex][cIndex] === SEARCH_KEYWORD) {
                // If a match is found, record its 0-indexed row and column.
                foundLocation = { row: rIndex, column: cIndex };
                // Set the flag to true to signal discovery.
                targetDiscovered = true;
                // Break from the inner loop as the target is found in this row.
                break;
            }
        }
    }

    // Call the output function to display the result based on whether the keyword was found.
    presentOutput(foundLocation, colDesignations);
};

// Initiate the entire process by reading input and passing it to the main processing function.
// This is the entry point of the script.
processGridSearch(acquireSystemInput());