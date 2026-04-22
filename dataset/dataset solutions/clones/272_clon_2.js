// This recursive function places numbers into a grid following a specific pattern,
// often seen in algorithms for generating magic squares (specifically, the Siamese method).
function detonate(rowCoord, colCoord) {
    // If the 'currentVal' has already reached its 'maxValue',
    // it signifies that all required numbers have been placed.
    // Therefore, this particular recursive branch should terminate.
    if (currentVal === maxValue) {
        return;
    }

    // Implement wrap-around logic for column coordinates.
    // If the column index goes below zero, wrap it to the rightmost column.
    if (colCoord < 0) {
        colCoord = dimension - 1;
    }
    // If the row index goes below zero, wrap it to the bottommost row.
    if (rowCoord < 0) {
        rowCoord = dimension - 1;
    }
    // If the column index exceeds the grid's dimension, wrap it to the leftmost column.
    if (colCoord >= dimension) {
        colCoord = 0;
    }
    // If the row index exceeds the grid's dimension, wrap it to the topmost row.
    if (rowCoord >= dimension) {
        rowCoord = 0;
    }

    // Check if the cell at the current (rowCoord, colCoord) is already occupied.
    // An occupied cell is indicated by a value other than -1.
    if (gridMatrix[rowCoord][colCoord] !== -1) {
        // If the cell is occupied, the placement rule dictates a move
        // diagonally down-left from the current position for the next attempt.
        detonate(rowCoord + 1, colCoord - 1);
    } else {
        // If the cell is empty (value is -1), place the 'currentVal' into it.
        gridMatrix[rowCoord][colCoord] = currentVal;
        // Increment 'currentVal' for the subsequent placement.
        currentVal++;
        // The primary placement rule dictates a move
        // diagonally down-right for the next number if the cell was free.
        detonate(rowCoord + 1, colCoord + 1);
    }
}


// Acquire the necessary file system module to read input from standard input.
const fileSystemMod = require('fs');

// Read the raw input data from /dev/stdin, treating it as UTF-8 encoded text.
const rawData = fileSystemMod.readFileSync('/dev/stdin', 'utf8');


// Process the raw input:
// 1. Remove leading/trailing whitespace.
// 2. Split the string into an array of strings based on newline characters.
// 3. Convert each string in the array to a numeric type.
const inputNumbers = rawData.trim().split('\n').map(Number);


// Iterate through each numeric value provided in the 'inputNumbers' array.
// Each number represents a dimension for a new grid generation.
for (let idx = 0; idx < inputNumbers.length; idx++) {
    // Assign the current input number to 'dimension'.
    let dimension = inputNumbers[idx];
    // Calculate the 'maxValue' that will be placed in the grid.
    // This is typically dimension * dimension + 1 for a magic square.
    const maxValue = dimension * dimension + 1;

    // If the 'dimension' is zero, it's a termination signal,
    // so break out of the loop and stop further processing.
    if (dimension === 0) {
        break;
    }

    // Initialize the 2D array (matrix) that will hold the numbers.
    let gridMatrix = [];
    // Populate the 'gridMatrix' with placeholder values (-1)
    // to indicate that all cells are initially empty.
    for (let rowIndex = 0; rowIndex < dimension; rowIndex++) {
        gridMatrix[rowIndex] = []; // Initialize the inner array for the current row.
        for (let colIndex = 0; colIndex < dimension; colIndex++) {
            gridMatrix[rowIndex][colIndex] = -1; // Set cell to empty placeholder.
        }
    }

    // Determine the starting column for the first number placement based on the dimension.
    let colStarting = Math.floor(dimension / 2);
    // Determine the starting row for the first number placement.
    // For this algorithm, it's typically one row below the starting column's row.
    let rowStarting = colStarting + 1;

    // Place the initial number (1) at the calculated starting position in the grid.
    gridMatrix[rowStarting][colStarting] = 1;

    // Initialize 'currentVal' to 2, as 1 has already been placed.
    let currentVal = 2;

    // Initiate the recursive number placement process.
    // The first recursive call starts from a position diagonally down-right
    // from where the number 1 was placed.
    detonate(rowStarting + 1, colStarting + 1);

    // Format the final 'gridMatrix' for output.
    // 1. Join rows with newline characters.
    // 2. Replace all commas (which are default array separators in .join()) with spaces.
    console.log(gridMatrix.join('\n').replace(/,/g, ' '));
}