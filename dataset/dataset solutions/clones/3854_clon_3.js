"use strict";

/**
 * Processes a grid represented by a string input to determine if every '#' character
 * has at least one adjacent '#' character (horizontally or vertically).
 * Prints "Yes" if all '#' cells are connected, otherwise prints "No".
 *
 * @param {string} sourceContent - The raw string input, typically from stdin.
 *                                 Expected format:
 *                                 "H W\n"
 *                                 "row1\n"
 *                                 "row2\n"
 *                                 ...
 *                                 "rowH"
 */
const evaluateGridConnectivity = function (sourceContent) {
  // Validate initial input: ensure it's not null, empty, or just whitespace.
  if (!sourceContent || sourceContent.trim().length === 0) {
    console.log("No");
    return;
  }

  // Split the entire input string into an array of individual lines.
  // Using a regex for split ensures cross-platform compatibility with different line endings.
  const inputRecords = sourceContent.split(/\r?\n/);

  // Parse the grid dimensions (height and width) from the first line.
  // Destructure the split string and convert to integers using parseInt with radix.
  const [heightString, widthString] = inputRecords[0].split(' ');
  const gridHeight = parseInt(heightString, 10);
  const gridWidth = parseInt(widthString, 10);

  // Perform basic validation on the parsed dimensions.
  // Dimensions must be valid numbers and positive.
  if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
    console.log("No"); // Invalid or non-positive dimensions indicate an issue.
    return;
  }

  // Construct the character matrix (grid) from the subsequent lines of input.
  const characterMatrix = [];
  // Iterate from the second line of input (index 1) up to the declared grid height.
  for (let currentRowIndex = 1; currentRowIndex <= gridHeight; currentRowIndex++) {
    // Ensure that the input actually contains enough lines for the declared height.
    if (currentRowIndex < inputRecords.length) {
      characterMatrix.push(inputRecords[currentRowIndex]);
    } else {
      // If the input is truncated, it's malformed.
      console.log("No");
      return;
    }
  }

  // Initialize a global flag to track the overall connectivity status.
  // It starts as true and will be set to false if any '#' cell fails the condition.
  let overallConnectivityStatus = true;

  // Iterate through each row of the character matrix.
  for (let r = 0; r < gridHeight; r++) {
    const currentLineChars = characterMatrix[r].split('');

    // Pre-check for row integrity: ensure the current row's length matches the declared grid width.
    if (currentLineChars.length !== gridWidth) {
      console.log("No"); // Malformed row (length mismatch).
      return;
    }

    // Iterate through each character (column) in the current row.
    for (let c = 0; c < gridWidth; c++) {
      const cellValue = currentLineChars[c];

      // We are only interested in '#' cells for connectivity checks.
      if (cellValue === '#') {
        let hasConnectedNeighbor = false; // Flag for the current cell's connectivity.

        // Define relative coordinates for potential neighbors: [delta_row, delta_col].
        // This covers left, right, up, and down neighbors.
        const neighborDisplacements = [
          [0, -1], // Left
          [0, 1],  // Right
          [-1, 0], // Up
          [1, 0]   // Down
        ];

        // Check all four potential neighbors for the current '#' cell.
        for (const [dr, dc] of neighborDisplacements) {
          const neighborRow = r + dr;
          const neighborCol = c + dc;

          // First, verify if the neighbor coordinates are within the grid boundaries.
          if (neighborRow >= 0 && neighborRow < gridHeight &&
              neighborCol >= 0 && neighborCol < gridWidth) {
            // Retrieve the character of the potential neighbor.
            const neighborCharacter = characterMatrix[neighborRow][neighborCol];

            // If a '#' neighbor is found, the current cell is connected.
            // Set the flag and stop checking other neighbors for this cell.
            if (neighborCharacter === '#') {
              hasConnectedNeighbor = true;
              break; // Exit the neighborDisplacements loop.
            }
          }
        }

        // If a '#' cell was found but had no '#' neighbors, the overall condition fails.
        if (!hasConnectedNeighbor) {
          overallConnectivityStatus = false;
          // Since the condition has already failed, we can stop processing further cells.
          break; // Exit the inner (column) loop.
        }
      }
    }

    // If the overall connectivity status has already become false,
    // there's no need to process the remaining rows.
    if (!overallConnectivityStatus) {
      break; // Exit the outer (row) loop.
    }
  }

  // Output the final result based on the comprehensive connectivity check.
  if (overallConnectivityStatus) {
    console.log("Yes");
  } else {
    console.log("No");
  }
};

// Invoke the grid analysis function, reading input from standard input.
evaluateGridConnectivity(require('fs').readFileSync('/dev/stdin', 'utf-8'));