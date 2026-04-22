function deployMine(rowCoord, colCoord) { // Recursive function to place mines in the grid
    // Check if the maximum number of mines has been placed. If so, terminate this branch.
    if (currentMineValue === maxMineCount) {
        return;
    }

    // Wrap column coordinate if it goes out of bounds horizontally
    if (colCoord < 0) {
        colCoord = gridDimension - 1;
    }
    if (colCoord >= gridDimension) {
        colCoord = 0;
    }

    // Wrap row coordinate if it goes out of bounds vertically
    if (rowCoord < 0) {
        rowCoord = gridDimension - 1;
    }
    if (rowCoord >= gridDimension) {
        rowCoord = 0;
    }

    // Check if the current cell is already occupied by a mine
    if (minefieldGrid[rowCoord][colCoord] !== UNPLACED_MARKER) {
        // If occupied, move to the cell diagonally up-left relative to the next position in a spiral
        deployMine(rowCoord + 1, colCoord - 1);
    } else {
        // If the cell is empty, place the current mine value
        // Format the number with leading spaces to ensure a consistent width of 4 characters
        minefieldGrid[rowCoord][colCoord] = (VALUE_PADDING + currentMineValue).slice(-4);
        
        // Increment the mine value for the next placement
        currentMineValue++;
        
        // Recursively call to place the next mine, moving diagonally down-right
        deployMine(rowCoord + 1, colCoord + 1);
    }
}

// Define constants for clarity and potential type changes
const UNPLACED_MARKER = -1; // Represents an empty slot in the minefield
const VALUE_PADDING = "   "; // Used for formatting mine numbers to a fixed width

// Read input from standard input, typically a file
const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace, split by newline, and convert each line to a number
const dimensionValues = fileContents.trim().split("\n").map(Number);

// Iterate through each dimension value provided in the input
for (let dimensionIndex = 0; dimensionIndex < dimensionValues.length; dimensionIndex++) {

    // Get the current grid dimension (n) from the array
    const gridDimension = dimensionValues[dimensionIndex];

    // Calculate the maximum number of mines to place in the grid (n*n) plus one for loop condition.
    const maxMineCount = gridDimension * gridDimension + 1;

    // If the dimension is 0, it signifies the end of input, so break the loop
    if (gridDimension === 0) {
        break;
    }

    // Initialize the 2D array (minefieldGrid) to store mine placements
    let minefieldGrid = [];
    
    // Populate the grid with the UNPLACED_MARKER
    for (let rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
        minefieldGrid[rowIndex] = []; // Initialize inner array for the current row
        for (let colIndex = 0; colIndex < gridDimension; colIndex++) {
            minefieldGrid[rowIndex][colIndex] = UNPLACED_MARKER;
        }
    }

    // Determine the starting position for the first mine placement
    // Initial column is the middle of the grid
    let startCol = Math.floor(gridDimension / 2);
    // Initial row is one below the middle column index
    let startRow = startCol + 1;

    // Place the very first mine (value 1) at the calculated starting position
    // Format it with padding
    minefieldGrid[startRow][startCol] = (VALUE_PADDING + 1).slice(-4);

    // Initialize the counter for the next mine value (starts from 2)
    let currentMineValue = 2;

    // Begin the recursive mine placement process from the next logical cell
    // This is typically diagonally down-right from the first placed mine
    deployMine(startRow + 1, startCol + 1);

    // Output the final minefield grid
    // Join rows with newlines, and remove any commas introduced by array.join()
    console.log(minefieldGrid.join("\n").replace(/,/g, ""));
}