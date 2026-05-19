'use strict';

const fileSystemModule = require('fs');

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedInputContent = rawInputContent.trim();
const stringValueArray = processedInputContent.split(' ');

const numericInputValues = stringValueArray.map(strItem => Number(strItem));

let finalIterationCount = 0;
const initialDivisorValue = numericInputValues[0];
const maximumThreshold = numericInputValues[1];

let currentProductValue = initialDivisorValue;
const multiplicationFactor = 2;

while (currentProductValue <= maximumThreshold) {
  currentProductValue *= multiplicationFactor;
  finalIterationCount++;
}

console.log(finalIterationCount);
