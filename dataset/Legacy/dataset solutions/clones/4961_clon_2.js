'use strict';

// Import the file system module for reading input
const dataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Parse the grid dimensions (number of rows and columns) from the first line of input
const gridDims = dataLines[0].split(' ').map(Number);
const numRows = gridDims[0]; // Store the number of rows
const numCols = gridDims[1]; // Store the number of columns

// Parse the total number of data points from the second line of input
const numPoints = parseInt(dataLines[1], 10);

// Extract the array of strings, each representing a data point (row, column, value)
const pointData = dataLines.slice(2);

// Initialize variables to store the calculated differences (slopes) for x and y axes.
// These are separated by the parity of the coordinate (odd/even) to handle different patterns.
let xOddDiff = -1; // Difference for points on odd-indexed columns along the x-axis
let xEvenDiff = -1; // Difference for points on even-indexed columns along the x-axis
let yOddDiff = -1; // Difference for points on odd-indexed rows along the y-axis
let yEvenDiff = -1; // Difference for points on even-indexed rows along the y-axis

// Initialize Maps to store previously encountered points.
// Keys are the fixed coordinate (e.g., column for y-axis checks), values are [varying_coordinate, value].
let xOddMap = new Map(); // Stores [col, val] for points on odd-indexed rows
let xEvenMap = new Map(); // Stores [col, val] for points on even-indexed rows
let yOddMap = new Map(); // Stores [row, val] for points on odd-indexed columns
let yEvenMap = new Map(); // Stores [row, val] for points on even-indexed columns

