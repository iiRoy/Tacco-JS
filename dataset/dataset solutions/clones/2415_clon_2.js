"use strict";

const processInput = (rawData) => {
  // Prepare the raw input data by trimming and splitting into lines.
  rawData = rawData.trim().split("\n");

  // Parse the dimensions and target count from the first line.
  const firstLineParts = rawData[0].split(" ");
  const numRows = parseInt(firstLineParts[0], 10);
  const numCols = parseInt(firstLineParts[1], 10);
  const targetCount = parseInt(firstLineParts[2], 10); // This variable is parsed but not used in the logic.

  // Extract the grid data from the remaining lines.
  // Each row string is split into an array of characters.
  const gridData = rawData.slice(1, numRows + 1).map((rowStr) => rowStr.split(""));

  // Initialize the result matrix with the appropriate dimensions.
  // It will store the assigned labels for each cell.
  let resultMatrix = new Array(numRows);

  // Populate the result matrix with initial zero values.
  for (let rowIndex = 0; rowIndex < resultMatrix.length; ++rowIndex) {
    resultMatrix[rowIndex] = new Array(numCols).fill(0x0); // Using hex literal for 0
  }

  // Initialize the labeling variables.
  let currentLabel = 0x1; // Start labeling from 1 (using hex literal for 1)
  let segmentStarted = false; // Flag to track if a '#' segment has begun in the current row.

  // Iterate through each cell of the grid to assign labels.
  for (let currentRow = 0; currentRow < numRows; ++currentRow) {
    for (let currentCol = 0; currentCol < numCols; ++currentCol) {
      // If a '#' is encountered and a segment was already active,
      // increment the label and reset the segment flag.
      if (gridData[currentRow][currentCol] === "#" && segmentStarted) {
        currentLabel++;
        segmentStarted = !true; // Using boolean negation for false
      }

      // If a '#' is encountered, mark that a segment has started.
      if (gridData[currentRow][currentCol] === "#") {
        segmentStarted = !false; // Using boolean negation for true
      }

      // Assign the current label to the cell in the result matrix.
      resultMatrix[currentRow][currentCol] = currentLabel;
    }
    // After processing each row, increment the label for the next row
    // and reset the segment flag.
    currentLabel++;
    segmentStarted = !true; // Reset for the next row
  }

  // Output the final result matrix, with each row joined by a newline.
  console.log(resultMatrix.join("\n"));
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
