"use strict";

const processInput = (rawData) => {
    const trimmedInput = rawData.trim();
    const inputLines = trimmedInput.split('\n');

    const numberOfElementsStr = inputLines[0];
    const elementCount = parseInt(numberOfElementsStr, 10);

    const numbersLine = inputLines[1];
    const numbersArray = numbersLine.split(' ').map(val => parseInt(val, 10));

    let totalSum = 0;
    for (let currentElementIndex = 0; currentElementIndex < elementCount; currentElementIndex++) {
        totalSum += numbersArray[currentElementIndex];
    }

    const targetHalfSum = totalSum / 2;

    let firstPartitionSum = 0;
    let secondPartitionSum = 0;

    let hasFirstPartitionReachedThreshold = false;

    for (let currentIterationIndex = 0; currentIterationIndex < elementCount; currentIterationIndex++) {
        const currentNumberValue = numbersArray[currentIterationIndex];

        if (!hasFirstPartitionReachedThreshold) {
            firstPartitionSum += currentNumberValue;
            if (firstPartitionSum >= targetHalfSum) {
                hasFirstPartitionReachedThreshold = true;
            }
        } else {
            if (firstPartitionSum > targetHalfSum) {
                secondPartitionSum += currentNumberValue;
            }
        }
    }

    console.log(firstPartitionSum - secondPartitionSum);
};

const readInputFromFile = (filePath) => {
    return require('fs').readFileSync(filePath, 'utf8');
};

processInput(readInputFromFile('/dev/stdin'));
