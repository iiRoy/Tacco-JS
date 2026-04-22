'use strict'; // Enforce strict mode for cleaner code practices

// Read all input data from standard input, process it, and split into lines.
const dataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Parse the grid dimensions (Rows and Columns) from the first line.
const gridDimensions = dataLines[0].split(' ').map(Number);
const numRows = gridDimensions[0]; // Total number of rows in the grid.
const numCols = gridDimensions[1]; // Total number of columns in the grid.

// Parse the count of data points from the second line.
const numPoints = Number.parseInt(dataLines[1]);

// Extract the actual coordinate and amount data points.
const pointData = dataLines.slice(2);

// Initialize flags to track observed gradients for odd/even coordinates in X and Y directions.
// A value of 'null' indicates no gradient has been established yet for that type.
let xOddGradient = null; // Gradient for odd-column changes along X-axis.
let xEvenGradient = null; // Gradient for even-column changes along X-axis.
let yOddGradient = null; // Gradient for odd-row changes along Y-axis.
let yEvenGradient = null; // Gradient for even-row changes along Y-axis.

// Maps to store previously encountered points for odd/even coordinates along X and Y axes.
// Key: Row/Column coordinate, Value: [Other coordinate, Amount].
let xOddMap = new Map(); // Stores points (row, [odd_col, amount])
let xEvenMap = new Map(); // Stores points (row, [even_col, amount])
let yOddMap = new Map(); // Stores points (col, [odd_row, amount])
let yEvenMap = new Map(); // Stores points (col, [even_row, amount])

