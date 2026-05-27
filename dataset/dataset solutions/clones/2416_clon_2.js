"use strict"; // Enforce strict parsing and error handling for robust code.

// DATA_READER is an Immediately Invoked Function Expression (IIFE)
// that provides methods for parsing input data from a string.
const DATA_READER = (function () {
  // This factory function creates and returns a new InputHandler instance.
  function createReader(rawContent) {
    return new InputHandler(rawContent);
  }

  // The InputHandler constructor initializes the internal state for reading.
  function InputHandler(rawContent) {
    this._textLines = rawContent.trim().split("\n"); // Store input as an array of lines.
    this._linePointer = 0; // Keep track of the current line being processed.
  }

  // Prototype method to fetch a single value from the current line.
  // 'isText' flag determines if the value should be returned as a string or number.
  InputHandler.prototype.fetchItem = function (isText) {
    const linesRef = this._textLines; // Reference to the array of lines.
    let pointerRef = this._linePointer; // Current line index.
    let extractedValue; // Variable to hold the popped value.

    // If the current line is still a single string, split it into items and reverse.
    // Reversing allows efficient popping from the end.
    if (typeof linesRef[pointerRef] === "string") {
      linesRef[pointerRef] = linesRef[pointerRef].split(" ").reverse();
    }

    // Extract the last item from the current line's array.
    extractedValue = linesRef[pointerRef].pop();

    // If the current line is now empty, advance the line pointer.
    if (!linesRef[pointerRef].length) {
      this._linePointer++;
    }

    // Return the value, converting to a number if 'isText' is false.
    return isText ? extractedValue : +extractedValue;
  };

  // Prototype method to fetch all values from the current line.
  // 'isText' flag determines if values should be returned as strings or numbers.
  InputHandler.prototype.fetchLine = function (isText) {
    const currentLineContent = this._textLines[this._linePointer++]; // Get line and advance pointer.
    const valuesOnLine = currentLineContent.split(" "); // Split the line into individual values.
    // Return values, mapping to numbers if 'isText' is false.
    return isText ? valuesOnLine : valuesOnLine.map((val) => +val);
  };

  // Prototype method to fetch a matrix (2D array) of values.
  // 'rowCount' specifies how many lines to read.
  // 'isText' flag determines if values should be returned as strings or numbers.
  InputHandler.prototype.fetchMatrix = function (rowCount, isText) {
    // Slice the required number of lines and split each into an array of strings.
    const matrixData = this._textLines
      .slice(this._linePointer, (this._linePointer += rowCount))
      .map((lineStr) => lineStr.split(" "));

    // Return the matrix, mapping inner values to numbers if 'isText' is false.
    return isText
      ? matrixData
      : matrixData.map((rowArr) => rowArr.map((val) => +val));
  };

  // Prototype method to fetch a specified number of raw lines.
  // 'lineCount' specifies how many lines to read.
  // 'isText' flag determines if values should be returned as strings or numbers.
  InputHandler.prototype.fetchRawLines = function (lineCount, isText) {
    // Slice the required number of lines.
    const rawLineData = this._textLines.slice(
      this._linePointer,
      (this._linePointer += lineCount)
    );
    // Return lines, mapping to numbers if 'isText' is false.
    return isText ? rawLineData : rawLineData.map((val) => +val);
  };

  return createReader; // The IIFE returns the factory function.
})();

