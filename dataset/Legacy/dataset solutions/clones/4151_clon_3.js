const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.split('\n');

const firstInputLine = inputLines.shift();
const lineSegments = firstInputLine.split(' ');

const firstStringValue = lineSegments[0];
const firstNumericValue = Number(firstStringValue);

const secondStringValue = lineSegments[1];
const secondNumericValue = Number(secondStringValue);

const sumOfValues = firstNumericValue + secondNumericValue;
const rawAverage = sumOfValues / 2;
const ceilingAverage = Math.ceil(rawAverage);

console.log(ceilingAverage);
