// Utility function to display the final calculated value.
function outputFinalResult(valueToPresent) {
  console.log(valueToPresent);
}

// Core function to process the grid tiling problem and determine configurations.
// This algorithm calculates the number of ways to tile a 2xN grid
// with 1x2 (vertical) and 2x1 (horizontal) dominoes,
// based on specific conditions related to the 'colors' of the cells.
function processGridTiling(rawInputString) {
  // Constants for state management to improve readability.
  const PREVIOUS_BLOCK_IS_VERTICAL = true;
  const PREVIOUS_BLOCK_IS_HORIZONTAL = false;

  // Constant for modulo operation to keep numbers within a manageable range.
  const PRIME_MODULUS = 1000000007;

  // Helper for modular arithmetic: performs (a * b) % modulus.
  const performModularMultiplication = (factorA, factorB) => (factorA * factorB) % PRIME_MODULUS;

  // --- Input Parsing and Validation ---

  if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
    outputFinalResult("Input error: Raw data is empty or invalid.");
    return; // Exit if input is bad.
  }

  // Split the raw input into individual lines.
  const inputLines = rawInputString.trim().split("\n");

  // Ensure there are enough lines for grid dimension and tile sequences.
  if (inputLines.length < 3) {
    outputFinalResult("Input error: Not enough lines provided. Expected at least 3 lines.");
    return;
  }

  // Parse the grid dimension (N) from the first line.
  const gridDimension = Number(inputLines[0]);
  if (isNaN(gridDimension) || gridDimension <= 0) {
    outputFinalResult("Input error: Grid dimension (N) must be a positive integer.");
    return;
  }

  // Extract character sequences for the top and bottom rows of the grid.
  const topLayerTiles = inputLines[1].split('');
  const bottomLayerTiles = inputLines[2].split('');

  // Validate that tile sequence lengths match the declared grid dimension.
  if (topLayerTiles.length !== gridDimension || bottomLayerTiles.length !== gridDimension) {
    outputFinalResult("Input error: Tile sequence length mismatch with grid dimension.");
    return;
  }

  // --- Core Calculation Logic ---

  // Initialize the count of valid tiling configurations.
  let totalConfigurations = 1;

  // Tracks the type of the previously processed block.
  // Initially assumed to be vertical for the base case (first block).
  let prevBlockType = PREVIOUS_BLOCK_IS_VERTICAL;

  // Iterate through the grid columns. The 'currentColumnIndex' can advance by 1 or 2
  // depending on whether a vertical or horizontal block is placed.
  let currentColumnIndex = 0;
  while (currentColumnIndex < gridDimension) {
    const currentTopTile = topLayerTiles[currentColumnIndex];
    const currentBottomTile = bottomLayerTiles[currentColumnIndex];

    // Determine if the current column can form a single-column (vertical) block.
    const isCurrentColumnSingleTile = (currentTopTile === currentBottomTile);

    // Branching logic based on whether it's the first block or a subsequent block.
    if (currentColumnIndex === 0) {
      // Special rules for the initial block placement.
      if (isCurrentColumnSingleTile) {
        // First block is vertical: 3 initial configuration options.
        totalConfigurations = performModularMultiplication(totalConfigurations, 3);
        prevBlockType = PREVIOUS_BLOCK_IS_VERTICAL;
        currentColumnIndex++; // Advance one column.
      } else {
        // First block is horizontal: 6 initial configuration options.
        totalConfigurations = performModularMultiplication(totalConfigurations, 6);
        prevBlockType = PREVIOUS_BLOCK_IS_HORIZONTAL;
        currentColumnIndex += 2; // Advance two columns for horizontal block.
      }
    } else {
      // Rules for blocks following the initial one.
      if (prevBlockType === PREVIOUS_BLOCK_IS_VERTICAL) {
        // If the previous block was vertical, there are 2 new options for the current block.
        totalConfigurations = performModularMultiplication(totalConfigurations, 2);

        if (isCurrentColumnSingleTile) {
          // Current block is vertical.
          prevBlockType = PREVIOUS_BLOCK_IS_VERTICAL;
          currentColumnIndex++; // Advance one column.
        } else {
          // Current block is horizontal.
          prevBlockType = PREVIOUS_BLOCK_IS_HORIZONTAL;
          currentColumnIndex += 2; // Advance two columns.
        }
      } else { // prevBlockType === PREVIOUS_BLOCK_IS_HORIZONTAL
        // If the previous block was horizontal.
        if (isCurrentColumnSingleTile) {
          // Current block is vertical. No additional multiplier here,
          // as the options were already accounted for by previous horizontal block's choice.
          prevBlockType = PREVIOUS_BLOCK_IS_VERTICAL;
          currentColumnIndex++; // Advance one column.
        } else {
          // Current block is horizontal.
          totalConfigurations = performModularMultiplication(totalConfigurations, 3); // 3 options for horizontal after horizontal.
          prevBlockType = PREVIOUS_BLOCK_IS_HORIZONTAL;
          currentColumnIndex += 2; // Advance two columns.
        }
      }
    }
  }

  // Display the final calculated number of configurations.
  outputFinalResult(totalConfigurations);
}

// Standard competitive programming entry point:
// Reads input from standard input, then executes the main processing function.
processGridTiling(require("fs").readFileSync("/dev/stdin", "utf8").trim());