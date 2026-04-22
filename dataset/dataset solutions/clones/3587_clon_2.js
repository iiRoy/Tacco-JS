let verticalDimension = 0; // Holds the total number of rows for the grid structure
let horizontalDimension = 0; // Holds the total number of columns for the grid structure

/**
 * This is the primary function that processes the entire input.
 * It parses dimensions, initializes the data grid, performs row/column marking,
 * and finally displays the filtered output.
 * @param {string} incomingText - The complete raw text input.
 */
function orchestrateProcessing(incomingText) {
  // Extracting grid dimensions from the initial line of the input
  const dimensionParts = incomingText.split("\n")[0].split(" ");
  verticalDimension = dimensionParts[0]; // Assigning the height
  horizontalDimension = dimensionParts[1]; // Assigning the width

  // Constructing the initial 2D character array (grid)
  let dataGrid = buildInitialStructure(
    incomingText.split("\n").filter((currentLine, lineIndex) => {
      // We skip the first line as it contains only dimensions
      return lineIndex !== 0;
    })
  );

  // First pass: Iterating through each row to identify and mark rows for exclusion
  for (let rowIterator = 0; rowIterator < verticalDimension; rowIterator++) {
    dataGrid = markRowForExclusion(dataGrid, rowIterator);
  }

  // Rotating the grid (transposing) to treat columns as rows for the next pass
  dataGrid = rotateGrid(dataGrid);

  // Second pass: Iterating through the 'new' rows (original columns) to mark columns for exclusion
  for (let colIterator = 0; colIterator < horizontalDimension; colIterator++) {
    dataGrid = markRowForExclusion(dataGrid, colIterator);
  }

  // Rotating the grid back to its original orientation and then displaying the final result
  displayProcessedGrid(rotateGrid(dataGrid));
}

/**
 * Renders the final processed grid to the console.
 * It filters out any completely marked rows and the individual marked cells.
 * @param {Array<Array<string>>} finalGrid - The 2D array ready for display.
 */
function displayProcessedGrid(finalGrid) {
  finalGrid.forEach((currentRow) => {
    // Check if the current row consists entirely of 'X' (marked) cells
    const shouldSkipRowOutput = currentRow.reduce((accumulator, cellContent) => accumulator && cellContent === "X", true);

    // Only print if the row is not entirely marked for skipping
    if (!shouldSkipRowOutput) {
      console.log(currentRow.filter((elementValue) => elementValue !== "X").join(""));
    }
  });
}

/**
 * Examines a specified row in the matrix. If the row contains only 'E' (empty) or 'X' (already marked) cells,
 * it marks all cells in that row as 'X' (excluded). Otherwise, the row remains unchanged.
 * @param {Array<Array<string>>} inputMatrix - The 2D array being modified.
 * @param {number} targetRowIndex - The index of the row to evaluate.
 * @returns {Array<Array<string>>} The matrix with the potentially modified row.
 */
function markRowForExclusion(inputMatrix, targetRowIndex) {
  // Verify if the row contains only empty ('E') or already excluded ('X') cells
  const isRowEligibleForMarking = inputMatrix[targetRowIndex].reduce(
    (currentAccumulator, cellValue) => currentAccumulator && (cellValue === "E" || cellValue === "X"),
    true
  );

  // If the row does not meet the criteria for marking, return the matrix as is
  if (!isRowEligibleForMarking) return inputMatrix;

  // If the row is eligible, create a new matrix where all cells in the target row are 'X'
  return inputMatrix.map((rowEntry, currentEntryIndex) => {
    return rowEntry.map((cellEntry) => {
      // If this is the row to be marked, set all its cells to 'X'
      return currentEntryIndex === targetRowIndex ? "X" : cellEntry;
    });
  });
}

/**
 * Performs a matrix transposition, swapping the rows and columns of a 2D array.
 * @param {Array<Array<string>>} sourceMatrix - The 2D array to be transposed.
 * @returns {Array<Array<string>>} The newly transposed 2D array.
 */
function rotateGrid(sourceMatrix) {
  const initialRowCount = sourceMatrix.length; // Original number of rows
  const initialColCount = sourceMatrix[0].length; // Original number of columns

  // Prepare a new matrix with dimensions swapped (columns become rows, rows become columns)
  const transposedMatrix = sourceMatrix[0].map((_placeholder) => new Array(initialRowCount));

  // Fill the transposed matrix by swapping indices
  for (let rowIdx = 0; rowIdx < initialRowCount; rowIdx++) {
    for (let colIdx = 0; colIdx < initialColCount; colIdx++) {
      transposedMatrix[colIdx][rowIdx] = sourceMatrix[rowIdx][colIdx];
    }
  }
  return transposedMatrix;
}

/**
 * Transforms an array of raw input strings into a 2D grid of characters.
 * It filters out any completely empty strings before processing.
 * @param {Array<string>} rawInputLines - An array of strings, each representing a line of grid data.
 * @returns {Array<Array<string>>} A 2D array where each inner array is a row of characters.
 */
function buildInitialStructure(rawInputLines) {
  return rawInputLines
    .filter((singleLine) => {
      // Only include lines that have characters after splitting
      return singleLine.split("").length > 0;
    })
    .map((individualLine) => {
      // Split each individual line string into an array of its constituent characters
      return individualLine.split("");
    });
}

// Initiate the entire process by reading input from standard input
orchestrateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));