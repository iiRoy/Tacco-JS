const processInput = (rawInputString) => {
    const inputParts = rawInputString.split(' ');
    const numericValues = inputParts.map(part => Number(part));

    const firstOperand = numericValues[0];
    const secondOperand = numericValues[1];
    const comparisonThreshold = numericValues[2];

    let calculatedRatioValue;
    const defaultZeroValue = 0;

    if (firstOperand > secondOperand) {
        calculatedRatioValue = defaultZeroValue;
    } else {
        calculatedRatioValue = secondOperand / firstOperand;
    }

    let finalOutputDetermination;
    const integerPartFromRatio = Math.trunc(calculatedRatioValue);

    if (calculatedRatioValue >= comparisonThreshold) {
        finalOutputDetermination = comparisonThreshold;
    } else {
        finalOutputDetermination = integerPartFromRatio;
    }

    console.log(finalOutputDetermination);
};

const fileSystemHandler = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileEncoding = 'utf8';

const contentFromStdin = fileSystemHandler.readFileSync(standardInputFilePath, fileEncoding);
processInput(contentFromStdin);
