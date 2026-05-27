const fileSystem = require('fs');

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const parsedSegments = rawInputContent.trim().split(' ');

const firstOperand = Number(parsedSegments[0]);
const secondOperand = Number(parsedSegments[1]);

const differenceValue = secondOperand - firstOperand;

const computeSummation = (limit) => (limit * (limit + 1)) / 2;

const cumulativeSum = computeSummation(differenceValue);

const ultimateOutcome = cumulativeSum - secondOperand;

console.log(ultimateOutcome);
