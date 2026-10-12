// This utility function flips a binary digit (0 to 1, 1 to 0).
function flipBinary(inputBit) {
  return inputBit === 0 ? 1 : 0; // If the input is zero, return one; otherwise, return zero.
}

/**
 * Main processing function for the given raw input string.
 * It parses dimensions and split points, then generates a binary matrix.
 * @param {string} rawData - The input string containing grid dimensions and split coordinates.
 */
function ProcessInput(rawData) {
  // Parse the first line of the input to extract numerical parameters.
  // The input is expected to be a single line of space-separated integers.
  const parsedValues = rawData.split("\n")[0].split(" ").map((currentVal) => (parseInt(currentVal)));

  // Output the initially parsed numerical values to the console.
  console.log(parsedValues);

  // Extract the grid dimensions and split points from the parsed array.
  const heightDim = parsedValues[0]; // Represents the total number of rows in the grid.
  const widthDim = parsedValues[1];  // Represents the total number of columns in the grid.
  const colSplit = parsedValues[2];  // Represents the column index where the pattern changes.
  const rowSplit = parsedValues[3];  // Represents the row index where the pattern changes.

  // Generate the 2D binary matrix based on the extracted dimensions and split points.
  // The outer map iterates through rows, and the inner map iterates through columns.
  const resultMatrix = [...Array(heightDim).keys()] // Create an array of row indices (0 to heightDim-1).
    .map((rowIndex) => rowIndex < rowSplit ? 0 : 1) // Determine the base value for each row: 0 if before rowSplit, 1 otherwise.
    .map((rowInitialValue) => {
      // For each row's base value, generate its columns.
      return [...Array(widthDim).keys()].map((colIndex) =>
        // Apply column split logic: if before colSplit, use rowInitialValue; otherwise, flip it.
        colIndex < colSplit ? rowInitialValue : flipBinary(rowInitialValue)
      );
    });

  // Format the resulting matrix into a string for console output.
  // Each row's elements are joined without separators, and rows are joined by newline characters.
  // An additional newline is appended at the very end.
  console.log(resultMatrix.map((rowArray) => rowArray.join("")).join("\n") + "\n");
}

// Read input from standard input (typically /dev/stdin in competitive programming environments)
// and pass the content as a UTF-8 string to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
