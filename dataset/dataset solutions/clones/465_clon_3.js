const parseNumericLine = (lineString) => {
  if (!lineString) return [];
  // Trim whitespace, split by one or more spaces, filter out empty strings, and parse as floats.
  return lineString.trim().split(/\s+/).filter(Boolean).map(parseFloat);
};

// Constant representing a coordinate that has not been found or is invalid.
const NO_MATCH_COORDINATE = Number.MAX_SAFE_INTEGER;

// Constant value in the pattern matrix that indicates a cell should be ignored during comparison.
const PATTERN_IGNORE_VALUE = -1;

/**
 * Generates a new 2D array by rotating the input square matrix 90 degrees counter-clockwise.
 *
 * @param {number[][]} originalGrid - The square matrix (array of arrays) to be rotated.
 * @returns {number[][]} A newly created matrix representing the counter-clockwise rotation.
 */
function transformMatrix90DegCounterClockwise(originalGrid) {
  // Defensive programming: Validate input to ensure it's a non-empty, square 2D array.
  if (!originalGrid || originalGrid.length === 0 || !Array.isArray(originalGrid[0])) {
    console.error("Error: Input grid for rotation is invalid or empty.");
    return []; // Return an empty array to indicate failure or invalid input.
  }

  const gridDimension = originalGrid.length;

  // Verify that all rows have the same length, ensuring it's a square matrix.
  for (let r = 0; r < gridDimension; r++) {
    if (originalGrid[r].length !== gridDimension) {
      console.error("Error: Input grid for rotation is not square.");
      return [];
    }
  }

  // Initialize the target grid (transformedGrid) with the same dimensions, pre-filled with zeros.
  // Using Array.from with a mapping function for concise initialization.
  const transformedGrid = Array.from({
    length: gridDimension
  }, () => Array(gridDimension).fill(0));

  // Iterate through the original grid's cells to populate the transformed grid.
  // For a 90-degree counter-clockwise rotation:
  // new_row = old_col
  // new_col = (dimension - 1) - old_row
  for (let sourceRow = 0; sourceRow < gridDimension; sourceRow++) {
    for (let sourceCol = 0; sourceCol < gridDimension; sourceCol++) {
      const destRow = sourceCol;
      const destCol = gridDimension - 1 - sourceRow;
      transformedGrid[destRow][destCol] = originalGrid[sourceRow][sourceCol];
    }
  }

  return transformedGrid;
}

/**
 * The primary function that orchestrates reading input, performing pattern matching,
 * and printing the results for multiple test cases.
 */
