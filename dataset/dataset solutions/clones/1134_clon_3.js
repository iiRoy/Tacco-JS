function calculateMaxKnapsackValue(numItems, maxWeight, itemCollection) {
    const ZERO_INITIAL_VALUE = 0;
    const dpTable = Array.from({ length: numItems + 1 }, () => Array(maxWeight + 1).fill(ZERO_INITIAL_VALUE));

    for (let itemIdx = 1; itemIdx <= numItems; itemIdx++) {
        const currentItemDetails = itemCollection[itemIdx];
        const currentItemWeight = currentItemDetails.w;
        const currentItemValue = currentItemDetails.v;

        for (let currentCapacity = 1; currentCapacity <= maxWeight; currentCapacity++) {
            const valueFromPreviousRow = dpTable[itemIdx - 1][currentCapacity];

            if (currentItemWeight <= maxWeight) {
                if (currentItemWeight <= currentCapacity) {
                    const remainingCapacityAfterTaking = currentCapacity - currentItemWeight;
                    const valueIfCurrentTaken = currentItemValue + dpTable[itemIdx - 1][remainingCapacityAfterTaking];
                    dpTable[itemIdx][currentCapacity] = Math.max(valueIfCurrentTaken, valueFromPreviousRow);
                } else {
                    dpTable[itemIdx][currentCapacity] = valueFromPreviousRow;
                }
            } else {
                dpTable[itemIdx][currentCapacity] = valueFromPreviousRow;
            }
        }
    }
    return dpTable[numItems][maxWeight];
}

const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const inputLinesArray = rawInputContent.trim().split("\n");
const configParameters = inputLinesArray.shift().split(" ").map(Number);

const numberOfItems = configParameters[0];
const maximumWeightCapacity = configParameters[1];

const itemDataList = [null]; // Using null at index 0 to maintain 1-based indexing for items

for (let k = 1; k <= numberOfItems; k++) {
    const itemDetails = inputLinesArray.shift().split(" ").map(Number);
    itemDataList[k] = { v: itemDetails[0], w: itemDetails[1] };
}

const finalCalculatedValue = calculateMaxKnapsackValue(numberOfItems, maximumWeightCapacity, itemDataList);
console.log(finalCalculatedValue);
