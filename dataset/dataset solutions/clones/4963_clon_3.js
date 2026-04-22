'use strict';

// Helper function to immediately terminate the program with a "No" output.
// This centralizes the error handling and improves readability by reducing repetition.
const terminateExecutionWithFailure = () => {
    console.log('No');
    process.exit(1); // Exit with a non-zero code to indicate an error
};

// Function to check if an observed value violates its calculated bounds.
// This encapsulates the common pattern: (value - factor * term1 < 0) || (value + factor * term2 < 0)
// Returns true if a violation is detected, false otherwise.
const checkValueBounds = (observedValue, diffFactor, lowerBoundTerm, upperBoundTerm) => {
    // If the difference factor hasn't been established yet, we cannot perform this check.
    // In such cases, this function implicitly indicates no violation by returning false.
    if (diffFactor === null) {
        return false;
    }
    // Check if the observed value, adjusted by the factor and terms, falls below zero.
    // This implies a violation of the underlying linear progression model.
    return (observedValue - diffFactor * lowerBoundTerm < 0) ||
           (observedValue + diffFactor * upperBoundTerm < 0);
};

// --- Input Data Acquisition and Initial Parsing ---
// Retrieve raw input content from standard input, decode as UTF-8,
// remove any leading/trailing whitespace, and split into individual lines.
const rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Parse the grid dimensions (Number of Rows and Number of Columns) from the first input line.
// The line is expected to contain two space-separated integers.
const gridDimensions = rawInputLines[0].split(' ').map(Number);
const numRows = gridDimensions[0]; // Corresponds to 'R' in the original problem
const numCols = gridDimensions[1]; // Corresponds to 'C' in the original problem

// Parse the total count of data points (observations) from the second input line.
const totalObservations = parseInt(rawInputLines[1], 10); // Ensure base-10 parsing

// Extract the array of strings, where each string represents a (row, column, value) observation.
// These are all lines starting from the third line (index 2).
const observationStringArray = rawInputLines.slice(2);

// --- State Management for Pattern Factors and Observed Points ---
// These variables store the calculated "difference factors" (gradients) for different
// categories of points, initialized to `null` to signify "not yet determined".
// 'x' refers to checks along rows (varying columns), 'y' refers to checks along columns (varying rows).
let xOddParityFactor = null;  // Factor for points on odd-indexed columns (when iterating by row)
let xEvenParityFactor = null; // Factor for points on even-indexed columns (when iterating by row)
let yOddParityFactor = null;  // Factor for points on odd-indexed rows (when iterating by column)
let yEvenParityFactor = null; // Factor for points on even-indexed rows (when iterating by column)

// Maps to store previously encountered points, categorized by their parity and axis.
// This allows for comparison with new points to derive or validate pattern factors.
// Key: The fixed coordinate (e.g., row for x-axis checks), Value: [Variable coordinate, Observed Value]
let rowXOddCoordinates = new Map();  // Maps `row` to `[col, value]` for odd columns
let rowXEvenCoordinates = new Map(); // Maps `row` to `[col, value]` for even columns
let colYOddCoordinates = new Map();  // Maps `col` to `[row, value]` for odd rows
let colYEvenCoordinates = new Map(); // Maps `col` to `[row, value]` for even rows

