"use strict";

const inputString = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const inputLines = inputString.split('\n');
const dataSize = parseInt(inputLines[0]);
const initialValues = inputLines[1].split(' ').map(Number);

const processedElementStates = new Map(initialValues.map((val, idx) => [idx, val]));

Array.from({ length: dataSize }, (_, k) => dataSize - k).forEach(currentOneBasedIndex => {
    const xorSumOfMultiples = Array.from(
        { length: Math.floor(dataSize / currentOneBasedIndex) - 1 },
        (_, k) => (k + 2) * currentOneBasedIndex
    ).reduce((accumulator, multipleOneBasedIndex) => {
        return accumulator ^ processedElementStates.get(multipleOneBasedIndex - 1);
    }, 0);

    const currentZeroBasedIndex = currentOneBasedIndex - 1;
    processedElementStates.set(
        currentZeroBasedIndex,
        processedElementStates.get(currentZeroBasedIndex) ^ xorSumOfMultiples
    );
});

const finalValuesArray = Array.from(processedElementStates.values());

const onesCollection = finalValuesArray.filter(val => val === 1);

console.log(onesCollection.length);

if (onesCollection.length > 0) {
    console.log(onesCollection.join(' '));
}
