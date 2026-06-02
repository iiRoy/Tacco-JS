'use strict';
// Retrieve input data from standard input.
// Reads the entire file, decodes as UTF-8, removes leading/trailing whitespace, and splits into an array of lines.
const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Parse the first line to get the grid dimensions (number of rows and columns).
const gridDimensions = inputLines[0].split(' ').map(Number);
const numRows = gridDimensions[0]; // The total count of rows in the grid.
const numCols = gridDimensions[1]; // The total count of columns in the grid.
const numPoints = parseInt(inputLines[1]); // The quantity of data points to process.

// Extract the actual data points (each containing a row, column, and value) from the input.
const pointData = inputLines.slice(2);

// Initialize variables to store the common differences (slopes) found along X and Y axes,
// categorized by the parity of the coordinate. 'false' indicates no difference has been established yet.
let xOddDiff = false;
let xEvenDiff = false;
let yOddDiff = false;
let yEvenDiff = false;

// Initialize Maps to store previously encountered points.
// These maps help in finding a second point on the same line (same row for X-maps, same column for Y-maps)
// to calculate a difference.
// Keys are the fixed coordinate (row for X-maps, column for Y-maps), values are an array [other_coord, value].
let xOddMap = new Map();
let xEvenMap = new Map();
let yOddMap = new Map();
let yEvenMap = new Map();

