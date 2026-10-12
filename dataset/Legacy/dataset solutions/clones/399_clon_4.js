const fileSystem = require('fs');

const checkDirection = (currentGrid, currentSize, currentY, currentX, yIncrement, xIncrement) => {
    if (currentY < 0 || currentX < 0 || currentY >= currentSize || currentX >= currentSize) {
        return 0;
    }
    if (currentGrid[currentY][currentX] !== 1) {
        return 0;
    }
    return 1 + checkDirection(currentGrid, currentSize, currentY + yIncrement, currentX + xIncrement, yIncrement, xIncrement);
};

const determineMaxSequence = (gridData, gridSize, startRow, startCol) => {
    const movementVectors = [
        { yInc: 0, xInc: 1 },
        { yInc: 1, xInc: -1 },
        { yInc: 1, xInc: 0 },
        { yInc: 1, xInc: 1 }
    ];

    return movementVectors.reduce((currentMax, vector) => {
        const sequenceLength = checkDirection(gridData, gridSize, startRow, startCol, vector.yInc, vector.xInc);
        return Math.max(currentMax, sequenceLength);
    }, 0);
};

function* inputProcessor(rawInput) {
    const lines = rawInput.trim().split('\n');
    let lineIndex = 0;

    while (lineIndex < lines.length) {
        const currentSize = Number(lines[lineIndex++]);
        if (currentSize === 0) {
            return;
        }

        const currentGrid = Array.from({ length: currentSize }, (_, r) =>
            lines[lineIndex++].split('').map(Number)
        );
        yield { size: currentSize, grid: currentGrid };
    }
}

const allInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

for (const gridSet of inputProcessor(allInput)) {
    const currentGridSize = gridSet.size;
    const currentGridData = gridSet.grid;

    const overallMax = Array.from({ length: currentGridSize }).flatMap((_, r) =>
        Array.from({ length: currentGridSize }, (_, c) => ({ row: r, col: c }))
    )
    .filter(coord => currentGridData[coord.row][coord.col] === 1)
    .reduce((maxVal, coord) =>
        Math.max(maxVal, determineMaxSequence(currentGridData, currentGridSize, coord.row, coord.col)),
        0
    );

    console.log(overallMax);
}
