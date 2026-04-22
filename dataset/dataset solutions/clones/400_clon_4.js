const fileSystem = require('fs');

function obtainLongestSequence(initialRow, initialCol, totalDimension, dataMatrix) {
    const movementVectors = [
        { rowDelta: 0, colDelta: 1 },
        { rowDelta: 1, colDelta: -1 },
        { rowDelta: 1, colDelta: 0 },
        { rowDelta: 1, colDelta: 1 }
    ];

    let highestValue = 1;

    movementVectors.forEach(vector => {
        let currentLength = 0;
        let step = 0;

        while (true) {
            let evaluatedRow = initialRow + (vector.rowDelta * step);
            let evaluatedCol = initialCol + (vector.colDelta * step);

            if (evaluatedRow < 0 || evaluatedCol < 0 || evaluatedRow >= totalDimension || evaluatedCol >= totalDimension) {
                break;
            }
            if (dataMatrix[evaluatedRow][evaluatedCol] !== 1) {
                break;
            }
            currentLength++;
            step++;
        }
        highestValue = Math.max(highestValue, currentLength);
    });

    return highestValue;
}

function processGrids(linesRemaining, accumulatedResults) {
    if (linesRemaining.length === 0 || linesRemaining[0].trim() === '') {
        return accumulatedResults;
    }

    const currentDimension = parseInt(linesRemaining[0], 10);
    if (isNaN(currentDimension) || currentDimension === 0) {
        return accumulatedResults;
    }

    const gridLines = linesRemaining.slice(1, currentDimension + 1);
    const matrixData = gridLines.map(line => line.split('').map(Number));

    let overallMaximum = 0;

    matrixData.forEach((rowValues, rowIndex) => {
        rowValues.forEach((cellValue, colIndex) => {
            if (cellValue === 1) {
                overallMaximum = Math.max(overallMaximum, obtainLongestSequence(rowIndex, colIndex, currentDimension, matrixData));
            }
        });
    });

    return processGrids(linesRemaining.slice(currentDimension + 1), accumulatedResults.concat(overallMaximum));
}

const allInputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const finalOutputs = processGrids(allInputLines, []);
finalOutputs.forEach(result => console.log(result));