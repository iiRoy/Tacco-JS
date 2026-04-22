function calculateGridPaths(inputContent) {
  // This constant defines the modulo value to prevent integer overflow for large path counts.
  const PATH_MODULO_VALUE = 1000000007; // Equivalent to 1e9 + 7

  // Helper function for performing modular addition, ensuring results stay within the modulo.
  const performModularAddition = (val1, val2) => (val1 + val2) % PATH_MODULO_VALUE;

  // --- Input Processing and Validation ---
  // Clean up the input string and split it into individual lines.
  const gridLines = inputContent.trim().split('\n');

  // Type III: Add a guard clause for empty input.
  if (gridLines.length === 0) {
    return "0"; // No grid data provided, thus no paths.
  }

  // Extract grid dimensions from the first line.
  const dimensionTokens = gridLines[0].split(' ');
  const totalGridRows = parseInt(dimensionTokens[0], 10);
  const totalGridColumns = parseInt(dimensionTokens[1], 10);

  // Type III: Basic validation for parsed dimensions.
  if (isNaN(totalGridRows) || isNaN(totalGridColumns) || totalGridRows <= 0 || totalGridColumns <= 0) {
      // Invalid or non-positive grid dimensions mean no valid paths can exist.
      return "0";
  }

  // The actual grid layout starts from the second line.
  const obstacleMapLayout = gridLines.slice(1);

  // Type III: Initialize the dynamic programming table using explicit nested loops.
  // This matrix will store the number of unique paths to reach each cell.
  const pathAccumulationMatrix = [];
  for (let rCounter = 0; rCounter < totalGridRows; rCounter++) {
    const rowEntry = new Array(totalGridColumns).fill(0);
    pathAccumulationMatrix.push(rowEntry);
  }

  // --- Base Case Handling ---
  // Type III: Check if the starting cell itself is an obstacle.
  // If the origin (0,0) is blocked, no paths are possible to any cell.
  if (obstacleMapLayout[0][0] === '#') {
    return "0";
  }
  // There is exactly one way to reach the starting cell (0,0) if it's not an obstacle.
  pathAccumulationMatrix[0][0] = 1;

  // --- Dynamic Programming Calculation ---
  // Iterate through each cell of the grid to calculate path counts.
  for (let currentRowIndex = 0; currentRowIndex < totalGridRows; currentRowIndex++) {
    for (let currentColIndex = 0; currentColIndex < totalGridColumns; currentColIndex++) {

      // Type III: If the current cell is an obstacle, it cannot be reached.
      // Its path count remains 0 (from initialization), and we skip further processing for this cell.
      if (obstacleMapLayout[currentRowIndex][currentColIndex] === '#') {
        pathAccumulationMatrix[currentRowIndex][currentColIndex] = 0; // Explicitly ensure it's zero.
        continue; // Move to the next cell.
      }

      // Skip the origin cell (0,0) as its base path count is already set.
      // The subsequent `if` conditions will also correctly handle it by not adding from non-existent cells.
      if (currentRowIndex === 0 && currentColIndex === 0) {
          continue; // Already handled by initial assignment.
      }

      // Type III: Introduce intermediate variables for clearer step-by-step accumulation.
      let pathsFromCellAbove = 0;
      let pathsFromCellLeft = 0;

      // Add paths from the cell directly above, if it exists (i.e., not the first row).
      if (currentRowIndex > 0) {
        pathsFromCellAbove = pathAccumulationMatrix[currentRowIndex - 1][currentColIndex];
      }

      // Add paths from the cell directly to the left, if it exists (i.e., not the first column).
      if (currentColIndex > 0) {
        pathsFromCellLeft = pathAccumulationMatrix[currentRowIndex][currentColIndex - 1];
      }

      // The total paths to the current cell are the sum of paths from above and from the left.
      // Apply the modular addition to prevent overflow.
      // Type III: Use the defined helper function for modular addition.
      pathAccumulationMatrix[currentRowIndex][currentColIndex] = performModularAddition(pathsFromCellAbove, pathsFromCellLeft);
    }
  }

  // --- Final Result ---
  // The number of paths to the destination cell (bottom-right) is the answer.
  // Convert the final count to a string as required.
  return pathAccumulationMatrix[totalGridRows - 1][totalGridColumns - 1].toString();
}

// Type III: Wrap the execution in a try-catch block for more robust error handling.
try {
  // Read the entire file content from standard input synchronously.
  const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Call the main function with the input data and print the result.
  console.log(calculateGridPaths(fileData));
} catch (executionError) {
  // Type III: Provide more descriptive error messages in case of failure.
  console.error("Path calculation encountered an issue:", executionError.message);
  // In case of an error, it's safer to output "0" or an error indicator.
  console.log("0");
}