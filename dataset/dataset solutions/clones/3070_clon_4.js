"use strict";

const processInputData = (rawInputData) => {
    const parsedLines = rawInputData.trim().split('\n');

    const [
        firstNumericValue,
        secondNumericValue,
        thirdNumericValue,
        fourthNumericValue,
        fifthNumericValue,
        sixthNumericValue
    ] = parsedLines.map(Number);

    const capacityCollection = [
        secondNumericValue,
        thirdNumericValue,
        fourthNumericValue,
        fifthNumericValue,
        sixthNumericValue
    ];

    const smallestElement = capacityCollection.reduce((currentMinimum, element) => {
        return (element < currentMinimum) ? element : currentMinimum;
    }, Infinity);

    const divisionResult = firstNumericValue / smallestElement;
    const sumWithOffset = divisionResult + 4;
    const finalCalculatedValue = Math.ceil(sumWithOffset);

    console.log(finalCalculatedValue);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
