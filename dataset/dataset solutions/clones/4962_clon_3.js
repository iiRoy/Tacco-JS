'use strict'; // Enforce strict mode for cleaner JavaScript practices

// A utility function to gracefully exit the application upon detecting an inconsistency.
// This encapsulates the common pattern of logging "No" and terminating.
const terminateApplication = (message = 'No') => {
  console.log(message); // Output the specific problem indicator
  process.exit(0);      // Exit the process successfully after reporting
};

// A robust parsing function to convert string inputs to numbers.
// This adds a layer of validation, a Type III enhancement.
const convertToNumeric = (textInput) => {
  const numericVal = Number(textInput); // Use Number() for parsing
  if (Number.isNaN(numericVal)) {
    // If the input is not a valid number, it indicates a critical input error.
    // For competitive programming, inputs are usually guaranteed, but this adds robustness.
    terminateApplication('Invalid numeric input detected');
  }
  return numericVal;
};

// Utilize the Node.js 'fs' module to read all input data.
// Reads from standard input, decodes as UTF-8, removes leading/trailing whitespace,
// and then splits the content into an array of lines.
const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Parse the first line to extract the grid's row and column dimensions.
// Each part is converted to a number using the helper function.
const gridDimensions = inputLines[0].split(' ').map(convertToNumeric);
const totalRows = gridDimensions[0]; // The total number of rows in the grid
const totalColumns = gridDimensions[1]; // The total number of columns in the grid

// Parse the second line to get the total count of data points.
const numberOfPoints = convertToNumeric(inputLines[1]);

// Slice the input array to get only the lines containing point data (r, c, a).
const pointDataStrings = inputLines.slice(2);

// Initialize variables to store the determined gradients for different categories.
// 'null' is used instead of '-1' to signify an uninitialized state, a Type II change.
let gradientXOdd = null;   // Gradient along rows for odd-indexed columns
let gradientXEven = null;  // Gradient along rows for even-indexed columns
let gradientYOdd = null;   // Gradient along columns for odd-indexed rows
let gradientYEven = null;  // Gradient along columns for even-indexed rows

// Maps to store the first encountered coordinate-value pairs.
// Renamed for Type II clarity: 'map_x_odd' -> 'storageRowOdd' etc.
// Each map stores { index: [other_index, value] }.
let storageRowOdd = new Map();  // Stores {row: [column, value]} for odd row index
let storageRowEven = new Map(); // Stores {row: [column, value]} for even row index
let storageColOdd = new Map();  // Stores {column: [row, value]} for odd column index
let storageColEven = new Map(); // Stores {column: [row, value]} for even column index

// Helper function to calculate the "distance" or factor for boundary checks.
// This encapsulates repetitive logic, a Type III addition.
const calculateOffsetFactor = (currentCoord, totalDim, isEvenParity, isStartBound) => {
    if (isStartBound) { // Check for the lower bound (e.g., row 1 or col 1)
        if (isEvenParity) { // For even coordinates
            return (currentCoord / 2) - 1;
        } else { // For odd coordinates
            return (currentCoord - 1) / 2 | 0; // Using bitwise OR for floor, Type II/III variation
        }
    } else { // Check for the upper bound (e.g., row 'totalRows' or col 'totalColumns')
        return (totalDim - currentCoord) / 2 | 0; // Using bitwise OR for floor
    }
};

