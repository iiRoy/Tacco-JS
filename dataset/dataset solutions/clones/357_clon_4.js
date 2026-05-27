function propagateClearance(initialRow, initialCol, targetSymbol, characterGrid, maxRows, maxCols) {
    const rowShift = [0, 0, -1, 1];
    const colShift = [-1, 1, 0, 0];

    const processingQueue = [[initialRow, initialCol]];
    characterGrid[initialRow][initialCol] = "m";

    let queuePointer = 0;
    while (queuePointer < processingQueue.length) {
        const [currentRow, currentCol] = processingQueue[queuePointer++];
        
        for (let k = 0; k < 4; k++) {
            const neighborRow = currentRow + rowShift[k];
            const neighborCol = currentCol + colShift[k];

            if (neighborRow >= 0 && neighborRow < maxRows && neighborCol >= 0 && neighborCol < maxCols) {
                if (characterGrid[neighborRow][neighborCol] === targetSymbol) {
                    characterGrid[neighborRow][neighborCol] = "m";
                    processingQueue.push([neighborRow, neighborCol]);
                }
            }
        }
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLineBuffer = rawInputData.trim().split("\n");

while (true) {
    const gridDimensions = inputLineBuffer.shift().split(" ").map(Number);

    if (gridDimensions[0] === 0 && gridDimensions[1] === 0) {
        break;
    }

    const characterGrid = Array.from({ length: gridDimensions[0] }, () =>
        inputLineBuffer.shift().split("")
    );

    let regionCount = 0;

    const totalCells = gridDimensions[0] * gridDimensions[1];
    for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
        const currentRow = Math.floor(cellIndex / gridDimensions[1]);
        const currentCol = cellIndex % gridDimensions[1];

        const currentSymbol = characterGrid[currentRow][currentCol];

        if (currentSymbol === "@" || currentSymbol === "#" || currentSymbol === "*") {
            regionCount++;
            propagateClearance(currentRow, currentCol, currentSymbol, characterGrid, gridDimensions[0], gridDimensions[1]);
        }
    }

    console.log(regionCount);
}
