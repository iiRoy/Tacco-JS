const analyzeGridPattern = (rawInputText) => {
  // Input validation: Ensure the input is a non-empty string.
  if (typeof rawInputText !== 'string' || rawInputText.trim().length === 0) {
    console.warn("Input is empty or invalid. Returning an empty grid.");
    return "";
  }

  // Step 1: Split the raw input into individual lines.
  const allInputLines = rawInputText.split('\n');

  // Step 2: Discard the first line (often a header or dimension line)
  // and filter out any lines that are completely empty after trimming.
  const contentLines = allInputLines
    .slice(1) // Remove the initial line
    .filter(singleLine => singleLine.trim().length > 0); // Keep only non-empty content

  // If no actual grid content remains after filtering, return an empty string.
  if (contentLines.length === 0) {
    return "";
  }

  // Step 3: Convert each content line into an array of characters,
  // forming the 2D grid structure we will operate on.
  const characterGrid = contentLines.map(lineStr => lineStr.split(''));

  // Determine the dimensions of the grid for boundary checks.
  const gridHeight = characterGrid.length;
  // Assuming a rectangular grid, all rows have the same width.
  const gridWidth = gridHeight > 0 ? characterGrid[0].length : 0;

  // Handle case where the grid might be empty after processing (e.g., first row was empty).
  if (gridWidth === 0) {
    return "";
  }

  // --- Helper function to calculate the count of '#' in a 3x3 neighborhood ---
  // This function includes the central cell in its count if it's a '#'.
  const calculateAdjacentHashCount = (
    currentRowIndex,
    currentColumnIndex,
    gridData,
    totalGridRows,
    totalGridCols
  ) => {
    let hashNeighborTally = 0; // Accumulator for '#' cells.

    // Iterate through the rows in the 3x3 neighborhood (from -1 to +1 relative to current cell).
    for (let rOffset = -1; rOffset <= 1; rOffset++) {
      // Iterate through the columns in the 3x3 neighborhood.
      for (let cOffset = -1; cOffset <= 1; cOffset++) {
        const neighborRow = currentRowIndex + rOffset;
        const neighborCol = currentColumnIndex + cOffset;

        // Perform explicit boundary checks to ensure the neighbor cell is within the grid.
        const isNeighborRowWithinBounds = neighborRow >= 0 && neighborRow < totalGridRows;
        const isNeighborColWithinBounds = neighborCol >= 0 && neighborCol < totalGridCols;

        if (isNeighborRowWithinBounds && isNeighborColWithinBounds) {
          // If the neighbor cell exists and contains a '#', increment the counter.
          if (gridData[neighborRow][neighborCol] === '#') {
            hashNeighborTally++;
          }
        }
      }
    }
    return hashNeighborTally;
  };

  // --- Core Grid Transformation Logic ---
  const transformedOutputGrid = []; // This will store the modified rows as strings.

  // Loop through each row of the input character grid.
  for (let r = 0; r < gridHeight; r++) {
    const originalRowCharacters = characterGrid[r];
    const currentRowResultChars = []; // Temporary array to build the current output row.

    // Loop through each character (cell) in the current row.
    for (let c = 0; c < gridWidth; c++) {
      const currentCellCharacter = originalRowCharacters[c];

      // If the current cell is a '#', it remains unchanged in the output.
      if (currentCellCharacter === '#') {
        currentRowResultChars.push('#');
      } else {
        // If the current cell is not '#', calculate its adjacent '#' count.
        const adjacentCount = calculateAdjacentHashCount(
          r,
          c,
          characterGrid,
          gridHeight,
          gridWidth
        );
        // Convert the numerical count to a string and add it to the output row.
        currentRowResultChars.push(String(adjacentCount));
      }
    }
    // Join the characters of the current row to form a complete output line string.
    transformedOutputGrid.push(currentRowResultChars.join(''));
  }

  // Join all the transformed lines with newline characters to produce the final output string.
  return transformedOutputGrid.join('\n');
};

// --- Execution Block: Read from stdin and print to stdout ---
try {
  // Dynamically import the file system module.
  const fileSystemOperations = require('fs');
  const standardInputPath = '/dev/stdin';
  const textEncoding = 'utf8';

  // Read the entire content of standard input synchronously.
  const rawDataBuffer = fileSystemOperations.readFileSync(standardInputPath, textEncoding);
  // Ensure the data is treated as a string before passing to the analysis function.
  const processedOutput = analyzeGridPattern(rawDataBuffer.toString());

  // Output the final transformed grid to standard output.
  console.log(processedOutput);
} catch (errorDetails) {
  // Catch and report any errors that occur during file reading or processing.
  console.error("An operational error occurred:", errorDetails.message);
  // Optionally, exit with a non-zero code to indicate program failure.
  // process.exit(1);
}