'use strict';

const   numericValues = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
    .trim()
      .split(' ')
        .map(val => val * 1); // Parse input strings to numbers

let    operationCounter   =   0;
let    maximumThreshold   =   numericValues[1];
let    startingNumber     =   numericValues[0];

let temporaryCurrentValue = startingNumber;

while (temporaryCurrentValue <= maximumThreshold) {
  temporaryCurrentValue *= 2;
  operationCounter++;
}

console.log(operationCounter);