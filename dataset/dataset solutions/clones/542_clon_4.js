const fileSystem = require('node:fs');
const sourceLocation = '/dev/stdin';

let dataPacket = fileSystem.readFileSync(sourceLocation, 'utf8');

const numberExtractor = /\s*(\d+)\s+(\d+)\s*/;
const extractedValues = dataPacket.match(numberExtractor);

let firstOperand;
let secondOperand;

if (extractedValues && extractedValues.length >= 3) {
    firstOperand = Number.parseInt(extractedValues[1], 10);
    secondOperand = Number.parseInt(extractedValues[2], 10);
} else {
    firstOperand = 1;
    secondOperand = 0;
}

let calculatedRatio = secondOperand / firstOperand;
let finalComputation;

if (calculatedRatio % 1 === 0) {
    finalComputation = calculatedRatio;
} else {
    finalComputation = Math.floor(calculatedRatio) + 1;
}

process.stdout.write(String(finalComputation) + '\n');