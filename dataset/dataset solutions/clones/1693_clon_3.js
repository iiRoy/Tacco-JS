// Type III clone: Extensive renaming, structural changes, additions, and deletions.

// This utility function determines the number of valid sub-grid configurations
// that meet a specific black cell count criterion.
const calculateCombinations = (
  gridDataFlattened, // Renamed from 'data', now explicitly flattened.
  gridHeight,         // Renamed from 'H'
  gridWidth,          // Renamed from 'W'
  desiredBlackCount,  // Renamed from 'K'
  verboseOutput = false // New parameter, replaces 'debug=0' and adds actual usage
) => {
  // Guard against invalid input dimensions or target count.
  // This is a new guard clause, ensuring robustness for edge cases.
  if (gridHeight <= 0 || gridWidth <= 0 || desiredBlackCount < 0) {
    if (verboseOutput) {
      console.warn("Warning: Invalid grid dimensions or desired black count. Returning 0.");
    }
    return 0;
  }

  // Helper function to map 2D coordinates (row, column) to a 1D array index.
  // This is a direct equivalent of the original '_' function, but renamed for clarity.
  const getLinearIndex = (rowIdx, colIdx) => rowIdx * gridWidth + colIdx;

  let validConfigurationCount = 0; // Renamed from 'result'

  // Calculate total possible combinations for rows and columns.
  // Using Math.pow for row masks for variety, and bit shift for column masks.
  const totalRowMasks = Math.pow(2, gridHeight);
  const totalColMasks = 1 << gridWidth;

  // Iterate through all possible row selections using bitmasks.
  for (let currentRowMask = 0; currentRowMask < totalRowMasks; ++currentRowMask) {
    // Iterate through all possible column selections using bitmasks.
    for (let currentColMask = 0; currentColMask < totalColMasks; ++currentColMask) {
      let currentBlackCellTally = 0; // Renamed from 'count'

      // Iterate over each cell in the original grid.
      for (let r = 0; r < gridHeight; ++r) {
        // Check if the current row 'r' is selected within the currentRowMask.
        // This uses a different bitwise check form: (mask >> bitPosition) & 1.
        const isRowSelected = ((currentRowMask >> r) & 1) === 1;

        // New fragment: If the current row is not selected, skip checking its cells
        // as they cannot contribute to the black cell tally for this configuration.
        if (!isRowSelected) {
          continue;
        }

        for (let c = 0; c < gridWidth; ++c) {
          // Check if the current column 'c' is selected within the currentColMask.
          // This uses the original bitwise check form: (1 << bitPosition) & mask.
          const isColSelected = ((1 << c) & currentColMask) !== 0;

          // If the cell at (r, c) is originally black (true in gridDataFlattened)
          // AND its row AND column are selected, then it contributes to the current tally.
          // gridDataFlattened stores boolean values (true for '#', false for '.').
          if (gridDataFlattened[getLinearIndex(r, c)] && isColSelected) {
            currentBlackCellTally++;
          }
        }
      }

      // If the tally of black cells for this specific row/column configuration
      // matches the desired count, increment the total valid configurations.
      if (currentBlackCellTally === desiredBlackCount) {
        validConfigurationCount++;
        // New fragment: Conditional debug output.
        if (verboseOutput) {
          console.log(`Debug: Found a valid configuration (rows mask: ${currentRowMask}, cols mask: ${currentColMask}). Total valid so far: ${validConfigurationCount}`);
        }
      }
    }
  }
  return validConfigurationCount;
};

// Main program execution flow to handle input/output operations.
const runGridSolver = async (inputSource, outputSink) => {
  // Import the readline module for asynchronous line-by-line input processing.
  const lineInputHandler = require('readline');

  // Create an asynchronous iterator for reading lines from the provided input source.
  // 'crlfDelay: Infinity' helps handle various newline conventions robustly.
  const inputLineIterator = lineInputHandler.createInterface({
    input: inputSource,
    crlfDelay: Infinity
  })[Symbol.asyncIterator]();

  // Helper function to fetch the next line from the input iterator.
  const retrieveNextLine = async () => (await inputLineIterator.next()).value;

  // Helper function to read a line, split it by spaces, and convert each part to an integer.
  // Explicit radix (10) is used for parseInt for robust parsing.
  const parseNumericInputLine = async () => {
    const lineContent = await retrieveNextLine();
    if (!lineContent) {
      // New fragment: Error handling for unexpected end of input.
      throw new Error("End of input reached unexpectedly while parsing numeric line.");
    }
    return lineContent.split(' ').map(val => parseInt(val, 10));
  };

  // Read the initial dimensions (Height, Width, Target Black Count) from the first line.
  const dimensionsAndTarget = await parseNumericInputLine();

  // Deconstruct and perform initial validation on the input parameters.
  const inputGridHeight = dimensionsAndTarget[0];
  const inputGridWidth = dimensionsAndTarget[1];
  const targetBlackCells = dimensionsAndTarget[2];

  // New fragment: More robust input validation for H, W, K.
  // Added upper bounds (e.g., 18) as a practical constraint for bitmasking.
  if (
    isNaN(inputGridHeight) || inputGridHeight < 1 || inputGridHeight > 18 ||
    isNaN(inputGridWidth) || inputGridWidth < 1 || inputGridWidth > 18 ||
    isNaN(targetBlackCells) || targetBlackCells < 0
  ) {
    throw new Error(`Invalid input parameters detected: H=${inputGridHeight}, W=${inputGridWidth}, K=${targetBlackCells}. All must be positive integers (H, W up to 18), K non-negative.`);
  }

  // Initialize the grid data structure as a 1D array of booleans.
  // True represents a '#' (black cell), false represents a '.' (white cell).
  // Using a standard Array<boolean> instead of Uint8Array for type flexibility.
  const initialGridState = new Array(inputGridHeight * inputGridWidth);

  // Helper function for 1D array indexing, local to the input parsing context.
  const computeFlatArrayIndex = (row, col) => row * inputGridWidth + col;

  // Populate the grid data structure from the subsequent input lines.
  for (let rIndex = 0; rIndex < inputGridHeight; ++rIndex) {
    const currentRowString = await retrieveNextLine();
    // New fragment: Validate the length of each input row.
    if (currentRowString === null || currentRowString.length !== inputGridWidth) {
      throw new Error(`Input row ${rIndex} has incorrect width. Expected ${inputGridWidth}, but got ${currentRowString ? currentRowString.length : 'null'}.`);
    }
    for (let cIndex = 0; cIndex < inputGridWidth; ++cIndex) {
      // Store true for '#', false for '.'. Using charAt for character access.
      initialGridState[computeFlatArrayIndex(rIndex, cIndex)] = currentRowString.charAt(cIndex) === '#';
    }
  }

  // Execute the core logic to find the number of valid combinations.
  // The verbose output flag can be configured, e.g., via an environment variable.
  const finalResultCount = calculateCombinations(
    initialGridState,
    inputGridHeight,
    inputGridWidth,
    targetBlackCells,
    process.env.DEBUG_MODE === 'true' // Example of integrating external configuration
  );

  // Write the final computed result to the output stream, followed by a newline.
  outputSink.write(`${finalResultCount}\n`);
};

// Standard boilerplate: If this script is executed directly (not imported as a module),
// then invoke the main program execution function with standard I/O streams.
if (require.main === module) {
  runGridSolver(process.stdin, process.stdout);
}