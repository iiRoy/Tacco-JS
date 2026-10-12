const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

let firstLineParts = inputLines.shift().split(' ');

const gridHeight = parseInt(firstLineParts[0], 10);
const gridWidth = parseInt(firstLineParts[1], 10);
const segmentCount = parseInt(firstLineParts[2], 10); // This variable is read but not used in the logic.

let outputGrid = [];
let currentSegmentId = 1;
let lastValidRow = null; // Stores a reference to the last row that was successfully processed with '#' characters.

// Iterate through each row of the input grid.
for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
    let hashColumnIndices = []; // List of column indices where '#' characters are found in the current row.
    outputGrid[rowIndex] = []; // Initialize the current row in the output grid.

    // Scan the current input row to find all '#' characters.
    for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
        if (inputLines[rowIndex][colIndex] === '#') {
            hashColumnIndices.push(colIndex);
        }
    }

    // Process the current row based on whether it contains '#' characters.
    if (hashColumnIndices.length === 0) {
        // If no '#' characters are found in this row.
        if (lastValidRow) {
            // If a previous valid row exists, copy its content to the current row.
            outputGrid[rowIndex] = lastValidRow;
        } else {
            // Otherwise, mark this row as 'e' (empty/unprocessed), to be filled later.
            outputGrid[rowIndex] = 'e';
        }
    } else {
        // If '#' characters are present, assign segment IDs based on their positions.
        let currentFillCol = 0; // Column index for filling the output grid.
        while (true) {
            let currentHashCol = hashColumnIndices.shift(); // Get the next '#' column index.
            if (currentHashCol === undefined) {
                break; // No more '#' characters in this row.
            }
            // Fill cells from currentFillCol up to currentHashCol with the current segment ID.
            while (currentFillCol <= currentHashCol) {
                outputGrid[rowIndex][currentFillCol] = currentSegmentId;
                currentFillCol++;
            }
            currentSegmentId++; // Increment segment ID for the next segment.
        }
        // After processing all '#' characters, fill any remaining cells in the row
        // with the last assigned segment ID (decremented by 1 because it was incremented one too many times).
        while (currentFillCol < gridWidth) {
            outputGrid[rowIndex][currentFillCol] = currentSegmentId - 1;
            currentFillCol++;
        }
        // Store this fully processed row as the last valid row for subsequent empty rows.
        lastValidRow = outputGrid[rowIndex];
    }
}

// Post-processing step: Fill any leading 'e' marked rows from the first valid row found below them.
if (outputGrid[0] === 'e') {
    let searchColIndex = 1;
    // Find the first row that is not marked 'e'.
    while (outputGrid[searchColIndex] === 'e') {
        searchColIndex++;
    }
    lastValidRow = outputGrid[searchColIndex]; // Get the content of this first valid row.
    searchColIndex--; // Move back to the last 'e' row.
    // Fill all 'e' rows from the top down to the first valid row found.
    while (searchColIndex >= 0) {
        outputGrid[searchColIndex--] = lastValidRow;
    }
}

// Format the final output grid into a string and print it to the console.
console.log(outputGrid.map(rowArray => rowArray.join(" ")).join('\n'));
