'use strict';

// Function to process raw input and perform the grid transformation logic.
const executeMatrixTransformation = (rawInputString) => {
    // Split the entire input into individual lines, filtering out any potential empty lines.
    const inputLines = rawInputString.split('\n').filter(line => line.trim() !== '');

    // The first line contains the grid dimensions (Height and Width).
    const dimensionTokens = inputLines[0].split(' ').map(Number);
    const gridHeight = dimensionTokens[0]; // Renamed from H
    const gridWidth = dimensionTokens[1];   // Renamed from W

    // Basic validation for dimensions to prevent errors with malformed input.
    if (isNaN(gridHeight) || isNaN(gridWidth) || gridHeight <= 0 || gridWidth <= 0) {
        console.error("Error: Invalid grid dimensions provided. Height and Width must be positive numbers.");
        return; // Exit if dimensions are invalid.
    }

    // Initialize the 2D array (matrix) to store numerical data.
    // Each inner array represents a row, initialized with zeros.
    const numericGrid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0)); // Renamed from 'a'

    // Populate the grid from the remaining input lines, starting from the second line.
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) { // Renamed from 'y'
        const lineTokens = inputLines[rowIndex + 1].split(' ').map(Number); // Renamed from 'l'
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) { // Renamed from 'x'
            // Ensure the value parsed from the input is a valid number, defaulting to 0 if not.
            numericGrid[rowIndex][colIndex] = isNaN(lineTokens[colIndex]) ? 0 : lineTokens[colIndex];
        }
    }

    // Array to store the details of each transfer operation performed.
    const transferRecords = []; // Renamed from 'log'

    // Helper function to record a transfer operation and update the grid state.
    // It takes source and destination coordinates (column, row).
    const recordAndExecuteMove = (sourceCol, sourceRow, destCol, destRow) => { // Renamed from 'move', 'sx', 'sy', 'ex', 'ey'
        // Construct the log entry string in the specified format.
        const moveEntry = `${sourceCol} ${sourceRow} ${destCol} ${destRow}`;
        transferRecords.push(moveEntry);

        // Perform the actual numerical transfer on the grid.
        // Increment the destination cell's value by one.
        numericGrid[destRow][destCol] = numericGrid[destRow][destCol] + 1;
        // Decrement the source cell's value by one.
        numericGrid[sourceRow][sourceCol] = numericGrid[sourceRow][sourceCol] - 1;
    };

    // --- Core logic: Redistribute odd values across the grid ---
    // This process iterates through each cell in the grid to identify cells
    // containing an odd number. If an odd number is found, one unit is moved
    // to an adjacent cell (preferring right, then down) to make the current
    // cell's value even.
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            // Retrieve the current cell's value for easier manipulation.
            let currentValue = numericGrid[rowIndex][colIndex];

            // Check if the current cell's value is odd using a bitwise AND operation.
            // This is an alternative to the modulo operator (%) for parity checking.
            const isValueOdd = (currentValue & 1) !== 0; // Equivalent to currentValue % 2 !== 0

            if (isValueOdd) {
                // If the value is odd, we need to transfer one unit to an adjacent cell.
                // The priority for movement is right, and if not possible, then down.

                const canMoveRight = (colIndex + 1) < gridWidth;
                const canMoveDown = (rowIndex + 1) < gridHeight;

                if (canMoveRight) {
                    // Move one unit to the cell immediately to the right.
                    recordAndExecuteMove(colIndex, rowIndex, colIndex + 1, rowIndex);
                } else if (canMoveDown) {
                    // If moving right is not possible (i.e., at the rightmost column),
                    // move one unit to the cell immediately below.
                    recordAndExecuteMove(colIndex, rowIndex, colIndex, rowIndex + 1);
                }
                // If neither right nor down is possible (e.g., bottom-right corner and odd),
                // the value remains odd. This scenario is typically implicitly handled by the problem constraints.
            }
        }
    }

    // --- Output Results ---
    // Print the total count of transfer operations performed.
    console.log(transferRecords.length);

    // Print each transfer record, with each record on a new line.
    // An extra newline is added at the end, matching the original output format
    // even if no records were made (resulting in two newlines after the count).
    if (transferRecords.length > 0) {
        console.log(transferRecords.join('\n') + '\n');
    } else {
        // If no transfers occurred, still print an empty line for consistency.
        console.log('\n');
    }
};

// --- Execution Context ---
// This flag determines whether the program runs with a hardcoded test input
// or reads data from standard input (e.g., from a file or pipe).
const runInTestMode = false; // Renamed from 'isTest'

if (runInTestMode) {
    // Example test case, as provided in the original problem description.
    executeMatrixTransformation('2 3\n1 2 3\n0 1 1\n');
} else {
    // For production execution, read input from standard input.
    try {
        const fileSystem = require('fs');
        const standardInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
        executeMatrixTransformation(standardInputData);
    } catch (error) {
        // Log any errors encountered during file reading from stdin.
        console.error("Failed to read from /dev/stdin:", error.message);
        // Depending on requirements, could exit process or provide a fallback.
    }
}