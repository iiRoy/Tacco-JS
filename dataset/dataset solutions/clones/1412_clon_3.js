let patternCounter = 0; // Tracks the number of generated patterns for debugging/logging purposes.
const allOutputSegments = []; // Accumulates all generated patterns before final output.

/**
 * Determines the character ('#' or '.') for a given cell based on its coordinates.
 * This function encapsulates the checkerboard pattern logic.
 * @param {number} rowPosition The row index of the cell.
 * @param {number} colPosition The column index of the cell.
 * @returns {string} The character for the cell: '#' for even sum, '.' for odd sum.
 */
const selectCellCharacter = (rowPosition, colPosition) => {
  // If the sum of coordinates is even, place a '#' (filled cell), otherwise a '.' (empty cell).
  return ((rowPosition + colPosition) % 2 === 0) ? '#' : '.';
};

/**
 * Parses a string line containing two space-separated numbers into height and width.
 * Includes basic validation for the input format.
 * @param {string} dimensionLine The input string, e.g., "5 8".
 * @returns {{height: number, width: number}} An object containing parsed height and width.
 *                                          Returns {height: NaN, width: NaN} if parsing fails.
 */
const parseGridDimensions = (dimensionLine) => {
  const lineParts = dimensionLine.trim().split(/\s+/); // Split by one or more whitespace characters.

  if (lineParts.length !== 2) {
    console.warn(`[Warning] Malformed dimension input encountered: "${dimensionLine}". Expected two numbers.`);
    return { height: NaN, width: NaN };
  }

  const parsedHeight = Number.parseInt(lineParts[0], 10);
  const parsedWidth = Number.parseInt(lineParts[1], 10);

  // Validate that parsed values are indeed numbers.
  if (Number.isNaN(parsedHeight) || Number.isNaN(parsedWidth)) {
    console.warn(`[Warning] Non-numeric dimension values in: "${dimensionLine}".`);
    return { height: NaN, width: NaN };
  }

  return { height: parsedHeight, width: parsedWidth };
};

/**
 * Main function to process an array of input lines, generating and accumulating
 * distinct geometric patterns based on provided dimensions.
 *
 * @param {string[]} rawInputTextRows An array where each string is an input line.
 */
function renderGeometricPatterns(rawInputTextRows) {
  // Iterate through each row of input data. The loop continues indefinitely until
  // an explicit break condition is met, allowing for multiple pattern definitions.
  for (let entryIndex = 0; ; entryIndex++) {
    // Ensure we don't go out of bounds or process empty/null lines at the end of input.
    if (entryIndex >= rawInputTextRows.length || !rawInputTextRows[entryIndex]) {
      // If no more valid input lines, terminate the pattern generation process.
      break;
    }

    const currentInputRow = rawInputTextRows[entryIndex].trim(); // Get current line and remove leading/trailing whitespace.

    // The termination condition for pattern generation: a line containing '0 0'.
    if (currentInputRow === '0 0') {
      break;
    }

    // Attempt to parse the height and width from the current input line.
    const { height: matrixHeight, width: matrixWidth } = parseGridDimensions(currentInputRow);

    // Perform robust validation on the parsed dimensions.
    if (Number.isNaN(matrixHeight) || Number.isNaN(matrixWidth) || matrixHeight <= 0 || matrixWidth <= 0) {
      console.error(`[Error] Invalid or non-positive dimensions (${matrixHeight}x${matrixWidth}) for pattern #${patternCounter + 1}. Skipping this pattern.`);
      continue; // Skip to the next input line if dimensions are invalid.
    }

    patternCounter++; // Increment the counter for successfully processed patterns.

    // Initialize a temporary array to hold the rows of the current pattern.
    const patternRowsBuffer = [];

    // Construct the pattern row by row.
    for (let verticalCoordinate = 0; verticalCoordinate < matrixHeight; verticalCoordinate++) {
      const currentRowCharacters = []; // Buffer for characters of the current row.
      for (let horizontalCoordinate = 0; horizontalCoordinate < matrixWidth; horizontalCoordinate++) {
        // Determine the character for the current cell using the helper function.
        const charToAppend = selectCellCharacter(verticalCoordinate, horizontalCoordinate);
        currentRowCharacters.push(charToAppend);
      }
      // Join the characters to form a complete row string and add a newline.
      patternRowsBuffer.push(currentRowCharacters.join('') + '\n');
    }

    // Add the fully constructed pattern (as a single string) to the global output accumulator.
    allOutputSegments.push(patternRowsBuffer.join(''));
  }

  // After processing all input lines, print all accumulated patterns to the console.
  // An extra newline separates each distinct pattern block.
  if (allOutputSegments.length > 0) {
    console.log(allOutputSegments.join('\n'));
  } else {
    // Inform the user if no patterns were generated.
    console.log("No valid patterns were generated from the provided input.");
  }
}

// --- Standard Node.js input handling setup ---
const incomingDataFragments = []; // Buffer for incoming data chunks from stdin.

// Event listener for incoming data.
process.stdin.on('data', function(dataSegment) {
  incomingDataFragments.push(dataSegment);
});

// Event listener for the end of input stream.
process.stdin.on('end', function() {
  if (incomingDataFragments.length === 0) {
    console.warn("No input data was received from standard input.");
    return;
  }
  // Concatenate all data fragments, then split into individual lines.
  const parsedInputLines = incomingDataFragments.join('').split('\n');
  renderGeometricPatterns(parsedInputLines); // Call the main processing function.
});