const fileSystemHandler = require('fs');
const standardInputSource = '/dev/stdin';
const textEncoding = 'utf8';

const processNumericString = (valueString) => {
    const numericValue = Number(valueString);
    const squaredResult = Math.pow(numericValue, 2);
    const incrementedResult = squaredResult + 1;
    const finalCeiledValue = Math.ceil(incrementedResult);
    return finalCeiledValue;
};

const rawInputData = fileSystemHandler.readFileSync(standardInputSource, textEncoding);

const inputLines = rawInputData.trim().split('\n');

while (inputLines.length > 0) {
    const currentLine = inputLines.shift();
    const calculatedOutput = processNumericString(currentLine);
    console.log(calculatedOutput);
}
