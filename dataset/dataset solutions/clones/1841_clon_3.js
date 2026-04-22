/**
 * Processes grid-related data based on a permutation sequence.
 * This function calculates an 'unfavorable count' by iteratively removing
 * cells from a grid based on a provided permutation and counting adjacent
 * available cells in four cardinal directions for non-border removals.
 *
 * @param {string} rawInputData The raw input string, expected to contain
 *                              the grid dimension (N) on the first line
 *                              and a space-separated permutation of numbers
 *                              from 1 to N*N on the second line.
 */
function processGridData(rawInputData) {
  // Parse input lines and perform basic validations
  let inputLines = rawInputData.trim().split("\n");

  // Ensure minimum input data is present
  if (inputLines.length < 2) {
    // Log an error and exit if input is insufficient
    console.error("Error: Insufficient input data. Expected at least two lines.");
    return;
  }

  // Extract and validate the grid dimension (N)
  const gridDimension = parseInt(inputLines[0], 10);
  if (isNaN(gridDimension) || gridDimension <= 0) {
    // Log an error and exit if N is invalid
    console.error(`Error: Invalid grid dimension '${inputLines[0]}'. Must be a positive integer.`);
    return;
  }

  // Parse the permutation sequence into an array of numbers
  const permutationSequence = inputLines[1].split(" ").map(Number);

  // Initialize the grid state. Using '0' to mark removed/empty cells.
  // The grid stores values from 1 to N*N initially.
  const gridStateMatrix = Array.from({ length: gridDimension }, () =>
    Array(gridDimension).fill(0)
  );

  // Create a mapping from each cell's value (1 to N*N) to its 1-indexed [row, column] coordinates.
  // Using a Map for efficient lookup.
  const coordinateLookupMap = new Map();

  // Populate the grid with sequential numbers and build the coordinate map.
  // Loop uses 0-indexed 'row' and 'col' for array access, but stores 1-indexed coordinates in the map.
  for (let row = 0; row < gridDimension; row++) {
    for (let col = 0; col < gridDimension; col++) {
      const cellIdentifier = row * gridDimension + col + 1; // Calculate 1-indexed cell value
      gridStateMatrix[row][col] = cellIdentifier; // Store value in the 0-indexed grid
      coordinateLookupMap.set(cellIdentifier, [row + 1, col + 1]); // Store 1-indexed coordinates
    }
  }

  let totalDislikesAccumulator = 0; // The counter for 'unfavorable' situations, renamed from 'nolike'

  // Iterate through the permutation sequence to simulate cell removals.
  // The outer loops here simply provide an ordered way to access elements
  // of the `permutationSequence` array, not directly iterating grid cells.
  for (let sequenceRowIterator = 0; sequenceRowIterator < gridDimension; sequenceRowIterator++) {
    for (let sequenceColIterator = 0; sequenceColIterator < gridDimension; sequenceColIterator++) {
      // Calculate the 0-indexed position within the flattened permutation sequence
      const currentPermutationFlatIndex = sequenceRowIterator * gridDimension + sequenceColIterator;

      // Retrieve the number that is currently being "removed" from the grid
      const valueToRemove = permutationSequence[currentPermutationFlatIndex];

      // Look up the original 1-indexed coordinates of this value in the grid
      const originalCellCoordinates = coordinateLookupMap.get(valueToRemove);

      // Guard clause: If coordinates are not found (e.g., invalid permutation value), skip.
      if (!originalCellCoordinates || originalCellCoordinates.length !== 2) {
        console.warn(`Warning: Coordinates not found for value ${valueToRemove}. Skipping this permutation element.`);
        continue;
      }

      const [targetRow1Idx, targetCol1Idx] = originalCellCoordinates;

      // Mark the cell at its original position in the grid as removed (set to 0).
      // Convert 1-indexed coordinates to 0-indexed for array access.
      gridStateMatrix[targetRow1Idx - 1][targetCol1Idx - 1] = 0; // '0' signifies an empty/removed cell

      // Determine if the removed cell was on any of the grid's borders.
      const isBoundaryCell =
        targetRow1Idx === 1 ||
        targetCol1Idx === 1 ||
        targetRow1Idx === gridDimension ||
        targetCol1Idx === gridDimension;

      // If the removed cell is on the border, it does not contribute to the dislike count.
      // The original code had 'nolike += 0; continue;', which is redundant;
      // simply continuing achieves the same outcome.
      if (isBoundaryCell) {
        continue;
      }

      // If the cell is NOT on the border, calculate available (non-zero) cells
      // in the four cardinal directions (North, South, West, East).
      let northCount = 0; // Count of available cells in the upward direction (decreasing row index)
      let southCount = 0; // Count of available cells in the downward direction (increasing row index)
      let westCount = 0;  // Count of available cells in the leftward direction (decreasing column index)
      let eastCount = 0;  // Count of available cells in the rightward direction (increasing column index)

      // Count cells upwards (North) from the target cell's column
      for (let rScan = targetRow1Idx - 2; rScan >= 0; rScan--) { // Start from row above target (0-indexed)
        if (gridStateMatrix[rScan][targetCol1Idx - 1] !== 0) {
          northCount++;
        }
      }

      // Count cells downwards (South) from the target cell's column
      for (let rScan = targetRow1Idx; rScan < gridDimension; rScan++) { // Start from row below target (0-indexed)
        if (gridStateMatrix[rScan][targetCol1Idx - 1] !== 0) {
          southCount++;
        }
      }

      // Count cells to the left (West) from the target cell's row
      for (let cScan = targetCol1Idx - 2; cScan >= 0; cScan--) { // Start from column left of target (0-indexed)
        if (gridStateMatrix[targetRow1Idx - 1][cScan] !== 0) {
          westCount++;
        }
      }

      // Count cells to the right (East) from the target cell's row
      for (let cScan = targetCol1Idx; cScan < gridDimension; cScan++) { // Start from column right of target (0-indexed)
        if (gridStateMatrix[targetRow1Idx - 1][cScan] !== 0) {
          eastCount++;
        }
      }

      // Add the minimum of the four directional counts to the total dislikes.
      totalDislikesAccumulator += Math.min(northCount, southCount, westCount, eastCount);
    }
  }

  // Output the final calculated count.
  console.log(totalDislikesAccumulator);
}

// Standard entry point for competitive programming in Node.js environments.
// Reads input from stdin and passes it to the main processing function.
processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));