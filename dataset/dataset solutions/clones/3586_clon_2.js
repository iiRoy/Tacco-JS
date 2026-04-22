// Initialize global data storage for the grid, a counter for valid rows, and a general-purpose loop iterator.
let gridData = [];
let validRowCount = 0;
let loopCounter = 0;

/*
 * This function performs a matrix transposition operation.
 * It effectively swaps the rows and columns of a 2D array.
 *
 * @param {Array<Array>} inputMatrix - The two-dimensional array (matrix) to be transformed.
 * @returns {Array<Array>} A new 2D array representing the transposed matrix.
 */
const rotateMatrix = (inputMatrix) =>
  inputMatrix[0].map(
    (
      _placeholder, // An unused parameter representing the column value (we only need the index).
      colIndex // The current column index we are processing.
    ) =>
      inputMatrix.map(
        (
          rowData // The current row (an array of elements) from the input matrix.
        ) => rowData[colIndex] // Extract the element at the current column index from each row.
      )
  );

/**
 * Determines if all elements within a given array are the specific character ".".
 * This is used to identify arrays that are considered "empty" or filled with placeholder characters.
 *
 * @param {Array<string>} targetArray - The array of characters to be evaluated.
 * @returns {boolean} Returns `true` if every element is ".", otherwise returns `false`.
 */
const isRowEmpty = (targetArray) =>
  targetArray.every(
    (
      elementValue // The current character element being checked.
    ) => elementValue === "." // Comparison to the placeholder character.
  );

/*
 * The primary function to execute the data processing logic.
 * It takes raw input, processes it into a grid, filters out empty rows/columns,
 * and then prints the refined grid.
 *
 * @param {string} rawInputText - The complete raw input provided as a single string.
 */
function ProcessInputData(rawInputText) {
  // First, split the entire input string into an array of individual lines.
  // Each line typically represents a row in the initial grid.
  let lineSegments = rawInputText.split("\n");

  // Iterate through the input lines, starting from the second line (index 1).
  // The first line is often a header or ignored in this specific processing.
  for (
    loopCounter = 1;
    loopCounter <= lineSegments.length - 1;
    loopCounter++
  ) {
    // For each relevant line, split it into an array of characters.
    // This forms a row in our `gridData`.
    gridData[validRowCount] = lineSegments[loopCounter].split("");

    // Check if the newly added row is not entirely composed of "." characters.
    // If it contains actual data (not just placeholders), increment the valid row counter.
    if (!isRowEmpty(gridData[validRowCount])) {
      validRowCount++;
    }
  }

  // Perform the first transposition. This effectively turns columns into rows,
  // allowing us to easily filter out empty columns in the next step.
  gridData = rotateMatrix(gridData);

  // Iterate through the transposed grid to identify and remove "empty" columns.
  // The loop counter is conditionally incremented to handle `splice` operations correctly.
  for (loopCounter = 0; loopCounter < gridData.length; ) {
    // If the current "row" (which was an original column) is entirely empty, remove it.
    if (isRowEmpty(gridData[loopCounter])) {
      gridData.splice(loopCounter, 1);
    } else {
      // Otherwise, if it's a valid column, move to the next one.
      loopCounter++;
    }
  }

  // Perform the second transposition to restore the grid to its original row/column orientation.
  // At this point, both empty rows and empty columns have been trimmed.
  gridData = rotateMatrix(gridData);

  // Finally, iterate through the processed grid and print each row to the console.
  // Each row (an array of characters) is joined back into a single string before printing.
  for (loopCounter = 0; loopCounter < gridData.length; loopCounter++) {
    console.log(gridData[loopCounter].join(""));
  }
}

// Read the input from standard input (e.g., from a pipe or file redirection)
// using Node.js's file system module, and then pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));