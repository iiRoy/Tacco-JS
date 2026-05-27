"use strict";

const performCalculation = (sourceData) => {
    const [configLine, valuesLine] = sourceData.trim().split('\n');
    const [totalCount, selectionLimit] = configLine.split(' ').map(Number);
    const numericValues = valuesLine.split(' ').map(Number);

    const sortedNumbers = numericValues.sort((valA, valB) => valA - valB);

    const finalSum = sortedNumbers.slice(0, selectionLimit).reduce((acc, current) => acc + current, 0);

    return finalSum;
};

const entryPoint = (inputPayload) => {
    const result = performCalculation(inputPayload);
    console.log(result);
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
