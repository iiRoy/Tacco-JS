'use strict';

const parseNumericString = (strValue, radixBase) => {
    return parseInt(strValue, radixBase);
};

const executeCalculation = (rawInputData) => {
    const DECIMAL_RADIX = 10;
    
    const inputLines = rawInputData.split('\n');
    const primaryInputLine = inputLines[0];

    const stringTokens = primaryInputLine.split(' ');

    const firstNumericVal = parseNumericString(stringTokens[0], DECIMAL_RADIX);
    const secondNumericVal = parseNumericString(stringTokens[1], DECIMAL_RADIX);
    const thirdNumericVal = parseNumericString(stringTokens[2], DECIMAL_RADIX);

    const doubledThird = thirdNumericVal * 2;
    const comparisonSum = secondNumericVal + doubledThird; // Equivalent to y + z * 2

    if (comparisonSum < firstNumericVal) {
        const numeratorDifference = firstNumericVal - comparisonSum; // Equivalent to x - (y + z * 2)
        const denominatorSum = secondNumericVal + thirdNumericVal; // Equivalent to y + z

        const intermediateDivision = numeratorDifference / denominatorSum;
        const finalComputedValue = Math.floor(intermediateDivision + 1);
        
        console.log(finalComputedValue);
    } else {
        console.log(0);
    }
};

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

const inputContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);
executeCalculation(inputContent);
