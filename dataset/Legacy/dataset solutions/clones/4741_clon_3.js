const fileSystem = require('fs');
const inputFilePath = '/dev/stdin';
const primaryDivisor = 11;
const remainderThreshold = 6;

let rawInputContent = fileSystem.readFileSync(inputFilePath, 'utf8');
let parsedInputLines = rawInputContent.split('\n');

let numericInputVal = parseInt(parsedInputLines.shift(), 10);

let baseCalculation = Math.floor(numericInputVal / primaryDivisor);
let finalAnswer = baseCalculation * 2;

let currentModulo = numericInputVal % primaryDivisor;

let conditionalAdjustment = 0;

if (currentModulo > 0) {
    if (currentModulo <= remainderThreshold) {
        conditionalAdjustment = 1;
    } else {
        conditionalAdjustment = 2;
    }
}

finalAnswer += conditionalAdjustment;

console.log(finalAnswer);
