/*
 * This module processes a structured text input to locate a specific keyword
 * within a grid-like data representation.
 * The input is expected to contain grid dimensions on the first line,
 * followed by rows of grid data.
 */

// Main execution wrapper for the program logic.
// It orchestrates reading the input, parsing it, and performing the search.
function ExecuteGridSearch(inputSourceText) {
    // Ensure input is a string and trim any leading/trailing whitespace.
    const trimmedInput = inputSourceText ? String(inputSourceText).trim() : '';

    // Guard clause: If the input is empty after trimming, there's nothing to process.
    if (!trimmedInput) {
        // Optionally, log an error or return a specific status.
        // For this clone, we'll just exit silently if no input.
        return;
    }

    // Split the entire input block into individual lines.
    // Filtering Boolean removes any empty strings that might result from extra newlines.
    const dataLines = trimmedInput.split('\n').filter(Boolean);

    // Another guard clause: If there are no meaningful lines, exit.
    if (dataLines.length === 0) {
        return;
    }

    // The first line contains configuration parameters, typically dimensions.
    // We expect two numbers: number of rows and number of columns.
    // Using `map(Number)` to convert string parts to actual numbers.
    const configParameters = dataLines[0].split(' ').map(Number);

    // Validate config parameters exist and are numbers.
    if (configParameters.length < 2 || isNaN(configParameters[0]) || isNaN(configParameters[1])) {
        // Handle malformed configuration line.
        console.error("Error: Invalid grid configuration line.");
        return;
    }

    // The actual grid data starts from the second line onwards.
    // Using slice to create a new array without modifying `dataLines`.
    const actualGridContent = dataLines.slice(1);

    // Transform the array of strings (each string representing a row)
    // into a 2D array where each inner array is a row of cell values.
    const processedGridMatrix = parseRowStringsIntoMatrix(actualGridContent);

    // Extract the number of columns from the configuration parameters, as it's used in the search loop.
    const expectedColumnCount = configParameters[1];

    // Iterate through each row of the processed grid matrix.
    for (let currentGridRow = 0; currentGridRow < processedGridMatrix.length; ++currentGridRow) {
        // Iterate through each column in the current row, up to the expected column count.
        // This ensures we don't go out of bounds if rows have more elements than specified,
        // or handle shorter rows gracefully by stopping early.
        for (let currentGridColumn = 0; currentGridColumn < expectedColumnCount; ++currentGridColumn) {
            // Check if the current cell value matches our target keyword "snuke".
            // Using strict equality (===) for robust comparison.
            if (processedGridMatrix[currentGridRow][currentGridColumn] === "snuke") {
                // If "snuke" is found, calculate its display coordinates.
                // Column is represented by a letter (A, B, C...) based on its 0-indexed position.
                const columnDisplayChar = String.fromCharCode('A'.charCodeAt(0) + currentGridColumn);
                // Row is 1-indexed for display purposes.
                const rowDisplayNumber = currentGridRow + 1;

                // Output the found location in the format "ColumnLetterRowNumber".
                console.log(`${columnDisplayChar}${rowDisplayNumber}`);

                // Once "snuke" is found in a row, we can stop searching this row.
                // The original code only breaks the inner loop, implying it looks for the first "snuke" per row.
                // If it were to find *all* snukes, this break would be removed.
                // Sticking to original behavior: find first snuke in a row, then move to next row.
                break;
            }
        }
    }
}

/**
 * Helper function to convert an array of strings (where each string is a row
 * with space-separated values) into a 2D array (matrix).
 * @param {string[]} rowStrings - An array where each element is a string representing a row.
 * @returns {string[][]} A 2D array where each inner array is a row of cell values.
 */
function parseRowStringsIntoMatrix(rowStrings) {
    // Use the map function for a more functional and concise transformation.
    // Each row string is split by spaces to form an array of cell values.
    return rowStrings.map(singleRowText => singleRowText.split(' '));
}

// Entry point for execution:
// Reads the content of /dev/stdin synchronously, converts it to UTF-8,
// trims whitespace, and passes it to the main processing function.
ExecuteGridSearch(require("fs").readFileSync("/dev/stdin", "utf8").trim());