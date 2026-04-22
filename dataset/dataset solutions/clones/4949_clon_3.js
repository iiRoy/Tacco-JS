'use strict';

// Function to handle early program termination with a 'No' output.
// This encapsulates the exit logic for cleaner code and potential future logging.
const signalFailureAndExit = () => {
    console.log('No');
    process.exit(1); // Indicate an abnormal termination.
};

// --- Data Acquisition and Initial Parsing ---
// Read input from standard input, decode as UTF-8,
// remove any surrounding whitespace, and split into an array of lines.
const sourceDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(/\r?\n/);

// Parse the first line to determine the grid dimensions: total rows and columns.
const gridDimensionsSplit = sourceDataLines[0].split(' ');
const totalRowsInGrid = Number(gridDimensionsSplit[0]); // Explicitly convert to number.
const totalColsInGrid = Number(gridDimensionsSplit[1]); // Explicitly convert to number.

// Parse the second line to get the total number of data points to process.
const numberOfInputPoints = parseInt(sourceDataLines[1], 10); // Ensure base 10 parsing.

// Extract the actual data points from the input, skipping the first two lines.
const individualPointSpecs = sourceDataLines.slice(2);

// --- Global State for Slope Tracking and Point Caching ---
// These variables will store the determined common difference (slope) for each
// category (row/column, odd/even parity). Initialized to `null` to signify 'not yet set'.
let horizontalSlopeOddRow = null;
let horizontalSlopeEvenRow = null;
let verticalSlopeOddCol = null;
let verticalSlopeEvenCol = null;

// Maps to store previously encountered points, categorized by their fixed coordinate
// and the parity of the varying coordinate.
// For horizontal checks (along rows, varying columns):
const pointsOnEvenRows = new Map(); // Key: row_index, Value: [column_index, associated_value]
const pointsOnOddRows = new Map();  // Key: row_index, Value: [column_index, associated_value]
// For vertical checks (along columns, varying rows):
const pointsInEvenCols = new Map(); // Key: column_index, Value: [row_index, associated_value]
const pointsInOddCols = new Map();  // Key: column_index, Value: [row_index, associated_value]

// --- Utility Function for Value Constraint Checks ---
// This function checks if a calculated value based on a linear progression
// falls below zero under two different boundary conditions.
const verifyValueRange = (currentValue, slopeRate, termCalculationA, termCalculationB) => {
    // If either extrapolated value is negative, the constraint is violated.
    return (currentValue - slopeRate * termCalculationA < 0) || (currentValue + slopeRate * termCalculationB < 0);
};

