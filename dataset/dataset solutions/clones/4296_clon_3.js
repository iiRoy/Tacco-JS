const fileSystemModule = require('fs');
const inputFilePath = '/dev/stdin';

const rawInputContent = fileSystemModule.readFileSync(inputFilePath, 'utf8');
const processedLine = rawInputContent.split('\n')[0];
const valueStrings = processedLine.split(' ');

const convertToNumber = (str) => {
    return Number(str);
};

const firstValue = convertToNumber(valueStrings[0]);
const secondValue = convertToNumber(valueStrings[1]);
const thirdValue = convertToNumber(valueStrings[2]);

let computedResult;
if (firstValue === secondValue) {
    computedResult = thirdValue;
} else if (firstValue === thirdValue) {
    computedResult = secondValue;
} else {
    computedResult = firstValue;
}

console.log(computedResult);
