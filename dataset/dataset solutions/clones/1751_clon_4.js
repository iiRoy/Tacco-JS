'use strict';

function ProcessData(rawData) {
    const allTokens = rawData.trim().split(/\s+/).filter(Boolean);
    let tokenPointer = 0;

    const countOfInitialNumbers = Number(allTokens[tokenPointer++]);
    const initialNumberValues = [];
    for (let i = 0; i < countOfInitialNumbers; i++) {
        initialNumberValues.push(Number(allTokens[tokenPointer++]));
    }
    initialNumberValues.sort((a, b) => a - b); // Numeric sort
    const bigIntInitialValues = initialNumberValues.map(BigInt);

    const countOfOperations = Number(allTokens[tokenPointer++]);
    const operationPairs = [];
    for (let i = 0; i < countOfOperations; i++) {
        const oldValueParam = BigInt(allTokens[tokenPointer++]);
        const newValueParam = BigInt(allTokens[tokenPointer++]);
        operationPairs.push([oldValueParam, newValueParam]);
    }

    const valueFrequencies = new Map();
    for (const currentValue of bigIntInitialValues) {
        valueFrequencies.set(currentValue, (valueFrequencies.get(currentValue) || 0n) + 1n);
    }

    let currentAggregateSum = 0n;
    for (const [val, count] of valueFrequencies.entries()) {
        currentAggregateSum += val * count;
    }

    for (const [oldValueParam, newValueParam] of operationPairs) {
        const countOfOldVal = valueFrequencies.get(oldValueParam) || 0n;
        if (countOfOldVal === 0n) {
            console.log(String(currentAggregateSum));
            continue;
        }

        const sumChange = (newValueParam - oldValueParam) * countOfOldVal;
        currentAggregateSum += sumChange;
        console.log(String(currentAggregateSum));

        valueFrequencies.set(newValueParam, (valueFrequencies.get(newValueParam) || 0n) + countOfOldVal);
        valueFrequencies.delete(oldValueParam);
    }

    return;
}
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));
