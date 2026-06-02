const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const valueTokens = rawData.split(' ');

const parseNumericValue = (inputString) => {
    return Number(inputString);
};

const divisorConstant = 2;

const firstValueString = valueTokens[0];
const secondValueString = valueTokens[1];

const firstParsedNumber = parseNumericValue(firstValueString);
const secondParsedNumber = parseNumericValue(secondValueString);

const dividedSecondNumber = secondParsedNumber / divisorConstant;

const finalCalculatedSum = firstParsedNumber + dividedSecondNumber;

console.log(finalCalculatedSum);
