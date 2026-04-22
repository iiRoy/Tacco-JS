/*
 * This module processes input data to find the minimum cost
 * to recolor a grid based on specific rules.
 */
function ProcessInputData(inputString) {
  // Split the entire input string into individual lines.
  const linesArray = inputString.split('\n');

  // The first line contains the grid dimensions (N) and number of available colors (C).
  // Parse these values from the first line.
  linesArray[0] = linesArray[0].split(' ').map(strVal => parseInt(strVal, 10));

  const gridSize = linesArray[0][0]; // Represents N: the size of the square grid.
  const numColors = linesArray[0][1]; // Represents C: the total number of distinct colors.

  // Declare arrays to store color change costs and the original grid's color configuration.
  const colorChangeCosts = []; // Stores the cost matrix D.
  const originalGridColors = []; // Stores the grid A, with adjusted 0-indexed colors.

  /*
   * Populate the color change cost matrix.
   * Each row 'i' to 'i+numColors' in the input represents
   * the costs of changing an original color 'l' to a new color 'k'.
   */
  for (let currentCostRow = 0; currentCostRow < numColors; currentCostRow++) {
    colorChangeCosts[currentCostRow] = linesArray[currentCostRow + 1].split(' ').map(strVal => parseInt(strVal, 10));
  }

  /*
   * Populate the original grid colors.
   * The subsequent 'gridSize' rows in the input represent the
   * initial color values for each cell in the N x N grid.
   * Colors are adjusted to be 0-indexed for easier processing.
   */
  for (let gridRowIndex = 0; gridRowIndex < gridSize; gridRowIndex++) {
    originalGridColors[gridRowIndex] = linesArray[gridRowIndex + 1 + numColors].split(' ').map(strVal => parseInt(strVal, 10) - 1);
  }

  /*
   * Initialize a 3D-like structure to count the occurrences of each
   * original color within each of the three modulo groups.
   * The groups are determined by (row_index + col_index) % 3.
   */
  const colorCountsByModGroup = Array.from({ length: 3 }, () => Array.from({ length: numColors }, () => 0));

  // Iterate through the grid to categorize and count colors by their modulo group.
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const groupDiscriminator = (r + c) % 3; // Calculate the modulo group (0, 1, or 2).
      const currentCellOriginalColor = originalGridColors[r][c]; // Get the 0-indexed color of the cell.
      colorCountsByModGroup[groupDiscriminator][currentCellOriginalColor]++; // Increment count for this color in its group.
    }
  }

  // Initialize the variable to store the minimum total cost found, setting it to a very large number.
  let minimumOverallCost = Infinity;

  /*
   * Iterate through all unique combinations of three distinct target colors.
   * These three colors will be assigned to cells belonging to modulo groups 0, 1, and 2 respectively.
   */
  for (let targetColorForGroup0 = 0; targetColorForGroup0 < numColors; targetColorForGroup0++) {
    for (let targetColorForGroup1 = 0; targetColorForGroup1 < numColors; targetColorForGroup1++) {
      // The target colors for group 0 and group 1 must be different.
      if (targetColorForGroup0 === targetColorForGroup1) continue;

      for (let targetColorForGroup2 = 0; targetColorForGroup2 < numColors; targetColorForGroup2++) {
        // The target color for group 2 must be different from both group 0 and group 1.
        if (targetColorForGroup0 === targetColorForGroup2 || targetColorForGroup1 === targetColorForGroup2) continue;

        // Calculate the total recoloring cost for this specific combination of (targetColorForGroup0, targetColorForGroup1, targetColorForGroup2).
        let currentCombinationCost = 0;

        // Sum up costs for each modulo group.
        for (let originalColorValue = 0; originalColorValue < numColors; originalColorValue++) {
          // Cost for group 0: count of originalColorValue in group 0 * cost to change it to targetColorForGroup0.
          currentCombinationCost += colorCountsByModGroup[0][originalColorValue] * colorChangeCosts[originalColorValue][targetColorForGroup0];

          // Cost for group 1: count of originalColorValue in group 1 * cost to change it to targetColorForGroup1.
          currentCombinationCost += colorCountsByModGroup[1][originalColorValue] * colorChangeCosts[originalColorValue][targetColorForGroup1];

          // Cost for group 2: count of originalColorValue in group 2 * cost to change it to targetColorForGroup2.
          currentCombinationCost += colorCountsByModGroup[2][originalColorValue] * colorChangeCosts[originalColorValue][targetColorForGroup2];
        }

        // Update the minimum overall cost if the current combination yields a lower cost.
        minimumOverallCost = Math.min(minimumOverallCost, currentCombinationCost);
      }
    }
  }

  // Output the calculated minimum cost to the console.
  console.info(minimumOverallCost);
}

// Read input from standard input and pass it to the main processing function.
ProcessInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));