// Create an instance of the input handler, reading from standard input.
const inputHandler = DATA_READER(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

// Function to dynamically create a multi-dimensional array.
// 'fillValue' is the initial value for all elements.
// Subsequent arguments are the dimensions of the array.
function initializeGrid(fillValue) {
  const dimensionsArgs = arguments; // Access all arguments.
  let argLength = dimensionsArgs.length; // Number of arguments.
  // Start building the array creation string from the innermost dimension.
  let arrayCreationString =
    "Array(dimensionsArgs[" +
    --argLength +
    "]).fill(0).map(x=>{return " +
    fillValue +
    ";})";
  // Loop to build up the outer dimensions.
  while (--argLength) {
    arrayCreationString =
      "Array(dimensionsArgs[" + argLength + "]).fill(0).map(x=>" +
      arrayCreationString +
      ")";
  }
  // Use eval to execute the dynamically constructed array creation string.
  return eval(arrayCreationString);
}

// Global variables to store the output matrix and the input character matrix.
let outputMatrix, charMatrix;

// Execute the main solution logic and print the result to console.
console.log(mainSolution());

// The main function orchestrates the problem-solving process.
function mainSolution() {
  const gridHeight = inputHandler.fetchItem(); // Read the height of the grid.
  const gridWidth = inputHandler.fetchItem(); // Read the width of the grid.
  const targetCount = inputHandler.fetchItem(); // Read the target count of '#' characters.

  charMatrix = inputHandler.fetchRawLines(gridHeight, true); // Read the character grid as strings.
  outputMatrix = initializeGrid(1, gridHeight, gridWidth); // Initialize output grid with 1s.

  // Start the recursive process to divide and assign IDs to subgrids.
  processSubgrid(0, 0, gridHeight, gridWidth, 1, targetCount);

  // Format the output matrix into a space-separated, newline-joined string.
  return outputMatrix.map((row) => row.join(" ")).join("\n");
}

// Recursive function to process a subgrid and assign IDs.
// (startY, startX): Top-left coordinates of the current subgrid.
// (currentHeight, currentWidth): Dimensions of the current subgrid.
// currentId: The starting ID to assign within this subgrid.
// subgridTargetCount: The number of '#' characters expected in this subgrid.
function processSubgrid(
  startY,
  startX,
  currentHeight,
  currentWidth,
  currentId,
  subgridTargetCount
) {
  // Base case: If only one '#' is needed, fill the entire subgrid with the current ID.
  if (subgridTargetCount === 1) {
    for (let rowIter = startY; rowIter < currentHeight; rowIter++) {
      for (let colIter = startX; colIter < currentWidth; colIter++) {
        outputMatrix[rowIter][colIter] = currentId;
      }
    }
    return;
  }

  // Initialize arrays to count '#' characters in rows and columns relative to the subgrid.
  const rowHashCounts = initializeGrid(0, currentHeight - startY);
  const colHashCounts = initializeGrid(0, currentWidth - startX);

  // Populate rowHashCounts and colHashCounts for the current subgrid.
  for (let rowIter = startY; rowIter < currentHeight; rowIter++) {
    for (let colIter = startX; colIter < currentWidth; colIter++) {
      if (charMatrix[rowIter][colIter] === "#") {
        rowHashCounts[rowIter - startY]++; // Increment count for relative row.
        colHashCounts[colIter - startX]++; // Increment count for relative column.
      }
    }
  }

  // Compute prefix sums for row hash counts.
  for (let rowIter = startY + 1; rowIter < currentHeight; rowIter++) {
    rowHashCounts[rowIter - startY] += rowHashCounts[rowIter - startY - 1];
  }
  // Compute prefix sums for column hash counts.
  for (let colIter = startX + 1; colIter < currentWidth; colIter++) {
    colHashCounts[colIter - startX] += colHashCounts[colIter - startX - 1];
  }

  // If the subgrid is only one column wide, a horizontal split is impossible; force a vertical split.
  if (startX + 1 === currentWidth) {
    return splitVertically(
      startY,
      startX,
      currentHeight,
      currentWidth,
      currentId,
      subgridTargetCount,
      rowHashCounts
    );
  }

  // Attempt to find a horizontal split point (a vertical line).
  // Calculate a potential split point (midpoint) relative to the subgrid's startX.
  let splitXCoord = (startX + currentWidth) >> 1; // Integer division for midpoint.
  splitXCoord -= startX; // Convert to a 0-indexed relative coordinate within the subgrid.

  // Adjust splitXCoord if it falls on a column with zero '#' characters.
  if (colHashCounts[splitXCoord] === 0) {
    while (++splitXCoord) {
      if (colHashCounts[splitXCoord] !== 0) break; // Find the first column with '#'s.
    }
    // If, after adjustment, this split point contains all '#'s, then split vertically instead.
    if (colHashCounts[splitXCoord] === subgridTargetCount) {
      return splitVertically(
        startY,
        startX,
        currentHeight,
        currentWidth,
        currentId,
        subgridTargetCount,
        rowHashCounts
      );
    }
  }

  // Adjust splitXCoord if it falls on a column that contains all '#' characters.
  if (colHashCounts[splitXCoord] === subgridTargetCount) {
    while (--splitXCoord) {
      if (colHashCounts[splitXCoord] !== subgridTargetCount) break; // Find the last column that doesn't contain all '#'s.
    }
    // If, after adjustment, this split point is empty or contains all '#'s, split vertically instead.
    if (
      colHashCounts[splitXCoord] === 0 ||
      colHashCounts[splitXCoord] === subgridTargetCount
    ) {
      return splitVertically(
        startY,
        startX,
        currentHeight,
        currentWidth,
        currentId,
        subgridTargetCount,
        rowHashCounts
      );
    }
  }

  // Perform a horizontal split: recursively process the left and right subgrids.
  // Left subgrid: from startX to (splitXCoord + startX + 1).
  processSubgrid(
    startY,
    startX,
    currentHeight,
    splitXCoord + startX + 1, // New width for the left part.
    currentId,
    colHashCounts[splitXCoord] // Number of '#' in the left part.
  );
  // Right subgrid: from (splitXCoord + startX + 1) to currentWidth.
  processSubgrid(
    startY,
    splitXCoord + startX + 1, // New starting X for the right part.
    currentHeight,
    currentWidth,
    currentId + colHashCounts[splitXCoord], // New ID for the right part.
    subgridTargetCount - colHashCounts[splitXCoord] // Remaining '#' for the right part.
  );
}

// Helper function to perform a vertical split (a horizontal line).
// Parameters are consistent with processSubgrid.
function splitVertically(
  startY,
  startX,
  currentHeight,
  currentWidth,
  currentId,
  subgridTargetCount,
  rowHashCounts
) {
  // Attempt to find a vertical split point (a horizontal line).
  // Calculate a potential split point (midpoint) relative to the subgrid's startY.
  let splitYCoord = (startY + currentHeight) >> 1; // Integer division for midpoint.
  splitYCoord -= startY; // Convert to a 0-indexed relative coordinate within the subgrid.

  // Adjust splitYCoord if it falls on a row with zero '#' characters.
  if (rowHashCounts[splitYCoord] === 0) {
    while (++splitYCoord) {
      if (rowHashCounts[splitYCoord] !== 0) break; // Find the first row with '#'s.
    }
  }
  // Adjust splitYCoord if it falls on a row that contains all '#' characters.
  else if (rowHashCounts[splitYCoord] === subgridTargetCount) {
    while (--splitYCoord) {
      if (rowHashCounts[splitYCoord] !== subgridTargetCount) break; // Find the last row that doesn't contain all '#'s.
    }
  }

  // Perform a vertical split: recursively process the top and bottom subgrids.
  // Top subgrid: from startY to (splitYCoord + startY + 1).
  processSubgrid(
    startY,
    startX,
    splitYCoord + startY + 1, // New height for the top part.
    currentWidth,
    currentId,
    rowHashCounts[splitYCoord] // Number of '#' in the top part.
  );
  // Bottom subgrid: from (splitYCoord + startY + 1) to currentHeight.
  processSubgrid(
    splitYCoord + startY + 1, // New starting Y for the bottom part.
    startX,
    currentHeight,
    currentWidth,
    currentId + rowHashCounts[splitYCoord], // New ID for the bottom part.
    subgridTargetCount - rowHashCounts[splitYCoord] // Remaining '#' for the bottom part.
  );
}
