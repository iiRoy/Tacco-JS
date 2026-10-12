const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);
const processedInput = rawInputContent.trim();
const numericStringValues = processedInput.split(/\s/);

let dataReadPointer = 0;

const calculationDivisor = 0.000003305785;
const finalScalingFactor = 1000000;

const firstValue = parseFloat(numericStringValues[dataReadPointer++]);
const secondValue = parseFloat(numericStringValues[dataReadPointer++]);

const productOfOperands = firstValue * secondValue;
const intermediateDivisionResult = productOfOperands / calculationDivisor;
const floorAppliedResult = Math.floor(intermediateDivisionResult);
const finalOutputValue = floorAppliedResult / finalScalingFactor;

console.log(finalOutputValue);
