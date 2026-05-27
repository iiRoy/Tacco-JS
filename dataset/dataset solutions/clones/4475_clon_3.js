"use strict";

const processInputData = (rawDataString) => {
    const inputLines = rawDataString.trim().split('\n');

    const firstLineTokens = inputLines[0].split(' ');
    const totalItemsCount = Number(firstLineTokens[0]);
    const itemsToSelectCount = Number(firstLineTokens[1]);

    const itemValues = inputLines[1].split(' ').map(Number);

    const sortDescending = (valueA, valueB) => {
        return valueB - valueA;
    };

    itemValues.sort(sortDescending);

    let cumulativeSum = 0;
    const selectionLimit = itemsToSelectCount;
    for (let currentIdx = 0; currentIdx < selectionLimit; currentIdx++) {
        cumulativeSum += itemValues[currentIdx];
    }

    console.log(cumulativeSum);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
