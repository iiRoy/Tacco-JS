'use strict';

// Read all input from standard input, decode as UTF-8, remove leading/trailing whitespace, and split into an array of lines.
const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Parse the first line to get grid dimensions (R and C).
const gridDimensions = inputLines[0].split(' ').map(Number);
const numRows = gridDimensions[0]; // Total number of rows in the grid.
const numCols = gridDimensions[1]; // Total number of columns in the grid.

// Parse the second line to get the number of data points (N).
const numDataPoints = parseInt(inputLines[1], 10);

// Extract the data point strings from the input, starting from the third line.
const dataPointStrings = inputLines.slice(2);

// Initialize variables to store calculated differences (slopes) for odd/even rows/columns.
// A value of -1 indicates that the difference has not yet been determined.
let xOddDifference = -1;
let xEvenDifference = -1;
let yOddDifference = -1;
let yEvenDifference = -1;

// Initialize Maps to store the first encountered (row, value) or (column, value) for a given coordinate.
// These maps help in determining the consistent difference (slope) across points.
let xOddCoordMap = new Map();  // Stores { row: [col, value] } for odd columns
let xEvenCoordMap = new Map(); // Stores { row: [col, value] } for even columns
let yOddCoordMap = new Map();  // Stores { col: [row, value] } for odd rows
let yEvenCoordMap = new Map(); // Stores { col: [row, value] } for even rows

