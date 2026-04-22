const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
let incomingLines = rawInputData.trim().split("\n");

const determineMaxSquareDimension = (sourceMatrix, matrixSize) => {
    // This table will store the maximum square dimension ending at each cell (row, col)
    // Initialized with null to indicate values not yet computed.
    const computedDimensions = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(null));
    let highestDimensionAchieved = 0;

    // Recursive helper function to compute the square dimension for a given cell
    const findCellExtent = (rowIndex, colIndex) => {
        // If the dimension for this cell has already been computed, return it
        if (computedDimensions[rowIndex][colIndex] !== null) {
            return computedDimensions[rowIndex][colIndex];
        }

        // If the current cell is a blocker (represented by 0 in sourceMatrix),
        // no square can end here, so its dimension is 0.
        if (sourceMatrix[rowIndex][colIndex] === 0) {
            computedDimensions[rowIndex][colIndex] = 0;
            return 0;
        }

        // Base cases: Cells in the first row or first column.
        // If they are not blockers (i.e., 1), they can form a 1x1 square.
        if (rowIndex === 0 || colIndex === 0) {
            computedDimensions[rowIndex][colIndex] = 1;
            return 1;
        }

        // Recursive step: For a non-blocker cell not in the first row/column,
        // its square dimension is 1 plus the minimum of its three relevant neighbors:
        // top-left, top, and left.
        const dimensionFromTopLeft = findCellExtent(rowIndex - 1, colIndex - 1);
        const dimensionFromTop = findCellExtent(rowIndex - 1, colIndex);
        const dimensionFromLeft = findCellExtent(rowIndex, colIndex - 1);

        const currentCellCalculatedDimension = 1 + Math.min(dimensionFromTopLeft, dimensionFromTop, dimensionFromLeft);
        computedDimensions[rowIndex][colIndex] = currentCellCalculatedDimension;
        return currentCellCalculatedDimension;
    };

    // Iterate through the entire grid to ensure all cells' dimensions are computed
    // and to find the absolute maximum dimension across the grid.
    for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
            const currentCellResult = findCellExtent(r, c);
            if (currentCellResult > highestDimensionAchieved) {
                highestDimensionAchieved = currentCellResult;
            }
        }
    }

    return highestDimensionAchieved;
};

// Main loop to process multiple test cases from input
while (true) {
    const currentGridSize = parseInt(incomingLines.shift(), 10);
    if (currentGridSize === 0) {
        break; // Exit loop if grid size is 0
    }

    // Prepare the input grid: convert '.' to 1 and '*' to 0 for easier processing
    const numericGrid = [];
    for (let rowIterator = 0; rowIterator < currentGridSize; rowIterator++) {
        const characterSequence = incomingLines.shift().split('');
        numericGrid.push(characterSequence.map(charValue => charValue === '.' ? 1 : 0));
    }

    // Compute the largest square dimension for the current grid
    const finalResult = determineMaxSquareDimension(numericGrid, currentGridSize);
    console.log(finalResult);
}