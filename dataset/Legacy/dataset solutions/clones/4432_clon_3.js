const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const firstLineOfInput = rawInputContent.split('\n')[0];
let inputLineParts = firstLineOfInput.split(' ');

const extractAndParseNumber = (sourceArray) => {
    const stringRepresentation = sourceArray.shift();
    return Number(stringRepresentation);
};

const firstValue = extractAndParseNumber(inputLineParts);
const secondValue = extractAndParseNumber(inputLineParts);

const decrementedFirst = firstValue - 1;
const decrementedSecond = secondValue - 1;

const finalProduct = decrementedFirst * decrementedSecond;

console.log(finalProduct);
