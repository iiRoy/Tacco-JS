function isWithinGridBounds(r, c, size) {
    return r >= 0 && c >= 0 && r < size && c < size;
}

function calculateMaxConsecutive(startRow, startCol, currentGridSize, currentGridData) {
    const directionVectors = [
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1]
    ];

    let currentMaxConsecutive = 0;

    for (let directionIndex = 0; directionIndex < directionVectors.length; directionIndex++) {
        let consecutiveCount = 0;
        const [deltaR, deltaC] = directionVectors[directionIndex];

        for (let stepOffset = 0; stepOffset <= currentGridSize; stepOffset++) {
            const currentRow = startRow + (deltaR * stepOffset);
            const currentCol = startCol + (deltaC * stepOffset);

            if (!isWithinGridBounds(currentRow, currentCol, currentGridSize)) {
                break;
            }

            const cellValue = currentGridData[currentRow][currentCol];
            if (cellValue === 1) {
                consecutiveCount++;
            } else {
                break;
            }
        }
        currentMaxConsecutive = Math.max(currentMaxConsecutive, consecutiveCount);
    }
    return currentMaxConsecutive;
}

function parseGridData(linesSource, size) {
    const parsedGrid = [];
    for (let rIdx = 0; rIdx < size; rIdx++) {
        parsedGrid[rIdx] = (linesSource.shift()).split("").map(Number);
    }
    return parsedGrid;
}

const rawInputLines = (input.trim()).split("\n");

while (true) {
    const currentGridSize = Number(rawInputLines.shift());

    if (currentGridSize === 0) {
        break;
    }

    const currentGridData = parseGridData(rawInputLines, currentGridSize);

    let overallMax = 0;

    for (let rowIndex = 0; rowIndex < currentGridSize; rowIndex++) {
        for (let colIndex = 0; colIndex < currentGridSize; colIndex++) {
            const cellValueAtCurrentPos = currentGridData[rowIndex][colIndex];

            if (cellValueAtCurrentPos === 1) {
                const maxFromCurrentCell = calculateMaxConsecutive(rowIndex, colIndex, currentGridSize, currentGridData);
                overallMax = Math.max(overallMax, maxFromCurrentCell);
            }
        }
    }
    console.log(overallMax);
}
