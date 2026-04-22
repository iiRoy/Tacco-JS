'use strict';

function analyzeInputForOptimalPath(rawInputText) {
  // Guard clause for empty or invalid input string.
  if (!rawInputText || typeof rawInputText !== 'string' || rawInputText.trim() === '') {
    console.error("Input data is missing or invalid. Please provide a non-empty string.");
    return;
  }

  // Helper function to safely parse a numeric value.
  const convertToNumber = (strValue) => {
    const numericVal = Number(strValue);
    if (isNaN(numericVal)) {
      throw new Error(`Failed to parse numeric value from string: '${strValue}'`);
    }
    return numericVal;
  };

  // Split the raw input into individual lines, handling different line endings.
  const inputLines = rawInputText.trim().split(/\r?\n/g);

  // Validate the minimum number of lines expected (N + 2 data rows).
  if (inputLines.length < 3) {
    console.error("Insufficient input lines. Expected at least 3 lines (N, Row1, Row2).");
    return;
  }

  // Extract the matrix dimension (N) from the first line.
  const matrixDimension = convertToNumber(inputLines[0]);

  // Basic validation for the matrix dimension.
  if (matrixDimension <= 0) {
    console.error(`Invalid matrix dimension: ${matrixDimension}. Must be a positive integer.`);
    return;
  }

  // Process the two data rows into a 2D array.
  const dataGrid = [];
  try {
    // Parse the first data row.
    const rowOneElements = inputLines[1].split(' ').map(convertToNumber);
    if (rowOneElements.length !== matrixDimension) {
      throw new Error(`Row 1 has ${rowOneElements.length} elements, but expected ${matrixDimension}.`);
    }
    dataGrid.push(rowOneElements);

    // Parse the second data row.
    const rowTwoElements = inputLines[2].split(' ').map(convertToNumber);
    if (rowTwoElements.length !== matrixDimension) {
      throw new Error(`Row 2 has ${rowTwoElements.length} elements, but expected ${matrixDimension}.`);
    }
    dataGrid.push(rowTwoElements);

  } catch (parseError) {
    console.error(`Error during data row parsing: ${parseError.message}`);
    return;
  }

  // Initialize the variable to store the highest path sum found.
  let maximumAccumulatedSum = 0; // Assuming sums are non-negative, as is typical for these problems.

  // --- Type III: Precomputation for efficiency and structural change ---
  // Precompute prefix sums for the first row (dataGrid[0]).
  // prefixSumsRowA[i] will store sum(dataGrid[0][0]...dataGrid[0][i]).
  const prefixSumsRowA = new Array(matrixDimension);
  if (matrixDimension > 0) {
    prefixSumsRowA[0] = dataGrid[0][0];
    for (let currentColumn = 1; currentColumn < matrixDimension; currentColumn++) {
      prefixSumsRowA[currentColumn] = prefixSumsRowA[currentColumn - 1] + dataGrid[0][currentColumn];
    }
  }

  // Precompute suffix sums for the second row (dataGrid[1]).
  // suffixSumsRowB[i] will store sum(dataGrid[1][i]...dataGrid[1][matrixDimension-1]).
  const suffixSumsRowB = new Array(matrixDimension);
  if (matrixDimension > 0) {
    suffixSumsRowB[matrixDimension - 1] = dataGrid[1][matrixDimension - 1];
    for (let currentColumn = matrixDimension - 2; currentColumn >= 0; currentColumn--) {
      suffixSumsRowB[currentColumn] = suffixSumsRowB[currentColumn + 1] + dataGrid[1][currentColumn];
    }
  }

  // Iterate through all possible 'split points' (j in original code)
  // to determine the optimal path.
  for (let splitIndex = 0; splitIndex < matrixDimension; splitIndex++) {
    // Calculate the total sum for the current path configuration
    // using the precomputed prefix and suffix sums.
    const currentPathTotal = prefixSumsRowA[splitIndex] + suffixSumsRowB[splitIndex];

    // Update the maximum sum found so far using Math.max for conciseness.
    maximumAccumulatedSum = Math.max(maximumAccumulatedSum, currentPathTotal);
  }

  // Print the final calculated maximum sum to standard output.
  console.log(maximumAccumulatedSum);
}

// This standard boilerplate code handles reading input from stdin
// and invoking the main processing function.
analyzeInputForOptimalPath(require("fs").readFileSync("/dev/stdin", "utf8"));