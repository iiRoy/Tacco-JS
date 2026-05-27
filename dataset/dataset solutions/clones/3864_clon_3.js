"use strict";

const calculateCombinations = (count) => {
    if (count < 2) {
        return 0;
    }
    return (count * (count - 1)) / 2;
};

const processInput = (rawInputString) => {
    const inputLines = rawInputString.trim().split("\n");

    const countElements = parseInt(inputLines[0].trim(), 10);
    const inputNumbers = inputLines[1].trim().split(" ").map(Number);

    const prefixSums = new Array(countElements + 1).fill(0);

    for (let index = 0; index < countElements; index++) {
        const currentNumber = inputNumbers[index];
        prefixSums[index + 1] = prefixSums[index] + currentNumber;
    }

    const sumFrequencyMap = {};
    for (const sumValue of prefixSums) {
        sumFrequencyMap[sumValue] = (sumFrequencyMap[sumValue] || 0) + 1;
    }

    let totalPairsCount = 0;

    for (const sumKey in sumFrequencyMap) {
        if (Object.prototype.hasOwnProperty.call(sumFrequencyMap, sumKey)) {
            const frequency = sumFrequencyMap[sumKey];
            totalPairsCount += calculateCombinations(frequency);
        }
    }

    console.log(totalPairsCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
