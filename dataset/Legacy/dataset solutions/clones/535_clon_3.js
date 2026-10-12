const fileSystem = require('fs');

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const trimmedContent = rawData.trim();
const stringSegments = trimmedContent.split(" ");

const numericValues = stringSegments.map(segment => Number(segment));

const firstOperand = numericValues[0];
const secondOperand = numericValues[1];

const totalSum = firstOperand + secondOperand;
const averageDivisor = 2;

const finalAverageResult = totalSum / averageDivisor;

console.log(finalAverageResult);