// Iterate through each data point provided.
for (let currentIdx = 0; currentIdx < numPoints; currentIdx++) {
    // Parse the current point's row, column, and amount values.
    const currentPointStr = pointData[currentIdx].split(' ');
    const rowCoord = Number.parseInt(currentPointStr[0]);
    const colCoord = Number.parseInt(currentPointStr[1]);
    const amountVal = Number.parseInt(currentPointStr[2]);

    // --- Process Y-axis (vertical) constraints ---
    // Special handling if the grid has only 2 rows.
    if (numRows === 2) {
        // If a point with the same column has been seen before (y-even map is used for R=2)
        if (yEvenMap.has(colCoord)) {
            const prevRowAmount = yEvenMap.get(colCoord);
            const prevRow = prevRowAmount[0];
            const prevAmount = prevRowAmount[1];

            // Calculate the gradient.
            const gradientValue = (prevAmount - amountVal) / (prevRow - rowCoord);

            // If this is the first gradient observed for Y-even.
            if (yEvenGradient === null) {
                yEvenGradient = gradientValue; // Set the gradient.

                // Validate all existing points in the map against this new gradient.
                for (const mapEntry of yEvenMap.entries()) {
                    const iterCol = mapEntry[0];
                    const iterRow = mapEntry[1][0];
                    const iterAmount = mapEntry[1][1];

                    // Check if conditions for amount validity are met.
                    if (iterAmount - gradientValue * (iterRow - 1) < 0 ||
                        iterAmount + gradientValue * (2 - iterRow) < 0) {
                        console.log('No');
                        process.exit(); // Exit if invalid.
                    }
                }
            } else {
                // If a gradient was already established, check for consistency.
                if (gradientValue !== yEvenGradient) {
                    console.log('No');
                    process.exit(); // Exit if inconsistent.
                }
            }

            // Validate the current point against the established gradient.
            if (amountVal - gradientValue * (rowCoord - 1) < 0 ||
                amountVal + gradientValue * (2 - rowCoord) < 0) {
                console.log('No');
                process.exit(); // Exit if invalid.
            }

        } else {
            // If no gradient has been established yet, and this is the first point for this column.
            if (yEvenGradient !== null) {
                // Validate the current point using the existing gradient.
                if (amountVal - yEvenGradient * (rowCoord - 1) < 0 ||
                    amountVal + yEvenGradient * (2 - rowCoord) < 0) {
                    console.log('No');
                    process.exit(); // Exit if invalid.
                }
            }
            // Store the current point.
            yEvenMap.set(colCoord, [rowCoord, amountVal]);
        }

    } else { // Grid has more than 2 rows.
        // Check if the current row is even or odd.
        if (rowCoord % 2 === 0) { // Even row
            if (yEvenMap.has(colCoord)) {
                const prevRowAmount = yEvenMap.get(colCoord);
                const prevRow = prevRowAmount[0];
                const prevAmount = prevRowAmount[1];

                const gradientValue = (prevAmount - amountVal) / ((prevRow - rowCoord) / 2);

                if (yEvenGradient === null) {
                    yEvenGradient = gradientValue;

                    for (const mapEntry of yOddMap.entries()) { // Note: original code used map_y_odd here.
                        const iterCol = mapEntry[0];
                        const iterRow = mapEntry[1][0];
                        const iterAmount = mapEntry[1][1];

                        if (iterAmount - gradientValue * ((iterRow / 2) - 1) < 0 ||
                            iterAmount + gradientValue * Math.floor((numRows - iterRow) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (gradientValue !== yEvenGradient) {
                        console.log('No');
                        process.exit();
                    }
                }
                if (amountVal - gradientValue * ((rowCoord / 2) - 1) < 0 ||
                    amountVal + gradientValue * Math.floor((numRows - rowCoord) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }

            } else {
                if (yEvenGradient !== null) {
                    if (amountVal - yEvenGradient * ((rowCoord / 2) - 1) < 0 ||
                        amountVal + yEvenGradient * Math.floor((numRows - rowCoord) / 2) < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
                yEvenMap.set(colCoord, [rowCoord, amountVal]);
            }
        } else { // Odd row
            if (yOddMap.has(colCoord)) {
                const prevRowAmount = yOddMap.get(colCoord);
                const prevRow = prevRowAmount[0];
                const prevAmount = prevRowAmount[1];

                const gradientValue = (prevAmount - amountVal) / ((prevRow - rowCoord) / 2);

                if (yOddGradient === null) {
                    yOddGradient = gradientValue;

                    for (const mapEntry of yOddMap.entries()) {
                        const iterCol = mapEntry[0];
                        const iterRow = mapEntry[1][0];
                        const iterAmount = mapEntry[1][1];

                        if (iterAmount - gradientValue * Math.floor(iterRow / 2) < 0 ||
                            iterAmount + gradientValue * Math.floor((numRows - iterRow) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (gradientValue !== yOddGradient) {
                        console.log('No');
                        process.exit();
                    }
                }
                if (amountVal - gradientValue * Math.floor((rowCoord - 1) / 2) < 0 ||
                    amountVal + gradientValue * Math.floor((numRows - rowCoord) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                if (yOddGradient !== null) {
                    if (amountVal - yOddGradient * Math.floor(rowCoord / 2) < 0 ||
                        amountVal + yOddGradient * Math.floor((numRows - rowCoord) / 2) < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
                yOddMap.set(colCoord, [rowCoord, amountVal]);
            }
        }
    }

    // --- Process X-axis (horizontal) constraints ---
    // Special handling if the grid has only 2 columns.
    if (numCols === 2) {
        if (xEvenMap.has(rowCoord)) {
            const prevColAmount = xEvenMap.get(rowCoord);
            const prevCol = prevColAmount[0];
            const prevAmount = prevColAmount[1];

            const gradientValue = (prevAmount - amountVal) / (prevCol - colCoord);

            // Note: Original code used -1 here. Changed to null for consistency.
            if (xEvenGradient === null) {
                xEvenGradient = gradientValue;

                for (const mapEntryX of xEvenMap.entries()) {
                    const iterRowX = mapEntryX[0];
                    const iterColX = mapEntryX[1][0];
                    const iterAmountX = mapEntryX[1][1];

                    if (iterAmountX - gradientValue * (iterColX - 1) < 0 ||
                        iterAmountX + gradientValue * (numCols - iterColX) < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
            } else {
                if (gradientValue !== xEvenGradient) {
                    console.log('No');
                    process.exit();
                }
            }
            if (amountVal - gradientValue * (colCoord - 1) < 0 ||
                amountVal + gradientValue * (numCols - colCoord) < 0) {
                console.log('No');
                process.exit();
            }

        } else {
            if (xEvenGradient !== null) {
                if (amountVal - xEvenGradient * (colCoord - 1) < 0 ||
                    amountVal + xEvenGradient * (numCols - colCoord) < 0) {
                    console.log('No');
                    process.exit();
                }
            }
            xEvenMap.set(rowCoord, [colCoord, amountVal]);
        }
    } else { // Grid has more than 2 columns.
        if (colCoord % 2 === 0) { // Even column
            if (xEvenMap.has(rowCoord)) {
                const prevColAmount = xEvenMap.get(rowCoord);
                const prevCol = prevColAmount[0];
                const prevAmount = prevColAmount[1];

                const gradientValue = (prevAmount - amountVal) / ((prevCol - colCoord) / 2);

                if (xEvenGradient === null) {
                    xEvenGradient = gradientValue;

                    for (const mapEntryX of xEvenMap.entries()) {
                        const iterRowX = mapEntryX[0];
                        const iterColX = mapEntryX[1][0];
                        const iterAmountX = mapEntryX[1][1];

                        if (iterAmountX - gradientValue * ((iterColX / 2) - 1) < 0 ||
                            iterAmountX + gradientValue * Math.floor((numCols - iterColX) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (gradientValue !== xEvenGradient) {
                        console.log('No');
                        process.exit();
                    }
                }
                if (amountVal - gradientValue * ((colCoord / 2) - 1) < 0 ||
                    amountVal + gradientValue * Math.floor((numCols - colCoord) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                if (xEvenGradient !== null) {
                    if (amountVal - xEvenGradient * ((colCoord / 2) - 1) < 0 ||
                        amountVal + xEvenGradient * Math.floor((numCols - colCoord) / 2) < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
                xEvenMap.set(rowCoord, [colCoord, amountVal]);
            }

        } else { // Odd column
            if (xOddMap.has(rowCoord)) {
                const prevColAmount = xOddMap.get(rowCoord);
                const prevCol = prevColAmount[0];
                const prevAmount = prevColAmount[1];

                const gradientValue = (prevAmount - amountVal) / ((prevCol - colCoord) / 2);

                if (xOddGradient === null) {
                    xOddGradient = gradientValue;

                    for (const mapEntryX of xOddMap.entries()) {
                        const iterRowX = mapEntryX[0];
                        const iterColX = mapEntryX[1][0];
                        const iterAmountX = mapEntryX[1][1];

                        if (iterAmountX - gradientValue * Math.floor(iterColX / 2) < 0 ||
                            iterAmountX + gradientValue * Math.floor((numCols - iterColX) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (gradientValue !== xOddGradient) {
                        console.log('No');
                        process.exit();
                    }
                }
                if (amountVal - gradientValue * Math.floor(colCoord / 2) < 0 ||
                    amountVal + gradientValue * Math.floor((numCols - colCoord) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                if (xOddGradient !== null) {
                    if (amountVal - xOddGradient * Math.floor(colCoord / 2) < 0 ||
                        amountVal + xOddGradient * Math.floor((numCols - colCoord) / 2) < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
                xOddMap.set(rowCoord, [colCoord, amountVal]);
            }
        }
    }
}

// If all points and gradients are consistent, print 'Yes'.
console.log('Yes');