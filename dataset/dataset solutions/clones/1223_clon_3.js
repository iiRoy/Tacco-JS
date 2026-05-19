const fileSystemModule = require('fs');

const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';
const inputDelimiter = ' ';

const rawInputData = fileSystemModule.readFileSync(standardInputPath, encodingFormat);

const stringTokens = rawInputData.split(inputDelimiter);

const numericValues = [];
for (let i = 0; i < stringTokens.length; i++) {
    const currentToken = stringTokens[i];
    const parsedNumber = parseInt(currentToken, 10);
    numericValues.push(parsedNumber);
}

const orderedValues = numericValues.sort();

const finalOutputString = orderedValues.join(inputDelimiter);

console.log(finalOutputString);