// Iterate through each data point provided in the input.
for (let pointIndex = 0; pointIndex < numDataPoints; pointIndex++) {
    // Parse the current data point string into row, column, and value.
    const currentPointParts = dataPointStrings[pointIndex].split(' ');
    const currentRow = parseInt(currentPointParts[0], 10);
    const currentCol = parseInt(currentPointParts[1], 10);
    const currentValue = parseInt(currentPointParts[2], 10);

    // --- Logic for Y-axis (vertical) consistency checks ---
    // This block handles checks related to differences along columns (y-direction).
    if (numRows === 2) {
        // Special case: If there are only 2 rows.
        if (yEvenCoordMap.has(currentCol)) {
            // If we've seen a point in this column before.
            const storedRowValue = yEvenCoordMap.get(currentCol);
            const storedRow = storedRowValue[0];
            const storedValue = storedRowValue[1];

            // Calculate the difference (slope) between the current point and the stored point.
            let calculatedSlope = (storedValue - currentValue) / (storedRow - currentRow);
            if (storedRow > currentRow) {
                calculatedSlope *= -1; // Adjust sign if rows are swapped for consistent direction.
            }

            if (yEvenDifference === -1) {
                // This is the first time we're determining the y-even difference.
                yEvenDifference = calculatedSlope;

                // Now, validate all previously stored points against this newly found difference.
                for (const mapEntryY of yEvenCoordMap.entries()) {
                    const entryColY = mapEntryY[0];
                    const entryRowY = mapEntryY[1][0];
                    const entryValueY = mapEntryY[1][1];

                    // Check if the values are non-negative based on the calculated slope.
                    // The expressions (entryRowY - 1) and (2 - entryRowY) represent distances from boundaries.
                    if (entryValueY - yEvenDifference * (entryRowY - 1) < 0 ||
                        entryValueY + yEvenDifference * (2 - entryRowY) < 0) {
                        console.log('No');
                        process.exit(); // Exit immediately if an inconsistency is found.
                    }
                }
            } else {
                // If y-even difference was already determined, check for consistency.
                if (calculatedSlope !== yEvenDifference) {
                    console.log('No');
                    process.exit();
                }
            }
            // Validate the current point against the established y-even difference.
            if (currentValue - yEvenDifference * (currentRow - 1) < 0 ||
                currentValue + yEvenDifference * (2 - currentRow) < 0) {
                console.log('No');
                process.exit();
            }
        } else {
            // If this is the first point encountered in this column, store it.
            yEvenCoordMap.set(currentCol, [currentRow, currentValue]);
        }
    } else {
        // General case: More than 2 rows.
        if (currentRow % 2 === 0) {
            // If the current row is even.
            if (yEvenCoordMap.has(currentCol)) {
                const storedRowValue = yEvenCoordMap.get(currentCol);
                const storedRow = storedRowValue[0];
                const storedValue = storedRowValue[1];

                let calculatedSlope = (storedValue - currentValue) / ((storedRow - currentRow) / 2);
                if (storedRow > currentRow) {
                    calculatedSlope *= -1;
                }

                if (yEvenDifference === -1) {
                    yEvenDifference = calculatedSlope;

                    for (const mapEntryY of yEvenCoordMap.entries()) {
                        const entryColY = mapEntryY[0];
                        const entryRowY = mapEntryY[1][0];
                        const entryValueY = mapEntryY[1][1];

                        if (entryValueY - yEvenDifference * ((entryRowY / 2) - 1) < 0 ||
                            entryValueY + yEvenDifference * Math.floor((numRows - entryRowY) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (calculatedSlope !== yEvenDifference) {
                        console.log('No');
                        process.exit();
                    }
                }
                if (currentValue - yEvenDifference * ((currentRow / 2) - 1) < 0 ||
                    currentValue + yEvenDifference * Math.floor((numRows - currentRow) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                yEvenCoordMap.set(currentCol, [currentRow, currentValue]);
            }
        } else {
            // If the current row is odd.
            if (yOddCoordMap.has(currentCol)) {
                const storedRowValue = yOddCoordMap.get(currentCol);
                const storedRow = storedRowValue[0];
                const storedValue = storedRowValue[1];

                let calculatedSlope = (storedValue - currentValue) / ((storedRow - currentRow) / 2);
                if (storedRow > currentRow) {
                    calculatedSlope *= -1;
                }

                if (yOddDifference === -1) {
                    yOddDifference = calculatedSlope;

                    for (const mapEntryY of yOddCoordMap.entries()) {
                        const entryColY = mapEntryY[0];
                        const entryRowY = mapEntryY[1][0];
                        const entryValueY = mapEntryY[1][1];

                        if (entryValueY - yOddDifference * Math.floor(entryRowY / 2) < 0 ||
                            entryValueY + yOddDifference * Math.floor((numRows - entryRowY) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (calculatedSlope !== yOddDifference) {
                        console.log('No');
                        process.exit();
                    }
                }
                if (currentValue - yOddDifference * Math.floor((currentRow - 1) / 2) < 0 ||
                    currentValue + yOddDifference * Math.floor((numRows - currentRow) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                yOddCoordMap.set(currentCol, [currentRow, currentValue]);
            }
        }
    }

    // --- Logic for X-axis (horizontal) consistency checks ---
    // This block handles checks related to differences along rows (x-direction).
    if (numCols === 2) {
        // Special case: If there are only 2 columns.
        if (xEvenCoordMap.has(currentRow)) {
            // If we've seen a point in this row before.
            const storedColValue = xEvenCoordMap.get(currentRow);
            const storedCol = storedColValue[0];
            const storedValue = storedColValue[1];

            let calculatedSlope = (storedValue - currentValue) / (storedCol - currentCol);
            if (storedCol > currentCol) {
                calculatedSlope *= -1;
            }

            if (xEvenDifference === -1) {
                xEvenDifference = calculatedSlope;

                for (const mapEntryX of xEvenCoordMap.entries()) {
                    const entryRowX = mapEntryX[0];
                    const entryColX = mapEntryX[1][0];
                    const entryValueX = mapEntryX[1][1];

                    if (entryValueX - xEvenDifference * (entryColX - 1) < 0 ||
                        entryValueX + xEvenDifference * (numCols - entryColX) < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
            } else {
                if (calculatedSlope !== xEvenDifference) {
                    console.log('No');
                    process.exit();
                }
            }
            if (currentValue - xEvenDifference * (currentCol - 1) < 0 ||
                currentValue + xEvenDifference * (numCols - currentCol) < 0) {
                console.log('No');
                process.exit();
            }
        } else {
            xEvenCoordMap.set(currentRow, [currentCol, currentValue]);
        }
    } else {
        // General case: More than 2 columns.
        if (currentCol % 2 === 0) {
            // If the current column is even.
            if (xEvenCoordMap.has(currentRow)) {
                const storedColValue = xEvenCoordMap.get(currentRow);
                const storedCol = storedColValue[0];
                const storedValue = storedColValue[1];

                let calculatedSlope = (storedValue - currentValue) / ((storedCol - currentCol) / 2);
                if (storedCol > currentCol) {
                    calculatedSlope *= -1;
                }

                if (xEvenDifference === -1) {
                    xEvenDifference = calculatedSlope;

                    for (const mapEntryX of xEvenCoordMap.entries()) {
                        const entryRowX = mapEntryX[0];
                        const entryColX = mapEntryX[1][0];
                        const entryValueX = mapEntryX[1][1];

                        if (entryValueX - xEvenDifference * ((entryColX / 2) - 1) < 0 ||
                            entryValueX + xEvenDifference * Math.floor((numCols - entryColX) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (calculatedSlope !== xEvenDifference) {
                        console.log('No');
                        process.exit();
                    }
                }
                if (currentValue - xEvenDifference * ((currentCol / 2) - 1) < 0 ||
                    currentValue + xEvenDifference * Math.floor((numCols - currentCol) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                xEvenCoordMap.set(currentRow, [currentCol, currentValue]);
            }
        } else {
            // If the current column is odd.
            if (xOddCoordMap.has(currentRow)) {
                const storedColValue = xOddCoordMap.get(currentRow);
                const storedCol = storedColValue[0];
                const storedValue = storedColValue[1];

                let calculatedSlope = (storedValue - currentValue) / ((storedCol - currentCol) / 2);
                if (storedCol > currentCol) {
                    calculatedSlope *= -1;
                }

                if (xOddDifference === -1) {
                    xOddDifference = calculatedSlope;

                    for (const mapEntryX of xOddCoordMap.entries()) {
                        const entryRowX = mapEntryX[0];
                        const entryColX = mapEntryX[1][0];
                        const entryValueX = mapEntryX[1][1];

                        if (entryValueX - xOddDifference * Math.floor(entryColX / 2) < 0 ||
                            entryValueX + xOddDifference * Math.floor((numCols - entryColX) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (calculatedSlope !== xOddDifference) {
                        console.log('No');
                        process.exit();
                    }
                }
                if (currentValue - xOddDifference * Math.floor(currentCol / 2) < 0 ||
                    currentValue + xOddDifference * Math.floor((numCols - currentCol) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                xOddCoordMap.set(currentRow, [currentCol, currentValue]);
            }
        }
    }
}

// If the program reaches this point, all checks passed without finding any inconsistencies.
console.log('Yes');
