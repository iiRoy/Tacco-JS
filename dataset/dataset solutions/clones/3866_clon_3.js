// This JavaScript program is designed to identify and count specific types of symmetric configurations
// within a character grid derived from multi-line string input.
// It performs transformations on the grid and checks for diagonal symmetry.

/**
 * Main entry point for processing the input data.
 * Reads a raw multi-line string, parses it, constructs an extended grid,
 * and then iterates through all possible sub-grid transformations to count
 * how many of them exhibit a specific symmetric property.
 *
 * @param {string} rawInputText - The complete raw string input, typically from stdin.
 */
function ProcessInputData(rawInputText) {
  // First, split the entire input string into an array of individual lines.
  // Using a regex for split ensures compatibility with both Windows (\r\n) and Unix (\n) line endings.
  const inputLineSegments = rawInputText.split(/\r?\n/);

  // The first line of input is expected to contain the dimension (N) of the square grid.
  // We parse it as an integer, explicitly specifying radix 10 for clarity.
  const gridDimensionSize = parseInt(inputLineSegments[0], 10);

  // --- Start: Robustness and Input Validation (Type III Additions) ---
  // Guard clause: Check if the parsed dimension is a valid positive number.
  if (isNaN(gridDimensionSize) || gridDimensionSize <= 0) {
    console.error("Error: The specified grid dimension is invalid or non-positive. Exiting.");
    return; // Terminate execution if dimension is invalid.
  }

  // Guard clause: Ensure that enough lines are provided in the input for the declared grid dimension.
  // We need N data lines plus the initial dimension line.
  if (inputLineSegments.length < gridDimensionSize + 1) {
    console.error("Error: Insufficient input lines provided for the declared grid dimension. Exiting.");
    return; // Terminate if input is incomplete.
  }
  // --- End: Robustness and Input Validation ---

  // Initialize an array that will hold our extended character grid.
  // This grid is designed to be twice the size of the original dimension,
  // allowing for wrap-around or offset access without complex modulo operations.
  // We pre-allocate the array's length for slight performance optimization (Type III Update).
  const extendedCharacterGrid = new Array(gridDimensionSize * 2);

  // Populate the extended grid. Each line from the input (after the first)
  // is duplicated and then stored at two positions in the `extendedCharacterGrid`:
  // once at its original index and once at its index plus the grid dimension.
  for (let currentGridRowIndex = 0; currentGridRowIndex < gridDimensionSize; currentGridRowIndex++) {
    // Retrieve the actual character line from the input segments.
    // (Input lines start from index 1 after the dimension line).
    const originalLineContent = inputLineSegments[currentGridRowIndex + 1];

    // Create a doubled version of the line (e.g., "AB" becomes "ABAB").
    // This is an intermediate step (Type III Addition).
    const concatenatedLine = originalLineContent + originalLineContent;

    // Store the concatenated line at two positions in the extended grid.
    extendedCharacterGrid[currentGridRowIndex] = concatenatedLine;
    extendedCharacterGrid[currentGridRowIndex + gridDimensionSize] = concatenatedLine;
  }

  // Initialize a counter to track the number of transformations that result in a symmetric sub-grid.
  let totalSymmetricConfigurations = 0;

  // Begin nested loops to iterate through all possible (row, column) shift combinations.
  // Each combination defines a unique top-left corner for a potential sub-grid within the extended grid.
  for (let rowOffsetValue = 0; rowOffsetValue < gridDimensionSize; rowOffsetValue++) {
    for (let columnOffsetValue = 0; columnOffsetValue < gridDimensionSize; columnOffsetValue++) {
      // For each offset pair, call a dedicated helper function to check if the
      // corresponding sub-grid exhibits the desired symmetric property.
      // The return value (0 or 1) is added to our total counter.
      totalSymmetricConfigurations += verifySubgridSymmetry(
        rowOffsetValue,
        columnOffsetValue,
        gridDimensionSize,
        extendedCharacterGrid
      );
    }
  }

  // After checking all possible transformations, print the final count to the console.
  console.log(totalSymmetricConfigurations);

  /**
   * Helper function to check if a sub-grid, defined by its top-left corner (rowShift, colShift),
   * is symmetric with respect to its main diagonal.
   *
   * Symmetry is checked by comparing characters at (r + rowShift, c + colShift)
   * with characters at (c + colShift, r + rowShift) for all r < c within the original grid dimensions.
   *
   * @param {number} rowShift - The row offset for the top-left corner of the current sub-grid.
   * @param {number} colShift - The column offset for the top-left corner of the current sub-grid.
   * @param {number} matrixDimension - The original dimension N of the square matrix.
   * @param {string[]} fullExtendedGridReference - A reference to the pre-constructed extended character grid.
   * @returns {number} 1 if the sub-grid is symmetric under the given transformation, 0 otherwise.
   */
  function verifySubgridSymmetry(rowShift, colShift, matrixDimension, fullExtendedGridReference) {
    // Iterate through all unique pairs of indices (r, c) where r is less than c.
    // This efficiently covers all pairs for checking symmetry across the diagonal without redundancy.
    for (let primaryRowIdx = 0; primaryRowIdx < matrixDimension; primaryRowIdx++) {
      for (let secondaryColIdx = primaryRowIdx + 1; secondaryColIdx < matrixDimension; secondaryColIdx++) {
        // Calculate the actual coordinates in the extended grid by applying the current shifts.
        // These represent the first character's position.
        const effectiveRowForCharA = primaryRowIdx + rowShift;
        const effectiveColForCharA = secondaryColIdx + colShift;

        // Calculate the coordinates for the character at the "symmetric" position.
        // This involves swapping the base row and column indices before applying shifts.
        const effectiveRowForCharB = secondaryColIdx + colShift;
        const effectiveColForCharB = primaryRowIdx + rowShift;

        // Retrieve the characters at these two symmetric positions.
        // Using intermediate constants for clarity and readability (Type III Addition).
        const charAtPosition_A = fullExtendedGridReference[effectiveRowForCharA][effectiveColForCharA];
        const charAtPosition_B = fullExtendedGridReference[effectiveRowForCharB][effectiveColForCharB];

        // If the characters at the symmetric positions are not identical,
        // then the sub-grid is not symmetric for this transformation.
        // We can immediately return 0, as no further checks are needed.
        if (charAtPosition_A !== charAtPosition_B) {
          return 0; // Not symmetric
        }
      }
    }
    // If the loops complete without finding any non-symmetric pairs,
    // it means the sub-grid defined by the current shifts is symmetric.
    return 1; // Symmetric
  }
}

// This is the standard entry point for competitive programming in Node.js.
// It reads the entire content of standard input as a UTF-8 string and passes it
// to our main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));