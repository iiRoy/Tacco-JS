'use strict';

const fileSystemModule = require('fs');

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedInputString = rawInputContent.trim();
const stringTokens = processedInputString.split(' ');

const numericValues = stringTokens.map(token => Number(token));

let multiplicationCount = 0;
const initialBase = numericValues[0];
const upperLimit = numericValues[1];

const GROWTH_FACTOR = 2;

let currentProduct = initialBase;

while (currentProduct <= upperLimit) {
    currentProduct *= GROWTH_FACTOR;
    multiplicationCount++;
}

console.log(multiplicationCount);
