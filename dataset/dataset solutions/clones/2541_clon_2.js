function ProcessInput(inputString) {
    // Process the raw input string to extract parameters.
    inputString = inputString.split("\n")[0];

    // Parse the four integer values from the first line of input.
    // These represent height, width, and two split points.
    let heightVal = parseInt(inputString.split(" ")[0], 10);
    let widthVal = parseInt(inputString.split(" ")[1], 10);
    let splitA = parseInt(inputString.split(" ")[2], 10);
    let splitB = parseInt(inputString.split(" ")[3], 10);

    // Initialize a temporary array for building each row.
    // It will be filled with zeros initially.
    let currentRowData = new Array(widthVal).fill(0);
    // This array will store the final generated matrix (2D array).
    let resultMatrix = [];

    // Iterate through each row of the matrix.
    for (let rowIndex = 0; rowIndex < heightVal; rowIndex++) {
        // Iterate through each column in the current row.
        for (let colIndex = 0; colIndex < widthVal; colIndex++) {
            // Determine the value for the current cell based on its position
            // relative to the split points (splitA and splitB).

            // Top-left quadrant (before splitA horizontally, before splitB vertically)
            if (colIndex < splitA && rowIndex < splitB) {
                currentRowData[colIndex] = 0;
            }
            // Top-right quadrant (at or after splitA horizontally, before splitB vertically)
            else if (colIndex >= splitA && rowIndex < splitB) {
                currentRowData[colIndex] = 1;
            }
            // Bottom-left quadrant (before splitA horizontally, at or after splitB vertically)
            else if (colIndex < splitA && rowIndex >= splitB) {
                currentRowData[colIndex] = 1;
            }
            // Bottom-right quadrant (at or after splitA horizontally, at or after splitB vertically)
            else if (colIndex >= splitA && rowIndex >= splitB) {
                currentRowData[colIndex] = 0;
            }
        }
        // After populating the current row, add a copy of it to the result matrix.
        // Using .slice() ensures a deep copy of the row array.
        resultMatrix[rowIndex] = currentRowData.slice();
        // Reset the temporary row array for the next iteration.
        currentRowData.fill(0);
    }

    // Output the generated matrix row by row.
    // Each row's elements are joined without a separator.
    for (let rowIndex = 0; rowIndex < heightVal; rowIndex++) {
        console.log(resultMatrix[rowIndex].join(""));
    }
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