// --- Main Processing Loop: Iterate Through Each Observation ---
for (let obsIndex = 0; obsIndex < totalObservations; ++obsIndex) {
    const currentObservationParts = observationStringArray[obsIndex].split(' ');
    const currentRowCoord = parseInt(currentObservationParts[0], 10);
    const currentColCoord = parseInt(currentObservationParts[1], 10);
    const currentObservedValue = parseInt(currentObservationParts[2], 10);

    // --- Section for Y-axis (Column-wise) Consistency Checks ---
    // This block analyzes patterns along columns, grouped by row parity (or special case for 2 rows).
    if (numRows === 2) {
        // Special logic for a grid with exactly 2 rows.
        // All points are treated as part of a single 'even' group for Y-axis consistency.
        if (colYEvenCoordinates.has(currentColCoord)) {
            // A previous point exists in the same column.
            const [prevRowCoord, prevObservedValue] = colYEvenCoordinates.get(currentColCoord);

            // Calculate the difference factor (gradient) using the two points.
            const diffNumerator = prevObservedValue - currentObservedValue;
            const diffDenominator = prevRowCoord - currentRowCoord;

            // Guard against division by zero if points are at the same coordinate but have different values.
            if (diffDenominator === 0 && diffNumerator !== 0) {
                terminateExecutionWithFailure();
            }
            const calculatedFactor = diffNumerator / diffDenominator;

            if (yEvenParityFactor === null) {
                // This is the first time a factor is being determined for this group.
                yEvenParityFactor = calculatedFactor;

                // Validate all previously stored points against this newly established factor.
                for (const [, [storedRow, storedValue]] of colYEvenCoordinates.entries()) {
                    const termOne = storedRow - 1;             // Equivalent to (r-1) for R=2
                    const termTwo = numRows - storedRow;       // Equivalent to (2-r) for R=2
                    if (checkValueBounds(storedValue, yEvenParityFactor, termOne, termTwo)) {
                        terminateExecutionWithFailure();
                    }
                }
            } else if (calculatedFactor !== yEvenParityFactor) {
                // Inconsistent factor detected; pattern is broken.
                terminateExecutionWithFailure();
            }

            // Validate the current point against the established factor.
            const termOne = currentRowCoord - 1;
            const termTwo = numRows - currentRowCoord;
            if (checkValueBounds(currentObservedValue, yEvenParityFactor, termOne, termTwo)) {
                terminateExecutionWithFailure();
            }
        } else {
            // No previous point in this specific column.
            // If a factor is already known, validate the current point against it.
            if (yEvenParityFactor !== null) {
                const termOne = currentRowCoord - 1;
                const termTwo = numRows - currentRowCoord;
                if (checkValueBounds(currentObservedValue, yEvenParityFactor, termOne, termTwo)) {
                    terminateExecutionWithFailure();
                }
            }
            // Store the current point for future comparisons within this column.
            colYEvenCoordinates.set(currentColCoord, [currentRowCoord, currentObservedValue]);
        }
    } else {
        // General logic for grids with more than 2 rows.
        // Points are categorized by the parity of their row coordinate.
        const isCurrentRowEven = (currentRowCoord % 2 === 0);
        if (isCurrentRowEven) {
            // Processing points on even-numbered rows.
            if (colYEvenCoordinates.has(currentColCoord)) {
                const [prevRowCoord, prevObservedValue] = colYEvenCoordinates.get(currentColCoord);
                const diffNumerator = prevObservedValue - currentObservedValue;
                const diffDenominator = (prevRowCoord - currentRowCoord) / 2;

                if (diffDenominator === 0 && diffNumerator !== 0) {
                    terminateExecutionWithFailure();
                }
                const calculatedFactor = diffNumerator / diffDenominator;

                if (yEvenParityFactor === null) {
                    yEvenParityFactor = calculatedFactor;
                    for (const [, [storedRow, storedValue]] of colYEvenCoordinates.entries()) {
                        const termOne = (storedRow / 2) - 1;
                        const termTwo = Math.floor((numRows - storedRow) / 2);
                        if (checkValueBounds(storedValue, yEvenParityFactor, termOne, termTwo)) {
                            terminateExecutionWithFailure();
                        }
                    }
                } else if (calculatedFactor !== yEvenParityFactor) {
                    terminateExecutionWithFailure();
                }
                const termOne = (currentRowCoord / 2) - 1;
                const termTwo = Math.floor((numRows - currentRowCoord) / 2);
                if (checkValueBounds(currentObservedValue, yEvenParityFactor, termOne, termTwo)) {
                    terminateExecutionWithFailure();
                }
            } else {
                if (yEvenParityFactor !== null) {
                    const termOne = (currentRowCoord / 2) - 1;
                    const termTwo = Math.floor((numRows - currentRowCoord) / 2);
                    if (checkValueBounds(currentObservedValue, yEvenParityFactor, termOne, termTwo)) {
                        terminateExecutionWithFailure();
                    }
                }
                colYEvenCoordinates.set(currentColCoord, [currentRowCoord, currentObservedValue]);
            }
        } else {
            // Processing points on odd-numbered rows.
            if (colYOddCoordinates.has(currentColCoord)) {
                const [prevRowCoord, prevObservedValue] = colYOddCoordinates.get(currentColCoord);
                const diffNumerator = prevObservedValue - currentObservedValue;
                const diffDenominator = (prevRowCoord - currentRowCoord) / 2;

                if (diffDenominator === 0 && diffNumerator !== 0) {
                    terminateExecutionWithFailure();
                }
                const calculatedFactor = diffNumerator / diffDenominator;

                if (yOddParityFactor === null) {
                    yOddParityFactor = calculatedFactor;
                    for (const [, [storedRow, storedValue]] of colYOddCoordinates.entries()) {
                        const termOne = Math.floor((storedRow - 1) / 2); // Corrected for odd rows
                        const termTwo = Math.floor((numRows - storedRow) / 2);
                        if (checkValueBounds(storedValue, yOddParityFactor, termOne, termTwo)) {
                            terminateExecutionWithFailure();
                        }
                    }
                } else if (calculatedFactor !== yOddParityFactor) {
                    terminateExecutionWithFailure();
                }
                const termOne = Math.floor((currentRowCoord - 1) / 2);
                const termTwo = Math.floor((numRows - currentRowCoord) / 2);
                if (checkValueBounds(currentObservedValue, yOddParityFactor, termOne, termTwo)) {
                    terminateExecutionWithFailure();
                }
            } else {
                if (yOddParityFactor !== null) {
                    const termOne = Math.floor((currentRowCoord - 1) / 2);
                    const termTwo = Math.floor((numRows - currentRowCoord) / 2);
                    if (checkValueBounds(currentObservedValue, yOddParityFactor, termOne, termTwo)) {
                        terminateExecutionWithFailure();
                    }
                }
                colYOddCoordinates.set(currentColCoord, [currentRowCoord, currentObservedValue]);
            }
        }
    }

    // --- Section for X-axis (Row-wise) Consistency Checks ---
    // This block analyzes patterns along rows, grouped by column parity (or special case for 2 columns).
    if (numCols === 2) {
        // Special logic for a grid with exactly 2 columns.
        // All points are treated as part of a single 'even' group for X-axis consistency.
        if (rowXEvenCoordinates.has(currentRowCoord)) {
            const [prevColCoord, prevObservedValue] = rowXEvenCoordinates.get(currentRowCoord);
            const diffNumerator = prevObservedValue - currentObservedValue;
            const diffDenominator = prevColCoord - currentColCoord;

            if (diffDenominator === 0 && diffNumerator !== 0) {
                terminateExecutionWithFailure();
            }
            const calculatedFactor = diffNumerator / diffDenominator;

            if (xEvenParityFactor === null) { // Original had -1 here, normalized to null
                xEvenParityFactor = calculatedFactor;
                for (const [, [storedCol, storedValue]] of rowXEvenCoordinates.entries()) {
                    const termOne = storedCol - 1;
                    const termTwo = numCols - storedCol;
                    if (checkValueBounds(storedValue, xEvenParityFactor, termOne, termTwo)) {
                        terminateExecutionWithFailure();
                    }
                }
            } else if (calculatedFactor !== xEvenParityFactor) {
                terminateExecutionWithFailure();
            }
            const termOne = currentColCoord - 1;
            const termTwo = numCols - currentColCoord;
            if (checkValueBounds(currentObservedValue, xEvenParityFactor, termOne, termTwo)) {
                terminateExecutionWithFailure();
            }
        } else {
            if (xEvenParityFactor !== null) {
                const termOne = currentColCoord - 1;
                const termTwo = numCols - currentColCoord;
                if (checkValueBounds(currentObservedValue, xEvenParityFactor, termOne, termTwo)) {
                    terminateExecutionWithFailure();
                }
            }
            rowXEvenCoordinates.set(currentRowCoord, [currentColCoord, currentObservedValue]);
        }
    } else {
        // General logic for grids with more than 2 columns.
        // Points are categorized by the parity of their column coordinate.
        const isCurrentColEven = (currentColCoord % 2 === 0);
        if (isCurrentColEven) {
            // Processing points on even-numbered columns.
            if (rowXEvenCoordinates.has(currentRowCoord)) {
                const [prevColCoord, prevObservedValue] = rowXEvenCoordinates.get(currentRowCoord);
                const diffNumerator = prevObservedValue - currentObservedValue;
                const diffDenominator = (prevColCoord - currentColCoord) / 2;

                if (diffDenominator === 0 && diffNumerator !== 0) {
                    terminateExecutionWithFailure();
                }
                const calculatedFactor = diffNumerator / diffDenominator;

                if (xEvenParityFactor === null) {
                    xEvenParityFactor = calculatedFactor;
                    for (const [, [storedCol, storedValue]] of rowXEvenCoordinates.entries()) {
                        const termOne = (storedCol / 2) - 1;
                        const termTwo = Math.floor((numCols - storedCol) / 2);
                        if (checkValueBounds(storedValue, xEvenParityFactor, termOne, termTwo)) {
                            terminateExecutionWithFailure();
                        }
                    }
                } else if (calculatedFactor !== xEvenParityFactor) {
                    terminateExecutionWithFailure();
                }
                const termOne = (currentColCoord / 2) - 1;
                const termTwo = Math.floor((numCols - currentColCoord) / 2);
                if (checkValueBounds(currentObservedValue, xEvenParityFactor, termOne, termTwo)) {
                    terminateExecutionWithFailure();
                }
            } else {
                if (xEvenParityFactor !== null) {
                    const termOne = (currentColCoord / 2) - 1;
                    const termTwo = Math.floor((numCols - currentColCoord) / 2);
                    if (checkValueBounds(currentObservedValue, xEvenParityFactor, termOne, termTwo)) {
                        terminateExecutionWithFailure();
                    }
                }
                rowXEvenCoordinates.set(currentRowCoord, [currentColCoord, currentObservedValue]);
            }
        } else {
            // Processing points on odd-numbered columns.
            if (rowXOddCoordinates.has(currentRowCoord)) {
                const [prevColCoord, prevObservedValue] = rowXOddCoordinates.get(currentRowCoord);
                const diffNumerator = prevObservedValue - currentObservedValue;
                const diffDenominator = (prevColCoord - currentColCoord) / 2;

                if (diffDenominator === 0 && diffNumerator !== 0) {
                    terminateExecutionWithFailure();
                }
                const calculatedFactor = diffNumerator / diffDenominator;

                if (xOddParityFactor === null) {
                    xOddParityFactor = calculatedFactor;
                    for (const [, [storedCol, storedValue]] of rowXOddCoordinates.entries()) {
                        const termOne = Math.floor((storedCol - 1) / 2); // Corrected for odd columns
                        const termTwo = Math.floor((numCols - storedCol) / 2);
                        if (checkValueBounds(storedValue, xOddParityFactor, termOne, termTwo)) {
                            terminateExecutionWithFailure();
                        }
                    }
                } else if (calculatedFactor !== xOddParityFactor) {
                    terminateExecutionWithFailure();
                }
                const termOne = Math.floor((currentColCoord - 1) / 2);
                const termTwo = Math.floor((numCols - currentColCoord) / 2);
                if (checkValueBounds(currentObservedValue, xOddParityFactor, termOne, termTwo)) {
                    terminateExecutionWithFailure();
                }
            } else {
                if (xOddParityFactor !== null) {
                    const termOne = Math.floor((currentColCoord - 1) / 2);
                    const termTwo = Math.floor((numCols - currentColCoord) / 2);
                    if (checkValueBounds(currentObservedValue, xOddParityFactor, termOne, termTwo)) {
                        terminateExecutionWithFailure();
                    }
                }
                rowXOddCoordinates.set(currentRowCoord, [currentColCoord, currentObservedValue]);
            }
        }
    }
}

// If the program completes the loop without any inconsistencies, print "Yes".
console.log('Yes');