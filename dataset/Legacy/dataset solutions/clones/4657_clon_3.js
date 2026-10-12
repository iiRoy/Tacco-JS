const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

const calculateWrappedSum = (valueOne, valueTwo, wrapLimit) => {
    const totalSum = valueOne + valueTwo;
    if (totalSum > wrapLimit) {
        return totalSum - wrapLimit;
    } else {
        return totalSum;
    }
};

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
const firstLineContent = rawInputContent.split('\n')[0];
const numericStringParts = firstLineContent.split(' ');

const operandA = Number(numericStringParts.shift());
const operandB = Number(numericStringParts.shift());

const wrapAroundThreshold = 24;

const finalOutputValue = calculateWrappedSum(operandA, operandB, wrapAroundThreshold);

console.log(finalOutputValue);
