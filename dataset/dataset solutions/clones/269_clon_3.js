// Recursive function to fill the grid based on specific movement rules.
// Renamed from 'bomb' (Type II).
// Parameters 'currentGridRow', 'currentGridCol' replace 'y', 'x' (Type II).
function processCellRecursive(currentGridRow, currentGridCol) {
    // Type III: Early exit condition placed at the beginning for clarity and efficiency.
    // Checks if all required values have been placed in the grid.
    if (currentValue >= upperBound) {
        return;
    }

    // Type III: Intermediate variables to hold the coordinates after wrapping.
    // This makes the coordinate adjustment step explicit.
    let adjustedRowPosition = currentGridRow;
    let adjustedColPosition = currentGridCol;

    // Apply coordinate wrapping logic.
    // Original: if(x<0)x=n-1; if(y<0)y=n-1; if(x>=n)x=0; if(y>=n)y=0;
    // Rewritten and reordered for slight variation (Type III).
    if (adjustedColPosition < 0) {
        adjustedColPosition = gridDimension - 1;
    } else if (adjustedColPosition >= gridDimension) {
        adjustedColPosition = 0;
    }

    if (adjustedRowPosition < 0) {
        adjustedRowPosition = gridDimension - 1;
    } else if (adjustedRowPosition >= gridDimension) {
        adjustedRowPosition = 0;
    }

    // Type III: Introduce an intermediate boolean variable for readability.
    const cellIsAlreadyFilled = gridMatrix[adjustedRowPosition][adjustedColPosition] !== -1;

    if (cellIsAlreadyFilled) {
        // If the current target cell is already filled,
        // we adjust the next placement attempt.
        // Original logic: bomb(y+1,x-1) -- attempting to place from a new position.
        // This implies moving one step down and one step left from the *original* (unwrapped) coordinates.
        processCellRecursive(currentGridRow + 1, currentGridCol - 1);
    } else {
        // If the target cell is empty, place the current value.
        // Type II: Changed string formatting from slice(-4) to padStart.
        gridMatrix[adjustedRowPosition][adjustedColPosition] = String(currentValue).padStart(4, ' ');
        currentValue++; // Increment the value for the next placement.

        // Proceed with the primary movement rule: one step down and one step right.
        // Original logic: bomb(y+1,x+1) -- attempting to place from a new position.
        processCellRecursive(currentGridRow + 1, currentGridCol + 1);
    }
}

// Type II: Renamed input variable.
const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

// Type II: Renamed array variable and added comments.
// Processes the raw input string into an array of numbers representing grid dimensions.
const dimensionSet = dataSource.trim().split("\n").map(Number);

// Type III: Declared global-like variables to be used across iterations and by the recursive function.
// This clarifies their scope and persistence within the script's execution context.
let gridDimension;
let upperBound;
let gridMatrix;
let currentValue;

// Type II: Renamed loop iterator.
// Iterate through each dimension provided in the input.
for (let dimensionIterator = 0; dimensionIterator < dimensionSet.length; dimensionIterator++) {
    gridDimension = dimensionSet[dimensionIterator];

    // Type III: Added a guard clause/validation for input dimensions.
    // Handles non-positive dimensions gracefully.
    if (gridDimension <= 0) {
        if (gridDimension === 0) {
            // Original behavior: break if dimension is 0.
            break;
        }
        // Type III: Added an error message for other invalid dimensions.
        console.error(`Skipping invalid grid dimension encountered: ${gridDimension}`);
        continue; // Skip to the next dimension in the set.
    }

    // Type II: Renamed 'max' to 'upperBound'.
    // Determines the maximum value to be placed in the grid (n*n).
    upperBound = gridDimension * gridDimension + 1;

    // Type II: Renamed 'yx' to 'gridMatrix'.
    // Initialize the 2D array (grid) with a placeholder value (-1) for empty cells.
    gridMatrix = [];
    for (let rowIdx = 0; rowIdx < gridDimension; rowIdx++) {
        gridMatrix[rowIdx] = [];
        for (let colIdx = 0; colIdx < gridDimension; colIdx++) {
            gridMatrix[rowIdx][colIdx] = -1; // Indicates an empty cell.
        }
    }

    // Type II: Renamed 'x' and 'y' to 'initialColPosition' and 'initialRowPosition'.
    // Calculate the initial placement coordinates for the first value (1).
    const initialColPosition = Math.floor(gridDimension / 2);
    const initialRowPosition = initialColPosition + 1;

    // Place the first value (1) in its starting position.
    // Type II: Changed string formatting.
    gridMatrix[initialRowPosition][initialColPosition] = String(1).padStart(4, ' ');

    // Type II: Renamed 'N' to 'currentValue'.
    // Initialize the counter for the values to be placed, starting from 2.
    currentValue = 2;

    // Initiate the recursive filling process.
    // The first recursive call attempts to place '2' at a specific offset from '1'.
    // Original: bomb(y+1,x+1)
    processCellRecursive(initialRowPosition + 1, initialColPosition + 1);

    // Type III: Rewrote the output formatting for clarity and using modern JS array methods.
    // Joins each row's elements without commas, then joins rows with newlines.
    const finalFormattedGridOutput = gridMatrix.map(gridRow =>
        gridRow.join('')
    ).join('\n');

    console.log(finalFormattedGridOutput);
}