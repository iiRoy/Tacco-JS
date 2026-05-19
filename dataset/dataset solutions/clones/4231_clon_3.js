'use strict';

const obtainComparisonSymbol = (valA, valB) => {
    let resultSymbol;
    if (valA === valB) {
        resultSymbol = '=';
    } else if (valA > valB) {
        resultSymbol = '>';
    } else {
        resultSymbol = '<';
    }
    return resultSymbol;
};

const processInputAndCompare = (rawContent) => {
    const inputLines = rawContent.split('\n');
    const firstRelevantLine = inputLines[0];

    const stringOperands = firstRelevantLine.split(' ');
    const firstOperand = stringOperands[0];
    const secondOperand = stringOperands[1];

    const comparisonOutcome = obtainComparisonSymbol(firstOperand, secondOperand);
    console.log(comparisonOutcome);
};

const fileSystemUtility = require('fs');
const standardInputSource = '/dev/stdin';
const encodingFormat = 'utf-8';

const fileData = fileSystemUtility.readFileSync(standardInputSource, encodingFormat);

processInputAndCompare(fileData);
