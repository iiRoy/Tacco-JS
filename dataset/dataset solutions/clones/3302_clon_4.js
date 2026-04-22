"use strict";

const processInput = (sourceText) => {
    const lines = sourceText.trim().split('\n');
    const firstLineNumbers = lines[0].split(' ').map(Number);
    const countItems = firstLineNumbers[0];
    const capacityLimit = firstLineNumbers[1];

    const itemData = lines.slice(1, countItems + 1).map(line => line.split(' ').map(Number));
    
    return { countItems, capacityLimit, itemData };
};

const processor = (rawData) => {
    const { countItems, capacityLimit, itemData } = processInput(rawData);

    const memoizationTable = Array(countItems + 1).fill(null).map(() => Array(capacityLimit + 1).fill(null));

    const calculateMaxBenefit = (idx, currentCapacity) => {
        if (currentCapacity <= 0) {
            return 0;
        }
        if (idx >= countItems) {
            return 0;
        }

        if (memoizationTable[idx][currentCapacity] !== null) {
            return memoizationTable[idx][currentCapacity];
        }

        const currentWeight = itemData[idx][0];
        const currentValue = itemData[idx][1];

        // Option 1: Exclude the current item
        const valueWithoutCurrent = calculateMaxBenefit(idx + 1, currentCapacity);

        // Option 2: Include the current item (if possible)
        let valueWithCurrent = 0;
        if (currentWeight <= currentCapacity) {
            valueWithCurrent = currentValue + calculateMaxBenefit(idx + 1, currentCapacity - currentWeight);
        }

        const result = Math.max(valueWithoutCurrent, valueWithCurrent);
        memoizationTable[idx][currentCapacity] = result;
        return result;
    };

    const finalOutcome = calculateMaxBenefit(0, capacityLimit);

    console.log(finalOutcome);
};

processor(require('fs').readFileSync('/dev/stdin', 'utf8'));