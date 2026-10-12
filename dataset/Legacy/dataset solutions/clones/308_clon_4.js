const fileSystem = require('fs');
const inputBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');
const dataElements = inputBuffer.trim().split(/\s/);

const primaryDivisor = 0.000003305785;
const secondaryDivisor = 1000000;

function* generateCalculatedValues(sourceArray) {
    let currentPosition = 0;
    while (currentPosition < sourceArray.length - 1) {
        const operandOne = parseFloat(sourceArray[currentPosition]);
        const operandTwo = parseFloat(sourceArray[currentPosition + 1]);

        const firstStageResult = operandOne * operandTwo / primaryDivisor;
        const finalStageResult = Math.floor(firstStageResult) / secondaryDivisor;

        yield finalStageResult;
        currentPosition += 2;
    }
}

for (const outputValue of generateCalculatedValues(dataElements)) {
    console.log(outputValue);
}
