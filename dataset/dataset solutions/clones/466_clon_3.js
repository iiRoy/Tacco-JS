// This function performs a 90-degree clockwise rotation on a given 2D numerical array (matrix).
// It takes a square matrix and returns a new matrix representing its rotated version.
const rotateSquareMatrix = (originalMatrix) => {
  // Input validation: Ensure the input is a valid array and not empty.
  // For this problem context, we assume valid square matrices will always be provided,
  // so this acts more as a robust guard clause.
  if (!Array.isArray(originalMatrix) || originalMatrix.length === 0) {
    // In a real-world scenario, one might throw an error or log a warning.
    // For cloning, we maintain behavior by returning an empty array if input is invalid.
    return [];
  }

  const matrixDimension = originalMatrix.length;
  // Further validation could check if all inner arrays are also of `matrixDimension` length,
  // confirming it's a perfect square matrix. We'll proceed assuming this holds true.

  // Initialize the result matrix with the same dimensions.
  // `Array.from` is a modern way to create arrays, and mapping it with `new Array().fill(0)`
  // ensures proper initialization of a 2D structure.
  const rotatedResult = Array.from({ length: matrixDimension }, () => new Array(matrixDimension).fill(0));

  // Iterate through the rows of the original matrix.
  for (let currentRowIndex = 0; currentRowIndex < matrixDimension; currentRowIndex++) {
    // Iterate through the columns of the original matrix.
    for (let currentColumnIndex = 0; currentColumnIndex < matrixDimension; currentColumnIndex++) {
      // The logic for a 90-degree clockwise rotation:
      // An element at `originalMatrix[old_row][old_col]` moves to `rotatedResult[old_col][matrixDimension - 1 - old_row]`.
      // The original code used `part2[i][m - j - 1] = part[j][i];`
      // Here, `i` is new_row, `m-j-1` is new_col, `j` is old_row, `i` is old_col.
      // So, `rotatedResult[new_row][new_col] = originalMatrix[old_row][old_col]` translates to:
      // `rotatedResult[currentColumnIndex][matrixDimension - 1 - currentRowIndex] = originalMatrix[currentRowIndex][currentColumnIndex];`
      // Let's use temporary variables for clarity:
      const elementFromOriginal = originalMatrix[currentRowIndex][currentColumnIndex];
      const newRowPosition = currentColumnIndex;
      const newColPosition = matrixDimension - 1 - currentRowIndex;

      rotatedResult[newRowPosition][newColPosition] = elementFromOriginal;
    }
  }

  // Return the newly created and rotated matrix.
  return rotatedResult;
};

// Define a constant for "no match found" initial coordinates, which serves as a sentinel value.
// Using an object provides more semantic meaning than a bare magic number.
const NO_MATCH_SENTINEL = { row: -1, col: -1, val: 99999999 };

// Helper function to parse a line of space-separated numbers into an array of floats.
// It uses `Number()` constructor for parsing, which is similar to `parseFloat` but handles some edge cases differently.
// `filter(Boolean)` removes any empty strings that might result from multiple spaces.
const parseNumberLine = (lineContent) => {
  return lineContent.split(/ +/).filter(Boolean).map(Number);
};

// Helper function to update the best found coordinates based on lexicographical order.
// This encapsulates the coordinate comparison logic for reuse and clarity.
const updateBestCoordinates = (currentMatchCol, currentMatchRow, bestMatchCol, bestMatchRow) => {
  let newBestCol = bestMatchCol;
  let newBestRow = bestMatchRow;

  // If no match has been found yet (indicated by the sentinel value), or if the current match
  // has a smaller column index, then this is the new best match.
  if (bestMatchCol === NO_MATCH_SENTINEL.val || currentMatchCol < bestMatchCol) {
    newBestCol = currentMatchCol;
    newBestRow = currentMatchRow;
  } else if (currentMatchCol === bestMatchCol && currentMatchRow < bestMatchRow) {
    // If the column indices are equal, then compare row indices for lexicographical order.
    newBestRow = currentMatchRow;
  }
  return { col: newBestCol, row: newBestRow };
};


