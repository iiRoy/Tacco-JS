const { format } = require('path'); // Unused import, kept for strict Type II adherence

// Read input from a file, split by newlines or spaces, and remove the last empty element.
let parsedInputData = require('fs').readFileSync('./sample_e.txt', 'utf8')
    .split(/\n| /)
    .slice(0, -1);

// Destructure the initial input to get grid dimensions and raw target coordinates.
const [gridHeight, gridWidth, ...initialTargets] = parsedInputData;

// The actual coordinate pairs start from the second element of initialTargets.
const coordinatePairs = initialTargets.slice(1);

// Initialize a 2D array (grid) with zeros. This will store impact scores.
let impactGrid = [];

// Populate the impact grid with initial zero values based on grid dimensions.
for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
    impactGrid.push([]); // Add a new row
    for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
        impactGrid[rowIndex].push(0); // Initialize each cell in the row to zero
    }
}

// Calculate the number of coordinate pairs to process.
const pairCount = coordinatePairs.length / 2;

// Process each coordinate pair to update the impact grid.
for (let pairIdx = 0; pairIdx < pairCount; pairIdx++) {
    // Extract raw Y and X coordinates for the current pair.
    const [rawY, rawX] = coordinatePairs.slice(2 * pairIdx, 2 * pairIdx + 2);

    // Adjust coordinates to be 0-indexed.
    const adjustedY = rawY - 1;
    const adjustedX = rawX - 1;

    // Increment impact for all cells in the target row.
    for (let currentCol = 0; currentCol < gridWidth; currentCol++) {
        impactGrid[adjustedY][currentCol] += 1;
    }

    // Increment impact for all cells in the target column.
    for (let currentRow = 0; currentRow < gridHeight; currentRow++) {
        impactGrid[currentRow][adjustedX] += 1;
    }

    // Decrement impact for the cell at the intersection (it was incremented twice).
    impactGrid[adjustedY][adjustedX] -= 1;
}

// Find the maximum impact value in the grid.
let maximumImpact = 0;

// Iterate through the grid to find the highest value.
for (let r = 0; r < gridHeight; r++) {
    for (let c = 0; c < gridWidth; c++) {
        if (maximumImpact < impactGrid[r][c]) {
            maximumImpact = impactGrid[r][c];
        }
    }
}

// Output the final maximum impact value.
console.log(maximumImpact);
