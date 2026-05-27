const formatStringPad = (inputString, targetWidth) => {
    const padding = ' '.repeat(targetWidth);
    return (padding + inputString).slice(-targetWidth);
};

const formatNumericPad = (inputNumber, targetWidth) => {
    return formatStringPad(String(inputNumber), targetWidth);
};

const formatArrayElementsPad = (inputArray, targetWidth) => {
    return inputArray.map(element => formatNumericPad(element, targetWidth));
};

const calculateArraySum = (numericArray) => {
    return numericArray.reduce((accumulator, currentValue) => Number(currentValue) + accumulator, 0);
};

const fileSystem = require("node:fs");
let inputDataLines = fileSystem.readFileSync("/dev/stdin", "utf8").trim().split('\n');
let currentLineIndex = 0;

while (inputDataLines[currentLineIndex] !== '0') {
    const rowCount = Number(inputDataLines[currentLineIndex++]);
    const originalDataRows = [];
    const processedOutputRows = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const currentInputRowValues = inputDataLines[currentLineIndex++].split(' ');
        originalDataRows.push(currentInputRowValues);
        const currentRowSum = calculateArraySum(currentInputRowValues);
        processedOutputRows.push([...currentInputRowValues, currentRowSum]);
    }

    for (const rowToDisplay of processedOutputRows) {
        console.log(formatArrayElementsPad(rowToDisplay, 5).join(''));
    }

    const finalColumnAggregates = [];
    const numberOfOriginalColumns = originalDataRows[0].length;

    for (let colIdx = 0; colIdx < numberOfOriginalColumns; colIdx++) {
        const currentColumnTotal = calculateArraySum(originalDataRows.map(row => row[colIdx]));
        finalColumnAggregates.push(currentColumnTotal);
    }
    
    finalColumnAggregates.push(0);

    console.log(formatArrayElementsPad(finalColumnAggregates, 5).join(''));
}
