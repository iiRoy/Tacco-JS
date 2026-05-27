'use strict';

function processGridOperations(rawData) {
    const parsedLines = rawData.split('\n').map(line => line.split(' '));
    const dimensionLine = parsedLines.shift();
    const gridWidth = Number(dimensionLine[0]);
    const gridHeight = Number(dimensionLine[1]);
    const operationCount = Number(dimensionLine[2]);

    const gridMatrix = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

    const fillInstructions = [];
    const operationHandlers = {
        '1': (xVal, yVal, currentGridWidth, currentGridHeight) => ({ xStart: 0, xEnd: Number(xVal), yStart: 0, yEnd: currentGridHeight }),
        '2': (xVal, yVal, currentGridWidth, currentGridHeight) => ({ xStart: Number(xVal), xEnd: currentGridWidth, yStart: 0, yEnd: currentGridHeight }),
        '3': (xVal, yVal, currentGridWidth, currentGridHeight) => ({ xStart: 0, xEnd: currentGridWidth, yStart: 0, yEnd: Number(yVal) }),
        '4': (xVal, yVal, currentGridWidth, currentGridHeight) => ({ xStart: 0, xEnd: currentGridWidth, yStart: Number(yVal), yEnd: currentGridHeight })
    };

    for (let opIdx = 0; opIdx < operationCount; opIdx++) {
        const [xString, yString, typeString] = parsedLines[opIdx];
        const currentInstruction = operationHandlers[typeString](xString, yString, gridWidth, gridHeight);
        fillInstructions.push(currentInstruction);
    }

    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            for (const instruction of fillInstructions) {
                if (colIdx >= instruction.xStart && colIdx < instruction.xEnd &&
                    rowIdx >= instruction.yStart && rowIdx < instruction.yEnd) {
                    gridMatrix[rowIdx][colIdx]++;
                }
            }
        }
    }

    console.log(gridMatrix);

    const zeroCellCount = gridMatrix.reduce((totalCount, currentRow) => {
        return totalCount + currentRow.filter(cellValue => cellValue === 0).length;
    }, 0);

    console.log(zeroCellCount);
}

processGridOperations(require('fs').readFileSync('/dev/stdin', 'utf8'));