// Main loop to process each input data point.
for (let pointIndex = 0; pointIndex < numberOfPoints; pointIndex++) {
  // Parse the current point's row, column, and 'a' value.
  const currentPointParts = pointDataStrings[pointIndex].split(' ');
  const currentRow = convertToNumeric(currentPointParts[0]);
  const currentColumn = convertToNumeric(currentPointParts[1]);
  const currentValue = convertToNumeric(currentPointParts[2]);

  // --- Consistency check along the Y-axis (columns) ---
  // This section ensures 'a' values are consistent vertically.
  // Special handling for a grid with only 2 rows.
  if (totalRows === 2) {
    if (storageColEven.has(currentColumn)) {
      // If a previous point already exists in this column
      const previousEntry = storageColEven.get(currentColumn);
      const previousRow = previousEntry[0];
      const previousValue = previousEntry[1];

      const rowDelta = currentRow - previousRow;
      // Guard against division by zero (Type III addition).
      // If rowDelta is zero, points are at the same (r,c).
      if (rowDelta === 0) {
        if (currentValue !== previousValue) { // Inconsistent if values differ
          terminateApplication();
        }
        continue; // No gradient to calculate, move to next point
      }

      // Calculate the gradient. Rewritten to avoid conditional sign flip (Type III).
      const calculatedGradient = (previousValue - currentValue) / rowDelta;

      // If this is the first gradient determined for this category (Y-even)
      if (gradientYEven === null) {
        gradientYEven = calculatedGradient; // Set the global gradient for this category

        // Validate all existing points in this category against the newly found gradient.
        for (const [entryCol, entryInfo] of storageColEven.entries()) {
          const entryRow = entryInfo[0];
          const entryVal = entryInfo[1];

          // Check extrapolated values at grid boundaries.
          // Original expressions are maintained.
          const lowerBoundProjection = entryVal - calculatedGradient * (entryRow - 1);
          const upperBoundProjection = entryVal + calculatedGradient * (totalRows - entryRow);

          if (lowerBoundProjection < 0 || upperBoundProjection < 0) {
            terminateApplication();
          }
        }
      } else {
        // If a gradient was already established, ensure consistency with the new point.
        if (calculatedGradient !== gradientYEven) {
          terminateApplication();
        }
      }
      // Finally, validate the current point's own extrapolated values.
      const currentLowerBoundProjection = currentValue - calculatedGradient * (currentRow - 1);
      const currentUpperBoundProjection = currentValue + calculatedGradient * (totalRows - currentRow);
      if (currentLowerBoundProjection < 0 || currentUpperBoundProjection < 0) {
        terminateApplication();
      }
    } else {
      // If this is the first point for this column (in the 2-row context), store it.
      storageColEven.set(currentColumn, [currentRow, currentValue]);
    }
  } else { // For grids with more than 2 rows
    // Check if the current row index is even using bitwise AND (Type II/III).
    if (!(currentRow & 1)) {
      if (storageColEven.has(currentColumn)) {
        const previousEntry = storageColEven.get(currentColumn);
        const previousRow = previousEntry[0];
        const previousValue = previousEntry[1];

        const rowDeltaScaled = (currentRow - previousRow) / 2;
        if (rowDeltaScaled === 0) {
          if (currentValue !== previousValue) { terminateApplication(); }
          continue;
        }

        const calculatedGradient = (previousValue - currentValue) / rowDeltaScaled;

        if (gradientYEven === null) {
          gradientYEven = calculatedGradient;

          for (const [entryCol, entryInfo] of storageColEven.entries()) {
            const entryRow = entryInfo[0];
            const entryVal = entryInfo[1];

            const lowerProjection = entryVal - calculatedGradient * calculateOffsetFactor(entryRow, totalRows, true, true);
            const upperProjection = entryVal + calculatedGradient * calculateOffsetFactor(entryRow, totalRows, true, false);

            if (lowerProjection < 0 || upperProjection < 0) {
              terminateApplication();
            }
          }
        } else {
          if (calculatedGradient !== gradientYEven) {
            terminateApplication();
          }
        }
        const currentLowerProjection = currentValue - calculatedGradient * calculateOffsetFactor(currentRow, totalRows, true, true);
        const currentUpperProjection = currentValue + calculatedGradient * calculateOffsetFactor(currentRow, totalRows, true, false);
        if (currentLowerProjection < 0 || currentUpperProjection < 0) {
          terminateApplication();
        }
      } else {
        storageColEven.set(currentColumn, [currentRow, currentValue]);
      }
    } else { // Current row index is odd.
      if (storageColOdd.has(currentColumn)) {
        const previousEntry = storageColOdd.get(currentColumn);
        const previousRow = previousEntry[0];
        const previousValue = previousEntry[1];

        const rowDeltaScaled = (currentRow - previousRow) / 2;
        if (rowDeltaScaled === 0) {
          if (currentValue !== previousValue) { terminateApplication(); }
          continue;
        }

        const calculatedGradient = (previousValue - currentValue) / rowDeltaScaled;

        if (gradientYOdd === null) {
          gradientYOdd = calculatedGradient;

          for (const [entryCol, entryInfo] of storageColOdd.entries()) {
            const entryRow = entryInfo[0];
            const entryVal = entryInfo[1];

            const lowerProjection = entryVal - calculatedGradient * calculateOffsetFactor(entryRow, totalRows, false, true);
            const upperProjection = entryVal + calculatedGradient * calculateOffsetFactor(entryRow, totalRows, false, false);

            if (lowerProjection < 0 || upperProjection < 0) {
              terminateApplication();
            }
          }
        } else {
          if (calculatedGradient !== gradientYOdd) {
            terminateApplication();
          }
        }
        const currentLowerProjection = currentValue - calculatedGradient * calculateOffsetFactor(currentRow, totalRows, false, true);
        const currentUpperProjection = currentValue + calculatedGradient * calculateOffsetFactor(currentRow, totalRows, false, false);
        if (currentLowerProjection < 0 || currentUpperProjection < 0) {
          terminateApplication();
        }
      } else {
        storageColOdd.set(currentColumn, [currentRow, currentValue]);
      }
    }
  }

  // --- Consistency check along the X-axis (rows) ---
  // This section ensures 'a' values are consistent horizontally.
  // Special handling for a grid with only 2 columns.
  if (totalColumns === 2) {
    if (storageRowEven.has(currentRow)) {
      const previousEntry = storageRowEven.get(currentRow);
      const previousColumn = previousEntry[0];
      const previousValue = previousEntry[1];

      const colDelta = currentColumn - previousColumn;
      if (colDelta === 0) {
        if (currentValue !== previousValue) { terminateApplication(); }
        continue;
      }

      const calculatedGradient = (previousValue - currentValue) / colDelta;

      if (gradientXEven === null) {
        gradientXEven = calculatedGradient;

        for (const [entryRow, entryInfo] of storageRowEven.entries()) {
          const entryCol = entryInfo[0];
          const entryVal = entryInfo[1];

          const lowerProjection = entryVal - calculatedGradient * (entryCol - 1);
          const upperProjection = entryVal + calculatedGradient * (totalColumns - entryCol);

          if (lowerProjection < 0 || upperProjection < 0) {
            terminateApplication();
          }
        }
      } else {
        if (calculatedGradient !== gradientXEven) {
          terminateApplication();
        }
      }
      const currentLowerProjection = currentValue - calculatedGradient * (currentColumn - 1);
      const currentUpperProjection = currentValue + calculatedGradient * (totalColumns - currentColumn);
      if (currentLowerProjection < 0 || currentUpperProjection < 0) {
        terminateApplication();
      }
    } else {
      storageRowEven.set(currentRow, [currentColumn, currentValue]);
    }
  } else { // For grids with more than 2 columns
    // Check if the current column index is even using bitwise AND.
    if (!(currentColumn & 1)) {
      if (storageRowEven.has(currentRow)) {
        const previousEntry = storageRowEven.get(currentRow);
        const previousColumn = previousEntry[0];
        const previousValue = previousEntry[1];

        const colDeltaScaled = (currentColumn - previousColumn) / 2;
        if (colDeltaScaled === 0) {
          if (currentValue !== previousValue) { terminateApplication(); }
          continue;
        }

        const calculatedGradient = (previousValue - currentValue) / colDeltaScaled;

        if (gradientXEven === null) {
          gradientXEven = calculatedGradient;

          for (const [entryRow, entryInfo] of storageRowEven.entries()) {
            const entryCol = entryInfo[0];
            const entryVal = entryInfo[1];

            const lowerProjection = entryVal - calculatedGradient * calculateOffsetFactor(entryCol, totalColumns, true, true);
            const upperProjection = entryVal + calculatedGradient * calculateOffsetFactor(entryCol, totalColumns, true, false);

            if (lowerProjection < 0 || upperProjection < 0) {
              terminateApplication();
            }
          }
        } else {
          if (calculatedGradient !== gradientXEven) {
            terminateApplication();
          }
        }
        const currentLowerProjection = currentValue - calculatedGradient * calculateOffsetFactor(currentColumn, totalColumns, true, true);
        const currentUpperProjection = currentValue + calculatedGradient * calculateOffsetFactor(currentColumn, totalColumns, true, false);
        if (currentLowerProjection < 0 || currentUpperProjection < 0) {
          terminateApplication();
        }
      } else {
        storageRowEven.set(currentRow, [currentColumn, currentValue]);
      }
    } else { // Current column index is odd.
      if (storageRowOdd.has(currentRow)) {
        const previousEntry = storageRowOdd.get(currentRow);
        const previousColumn = previousEntry[0];
        const previousValue = previousEntry[1];

        const colDeltaScaled = (currentColumn - previousColumn) / 2;
        if (colDeltaScaled === 0) {
          if (currentValue !== previousValue) { terminateApplication(); }
          continue;
        }

        const calculatedGradient = (previousValue - currentValue) / colDeltaScaled;

        if (gradientXOdd === null) {
          gradientXOdd = calculatedGradient;

          for (const [entryRow, entryInfo] of storageRowOdd.entries()) {
            const entryCol = entryInfo[0];
            const entryVal = entryInfo[1];

            const lowerProjection = entryVal - calculatedGradient * calculateOffsetFactor(entryCol, totalColumns, false, true);
            const upperProjection = entryVal + calculatedGradient * calculateOffsetFactor(entryCol, totalColumns, false, false);

            if (lowerProjection < 0 || upperProjection < 0) {
              terminateApplication();
            }
          }
        } else {
          if (calculatedGradient !== gradientXOdd) {
            terminateApplication();
          }
        }
        const currentLowerProjection = currentValue - calculatedGradient * calculateOffsetFactor(currentColumn, totalColumns, false, true);
        const currentUpperProjection = currentValue + calculatedGradient * calculateOffsetFactor(currentColumn, totalColumns, false, false);
        if (currentLowerProjection < 0 || currentUpperProjection < 0) {
          terminateApplication();
        }
      } else {
        storageRowOdd.set(currentRow, [currentColumn, currentValue]);
      }
    }
  }
}

// If the entire loop completes without calling terminateApplication(),
// it means all points are consistent.
console.log('Yes');