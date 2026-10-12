const fileSystemModule = require('fs');

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf-8');
const inputDataLines = rawInputContent.split('\n');

const targetNumberString = inputDataLines[0];
const targetNumber = Number(targetNumberString);

const intermediateHalfValue = targetNumber * 0.5;
const roundedIntermediateValue = Math.round(intermediateHalfValue);
const finalCalculatedResult = roundedIntermediateValue / targetNumber;

console.log(finalCalculatedResult);