// --- Main Processing Loop: Iterating Through Each Data Point ---
// Each point provides a (row, column, value) triplet that must conform to
// specific linear progression rules across the grid.
for (let pointIdx = 0; pointIdx < numberOfInputPoints; ++pointIdx) {
    // Parse the current point's data.
    const currentPointString = individualPointSpecs[pointIdx].split(' ');
    const currentPointRow = parseInt(currentPointString[0], 10);
    const currentPointCol = parseInt(currentPointString[1], 10);
    const currentPointValue = parseInt(currentPointString[2], 10);

    // --- Validate Vertical Consistency (along columns for a fixed row) ---
    // This part checks how values change as columns vary for a given row.
    if (totalRowsInGrid === 2) {
        // Special logic for a 2-row grid. All points are treated similarly here.
        const existingEntry = pointsInEvenCols.get(currentPointCol);

        if (existingEntry) {
            // If another point for this column was seen, calculate the slope.
            const previousRow = existingEntry[0];
            const previousValue = existingEntry[1];

            // The denominator is (previous row - current row), which will be +/-1.
            const computedSlope = (previousValue - currentPointValue) / (previousRow - currentPointRow);

            if (verticalSlopeEvenCol === null) {
                // If this is the first slope determined for this category, set it.
                verticalSlopeEvenCol = computedSlope;

                // Then, validate all previously stored points against this new slope.
                for (const [colIdentifier, [rValue, aValue]] of pointsInEvenCols.entries()) {
                    const termForR1 = (rValue - 1);
                    const termForR2 = (2 - rValue); // (totalRowsInGrid - rValue) where totalRowsInGrid=2

                    if (verifyValueRange(aValue, verticalSlopeEvenCol, termForR1, termForR2)) {
                        signalFailureAndExit();
                    }
                }
            } else {
                // If a slope was already set, ensure the new one matches.
                if (computedSlope !== verticalSlopeEvenCol) {
                    signalFailureAndExit();
                }
            }

            // Finally, validate the current point with the determined slope.
            const currentTermR1 = (currentPointRow - 1);
            const currentTermR2 = (2 - currentPointRow);

            if (verifyValueRange(currentPointValue, computedSlope, currentTermR1, currentTermR2)) {
                signalFailureAndExit();
            }

        } else {
            // No previous point for this column to calculate a slope.
            if (verticalSlopeEvenCol !== null) {
                // If a general slope for this category is already known, validate this point.
                const currentTermR1 = (currentPointRow - 1);
                const currentTermR2 = (2 - currentPointRow);

                if (verifyValueRange(currentPointValue, verticalSlopeEvenCol, currentTermR1, currentTermR2)) {
                    signalFailureAndExit();
                }
            }
            // Store the current point for future comparisons.
            pointsInEvenCols.set(currentPointCol, [currentPointRow, currentPointValue]);
        }

    } else {
        // General case for grids with more than 2 rows.
        // Points are categorized by the parity of their row index.
        const isCurrentPointRowEven = (currentPointRow % 2 === 0);

        if (isCurrentPointRowEven) {
            // Processing for points on even-indexed rows.
            const existingEntry = pointsInEvenCols.get(currentPointCol);

            if (existingEntry) {
                const previousRow = existingEntry[0];
                const previousValue = existingEntry[1];

                // Slope calculation for even rows, adjusted by (row difference / 2).
                const computedSlope = (previousValue - currentPointValue) / ((previousRow - currentPointRow) / 2);

                if (verticalSlopeEvenCol === null) {
                    verticalSlopeEvenCol = computedSlope;
                    for (const [colIdentifier, [rValue, aValue]] of pointsInEvenCols.entries()) {
                        const termForR1 = (rValue / 2) - 1;
                        const termForR2 = Math.floor((totalRowsInGrid - rValue) / 2);

                        if (verifyValueRange(aValue, verticalSlopeEvenCol, termForR1, termForR2)) {
                            signalFailureAndExit();
                        }
                    }
                } else {
                    if (computedSlope !== verticalSlopeEvenCol) {
                        signalFailureAndExit();
                    }
                }

                const currentTermR1 = (currentPointRow / 2) - 1;
                const currentTermR2 = Math.floor((totalRowsInGrid - currentPointRow) / 2);

                if (verifyValueRange(currentPointValue, computedSlope, currentTermR1, currentTermR2)) {
                    signalFailureAndExit();
                }

            } else {
                if (verticalSlopeEvenCol !== null) {
                    const currentTermR1 = (currentPointRow / 2) - 1;
                    const currentTermR2 = Math.floor((totalRowsInGrid - currentPointRow) / 2);

                    if (verifyValueRange(currentPointValue, verticalSlopeEvenCol, currentTermR1, currentTermR2)) {
                        signalFailureAndExit();
                    }
                }
                pointsInEvenCols.set(currentPointCol, [currentPointRow, currentPointValue]);
            }

        } else {
            // Processing for points on odd-indexed rows.
            const existingEntry = pointsInOddCols.get(currentPointCol);

            if (existingEntry) {
                const previousRow = existingEntry[0];
                const previousValue = existingEntry[1];

                // Slope calculation for odd rows, adjusted by (row difference / 2).
                const computedSlope = (previousValue - currentPointValue) / ((previousRow - currentPointRow) / 2);

                if (verticalSlopeOddCol === null) {
                    verticalSlopeOddCol = computedSlope;
                    for (const [colIdentifier, [rValue, aValue]] of pointsInOddCols.entries()) {
                        const termForR1 = Math.floor((rValue - 1) / 2);
                        const termForR2 = Math.floor((totalRowsInGrid - rValue) / 2);

                        if (verifyValueRange(aValue, verticalSlopeOddCol, termForR1, termForR2)) {
                            signalFailureAndExit();
                        }
                    }
                } else {
                    if (computedSlope !== verticalSlopeOddCol) {
                        signalFailureAndExit();
                    }
                }

                const currentTermR1 = Math.floor((currentPointRow - 1) / 2);
                const currentTermR2 = Math.floor((totalRowsInGrid - currentPointRow) / 2);

                if (verifyValueRange(currentPointValue, computedSlope, currentTermR1, currentTermR2)) {
                    signalFailureAndExit();
                }

            } else {
                if (verticalSlopeOddCol !== null) {
                    const currentTermR1 = Math.floor((currentPointRow - 1) / 2);
                    const currentTermR2 = Math.floor((totalRowsInGrid - currentPointRow) / 2);

                    if (verifyValueRange(currentPointValue, verticalSlopeOddCol, currentTermR1, currentTermR2)) {
                        signalFailureAndExit();
                    }
                }
                pointsInOddCols.set(currentPointCol, [currentPointRow, currentPointValue]);
            }
        }
    }

    // --- Validate Horizontal Consistency (along rows for a fixed column) ---
    // This part checks how values change as rows vary for a given column.
    if (totalColsInGrid === 2) {
        // Special logic for a 2-column grid.
        const existingEntry = pointsOnEvenRows.get(currentPointRow);

        if (existingEntry) {
            const previousCol = existingEntry[0];
            const previousValue = existingEntry[1];

            const computedSlope = (previousValue - currentPointValue) / (previousCol - currentPointCol);

            if (horizontalSlopeEvenRow === null) {
                horizontalSlopeEvenRow = computedSlope;
                for (const [rowIdentifier, [cValue, aValue]] of pointsOnEvenRows.entries()) {
                    const termForC1 = (cValue - 1);
                    const termForC2 = (totalColsInGrid - cValue); // (C - c3) where C=2

                    if (verifyValueRange(aValue, horizontalSlopeEvenRow, termForC1, termForC2)) {
                        signalFailureAndExit();
                    }
                }
            } else {
                if (computedSlope !== horizontalSlopeEvenRow) {
                    signalFailureAndExit();
                }
            }

            const currentTermC1 = (currentPointCol - 1);
            const currentTermC2 = (totalColsInGrid - currentPointCol);

            if (verifyValueRange(currentPointValue, computedSlope, currentTermC1, currentTermC2)) {
                signalFailureAndExit();
            }

        } else {
            if (horizontalSlopeEvenRow !== null) {
                const currentTermC1 = (currentPointCol - 1);
                const currentTermC2 = (totalColsInGrid - currentPointCol);

                if (verifyValueRange(currentPointValue, horizontalSlopeEvenRow, currentTermC1, currentTermC2)) {
                    signalFailureAndExit();
                }
            }
            pointsOnEvenRows.set(currentPointRow, [currentPointCol, currentPointValue]);
        }

    } else {
        // General case for grids with more than 2 columns.
        // Points are categorized by the parity of their column index.
        const isCurrentPointColEven = (currentPointCol % 2 === 0);

        if (isCurrentPointColEven) {
            // Processing for points in even-indexed columns.
            const existingEntry = pointsOnEvenRows.get(currentPointRow);

            if (existingEntry) {
                const previousCol = existingEntry[0];
                const previousValue = existingEntry[1];

                const computedSlope = (previousValue - currentPointValue) / ((previousCol - currentPointCol) / 2);

                if (horizontalSlopeEvenRow === null) {
                    horizontalSlopeEvenRow = computedSlope;
                    for (const [rowIdentifier, [cValue, aValue]] of pointsOnEvenRows.entries()) {
                        const termForC1 = (cValue / 2) - 1;
                        const termForC2 = Math.floor((totalColsInGrid - cValue) / 2);

                        if (verifyValueRange(aValue, horizontalSlopeEvenRow, termForC1, termForC2)) {
                            signalFailureAndExit();
                        }
                    }
                } else {
                    if (computedSlope !== horizontalSlopeEvenRow) {
                        signalFailureAndExit();
                    }
                }

                const currentTermC1 = (currentPointCol / 2) - 1;
                const currentTermC2 = Math.floor((totalColsInGrid - currentPointCol) / 2);

                if (verifyValueRange(currentPointValue, computedSlope, currentTermC1, currentTermC2)) {
                    signalFailureAndExit();
                }

            } else {
                if (horizontalSlopeEvenRow !== null) {
                    const currentTermC1 = (currentPointCol / 2) - 1;
                    const currentTermC2 = Math.floor((totalColsInGrid - currentPointCol) / 2);

                    if (verifyValueRange(currentPointValue, horizontalSlopeEvenRow, currentTermC1, currentTermC2)) {
                        signalFailureAndExit();
                    }
                }
                pointsOnEvenRows.set(currentPointRow, [currentPointCol, currentPointValue]);
            }

        } else {
            // Processing for points in odd-indexed columns.
            const existingEntry = pointsOnOddRows.get(currentPointRow);

            if (existingEntry) {
                const previousCol = existingEntry[0];
                const previousValue = existingEntry[1];

                const computedSlope = (previousValue - currentPointValue) / ((previousCol - currentPointCol) / 2);

                if (horizontalSlopeOddRow === null) {
                    horizontalSlopeOddRow = computedSlope;
                    for (const [rowIdentifier, [cValue, aValue]] of pointsOnOddRows.entries()) {
                        const termForC1 = Math.floor((cValue - 1) / 2);
                        const termForC2 = Math.floor((totalColsInGrid - cValue) / 2);

                        if (verifyValueRange(aValue, horizontalSlopeOddRow, termForC1, termForC2)) {
                            signalFailureAndExit();
                        }
                    }
                } else {
                    if (computedSlope !== horizontalSlopeOddRow) {
                        signalFailureAndExit();
                    }
                }

                const currentTermC1 = Math.floor((currentPointCol - 1) / 2);
                const currentTermC2 = Math.floor((totalColsInGrid - currentPointCol) / 2);

                if (verifyValueRange(currentPointValue, computedSlope, currentTermC1, currentTermC2)) {
                    signalFailureAndExit();
                }

            } else {
                if (horizontalSlopeOddRow !== null) {
                    const currentTermC1 = Math.floor((currentPointCol - 1) / 2);
                    const currentTermC2 = Math.floor((totalColsInGrid - currentPointCol) / 2);

                    if (verifyValueRange(currentPointValue, horizontalSlopeOddRow, currentTermC1, currentTermC2)) {
                        signalFailureAndExit();
                    }
                }
                pointsOnOddRows.set(currentPointRow, [currentPointCol, currentPointValue]);
            }
        }
    }
}

// If the program reaches this point, all data points satisfied the consistency rules.
console.log('Yes');