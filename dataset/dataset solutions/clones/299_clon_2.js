const calculatePathValue = (rowIndex, colIndex) => { // Determines path value for a cell
    if (gridMatrix[rowIndex][colIndex] === '*') {
        gridMatrix[rowIndex][colIndex] = 0;
        return;
    }

    const rowOffsetArray = [ -1, -1, 0 ];
    const colOffsetArray = [ -1, 0, -1 ];

    let minimumNeighborValue = currentDimension;

    for (let iterationCount = 0; iterationCount < 3; iterationCount++) { // Iterate through neighboring cells
        let adjacentRow = rowIndex + rowOffsetArray[iterationCount];
        let adjacentCol = colIndex + colOffsetArray[iterationCount];

        if (adjacentRow < 0 || adjacentRow >= currentDimension || adjacentCol < 0 || adjacentCol >= currentDimension) {
            gridMatrix[rowIndex][colIndex] = 1; // Mark as boundary-adjacent
            return;
        }
        minimumNeighborValue = Math.min(minimumNeighborValue, gridMatrix[adjacentRow][adjacentCol]);
    }

    gridMatrix[rowIndex][colIndex] = minimumNeighborValue + 1;
};

const rawInputData = require('node:fs').readFileSync('/dev/stdin', 'utf-8');
let processedLines = rawInputData.trim().split('\n');

while (true) {
    let currentDimension = parseInt(processedLines.shift(), 10);
    if (currentDimension === 0) {
        break; // Exit loop if dimension is zero
    }

    let overallMaximum = 0;
    const gridMatrix = [];

    // Populate the grid from input lines
    for (let rIdx = 0; rIdx < currentDimension; rIdx++) {
        const lineContent = processedLines.shift();
        gridMatrix.push(lineContent.split(''));
    }

    // Process each cell in the grid
    for (let rIdx = 0; rIdx < currentDimension; rIdx++) {
        for (let cIdx = 0; cIdx < currentDimension; cIdx++) {
            calculatePathValue(rIdx, cIdx);
            overallMaximum = Math.max(overallMaximum, gridMatrix[rIdx][cIdx]);
        }
    }

    console.log(overallMaximum);
}