function executePatternMatching() {
  let canvasDataMatrix; // Represents the larger image where patterns are sought.
  let currentPatternSegment; // The pattern matrix currently being processed.
  const allPatternOrientations = []; // An array to store the 4 rotations of the pattern.
  let bestMatchRowCoord = NO_MATCH_COORDINATE; // Y-coordinate (1-indexed) of the best match's top-left corner.
  let bestMatchColCoord = NO_MATCH_COORDINATE; // X-coordinate (1-indexed) of the best match's top-left corner.

  let canvasHeight; // The number of rows (and columns, assuming square) in the canvasDataMatrix.
  let patternDimension; // The dimension (rows/columns) of the square patternSegment.
  let currentInputLineIndex = 0; // Index to keep track of the current line being read from stdin content.

  // Main loop to process multiple sets of input data until a termination condition is met.
  while (true) {
    // Read and parse the first line of each input set, containing canvas and pattern dimensions.
    const dimensionsLine = parseNumericLine(globalStdinContent[currentInputLineIndex++]);

    // Basic validation for the dimensions line.
    if (dimensionsLine.length < 2) {
      console.error("Warning: Malformed dimensions line encountered. Skipping current input set.");
      // If we can't parse dimensions, we can't determine how many lines to skip.
      // In a real scenario, this might need more robust error recovery or termination.
      // For this problem, we'll try to continue to the next line, hoping it's a new set.
      if (currentInputLineIndex >= globalStdinContent.length) break; // No more input.
      continue;
    }

    canvasHeight = dimensionsLine[0];
    patternDimension = dimensionsLine[1];

    // Termination condition: If both dimensions are zero, exit the main loop.
    if (canvasHeight === 0 && patternDimension === 0) {
      break;
    }

    // Further input validation for positive dimensions and pattern fitting within canvas.
    if (canvasHeight <= 0 || patternDimension <= 0) {
      console.error(`Warning: Invalid canvas (${canvasHeight}) or pattern (${patternDimension}) dimensions. Must be positive. Skipping.`);
      // Skip the expected number of lines for this malformed set to align input for the next.
      currentInputLineIndex += (canvasHeight > 0 ? canvasHeight : 0) + (patternDimension > 0 ? patternDimension : 0);
      continue;
    }
    if (patternDimension > canvasHeight) {
      console.error(`Warning: Pattern dimension (${patternDimension}) exceeds canvas height (${canvasHeight}). Skipping.`);
      // Skip the expected number of lines for the canvas and pattern matrices.
      currentInputLineIndex += canvasHeight + patternDimension;
      continue;
    }

    // Initialize and populate the canvas data matrix.
    canvasDataMatrix = [];
    for (let rowIdx = 0; rowIdx < canvasHeight; rowIdx++) {
      const rowData = parseNumericLine(globalStdinContent[currentInputLineIndex++]);
      // Assuming a square canvas where each row should have 'canvasHeight' elements.
      if (rowData.length !== canvasHeight) {
        console.error(`Warning: Malformed canvas row ${rowIdx}. Expected ${canvasHeight} elements, got ${rowData.length}. Skipping input set.`);
        // Skip remaining lines for this malformed canvas and the pattern.
        currentInputLineIndex += (canvasHeight - 1 - rowIdx) + patternDimension;
        continue; // Skip processing this malformed input set.
      }
      canvasDataMatrix.push(rowData);
    }
    // If the canvas was not fully populated due to malformed rows, skip this set.
    if (canvasDataMatrix.length !== canvasHeight) {
      continue;
    }


    // Initialize and populate the initial pattern segment matrix.
    currentPatternSegment = [];
    for (let rowIdx = 0; rowIdx < patternDimension; rowIdx++) {
      const rowData = parseNumericLine(globalStdinContent[currentInputLineIndex++]);
      // Assuming a square pattern where each row should have 'patternDimension' elements.
      if (rowData.length !== patternDimension) {
        console.error(`Warning: Malformed pattern row ${rowIdx}. Expected ${patternDimension} elements, got ${rowData.length}. Skipping input set.`);
        // Skip remaining lines for this malformed pattern.
        currentInputLineIndex += (patternDimension - 1 - rowIdx);
        continue;
      }
      currentPatternSegment.push(rowData);
    }
    // If the pattern was not fully populated, skip this set.
    if (currentPatternSegment.length !== patternDimension) {
      continue;
    }

    // Clear previous orientations and generate all four 90-degree rotations of the pattern.
    allPatternOrientations.length = 0; // Efficiently clears the array.
    let rotationIteration = 0;
    while (rotationIteration < 4) {
      allPatternOrientations.push(currentPatternSegment);
      // Rotate the pattern for the next iteration, but not after the fourth orientation is added.
      if (rotationIteration < 3) {
        currentPatternSegment = transformMatrix90DegCounterClockwise(currentPatternSegment);
      }
      rotationIteration++;
    }

    // Reset best match coordinates for the current search instance.
    bestMatchColCoord = NO_MATCH_COORDINATE;
    bestMatchRowCoord = NO_MATCH_COORDINATE;

    // Begin the exhaustive search for the pattern within the canvas.
    // Iterate through all possible top-left starting positions for the pattern on the canvas.
    // The pattern's top-left (0,0) can range from (0,0) to (canvasHeight - patternDimension, canvasHeight - patternDimension).
    for (let canvasRowIdx = 0; canvasRowIdx <= canvasHeight - patternDimension; canvasRowIdx++) {
      for (let canvasColIdx = 0; canvasColIdx <= canvasHeight - patternDimension; canvasColIdx++) {

        // For each potential position, check against all four generated pattern orientations.
        for (let orientationIndex = 0; orientationIndex < 4; orientationIndex++) {
          const currentOrientation = allPatternOrientations[orientationIndex];
          let isCurrentSubmatrixMatch = true; // Flag to track if the current orientation matches at this position.
          let firstMatchCol = -1; // Stores 1-indexed column of the first non-ignored pattern cell.
          let firstMatchRow = -1; // Stores 1-indexed row of the first non-ignored pattern cell.

          // Iterate through each cell of the current pattern orientation.
          for (let patternRowIdx = 0; patternRowIdx < patternDimension; patternRowIdx++) {
            for (let patternColIdx = 0; patternColIdx < patternDimension; patternColIdx++) {

              const patternValue = currentOrientation[patternRowIdx][patternColIdx];

              // If the pattern cell value is a designated ignore value, skip comparison for this cell.
              if (patternValue === PATTERN_IGNORE_VALUE) {
                continue;
              }

              // Compare the pattern cell value with the corresponding cell in the canvas.
              const canvasValue = canvasDataMatrix[canvasRowIdx + patternRowIdx][canvasColIdx + patternColIdx];
              if (patternValue !== canvasValue) {
                isCurrentSubmatrixMatch = false; // Mismatch found.
                break; // Exit the inner (patternColIdx) loop.
              }

              // If this is the first non-ignored cell that has matched, record its absolute 1-indexed coordinates.
              if (firstMatchCol === -1 && firstMatchRow === -1) {
                firstMatchCol = canvasColIdx + patternColIdx + 1;
                firstMatchRow = canvasRowIdx + patternRowIdx + 1;
              }
            }
            if (!isCurrentSubmatrixMatch) {
              break; // Exit the middle (patternRowIdx) loop if a mismatch was found.
            }
          }

          // If a complete match was found for the current pattern orientation at this position.
          if (isCurrentSubmatrixMatch) {
            // Update the global best match coordinates if the current match is superior.
            // Superiority is defined by a higher (smaller row coordinate) position,
            // or if at the same height, a further left (smaller column coordinate) position.
            if (firstMatchRow < bestMatchRowCoord) {
              bestMatchRowCoord = firstMatchRow;
              bestMatchColCoord = firstMatchCol;
            } else if (firstMatchRow === bestMatchRowCoord && firstMatchCol < bestMatchColCoord) {
              bestMatchColCoord = firstMatchCol;
            }
          }
        }
      }
    }

    // Output the result for the current set of input data.
    if (bestMatchColCoord !== NO_MATCH_COORDINATE && bestMatchRowCoord !== NO_MATCH_COORDINATE) {
      console.log(`${bestMatchColCoord} ${bestMatchRowCoord}`);
    } else {
      console.log('NA'); // No match found for this input set.
    }
  }
}

// Global variable to accumulate all received standard input data.
let globalStdinContent = '';

// Configure Node.js standard input stream.
process.stdin.resume(); // Ensures the process stays open to receive input.
process.stdin.setEncoding('utf8'); // Specifies the character encoding for input data.

// Event listener: Appends each received data chunk to the global input buffer.
process.stdin.on('data', function(receivedDataChunk) {
  globalStdinContent += receivedDataChunk;
});

// Event listener: Triggered when the standard input stream ends.
process.stdin.on('end', function() {
  // Once all input is received, split it into an array of lines.
  // Filter out any lines that are empty after trimming whitespace, to handle extra newlines.
  globalStdinContent = globalStdinContent.split('\n').filter(line => line.trim() !== '');

  // Initiate the main program logic with the collected and parsed input.
  executePatternMatching();
});