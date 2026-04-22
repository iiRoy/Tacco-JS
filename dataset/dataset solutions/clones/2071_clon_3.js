// This JavaScript module is designed to process grid dimension data from standard input
// and compute a specific value based on these dimensions.
// The primary goal is to determine a 'tiling count' or a similar metric for a grid.

/**
 * @param {string} rawInputText - The complete string received from the standard input stream.
 *                                This typically contains multiple lines of data.
 */
function processGridDimensions(rawInputText) {
  // Extract the first meaningful line from the input string.
  // This line is expected to contain the grid's dimensions.
  const firstDataLine = rawInputText.split("\n")[0];

  // --- Input Validation and Pre-processing ---
  // Guard clause: Ensure the primary data line is not empty or just whitespace.
  if (!firstDataLine || firstDataLine.trim().length === 0) {
    console.error("Input processing error: No valid data line found for dimensions.");
    return; // Terminate execution gracefully if input is invalid.
  }

  // Split the line into string parts based on spaces.
  const dimensionStrings = firstDataLine.split(' ');

  // Guard clause: Verify that at least two dimension values are provided.
  if (dimensionStrings.length < 2) {
    console.error("Input processing error: Insufficient dimension values provided. Expected two.");
    return;
  }

  // Convert the string dimensions into numerical values.
  // Using `Number` is a concise way to parse integers, handling potential leading/trailing spaces.
  const parsedHeightValue = Number(dimensionStrings[0]);
  const parsedWidthValue = Number(dimensionStrings[1]);

  // Guard clause: Validate that both parsed values are indeed positive integers.
  if (isNaN(parsedHeightValue) || isNaN(parsedWidthValue) || parsedHeightValue < 1 || parsedWidthValue < 1) {
    console.error("Input processing error: Grid dimensions must be positive integer values.");
    return;
  }

  // Assign validated and parsed dimensions to descriptive constants.
  const gridHeight = parsedHeightValue;
  const gridWidth = parsedWidthValue;

  // Declare a variable to hold the computed result, initialized to a default.
  let calculatedGridMetric = 0;

  // --- Core Calculation Logic ---

  // Define a simple predicate function to check for 'linear' grid cases.
  const isOneDimensionalGrid = (h, w) => (h === 1 || w === 1);

  if (isOneDimensionalGrid(gridHeight, gridWidth)) {
    // Special case handling: If either dimension is 1, the metric is simply 1.
    // This often applies to problems where a 1xN or Nx1 grid has a single 'active' cell.
    calculatedGridMetric = 1;
  } else {
    // General case for 2D grids (both dimensions greater than 1).
    // The calculation here typically corresponds to counting 'dark' squares on a chessboard pattern,
    // which is equivalent to rounding up (H * W) / 2.
    const totalArea = gridHeight * gridWidth;
    calculatedGridMetric = Math.ceil(totalArea / 2);

    // Alternative, more verbose calculation path (commented out for brevity but shows Type III change potential):
    /*
    let fullColumnPairsCoverage = gridHeight * Math.floor(gridWidth / 2);
    let oddColumnRemainderCoverage = 0;
    // If the width is odd, there's a single column remaining to consider.
    if (gridWidth % 2 !== 0) {
      oddColumnRemainderCoverage = Math.round(gridHeight / 2); // Calculate coverage for the remaining column.
    }
    calculatedGridMetric = fullColumnPairsCoverage + oddColumnRemainderCoverage;
    */
  }

  // --- Output Result ---
  // Print the final calculated metric to the standard output.
  console.log(calculatedGridMetric);
}

// --- Standard Input Handling ---
// This section is responsible for reading input from the execution environment.
// It should remain unchanged to comply with typical competitive programming platform requirements.
processGridDimensions(require("fs").readFileSync("/dev/stdin", "utf8"));