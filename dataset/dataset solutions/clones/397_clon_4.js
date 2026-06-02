function determineLongestChain(gridMatrix, gridSizeValue, initialRow, initialCol) {
    const movementVectors = [
        { r: 0, c: 1 },
        { r: 1, c: -1 },
        { r: 1, c: 0 },
        { r: 1, c: 1 }
    ];

    const calculateChainInDirection = (currentRow, currentCol, rowDelta, colDelta, currentLength) => {
        if (
            currentRow < 0 || currentRow >= gridSizeValue ||
            currentCol < 0 || currentCol >= gridSizeValue ||
            gridMatrix[currentRow][currentCol] !== 1
        ) {
            return currentLength;
        }
        return calculateChainInDirection(
            currentRow + rowDelta,
            currentCol + colDelta,
            rowDelta,
            colDelta,
            currentLength + 1
        );
    };

    let maxChainLength = 0;

    for (const vector of movementVectors) {
        const lengthInThisDirection = calculateChainInDirection(
            initialRow,
            initialCol,
            vector.r,
            vector.c,
            0
        );
        maxChainLength = Math.max(maxChainLength, lengthInThisDirection);
    }

    return maxChainLength;
}

const inputLines = (input.trim()).split("\n");
let linePointer = 0;

while (true) {
    const gridSizeValue = Number(inputLines[linePointer++]);

    if (gridSizeValue === 0) break;

    const gridMatrix = Array.from({ length: gridSizeValue }, (_, rIdx) =>
        inputLines[linePointer++].split("").map(Number)
    );

    const allCellCoordinates = Array.from({ length: gridSizeValue * gridSizeValue }, (_, idx) => ({
        r: Math.floor(idx / gridSizeValue),
        c: idx % gridSizeValue
    }));

    const overallMaximum = allCellCoordinates.reduce((currentMax, { r, c }) => {
        if (gridMatrix[r][c] === 1) {
            return Math.max(currentMax, determineLongestChain(gridMatrix, gridSizeValue, r, c));
        }
        return currentMax;
    }, 0);

    console.log(overallMaximum);
}
