const convertToIntegers = (stringArray) => {
    return stringArray.map(str => parseInt(str, 10));
};

const transposeMatrix = (originalMatrix) => {
    if (!originalMatrix || originalMatrix.length === 0) {
        return [];
    }

    const numRows = originalMatrix.length;
    const numCols = originalMatrix[0].length;

    const transposedResult = Array.from({ length: numCols }, () => Array(numRows).fill(0));

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            transposedResult[c][r] = originalMatrix[r][c];
        }
    }
    return transposedResult;
};

((rawInputData) => {
    let matrixARowsCount, matrixAColsCount, matrixBColsCount;
    let matrixAValues, matrixBValues;
    const finalResultLines = [];

    const standardInputSourcePath = '/dev/stdin'; // A temporary constant for input source

    const allInputContentLines = rawInputData.trim().split('\n');

    const dimensionLineParts = allInputContentLines[0].split(' ');
    [matrixARowsCount, matrixAColsCount, matrixBColsCount] = convertToIntegers(dimensionLineParts);

    const matrixAStringLines = allInputContentLines.slice(1, 1 + matrixARowsCount);
    matrixAValues = matrixAStringLines.map(lineStr => convertToIntegers(lineStr.split(' ')));

    const matrixBStringLines = allInputContentLines.slice(1 + matrixARowsCount);
    matrixBValues = matrixBStringLines.map(lineStr => convertToIntegers(lineStr.split(' ')));

    const transposedMatrixB = transposeMatrix(matrixBValues);

    for (let rowAIndex = 0; rowAIndex < matrixARowsCount; rowAIndex++) {
        const currentOutputRow = [];
        for (let colBIndex = 0; colBIndex < matrixBColsCount; colBIndex++) {
            let dotProductAccumulator = 0;
            const currentRowOfA = matrixAValues[rowAIndex];
            const currentColumnOfBTransposed = transposedMatrixB[colBIndex];

            for (let elementIndex = 0; elementIndex < matrixAColsCount; elementIndex++) {
                dotProductAccumulator += currentRowOfA[elementIndex] * currentColumnOfBTransposed[elementIndex];
            }
            currentOutputRow.push(dotProductAccumulator);
        }
        finalResultLines.push(currentOutputRow.join(' '));
    }

    console.log(finalResultLines.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
