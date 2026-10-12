var gridHeight = 0; // Global variable to store the height of the grid
var gridWidth = 0; // Global variable to store the width of the grid

/**
 * Main function to process the input data, manipulate the grid, and display the result.
 * @param {string} rawInputString - The raw input string from stdin.
 */
function processInputData(rawInputString) {
  // Split the input string by newlines to get individual lines.
  // The first line contains grid dimensions (H W).
  const inputLines = rawInputString.split("\n");

  // Parse grid dimensions from the first line.
  const dimensions = inputLines[0].split(" ");
  gridHeight = dimensions[0];
  gridWidth = dimensions[1];

  // Initialize the character grid from the remaining input lines.
  // Filter out the first line (dimensions) and any empty lines.
  var characterGrid = initializeCharacterGrid(
    inputLines.filter((currentInputLine, idx) => {
      return idx !== 0; // Exclude the first line containing H and W
    })
  );

  // Iterate through rows to mark them for removal if they are entirely '.' or 'n'.
  for (var rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
    characterGrid = markGridRowForExclusion(characterGrid, rowIndex);
  }

  // Transpose the matrix to process columns as if they were rows.
  characterGrid = performMatrixTransposition(characterGrid);

  // Iterate through "new" rows (original columns) to mark them for removal.
  for (var colIndex = 0; colIndex < gridWidth; colIndex++) {
    characterGrid = markGridRowForExclusion(characterGrid, colIndex);
  }

  // Transpose the matrix back to its original orientation before printing.
  displayProcessedGrid(performMatrixTransposition(characterGrid));
}

/**
 * Prints the processed grid, skipping rows that are entirely marked for removal.
 * @param {Array<Array<string>>} outputArray - The 2D array representing the grid to print.
 */
function displayProcessedGrid(outputArray) {
  outputArray.forEach(outputRow => {
    // Check if the current row consists only of 'n' characters.
    const isRowCompletelyEmpty = outputRow.reduce((accumulator, cellContent) => accumulator && cellContent === "n", !false); // !false is equivalent to true
    
    // If the row is not completely empty, print its non-'n' elements.
    if (!isRowCompletelyEmpty) {
      console.log(outputRow.filter(validCell => validCell !== "n").join(""));
    }
  });
}

/**
 * Marks a row in the grid for exclusion if it contains only '.' or 'n' characters.
 * @param {Array<Array<string>>} currentGridState - The current state of the grid.
 * @param {number} targetRowIndex - The index of the row to check and potentially mark.
 * @returns {Array<Array<string>>} The grid with the specified row marked as 'n' if it was removable, otherwise the original grid.
 */
function markGridRowForExclusion(currentGridState, targetRowIndex) {
  // Determine if the target row is entirely composed of '.' or 'n'.
  const isTargetRowFullyRemovable = currentGridState[targetRowIndex].reduce(
    (removabilityAccumulator, cellContent) => removabilityAccumulator && (cellContent === "." || cellContent === "n"),
    true
  );

  // If the row is not fully removable, return the grid as is.
  if (!isTargetRowFullyRemovable) {
    return currentGridState;
  }

  // If the row is fully removable, create a new grid where cells in the target row are marked 'n'.
  return currentGridState.map((gridRowToProcess, currentRowIndex) => {
    return gridRowToProcess.map(cellValueInRow => {
      return currentRowIndex === targetRowIndex ? "n" : cellValueInRow;
    });
  });
}

/**
 * Transposes a given 2D matrix (swaps rows and columns).
 * @param {Array<Array<string>>} originalMatrix - The matrix to transpose.
 * @returns {Array<Array<string>>} The transposed matrix.
 */
function performMatrixTransposition(originalMatrix) {
  const originalRowsCount = originalMatrix.length;
  const originalColsCount = originalMatrix[0].length;

  // Initialize a new matrix with dimensions swapped (cols x rows).
  // The first row of the original matrix determines the number of columns for the new matrix.
  var transposedResult = originalMatrix[0].map(element => new Array(originalRowsCount));

  // Populate the transposed matrix.
  for (var rowIterator = 0; rowIterator < originalRowsCount; rowIterator++) {
    for (var colIterator = 0; colIterator < originalColsCount; colIterator++) {
      transposedResult[colIterator][rowIterator] = originalMatrix[rowIterator][colIterator];
    }
  }
  return transposedResult;
}

/**
 * Initializes a 2D character grid from an array of input line strings.
 * Filters out empty lines and splits each valid line into an array of characters.
 * @param {Array<string>} inputLinesArray - An array of strings, each representing a row of the grid.
 * @returns {Array<Array<string>>} The initialized 2D character grid.
 */
function initializeCharacterGrid(inputLinesArray) {
  return inputLinesArray
    .filter(lineString => {
      // Ensure the line is not empty before processing.
      return lineString.split("").length > 0;
    })
    .map(lineString => {
      // Split each valid line into an array of individual characters.
      return lineString.split("");
    });
}

// Read input from stdin and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
