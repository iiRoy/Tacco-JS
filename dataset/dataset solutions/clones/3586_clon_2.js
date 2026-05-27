let matrixData = [];
let rowIndex = 0;
let loopCounter = 0;

// Function to rotate a 2D array (matrix) by 90 degrees clockwise.
const rotateMatrix = (inputGrid) => inputGrid[0].map((_, colIndex) => inputGrid.map((rowEntry) => rowEntry[colIndex]));

// Function to check if a given array (row or column) consists only of '.' characters.
const isRowOrColEmpty = (inputArray) => inputArray.every((elementValue) => elementValue === '.');

function ProcessInput(rawData) {
    // Split the raw input string into an array of lines.
    let processedLines = rawData.split("\n");

    // Iterate through the input lines, starting from the second line (index 1).
    // The first line is often metadata and not part of the grid.
    for (loopCounter = 1; loopCounter <= processedLines.length - 1; loopCounter++) {
        // Split each line into an array of characters and store it in our matrix.
        matrixData[rowIndex] = processedLines[loopCounter].split("");
        // If the current row is not entirely empty (i.e., doesn't consist only of '.'),
        // then increment the row index for the next valid row.
        if (!isRowOrColEmpty(matrixData[rowIndex])) {
            rowIndex++;
        }
    }

    // Transpose the matrix to process columns as rows.
    matrixData = rotateMatrix(matrixData);

    // Iterate through the transposed matrix to remove empty columns.
    // We use a while loop because `splice` changes the array length and indices.
    for (loopCounter = 0; loopCounter < matrixData.length;) {
        // If the current "row" (which was an original column) is empty, remove it.
        if (isRowOrColEmpty(matrixData[loopCounter])) {
            matrixData.splice(loopCounter, 1);
        }
        // Otherwise, move to the next "row".
        else {
            loopCounter++;
        }
    }

    // Transpose the matrix back to its original orientation.
    matrixData = rotateMatrix(matrixData);

    // Print the resulting matrix, joining each row's characters back into a string.
    for (loopCounter = 0; loopCounter < matrixData.length; loopCounter++) {
        console.log(matrixData[loopCounter].join(''));
    }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
