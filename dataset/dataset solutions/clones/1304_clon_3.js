'use strict'

const parseNumericMatrix = (stringRows, rowCount) => {
    const parsedMatrix = [];
    for (let i = 0; i < rowCount; i++) {
        parsedMatrix.push(stringRows[i].split(" ").map(s => parseInt(s, 10)));
    }
    return parsedMatrix;
};

const processInput = rawData => {
    const lines = rawData.trim().split("\n");

    const dimensionsStr = lines[0].split(" ");
    const numRowsA = parseInt(dimensionsStr[0], 10);
    const commonDim = parseInt(dimensionsStr[1], 10);
    const numColsB = parseInt(dimensionsStr[2], 10);

    const matA = parseNumericMatrix(lines.slice(1, numRowsA + 1), numRowsA);
    const matB = parseNumericMatrix(lines.slice(numRowsA + 1, numRowsA + 1 + commonDim), commonDim);

    const productMatrix = Array.from({ length: numRowsA }, () => Array.from({ length: numColsB }, () => 0));

    for (let rowIdxA = 0; rowIdxA < numRowsA; rowIdxA++) {
        for (let colIdxB = 0; colIdxB < numColsB; colIdxB++) {
            let currentSum = 0;
            for (let commonIdx = 0; commonIdx < commonDim; commonIdx++) {
                currentSum += matA[rowIdxA][commonIdx] * matB[commonIdx][colIdxB];
            }
            productMatrix[rowIdxA][colIdxB] = currentSum;
        }
    }

    const outputLines = productMatrix.map(row => row.join(" "));
    console.log(outputLines.join("\n"));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
