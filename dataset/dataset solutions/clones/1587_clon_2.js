// This section handles reading data from the system's standard input.
let dataSource = require('fs').readFileSync('/proc/self/fd/0', 'utf-8')
    // The commented line below is for local file testing, not used in production.
    // let dataSource = require('fs').readFileSync('./alternative_input.txt', 'utf-8')
    .split(/\s+|\n/)                                   // Split the entire string by any whitespace or newlines.
    .slice(0, -1)                                       // Remove the very last element, which is often empty.
    .map(elementValue => Number.parseInt(elementValue)); // Convert each resulting string fragment into an integer.

// Destructure the first few elements into dimension variables, and the rest into an array of initial coordinates.
const [rowsDimension, colsDimension, ...initialCoords] = dataSource;

// An empty array to store the coordinate pairs after processing.
const processedPoints = [];

// Loop through the initial coordinates, grouping them into pairs (x,y) and storing them.
for (let loopIndex = 1; loopIndex < initialCoords.length; loopIndex += 2) {
    processedPoints.push([initialCoords[loopIndex], initialCoords[loopIndex + 1]]);
}

// Initialize arrays to hold frequency counts for rows and columns, filled with zeros.
let rowCounts = new Array(rowsDimension).fill(0);
let colCounts = new Array(colsDimension).fill(0);

// Iterate through the processed coordinate pairs to populate the frequency count arrays.
for (let pointIndex = 0; pointIndex < processedPoints.length; pointIndex++) {
    // Adjusting for 0-based array indexing versus 1-based coordinate values.
    rowCounts[processedPoints[pointIndex][0] - 1]++;
    colCounts[processedPoints[pointIndex][1] - 1]++;
}

// Find the maximum frequency value observed in the row counts.
const maxRowCountValue = Math.max(...rowCounts);
// An array to store the indices where the row frequency matches the maximum.
const topRowIndices = [];
// Populate the topRowIndices array by checking each row's count.
for (let rIdx = 0; rIdx < rowsDimension; rIdx++) {
    if (rowCounts[rIdx] === maxRowCountValue) {
        topRowIndices.push(rIdx);
    }
}

// Find the maximum frequency value observed in the column counts.
const maxColCountValue = Math.max(...colCounts);
// An array to store the indices where the column frequency matches the maximum.
const topColIndices = [];
// Populate the topColIndices array by checking each column's count.
for (let cIdx = 0; cIdx < colsDimension; cIdx++) {
    if (colCounts[cIdx] === maxColCountValue) {
        topColIndices.push(cIdx);
    }
}

// Iterate through all combinations of top row indices and top column indices.
for (let currentRowPointer of topRowIndices) {
    for (let currentColPointer of topColIndices) {
        // Check if the current (row, column) combination is NOT present in the original processed points list.
        // We add 1 to indices to convert them back to 1-based coordinate values for comparison.
        if (!processedPoints.some(pointEntry => pointEntry[0] === currentRowPointer + 1 && pointEntry[1] === currentColPointer + 1)) {
            // If such a combination is found, print the sum of max row and column counts and exit.
            console.log(maxRowCountValue + maxColCountValue);
            return; // Terminate execution immediately.
        }
    }
}

// If all combinations of top row and column indices ARE found in the processed points,
// then print the sum of max counts minus one.
console.log(maxRowCountValue + maxColCountValue - 1);