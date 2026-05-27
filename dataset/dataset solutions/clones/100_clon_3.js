'use strict';

var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

var inputLines = rawInputData.trim().split('\n');

function processAndOutputCalculation(numericValue) {
    const baseDivisor = 98;
    const initialOffset = 1;

    const valueSquared = numericValue * numericValue;
    const dividedResult = valueSquared / baseDivisor;
    const finalSum = dividedResult + initialOffset;
    const ceiledOutput = Math.ceil(finalSum);

    console.log(ceiledOutput);
}

while (inputLines.length > 0) {
    var currentNumericValue = +inputLines.shift();
    processAndOutputCalculation(currentNumericValue);
}