// Iterate through each provided data point.
for (let pointIndex = 0; pointIndex < numPoints; pointIndex++) {
    // Parse the current data point string into its components: row, column, and value.
    let currentPointString = pointData[pointIndex].split(' ');
    let rowCoordinate = parseInt(currentPointString[0]);
    let colCoordinate = parseInt(currentPointString[1]);
    let valueAtPoint = parseInt(currentPointString[2]);

    // --- Processing for Y-axis (vertical) differences ---
    // This section handles calculations and validations for differences along columns.
    if (numRows === 2) {
        // Special handling for a grid with exactly two rows.
        // In this scenario, all row-based calculations effectively treat rows as 'even' for simplicity.
        if (yEvenMap.has(colCoordinate)) {
            // If another point has already been recorded for this column.
            let previousRowValue = yEvenMap.get(colCoordinate);
            let previousRow = previousRowValue[0];
            let previousValue = previousRowValue[1];

            // Calculate the common difference (slope) using the current and previous points.
            let calculatedDifference = (previousValue - valueAtPoint) / (previousRow - rowCoordinate);

            if (yEvenDiff === false) {
                // If this is the first time a y-even difference is determined.
                yEvenDiff = calculatedDifference;

                // Validate all previously stored y-even points against this newly found difference.
                for (let mapEntry of yEvenMap.entries()) {
                    let iteratedColumn = mapEntry[0]; // The column (map key).
                    let iteratedRow = mapEntry[1][0]; // The row of the stored point.
                    let iteratedValue = mapEntry[1][1]; // The value of the stored point.

                    // Check if the value at the boundaries (row 1 or row 2) would become negative.
                    if (iteratedValue - calculatedDifference * (iteratedRow - 1) < 0 ||
                        iteratedValue + calculatedDifference * (2 - iteratedRow) < 0) {
                        console.log('No');
                        process.exit(); // Exit if an invalid state is found.
                    }
                }
            } else {
                // If a y-even difference was already established, ensure consistency.
                if (calculatedDifference !== yEvenDiff) {
                    console.log('No');
                    process.exit(); // Exit if the new difference is inconsistent.
                }
            }

            // Validate the current point against the established difference.
            if (valueAtPoint - calculatedDifference * (rowCoordinate - 1) < 0 ||
                valueAtPoint + calculatedDifference * (2 - rowCoordinate) < 0) {
                console.log('No');
                process.exit(); // Exit if the current point is invalid.
            }

        } else {
            // If this is the first point encountered for this specific column.
            if (yEvenDiff !== false) {
                // If a common y-even difference already exists, validate this point against it.
                if (valueAtPoint - yEvenDiff * (rowCoordinate - 1) < 0 ||
                    valueAtPoint + yEvenDiff * (2 - rowCoordinate) < 0) {
                    console.log('No');
                    process.exit(); // Exit if the point is invalid with the existing difference.
                }
            }
            // Store the current point's row and value in the map for future comparisons.
            yEvenMap.set(colCoordinate, [rowCoordinate, valueAtPoint]);
        }

    } else {
        // General case: Grid has more than two rows.
        // Differences are categorized based on the parity of the row coordinate.
        if (rowCoordinate % 2 === 0) {
            // Current point is on an even-numbered row.
            if (yEvenMap.has(colCoordinate)) {
                let previousRowValue = yEvenMap.get(colCoordinate);
                let previousRow = previousRowValue[0];
                let previousValue = previousRowValue[1];

                // Calculate difference, adjusted for row parity (distance is (r2-r1)/2).
                let calculatedDifference = (previousValue - valueAtPoint) / ((previousRow - rowCoordinate) / 2);

                if (yEvenDiff === false) {
                    yEvenDiff = calculatedDifference;

                    // Validate all previously stored y-even points.
                    for (let mapEntry of yEvenMap.entries()) {
                        let iteratedColumn = mapEntry[0];
                        let iteratedRow = mapEntry[1][0];
                        let iteratedValue = mapEntry[1][1];

                        // Check for negative values at boundaries.
                        if (iteratedValue - calculatedDifference * ((iteratedRow / 2) - 1) < 0 ||
                            iteratedValue + calculatedDifference * Math.floor((numRows - iteratedRow) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (calculatedDifference !== yEvenDiff) {
                        console.log('No');
                        process.exit();
                    }
                }
                // Validate the current point.
                if (valueAtPoint - calculatedDifference * ((rowCoordinate / 2) - 1) < 0 ||
                    valueAtPoint + calculatedDifference * Math.floor((numRows - rowCoordinate) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }

            } else {
                if (yEvenDiff !== false) {
                    // If a common difference already exists, validate this point.
                    if (valueAtPoint - yEvenDiff * ((rowCoordinate / 2) - 1) < 0 ||
                        valueAtPoint + yEvenDiff * Math.floor((numRows - rowCoordinate) / 2) < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
                yEvenMap.set(colCoordinate, [rowCoordinate, valueAtPoint]);
            }
        } else {
            // Current point is on an odd-numbered row.
            if (yOddMap.has(colCoordinate)) {
                let previousRowValue = yOddMap.get(colCoordinate);
                let previousRow = previousRowValue[0];
                let previousValue = previousRowValue[1];

                // Calculate difference, adjusted for row parity.
                let calculatedDifference = (previousValue - valueAtPoint) / ((previousRow - rowCoordinate) / 2);

                if (yOddDiff === false) {
                    yOddDiff = calculatedDifference;

                    // Validate all previously stored y-odd points.
                    for (let mapEntry of yOddMap.entries()) {
                        let iteratedColumn = mapEntry[0];
                        let iteratedRow = mapEntry[1][0];
                        let iteratedValue = mapEntry[1][1];

                        // Check for negative values at boundaries.
                        if (iteratedValue - calculatedDifference * Math.floor(iteratedRow / 2) < 0 ||
                            iteratedValue + calculatedDifference * Math.floor((numRows - iteratedRow) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (calculatedDifference !== yOddDiff) {
                        console.log('No');
                        process.exit();
                    }
                }
                // Validate the current point.
                if (valueAtPoint - calculatedDifference * Math.floor((rowCoordinate - 1) / 2) < 0 ||
                    valueAtPoint + calculatedDifference * Math.floor((numRows - rowCoordinate) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                if (yOddDiff !== false) {
                    // If a common difference already exists, validate this point.
                    if (valueAtPoint - yOddDiff * Math.floor(rowCoordinate / 2) < 0 ||
                        valueAtPoint + yOddDiff * Math.floor((numRows - rowCoordinate) / 2) < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
                yOddMap.set(colCoordinate, [rowCoordinate, valueAtPoint]);
            }
        }
    }

    // --- Processing for X-axis (horizontal) differences ---
    // This section handles calculations and validations for differences along rows.
    if (numCols === 2) {
        // Special handling for a grid with exactly two columns.
        // All column-based calculations effectively treat columns as 'even'.
        if (xEvenMap.has(rowCoordinate)) {
            // If another point has already been recorded for this row.
            let previousColValue = xEvenMap.get(rowCoordinate);
            let previousCol = previousColValue[0];
            let previousValue = previousColValue[1];

            // Calculate the common difference (slope) using the current and previous points.
            let calculatedDifference = (previousValue - valueAtPoint) / (previousCol - colCoordinate);

            // NOTE: The original code initializes `xEvenDiff` to `false` but checks `xEvenDiff === -1` here.
            // This condition `xEvenDiff === -1` will always be false on the first pass,
            // causing the `else` block to execute. The `calculatedDifference !== xEvenDiff` check
            // will then compare a number (`calculatedDifference`) with `false`, which is always true,
            // leading to an immediate 'No' output and exit for the first relevant point when `numCols === 2`.
            // This behavior (likely a bug in the original) is preserved as per Type II cloning rules.
            if (xEvenDiff === -1) { // This condition is effectively unreachable with initial `xEvenDiff = false`.
                xEvenDiff = calculatedDifference;

                // Validate all previously stored x-even points with this new difference.
                for (let mapEntryX of xEvenMap.entries()) {
                    let iteratedRow = mapEntryX[0];
                    let iteratedColumn = mapEntryX[1][0];
                    let iteratedValue = mapEntryX[1][1];

                    // Check for negative values at boundaries (column 1 or column C).
                    if (iteratedValue - calculatedDifference * (iteratedColumn - 1) < 0 ||
                        iteratedValue + calculatedDifference * (numCols - iteratedColumn) < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
            } else {
                // This `else` block will always be executed due to the `xEvenDiff === -1` condition.
                if (calculatedDifference !== xEvenDiff) { // `calculatedDifference !== false` is always true.
                    console.log('No');
                    process.exit(); // This will cause an early exit for numCols === 2.
                }
            }
            // Validate the current point with the established difference.
            if (valueAtPoint - calculatedDifference * (colCoordinate - 1) < 0 ||
                valueAtPoint + calculatedDifference * (numCols - colCoordinate) < 0) {
                console.log('No');
                process.exit();
            }

        } else {
            // If this is the first point encountered for this specific row.
            if (xEvenDiff !== false) {
                // If a common x-even difference already exists, validate this point against it.
                if (valueAtPoint - xEvenDiff * (colCoordinate - 1) < 0 ||
                    valueAtPoint + xEvenDiff * (numCols - colCoordinate) < 0) {
                    console.log('No');
                    process.exit();
                }
            }
            // Store the current point's column and value in the map for future comparisons.
            xEvenMap.set(rowCoordinate, [colCoordinate, valueAtPoint]);
        }
    } else {
        // General case: Grid has more than two columns.
        // Differences are categorized based on the parity of the column coordinate.
        if (colCoordinate % 2 === 0) {
            // Current point is on an even-numbered column.
            if (xEvenMap.has(rowCoordinate)) {
                let previousColValue = xEvenMap.get(rowCoordinate);
                let previousCol = previousColValue[0];
                let previousValue = previousColValue[1];

                // Calculate difference, adjusted for column parity (distance is (c2-c1)/2).
                let calculatedDifference = (previousValue - valueAtPoint) / ((previousCol - colCoordinate) / 2);

                if (xEvenDiff === false) {
                    xEvenDiff = calculatedDifference;

                    // Validate all previously stored x-even points.
                    for (let mapEntryX of xEvenMap.entries()) {
                        let iteratedRow = mapEntryX[0];
                        let iteratedColumn = mapEntryX[1][0];
                        let iteratedValue = mapEntryX[1][1];

                        // Check for negative values at boundaries.
                        if (iteratedValue - calculatedDifference * ((iteratedColumn / 2) - 1) < 0 ||
                            iteratedValue + calculatedDifference * Math.floor((numCols - iteratedColumn) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (calculatedDifference !== xEvenDiff) {
                        console.log('No');
                        process.exit();
                    }
                }
                // Validate the current point.
                if (valueAtPoint - calculatedDifference * ((colCoordinate / 2) - 1) < 0 ||
                    valueAtPoint + calculatedDifference * Math.floor((numCols - colCoordinate) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                if (xEvenDiff !== false) {
                    // If a common difference already exists, validate this point.
                    if (valueAtPoint - xEvenDiff * ((colCoordinate / 2) - 1) < 0 ||
                        valueAtPoint + xEvenDiff * Math.floor((numCols - colCoordinate) / 2) < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
                xEvenMap.set(rowCoordinate, [colCoordinate, valueAtPoint]);
            }

        } else {
            // Current point is on an odd-numbered column.
            if (xOddMap.has(rowCoordinate)) {
                let previousColValue = xOddMap.get(rowCoordinate);
                let previousCol = previousColValue[0];
                let previousValue = previousColValue[1];

                // Calculate difference, adjusted for column parity.
                let calculatedDifference = (previousValue - valueAtPoint) / ((previousCol - colCoordinate) / 2);

                if (xOddDiff === false) {
                    xOddDiff = calculatedDifference;

                    // Validate all previously stored x-odd points.
                    for (let mapEntryX of xOddMap.entries()) {
                        let iteratedRow = mapEntryX[0];
                        let iteratedColumn = mapEntryX[1][0];
                        let iteratedValue = mapEntryX[1][1];

                        // Check for negative values at boundaries.
                        if (iteratedValue - calculatedDifference * Math.floor(iteratedColumn / 2) < 0 ||
                            iteratedValue + calculatedDifference * Math.floor((numCols - iteratedColumn) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (calculatedDifference !== xOddDiff) {
                        console.log('No');
                        process.exit();
                    }
                }
                // Validate the current point.
                if (valueAtPoint - calculatedDifference * Math.floor(colCoordinate / 2) < 0 ||
                    valueAtPoint + calculatedDifference * Math.floor((numCols - colCoordinate) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                if (xOddDiff !== false) {
                    // If a common difference already exists, validate this point.
                    if (valueAtPoint - xOddDiff * Math.floor(colCoordinate / 2) < 0 ||
                        valueAtPoint + xOddDiff * Math.floor((numCols - colCoordinate) / 2) < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
                xOddMap.set(rowCoordinate, [colCoordinate, valueAtPoint]);
            }
        }
    }
}

// If the program reaches this point, all data points have been processed
// without encountering any inconsistencies or invalid conditions.
console.log('Yes');
