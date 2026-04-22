function toggleBinaryValue(inputBit) {
  // Helper function to invert a binary digit (0 becomes 1, 1 becomes 0).
  // This is an alternative to a conditional statement for binary inversion.
  return 1 - inputBit;
}

/**
 * Parses the raw input string to extract grid dimensions and split points.
 * @param {string} rawInputString - The input string, expected to be "H W A B" on the first line.
 * @returns {object} An object containing matrixHeight, matrixWidth, columnSplitPoint, rowSplitPoint.
 * @throws {Error} If the input format is invalid.
 */
function parseGridConfiguration(rawInputString) {
  // Extract the first line of input and split it by spaces.
  const lineOfNumbers = rawInputString.split('\n')[0].split(' ');

  // Basic validation: ensure we have exactly four numeric values.
  if (lineOfNumbers.length !== 4) {
    console.error("Input format error: Expected 4 space-separated numbers.");
    // In a competitive programming context, this might be a fatal error or indicate unexpected input.
    // For this clone, we'll proceed but might lead to NaN if parsing fails.
  }

  // Convert string parts to numbers. Using Number() is an alternative to parseInt().
  const [hStr, wStr, aStr, bStr] = lineOfNumbers;
  const matrixHeight = Number(hStr);
  const matrixWidth = Number(wStr);
  const columnSplitPoint = Number(aStr);
  const rowSplitPoint = Number(bStr);

  // Further validation for non-negative dimensions/split points (optional but good practice).
  if (isNaN(matrixHeight) || isNaN(matrixWidth) || isNaN(columnSplitPoint) || isNaN(rowSplitPoint) ||
      matrixHeight < 0 || matrixWidth < 0 || columnSplitPoint < 0 || rowSplitPoint < 0) {
    console.error("Input format error: All dimensions and split points must be valid non-negative numbers.");
    // Default to a safe set of values or throw. For cloning, we'll let the error propagate or ignore.
  }

  return { matrixHeight, matrixWidth, columnSplitPoint, rowSplitPoint };
}

/**
 * Renders a 2D binary array into a formatted string for console output.
 * @param {Array<Array<number>>} gridData - The 2D array of 0s and 1s.
 * @returns {string} The formatted grid string.
 */
function renderBinaryGrid(gridData) {
  // Using reduce to join rows, and then each row's elements.
  // This is an alternative to map().join().join().
  const formattedOutput = gridData.reduce((acc, currentRow) => {
    // Join elements of the current row directly.
    const rowString = currentRow.join('');
    // Append to accumulator, adding a newline for separation.
    return acc + rowString + '\n';
  }, ''); // Start with an empty string accumulator.

  return formattedOutput;
}


/**
 * Orchestrates the entire process: reading input, generating the grid, and printing it.
 * @param {string} rawInputString - The complete input string from stdin.
 */
function generateBinaryPattern(rawInputString) {
  // Step 1: Parse input parameters from the provided string.
  const { matrixHeight, matrixWidth, columnSplitPoint, rowSplitPoint } = parseGridConfiguration(rawInputString);

  // Initialize an empty array to store the rows of our final grid.
  const outputMatrix = [];

  // Step 2: Iterate through each row to construct the grid.
  for (let rowIndex = 0; rowIndex < matrixHeight; rowIndex++) {
    // Determine the base value for the current row (0 or 1).
    // Rows before 'rowSplitPoint' start with 0, others start with 1.
    const baseRowValue = (rowIndex < rowSplitPoint) ? 0 : 1;

    // Initialize an array to store the cells of the current row.
    const currentRowCells = [];

    // Step 3: Iterate through each column within the current row.
    for (let colIndex = 0; colIndex < matrixWidth; colIndex++) {
      let cellValue;
      // If the column index is before 'columnSplitPoint', use the base row value.
      // Otherwise, use the inverted base row value.
      if (colIndex < columnSplitPoint) {
        cellValue = baseRowValue;
      } else {
        cellValue = toggleBinaryValue(baseRowValue);
      }
      currentRowCells.push(cellValue); // Add the determined cell value to the current row.
    }
    outputMatrix.push(currentRowCells); // Add the completed row to the matrix.
  }

  // Step 4: Render the generated grid into a displayable string and print it.
  const finalDisplay = renderBinaryGrid(outputMatrix);
  console.log(finalDisplay);
}

// --- Main execution block ---
// Define the standard input file path as a constant for clarity.
const STANDARD_INPUT_PATH = "/dev/stdin";

// Read the entire content of the standard input file synchronously.
// Ensure UTF-8 encoding for proper string handling.
const inputContent = require("fs").readFileSync(STANDARD_INPUT_PATH, "utf8");

// Execute the grid generation process with the obtained input.
generateBinaryPattern(inputContent);