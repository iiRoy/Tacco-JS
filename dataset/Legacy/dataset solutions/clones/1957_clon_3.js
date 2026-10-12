const fileSystemModule = require('fs');

const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, encodingType);

const parsedNumericValue = parseInt(rawInputContent);

const TWO_PI_CONSTANT = Math.PI * 2;

const calculatedCircumference = parsedNumericValue * TWO_PI_CONSTANT;

console.log(calculatedCircumference);
