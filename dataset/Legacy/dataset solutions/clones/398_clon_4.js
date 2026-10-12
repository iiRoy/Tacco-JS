function measureSequence(currY, currX, dY, dX, currentGrid, gridDimension) {
    if (currY < 0 || currX < 0 || currY >= gridDimension || currX >= gridDimension) {
        return 0;
    }
    if (currentGrid[currY][currX] !== 1) {
        return 0;
    }
    return 1 + measureSequence(currY + dY, currX + dX, dY, dX, currentGrid, gridDimension);
}

function calculateMaxSequence(initialY, initialX, currentGrid, gridDimension) {
    const directionVectors = [
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1]
    ];

    return directionVectors.reduce((currentMax, [deltaY, deltaX]) => {
        const sequenceLength = measureSequence(initialY, initialX, deltaY, deltaX, currentGrid, gridDimension);
        return Math.max(currentMax, sequenceLength);
    }, 0);
}

function* parseInputCases(inputLines) {
    let lines = [...inputLines];
    while (lines.length > 0) {
        const dimension = Number(lines.shift());
        if (dimension === 0) {
            return;
        }
        const gridData = [];
        for (let r = 0; r < dimension; r++) {
            gridData.push(lines.shift().split("").map(Number));
        }
        yield { size: dimension, matrix: gridData };
    }
}

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInput.trim().split("\n");

for (const currentCase of parseInputCases(processedLines)) {
    const currentDimension = currentCase.size;
    const currentMatrix = currentCase.matrix;
    let overallMaximum = 0;

    currentMatrix.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            if (cellValue === 1) {
                const localMax = calculateMaxSequence(rowIndex, colIndex, currentMatrix, currentDimension);
                overallMaximum = Math.max(overallMaximum, localMax);
            }
        });
    });
    console.log(overallMaximum);
}
