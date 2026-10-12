function fillGridRecursively(rowCoord, colCoord, gridSize, gridMatrix, currentFillValueRef, maxFillValue) {
    if (currentFillValueRef.value >= maxFillValue) {
        return;
    }

    // Normalize column coordinate (wrap around grid)
    let adjustedCol = colCoord;
    if (adjustedCol < 0) {
        adjustedCol = gridSize - 1;
    } else if (adjustedCol >= gridSize) {
        adjustedCol = 0;
    }

    // Normalize row coordinate (wrap around grid)
    let adjustedRow = rowCoord;
    if (adjustedRow < 0) {
        adjustedRow = gridSize - 1;
    } else if (adjustedRow >= gridSize) {
        adjustedRow = 0;
    }

    // Check if the cell at the adjusted coordinates is already filled
    const cellContent = gridMatrix[adjustedRow][adjustedCol];

    if (cellContent !== -1) {
        // If cell is occupied, try the next position diagonally up-left relative to the current adjusted position
        fillGridRecursively(adjustedRow + 1, adjustedCol - 1, gridSize, gridMatrix, currentFillValueRef, maxFillValue);
    } else {
        // If cell is empty, fill it with the current value and increment
        gridMatrix[adjustedRow][adjustedCol] = currentFillValueRef.value;
        currentFillValueRef.value++;
        // Then, try the next position diagonally up-right relative to the current adjusted position
        fillGridRecursively(adjustedRow + 1, adjustedCol + 1, gridSize, gridMatrix, currentFillValueRef, maxFillValue);
    }
}

// Helper function to create and initialize an empty grid
function initializeEmptyGrid(size) {
    const newGrid = [];
    for (let rowIndex = 0; rowIndex < size; rowIndex++) {
        newGrid.push(Array(size).fill(-1));
    }
    return newGrid;
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputNumbers = rawData.trim().split("\n").map(Number);

for (let inputIdx = 0; inputIdx < inputNumbers.length; inputIdx++) {
    const currentGridSize = inputNumbers[inputIdx];
    const totalCellsCount = currentGridSize * currentGridSize;
    const maxFillValue = totalCellsCount + 1;

    if (currentGridSize === 0) {
        break;
    }

    const gridMatrix = initializeEmptyGrid(currentGridSize);

    const centerOffset = Math.floor(currentGridSize / 2);
    let initialCol = centerOffset;
    let initialRow = centerOffset + 1;

    gridMatrix[initialRow][initialCol] = 1;

    // Use an object to pass the current value by reference, mimicking global variable behavior
    const currentFillValueRef = { value: 2 };

    fillGridRecursively(initialRow + 1, initialCol + 1, currentGridSize, gridMatrix, currentFillValueRef, maxFillValue);

    // Format the output to match the original's exact spacing and newlines
    const formattedOutputLines = gridMatrix.map(row => {
        const rowString = row.join(" ");
        return " " + rowString; // Prepend a space to each line
    });
    console.log(formattedOutputLines.join("\n"));
}