// Main function to orchestrate the pattern matching process.
// It reads input, prepares data, performs the search, and outputs results.
const processMatrixSearch = () => {
  let currentInputLineIndex = 0; // Tracks the current line being processed from the global input array.

  // Loop indefinitely until a specific termination condition is met, allowing multiple test cases.
  while (true) {
    // Read and parse the dimensions line for the main image and the pattern.
    const dimensionLineValues = parseNumberLine(globalRawInputLines[currentInputLineIndex++]);
    const imageSizeN = dimensionLineValues[0];
    const patternSizeM = dimensionLineValues[1];

    // Termination condition: If both dimensions are zero (0 0), exit the processing loop.
    if (imageSizeN === 0 && patternSizeM === 0) {
      break;
    }

    // Input validation: Add a guard clause to handle cases where the pattern is larger than the image.
    // The original code would likely enter empty loops or produce incorrect results in this scenario.
    if (patternSizeM > imageSizeN) {
        console.warn(`Pattern size (${patternSizeM}) is larger than image size (${imageSizeN}). Skipping this test case.`);
        // Consume the remaining lines for this specific test case to correctly move to the next.
        // This includes N lines for the image and M lines for the pattern.
        for (let idx = 0; idx < imageSizeN + patternSizeM; idx++) {
            currentInputLineIndex++;
        }
        continue; // Proceed to the next test case in the input.
    }


    // Construct the main image matrix by parsing subsequent lines.
    const mainImageGrid = [];
    for (let r = 0; r < imageSizeN; r++) {
      mainImageGrid.push(parseNumberLine(globalRawInputLines[currentInputLineIndex++]));
    }

    // Construct the initial pattern matrix.
    let currentPatternMatrix = [];
    for (let r = 0; r < patternSizeM; r++) {
      currentPatternMatrix.push(parseNumberLine(globalRawInputLines[currentInputLineIndex++]));
    }

    // Generate all four rotations of the pattern matrix and store them.
    // The `rotateSquareMatrix` function is used iteratively to produce each rotation.
    const allPatternRotations = [];
    for (let rotationCount = 0; rotationCount < 4; rotationCount++) {
      allPatternRotations.push(currentPatternMatrix);
      // Update the pattern matrix to its next rotation for the subsequent iteration.
      currentPatternMatrix = rotateSquareMatrix(currentPatternMatrix);
    }

    // Initialize variables to store the coordinates of the lexicographically smallest match found.
    // They are set to the sentinel value indicating no match has been found yet.
    let bestMatchColumn = NO_MATCH_SENTINEL.val;
    let bestMatchRow = NO_MATCH_SENTINEL.val;

    // Outer loops: Iterate through all possible top-left starting positions for the pattern within the main image.
    // The loop condition `i <= imageSizeN - patternSizeM` correctly covers all valid starting positions (0 to N-M).
    // Note: The original code's loop condition `i < n-m` would miss the last valid row/column.
    outer_position_scan: // A descriptive label for the outer search loop.
    for (let imgRowOffset = 0; imgRowOffset <= imageSizeN - patternSizeM; imgRowOffset++) {
      for (let imgColOffset = 0; imgColOffset <= imageSizeN - patternSizeM; imgColOffset++) {

        // Inner loop: Iterate through each of the four pre-generated pattern rotations.
        for (let rotationIdx = 0; rotationIdx < 4; rotationIdx++) {
          const currentRotation = allPatternRotations[rotationIdx];
          let isCurrentPatternMatch = true; // Flag to indicate if the current pattern rotation matches at this position.
          let firstNonWildcardMatchCol = 0; // 1-indexed column of the first non-wildcard match.
          let firstNonWildcardMatchRow = 0; // 1-indexed row of the first non-wildcard match.

          // Innermost loops: Compare elements of the current pattern rotation with the corresponding part of the image.
          pattern_element_check: // A descriptive label for the pattern element comparison loop.
          for (let patRow = 0; patRow < patternSizeM; patRow++) {
            for (let patCol = 0; patCol < patternSizeM; patCol++) {
              const patternElement = currentRotation[patRow][patCol];
              const imageElement = mainImageGrid[imgRowOffset + patRow][imgColOffset + patCol];

              // If the pattern element is a wildcard (-1), it matches any image element, so skip comparison.
              if (patternElement === -1) {
                continue;
              }

              // If the pattern element and image element do not match, then this pattern rotation
              // does not match at the current position. Set the flag and break out of inner loops.
              if (patternElement !== imageElement) {
                isCurrentPatternMatch = false;
                break pattern_element_check; // Exit the inner comparison loops for this pattern.
              }

              // If this is the first non-wildcard element found to match, record its 1-indexed coordinates.
              if (firstNonWildcardMatchCol === 0 && firstNonWildcardMatchRow === 0) {
                // Coordinates are 1-indexed as per problem requirements.
                firstNonWildcardMatchCol = imgColOffset + patCol + 1;
                firstNonWildcardMatchRow = imgRowOffset + patRow + 1;
              }
            }
          }

          // If `isCurrentPatternMatch` is still true, it means a full match was found for this rotation and position.
          if (isCurrentPatternMatch) {
            // Update the global best match coordinates using the helper function.
            const updatedCoords = updateBestCoordinates(
              firstNonWildcardMatchCol,
              firstNonWildcardMatchRow,
              bestMatchColumn,
              bestMatchRow
            );
            bestMatchColumn = updatedCoords.col;
            bestMatchRow = updatedCoords.row;
          }
        }
      }
    }

    // Output the result for the current test case based on whether a match was found.
    if (bestMatchColumn !== NO_MATCH_SENTINEL.val && bestMatchRow !== NO_MATCH_SENTINEL.val) {
      // Using template literals for clean output formatting.
      console.log(`${bestMatchColumn} ${bestMatchRow}`);
    } else {
      console.log('NA'); // No match found for this test case.
    }
  }
};

// A global variable to store all raw input received from the standard input stream.
let globalInputBuffer = '';

// A global array to hold processed input lines, which will be populated once all input is received.
let globalRawInputLines = [];

// Set up event listeners for the standard input stream (`process.stdin`).
// `process.stdin.resume()` ensures the stream is flowing and ready to receive data.
process.stdin.resume();

// Specify the encoding for the input stream to correctly interpret text data.
process.stdin.setEncoding('utf8');

// Event handler for when data chunks are received from stdin.
process.stdin.on('data', (inputChunk) => {
  globalInputBuffer += inputChunk; // Append incoming data to the buffer.
});

// Event handler for when the entire input stream has ended (e.g., EOF is reached).
process.stdin.on('end', () => {
  // Split the accumulated input buffer into individual lines.
  // Using a regular expression `/\r?\n/` handles both Windows (`\r\n`) and Unix (`\n`) line endings.
  // `filter(line => line.trim() !== '')` removes any blank lines, including a potential trailing empty line.
  globalRawInputLines = globalInputBuffer.split(/\r?\n/).filter(line => line.trim() !== '');

  // Once all input is processed and prepared, invoke the main pattern searching logic.
  // Wrapping the call in a try-catch block provides basic error handling for the entire process.
  try {
    processMatrixSearch();
  } catch (error) {
    console.error("An unexpected error occurred during matrix processing:", error);
  }
});