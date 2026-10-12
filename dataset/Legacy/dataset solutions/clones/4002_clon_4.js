'use strict';

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const numericPattern = /^(-?\d+)/;
const matchedValue = sourceData.match(numericPattern);

const parsedNumber = Number(matchedValue[1]);

const intermediateQuotient = parsedNumber / 3;
let computedResult;

if (parsedNumber >= 0) {
    computedResult = intermediateQuotient | 0;
} else {
    computedResult = (parsedNumber % 3 === 0) ? intermediateQuotient : (intermediateQuotient | 0) - 1;
}

console.log(computedResult);
