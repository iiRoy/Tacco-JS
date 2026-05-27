'use strict';

const fileSystem = require('fs');

const rawDataBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedData = rawDataBuffer.trim().split(' ');
const numericInputs = processedData.map(strValue => Number(strValue));

let currentIterationCount = 0;
const maximumAllowedValue = numericInputs[1];
const initialBaseNumber = numericInputs[0];

const doublingMultiplier = 2;

let dynamicProduct = initialBaseNumber;

while (dynamicProduct <= maximumAllowedValue) {
  currentIterationCount++;
  dynamicProduct = dynamicProduct * doublingMultiplier;
}

console.log(currentIterationCount);
