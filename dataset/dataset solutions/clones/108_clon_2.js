const fs = require('fs'); // File system module for input handling

// Determine the size of the standard input stream
let dataSize = fs.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data
let inputBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer
let readBytesCount = fs.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string and split into lines
let parsedLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Execute the primary processing function
processData();

/**
 * Main function to process the input data and calculate results.
 * It initializes a grid, processes each input line to update the grid,
 * and then analyzes the grid to find specific counts.
 */
function processData() {
    // Reference to the global input lines for local scope
    const currentInputLines = parsedLines;

    // Initialize a 14x14 grid matrix with all elements set to zero.
    // This matrix will store increment counts based on input coordinates.
    let gridMatrix = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

    // Loop through the input lines from the end towards the beginning.
    // The loop condition `lineIndex--` means it will iterate `currentInputLines.length - 1` times,
    // effectively skipping the last (potentially empty) line.
    let lineIndex = currentInputLines.length - 1;
    for (; lineIndex--;) {
        const currentLine = currentInputLines[lineIndex]; // Get the current line string for processing

        // Parse the X and Y coordinates from the line, adding an offset of 2 to each.
        // The coordinates are expected at indices 0 and 2 of the string.
        const colCoord = parseInt(currentLine[0], 10) + 2; // X-coordinate (column)
        const rowCoord = parseInt(currentLine[2], 10) + 2; // Y-coordinate (row)

        // A switch statement determines which grid cells to increment based on a character
        // found at index 4 of the current input line.
        switch (currentLine[4]) {
            case '3': // If the character is '3', execute this block and fall through to '2'.
                // Increment cells at specific relative positions (2 units away).
                gridMatrix[rowCoord + 2][colCoord]++;
                gridMatrix[rowCoord - 2][colCoord]++;
                gridMatrix[rowCoord][colCoord - 2]++;
                gridMatrix[rowCoord][colCoord + 2]++;
            case '2': // If the character is '2' (or fell through from '3'), execute this block and fall through to '1'.
                // Increment cells at specific diagonal relative positions (1 unit away).
                gridMatrix[rowCoord + 1][colCoord - 1]++;
                gridMatrix[rowCoord + 1][colCoord + 1]++;
                gridMatrix[rowCoord - 1][colCoord - 1]++;
                gridMatrix[rowCoord - 1][colCoord + 1]++;
            case '1': // If the character is '1' (or fell through from '3' or '2'), execute this block.
                // Increment cells at specific orthogonal and central relative positions (1 unit away or at center).
                gridMatrix[rowCoord + 1][colCoord]++;
                gridMatrix[rowCoord][colCoord - 1]++;
                gridMatrix[rowCoord][colCoord]++; // The central cell itself
                gridMatrix[rowCoord][colCoord + 1]++;
                gridMatrix[rowCoord - 1][colCoord]++;
                break; // Exit the switch statement after processing '1' (or its fall-through cases).
        }
    }

    // Initialize variables for the final analysis of the grid.
    let notDroppedCount = 0; // Counter for cells that have a value of 0 (meaning nothing "dropped" on them).
    let maxDroppedCount = 0; // Stores the highest value found in any cell of the grid.

    // Iterate through a 10x10 sub-grid of the `gridMatrix`.
    // The iteration uses a decrementing loop, effectively going from 9 down to 0.
    let rowIter = 10;
    for (; rowIter--;) {
        let colIter = 10;
        for (; colIter--;) {
            // Check if the cell at the current (rowIter+2, colIter+2) position has a value of 0.
            // If it's 0, `!(0)` is true, which adds 1 to `notDroppedCount`.
            notDroppedCount += !(gridMatrix[rowIter + 2][colIter + 2]);
            // Update `maxDroppedCount` with the maximum value between its current value
            // and the value of the current grid cell, using a custom max function.
            maxDroppedCount = findMax(gridMatrix[rowIter + 2][colIter + 2], maxDroppedCount);
        }
    }

    // Output the calculated results to the console.
    console.log(notDroppedCount);
    console.log(maxDroppedCount);
}

/**
 * Custom function to find the maximum of two numbers using bitwise operations.
 * This is an optimized way to compute Math.max(a, b) for integers.
 *
 * @param {number} valA - The first numeric value.
 * @param {number} valB - The second numeric value.
 * @returns {number} The greater of the two input values.
 */
function findMax(valA, valB) {
    // This bitwise trick works for signed 32-bit integers.
    // If (valA - valB) is negative, (valA - valB) >> 31 will be -1 (all ones in two's complement).
    // If (valA - valB) is positive or zero, (valA - valB) >> 31 will be 0.
    // So, (valA - valB) & ((valA - valB) >> 31) will be (valA - valB) if valA < valB, else 0.
    // Subtracting this result from valA effectively returns valB if valA < valB, else valA.
    return valA - ((valA - valB) & ((valA - valB) >> 31));
}
