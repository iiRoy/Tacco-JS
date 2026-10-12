function calculateCubicThird(inputValue) {
    const dividedByThree = inputValue / 3;
    const cubedResult = Math.pow(dividedByThree, 3);
    return cubedResult;
}

function processInputData(rawInputString) {
    const parsedNumericValue = parseFloat(rawInputString);
    const finalComputedValue = calculateCubicThird(parsedNumericValue);
    console.log(finalComputedValue);
}

const fileSystemUtility = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileContentBuffer = fileSystemUtility.readFileSync(standardInputFilePath, 'utf8');

processInputData(fileContentBuffer);
