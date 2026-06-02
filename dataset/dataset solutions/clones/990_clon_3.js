const appSettings = {
    sourcePath: '/dev/stdin',
    lineDelimiter: '\n'
};

const fileSystem = require('fs');

function calculateGCD(valA, valB) {
    if (valB === 0) {
        return valA;
    }
    const remainder = valA % valB;
    return calculateGCD(valB, remainder);
}

const parseStringNumbersToInts = (stringArray) => {
    return stringArray.map(currentStr => parseInt(currentStr));
};

const fileContentBuffer = fileSystem.readFileSync(appSettings.sourcePath, 'utf-8');
const processedLines = fileContentBuffer.split(appSettings.lineDelimiter);

const firstDataLine = processedLines[0];
const stringNumbers = firstDataLine.split(' ');

const numericValues = parseStringNumbersToInts(stringNumbers);

const numberOne = numericValues[0];
const numberTwo = numericValues[1];

const finalResult = calculateGCD(numberOne, numberTwo);

console.log(finalResult);
