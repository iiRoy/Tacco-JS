const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingType);

const trimmedContent = rawInputContent.trim();
const valueDelimiter = " ";
const stringValueArray = trimmedContent.split(valueDelimiter);

const parseNumericValues = (inputStringArray) => {
    return inputStringArray.map(Number);
};

const numericValueCollection = parseNumericValues(stringValueArray);

const firstOperand = numericValueCollection[0];
const secondOperand = numericValueCollection[1];

const intermediateDivisionResult = secondOperand / firstOperand;
const finalCeilingCalculation = Math.ceil(intermediateDivisionResult);

console.log(finalCeilingCalculation);
