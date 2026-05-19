const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let configPhase = 0;
let matrixARowIdx = 0;
let matrixBRowIdx = 0; // Renamed from stepb to reflect its use as row index for B in input processing
let numRowsA, numColsA, numRowsB; // Renamed from n, m, l. Note: l is numRowsB for matrix B.
const matrixA = [];
const matrixB = [];

process.stdin.setEncoding('ascii');

inputReader.on('line', (currentLine) => {
    if (configPhase === 0) {
        processConfigLine(currentLine);
    } else if (matrixARowIdx < numRowsA) {
        populateMatrixA(currentLine);
    } else if (matrixBRowIdx < numRowsB) { // Original was stepb < l, which is matrixBRowIdx < numRowsB
        populateMatrixB(currentLine);
    } else {
        inputReader.close();
    }
});

function processConfigLine(inputLine) {
    const parsedValues = inputLine.split(' ').map(Number);
    numRowsA = parsedValues[0]; // n
    numColsA = parsedValues[1]; // m
    numRowsB = parsedValues[2]; // l

    const aInitCount = numRowsA;
    const bInitCount = numRowsB;

    for (let i = 0; i < aInitCount; i++) {
        matrixA.push(new Int16Array(numColsA)); // m columns for A
    }
    for (let i = 0; i < bInitCount; i++) {
        matrixB.push(new Int16Array(numColsA)); // m columns for B
    }
    configPhase++;
}

function populateMatrixA(inputLine) {
    const rowValues = inputLine.split(' ').map(Number);
    const currentRow = matrixA[matrixARowIdx];
    for (let elementIndex = 0; elementIndex < rowValues.length; elementIndex++) {
        currentRow[elementIndex] = rowValues[elementIndex];
    }
    matrixARowIdx++;
}

function populateMatrixB(inputLine) {
    const rowValues = inputLine.split(' ').map(Number); // Renamed from colValues, as it's a row of B
    const currentRow = matrixB[matrixBRowIdx]; // Helper variable for current row of B
    for (let elementIndex = 0; elementIndex < rowValues.length; elementIndex++) {
        currentRow[elementIndex] = rowValues[elementIndex];
    }
    matrixBRowIdx++; // Renamed stepb++
}

inputReader.on('close', () => {
    for (let i = 0; i < numRowsA; i++) {
        const currentMatrixARow = matrixA[i];
        const outputLineParts = [];

        for (let j = 0; j < numRowsB; j++) { // Iterate through rows of matrixB (l rows)
            const currentMatrixBRow = matrixB[j]; // Get current row of B
            outputLineParts.push(calculateDotProduct(currentMatrixARow, currentMatrixBRow));
        }
        console.log(outputLineParts.join(' '));
    }
});

function calculateDotProduct(vecA, vecB) {
    let resultSum = 0;
    const vectorLength = numColsA; // Original used m
    for (let i = vectorLength - 1; i >= 0; i--) {
        resultSum += vecA[i] * vecB[i];
    }
    return resultSum;
}