// Iterate through each data point to check for consistency
for (let idx = 0; idx < numPoints; idx++) {
    // Parse the current point's coordinates and value
    let currentPointStr = pointData[idx].split(' ');
    let rowCoord = parseInt(currentPointStr[0], 10); // Current row coordinate
    let colCoord = parseInt(currentPointStr[1], 10); // Current column coordinate
    let valCoord = parseInt(currentPointStr[2], 10); // Current associated value

    // --- Begin Y-axis (column-wise) consistency checks ---
    // Special handling if there are only 2 rows
    if (numRows === 2) {
        // If a point with the same column has been seen before (for R=2, all rows are treated uniformly)
        if (yEvenMap.has(colCoord)) {
            let prevRowVal = yEvenMap.get(colCoord);
            let prevRow = prevRowVal[0]; // Previous row coordinate for this column
            let prevVal = prevRowVal[1]; // Previous value for this column

            // Calculate the difference (slope) between the current and previous points
            let difference = (prevVal - valCoord) / (prevRow - rowCoord);

            // If this is the first difference established for this category
            if (yEvenDiff === -1) {
                yEvenDiff = difference; // Set the established difference

                // Validate all previously stored points in this map against the new difference
                for (let mapEntry of yEvenMap.entries()) {
                    let entryCol = mapEntry[0];
                    let entryRow = mapEntry[1][0];
                    let entryVal = mapEntry[1][1];

                    // Check if the value at the boundaries would be negative
                    if (entryVal - difference * (entryRow - 1) < 0 ||
                        entryVal + difference * (numRows - entryRow) < 0) {
                        console.log('No'); // Output 'No' and terminate if invalid
                        process.exit();
                    }
                }
            } else {
                // If a difference was already established, ensure consistency
                if (difference !== yEvenDiff) {
                    console.log('No'); // Output 'No' and terminate if inconsistent
                    process.exit();
                }
            }
            // Validate the current point against the established difference
            if (valCoord - difference * (rowCoord - 1) < 0 ||
                valCoord + difference * (numRows - rowCoord) < 0) {
                console.log('No'); // Output 'No' and terminate if invalid
                process.exit();
            }

        } else {
            // If this is the first point for this column, store it
            yEvenMap.set(colCoord, [rowCoord, valCoord]);
        }

    } else { // If numRows is not 2, distinguish by row parity
        if (rowCoord % 2 === 0) { // Current row is even
            if (yEvenMap.has(colCoord)) {
                let prevRowVal = yEvenMap.get(colCoord);
                let prevRow = prevRowVal[0];
                let prevVal = prevRowVal[1];

                let difference = (prevVal - valCoord) / ((prevRow - rowCoord) / 2);

                if (yEvenDiff === -1) {
                    // Ensure the difference is an integer (no fractional slopes)
                    if (Math.round(difference) !== difference) {
                        console.log('No');
                        process.exit();
                    }
                    yEvenDiff = difference;

                    // Validate previously stored points. Note: Original code iterates over yOddMap here,
                    // which might be a logical inconsistency but is preserved for Type II cloning.
                    for (let mapEntry of yOddMap.entries()) {
                        let entryCol = mapEntry[0];
                        let entryRow = mapEntry[1][0];
                        let entryVal = mapEntry[1][1];

                        if (entryVal - difference * ((entryRow / 2) - 1) < 0 ||
                            entryVal + difference * Math.floor((numRows - entryRow) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (difference !== yEvenDiff) {
                        console.log('No');
                        process.exit();
                    }
                }
                if (valCoord - difference * ((rowCoord / 2) - 1) < 0 ||
                    valCoord + difference * Math.floor((numRows - rowCoord) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }

            } else {
                yEvenMap.set(colCoord, [rowCoord, valCoord]);
            }

        } else { // Current row is odd
            if (yOddMap.has(colCoord)) {
                let prevRowVal = yOddMap.get(colCoord);
                let prevRow = prevRowVal[0];
                let prevVal = prevRowVal[1];

                let difference = (prevVal - valCoord) / ((prevRow - rowCoord) / 2);

                if (yOddDiff === -1) {
                    if (Math.round(difference) !== difference) {
                        console.log('No');
                        process.exit();
                    }

                    yOddDiff = difference;

                    // Validate all previously stored odd-row points
                    for (let mapEntry of yOddMap.entries()) {
                        let entryCol = mapEntry[0];
                        let entryRow = mapEntry[1][0];
                        let entryVal = mapEntry[1][1];

                        if (entryVal - difference * Math.floor(entryRow / 2) < 0 ||
                            entryVal + difference * Math.floor((numRows - entryRow) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (difference !== yOddDiff) {
                        console.log('No');
                        process.exit();
                    }
                }
                if (valCoord - difference * Math.floor(rowCoord / 2) < 0 ||
                    valCoord + difference * Math.floor((numRows - rowCoord) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                yOddMap.set(colCoord, [rowCoord, valCoord]);
            }
        }
    }

    // --- Begin X-axis (row-wise) consistency checks ---
    // Special handling if there are only 2 columns
    if (numCols === 2) {
        // If a point with the same row has been seen before (for C=2, all columns are treated uniformly)
        if (xEvenMap.has(rowCoord)) {
            let prevColVal = xEvenMap.get(rowCoord);
            let prevCol = prevColVal[0]; // Previous column coordinate for this row
            let prevVal = prevColVal[1]; // Previous value for this row

            // Calculate the difference (slope)
            let difference = (prevVal - valCoord) / (prevCol - colCoord);

            // If this is the first difference established for this category
            if (xEvenDiff === -1) {
                xEvenDiff = difference; // Set the established difference

                // Validate all previously stored points in this map
                for (let mapItem of xEvenMap.entries()) {
                    let itemRow = mapItem[0];
                    let itemCol = mapItem[1][0];
                    let itemVal = mapItem[1][1];

                    // Check if the value at the boundaries would be negative
                    if (itemVal - difference * (itemCol - 1) < 0 ||
                        itemVal + difference * (numCols - itemCol) < 0) {
                        console.log('No');
                        process.exit();
                    }
                }
            } else {
                // If a difference was already established, ensure consistency
                if (difference !== xEvenDiff) {
                    console.log('No');
                    process.exit();
                }
            }
            // Validate the current point against the established difference
            if (valCoord - difference * colCoord < 0 ||
                valCoord + difference * (numCols - colCoord) < 0) {
                console.log('No');
                process.exit();
            }

        } else {
            // If this is the first point for this row, store it
            xEvenMap.set(rowCoord, [colCoord, valCoord]);
        }
    } else { // If numCols is not 2, distinguish by column parity
        if (colCoord % 2 === 0) { // Current column is even
            if (xEvenMap.has(rowCoord)) {
                let prevColVal = xEvenMap.get(rowCoord);
                let prevCol = prevColVal[0];
                let prevVal = prevColVal[1];

                let difference = (prevVal - valCoord) / ((prevCol - colCoord) / 2);

                if (xEvenDiff === -1) {
                    if (Math.round(difference) !== difference) {
                        console.log('No');
                        process.exit();
                    }

                    xEvenDiff = difference;

                    // Validate all previously stored even-column points
                    for (let mapItem of xEvenMap.entries()) {
                        let itemRow = mapItem[0];
                        let itemCol = mapItem[1][0];
                        let itemVal = mapItem[1][1];

                        if (itemVal - difference * ((itemCol / 2) - 1) < 0 ||
                            itemVal + difference * Math.floor((numCols - itemCol) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (difference !== xEvenDiff) {
                        console.log('No');
                        process.exit();
                    }
                }
                if (valCoord - difference * ((colCoord / 2) - 1) < 0 ||
                    valCoord + difference * Math.floor((numCols - colCoord) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                xEvenMap.set(rowCoord, [colCoord, valCoord]);
            }

        } else { // Current column is odd
            if (xOddMap.has(rowCoord)) {
                let prevColVal = xOddMap.get(rowCoord);
                let prevCol = prevColVal[0];
                let prevVal = prevColVal[1];

                let difference = (prevVal - valCoord) / ((prevCol - colCoord) / 2);

                if (xOddDiff === -1) {
                    if (Math.round(difference) !== difference) {
                        console.log('No');
                        process.exit();
                    }

                    xOddDiff = difference;

                    // Validate all previously stored odd-column points
                    for (let mapItem of xOddMap.entries()) {
                        let itemRow = mapItem[0];
                        let itemCol = mapItem[1][0];
                        let itemVal = mapItem[1][1];

                        if (itemVal - difference * Math.floor(itemCol / 2) < 0 ||
                            itemVal + difference * Math.floor((numCols - itemCol) / 2) < 0) {
                            console.log('No');
                            process.exit();
                        }
                    }
                } else {
                    if (difference !== xOddDiff) {
                        console.log('No');
                        process.exit();
                    }
                }
                if (valCoord - difference * Math.floor(colCoord / 2) < 0 ||
                    valCoord + difference * Math.floor((numCols - colCoord) / 2) < 0) {
                    console.log('No');
                    process.exit();
                }
            } else {
                xOddMap.set(rowCoord, [colCoord, valCoord]);
            }
        }
    }
}

// If the loop completes without any inconsistencies, output 'Yes'
console.log('Yes');
