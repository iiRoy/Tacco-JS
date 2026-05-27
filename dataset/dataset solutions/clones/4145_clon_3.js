'use strict';

const fileSystemModule = require('fs');

function processRawInputToNumbers(rawContentString) {
    const trimmedString = rawContentString.trim();
    const stringParts = trimmedString.split(' ');
    const convertedNumbers = stringParts.map(part => Number(part));
    return convertedNumbers;
}

const rawFileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const numericInputValues = processRawInputToNumbers(rawFileContent);

let iterationCount = 0;
const limitValue = numericInputValues[1];
const startValue = numericInputValues[0];

const MULTIPLY_FACTOR = 2;

let currentProduct = startValue;

while (currentProduct < limitValue) {
  currentProduct = currentProduct * MULTIPLY_FACTOR;
  iterationCount = iterationCount + 1;
}

console.log(iterationCount);
