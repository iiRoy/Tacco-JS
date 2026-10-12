const ioInterface = require('readline').createInterface({
    input: process.stdin, output: process.stdout
});

let inputPhase = 0;
let currentARowIndex = 0;
let currentBInputLineIndex = 0;

let matrixARows, matrixACols, matrixBCols;
let matrixAData = [];
let matrixBTransposedData = [];

process.stdin.setEncoding('ascii');

const parseLineToNumbers = (lineString) => {
    return lineString.split(' ').map(Number);
};

const initializeMatricesAndDimensions = (configLine) => {
    const parsedNumbers = parseLineToNumbers(configLine);
    matrixARows = parsedNumbers[0];
    matrixACols = parsedNumbers[1];
    matrixBCols = parsedNumbers[2];

    for (let r = 0; r < matrixARows; r++) {
        matrixAData.push(new Int16Array(matrixACols));
    }

    for (let r = 0; r < matrixBCols; r++) {
        matrixBTransposedData.push(new Int16Array(matrixACols));
    }
    inputPhase = 1;
};

const fillMatrixARow = (lineContent) => {
    const rowValues = parseLineToNumbers(lineContent);
    for (let col = 0; col < rowValues.length; col++) {
        matrixAData[currentARowIndex][col] = rowValues[col];
    }
    currentARowIndex++;
};

const fillMatrixBColumnFromInputLine = (lineContent) => {
    const inputLineValues = parseLineToNumbers(lineContent);
    for (let row = 0; row < inputLineValues.length; row++) {
        matrixBTransposedData[row][currentBInputLineIndex] = inputLineValues[row];
    }
    currentBInputLineIndex++;
};

ioInterface.on('line', (currentLine) => {
    if (inputPhase === 0) {
        initializeMatricesAndDimensions(currentLine);
    } else if (inputPhase === 1) {
        fillMatrixARow(currentLine);
        if (currentARowIndex === matrixARows) {
            inputPhase = 2;
        }
    } else if (inputPhase === 2) {
        fillMatrixBColumnFromInputLine(currentLine);
        if (currentBInputLineIndex === matrixACols) {
            ioInterface.close();
        }
    }
});

const computeVectorDotProduct = (vectorOne, vectorTwo, vectorLength) => {
    let sumResult = 0;
    for (let k = 0; k < vectorLength; k++) {
        const termProduct = vectorOne[k] * vectorTwo[k];
        sumResult += termProduct;
    }
    return sumResult;
};

ioInterface.on('close', () => {
    for (let aRowIdx = 0; aRowIdx < matrixARows; aRowIdx++) {
        const outputSegments = [];
        for (let bColIdx = 0; bColIdx < matrixBCols; bColIdx++) {
            const cellValue = computeVectorDotProduct(
                matrixAData[aRowIdx],
                matrixBTransposedData[bColIdx],
                matrixACols
            );
            outputSegments.push(cellValue);
        }
        console.log(outputSegments.join(' ').trim());
    }
});
