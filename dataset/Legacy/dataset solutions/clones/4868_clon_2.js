let rawData; // Global variable to hold raw input data, if needed later.
let rowLimit; // Global variable for the number of rows in the grid.
let colLimit; // Global variable for the number of columns in the grid.

/**
 * Analyzes a grid-like input to determine path possibility based on specific rules.
 * This function processes the entire input string provided.
 * @param {string} sourceData - The complete input string, typically read from standard input.
 */
function ProcessGrid(sourceData) {
    // Divide the incoming string into an array of lines.
    sourceData = sourceData.split("\n");

    // Extract grid dimensions from the first line of the input.
    // The values are strings, but JavaScript's type coercion handles them in comparisons.
    rowLimit = sourceData[0].split(" ")[0];
    colLimit = sourceData[0].split(" ")[1];

    let previousRowState; // Variable to store the processed state of the row from the prior iteration.
    let currentRowState = sourceData[1]; // Initialize with the second line of the input as the starting current row.

    // Begin iterating through the grid rows, starting from the third line (index 2).
    // The loop continues as long as the current row index is within the defined row limit.
    for (let rowIndex = 2; rowIndex <= rowLimit; rowIndex++) {
        let hashCount = 0; // Initialize a counter for '#' characters found in the current row.
        previousRowState = currentRowState; // Update the previous row's state with the current row's state.
        currentRowState = ""; // Reset the current row's state to an empty string for rebuilding.

        // Iterate through each column of the current row.
        for (let colIndex = 0; colIndex < colLimit; colIndex++) {
            // Check if the character at the current grid position is a '#'.
            if (sourceData[rowIndex][colIndex] === "#") {
                // Condition 1: If the current position is the very last cell of the grid.
                if (rowIndex == rowLimit && colIndex == colLimit - 1) {
                    console.log("Possible"); // Output "Possible" and terminate.
                    return;
                }
                // Condition 2: Check for an "L" shape pattern that makes the path impossible.
                // This involves checking the cell to the right and the cell directly below.
                else if (colIndex + 1 <= colLimit && rowIndex + 1 <= rowLimit &&
                         sourceData[rowIndex][colIndex + 1] === "#" &&
                         sourceData[rowIndex + 1][colIndex] === "#") {
                    console.log("Impossible"); // Output "Impossible" and terminate.
                    return;
                }
                // Condition 3: If the corresponding cell in the previous row was not a '#'.
                else if (previousRowState[colIndex] !== "#") {
                    // Sub-condition: If it's the first column OR the cell to the left in the current row is not a '#'.
                    if (colIndex === 0 || (colIndex > 0 && sourceData[rowIndex][colIndex - 1] !== "#")) {
                        currentRowState += "."; // Append a '.' to the new current row state.
                        continue; // Skip to the next column.
                    }
                }
                currentRowState += "#"; // If none of the above conditions led to a 'continue' or 'return', append '#'.
                hashCount++; // Increment the count of '#' characters for the current row.
            } else {
                currentRowState += "."; // If the current cell is not '#', append '.'.
            }
        }
        // After processing all columns in a row, check if any '#' characters were found.
        if (hashCount === 0) {
            break; // If no '#' were found, break out of the outer row loop.
        }
    }
    // If the function completes without returning "Possible", then the path is "Impossible".
    console.log("Impossible");
}

// This section handles reading input from standard input and invoking the main processing function.
// It should not be modified as per the problem statement.
ProcessGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
