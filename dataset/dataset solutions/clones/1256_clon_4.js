(function() {
    'use strict';

    const fs = require('fs');
    const inputData = fs.readFileSync('/dev/stdin', 'utf-8');

    const processNumericSequence = (sourceContent) => {
        const dataLines = sourceContent.trim().split("\n");
        const elementCount = Number.parseInt(dataLines[0].trim());

        const stringNumbers = dataLines[1].trim().split(" ");
        const numericValues = stringNumbers.map(Number.parseInt);

        const calculationResult = numericValues.reduce((accumulator, currentNumber) => {
            accumulator.minVal = Math.min(accumulator.minVal, currentNumber);
            accumulator.maxVal = Math.max(accumulator.maxVal, currentNumber);
            accumulator.totalSum += currentNumber;
            return accumulator;
        }, { minVal: Infinity, maxVal: -Infinity, totalSum: 0 });

        console.log(`${calculationResult.minVal} ${calculationResult.maxVal} ${calculationResult.totalSum}`);
    };

    processNumericSequence(inputData);
})();
