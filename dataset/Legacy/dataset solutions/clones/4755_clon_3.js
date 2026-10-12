const INPUT_FILE_PATH = '/dev/stdin';

function retrieveAndConvertNumericValue(sourceArray) {
    const stringRepresentation = sourceArray.shift();
    return Number(stringRepresentation);
}

const fileData = require('fs').readFileSync(INPUT_FILE_PATH, 'utf8');
const initialLine = fileData.split('\n')[0];
const parsedStringElements = initialLine.split(' ');

const firstOperand = retrieveAndConvertNumericValue(parsedStringElements);
const secondOperand = retrieveAndConvertNumericValue(parsedStringElements);
const thirdOperand = retrieveAndConvertNumericValue(parsedStringElements);
const fourthOperand = retrieveAndConvertNumericValue(parsedStringElements);

const productOne = firstOperand * secondOperand;
const productTwo = secondOperand * thirdOperand;
const productThree = thirdOperand * fourthOperand;

let computedOutcome;
if (productOne > productTwo) {
    computedOutcome = productOne;
} else {
    computedOutcome = productThree;
}

console.log(computedOutcome);
