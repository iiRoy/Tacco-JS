let totalItemsCount;
let knapsackCapacity;
let availableItems;

function initializeKnapsackData(rawInputString) {
    const trimmedInput = rawInputString.trim();
    const inputLinesArray = trimmedInput.split("\n");

    const configLine = inputLinesArray.shift();
    const configValues = configLine.split(" ").map(val => parseInt(val, 10));

    totalItemsCount = configValues[0];
    knapsackCapacity = configValues[1];

    availableItems = [null];
    for (let currentItemIdx = 1; currentItemIdx <= totalItemsCount; currentItemIdx++) {
        const itemLine = inputLinesArray.shift();
        const parsedItemDetails = itemLine.split(" ").map(val => parseInt(val, 10));
        availableItems[currentItemIdx] = { itemValue: parsedItemDetails[0], itemWeight: parsedItemDetails[1] };
    }
}

function computeKnapsackOptimalValue() {
    let memoizationTable = [];

    for (let currentItemIdx = 0; currentItemIdx <= totalItemsCount; currentItemIdx++) {
        memoizationTable[currentItemIdx] = new Array(knapsackCapacity + 1).fill(0);
    }

    for (let currentItemIdx = 0; currentItemIdx <= totalItemsCount; currentItemIdx++) {
        memoizationTable[currentItemIdx][0] = 0;
    }

    for (let currentItemIdx = 1; currentItemIdx <= totalItemsCount; currentItemIdx++) {
        const currentItem = availableItems[currentItemIdx];
        const itemWeight = currentItem.itemWeight;
        const itemValue = currentItem.itemValue;

        for (let currentWeightLimit = 1; currentWeightLimit <= knapsackCapacity; currentWeightLimit++) {
            if (itemWeight <= knapsackCapacity) {
                const valueIfSkipped = memoizationTable[currentItemIdx - 1][currentWeightLimit];

                let valueIfTakenFromPreviousRow = -Infinity;
                if (currentWeightLimit >= itemWeight) {
                    valueIfTakenFromPreviousRow = itemValue + memoizationTable[currentItemIdx - 1][currentWeightLimit - itemWeight];
                }

                let valueIfTakenFromCurrentRow = -Infinity;
                if (currentWeightLimit >= itemWeight) {
                    valueIfTakenFromCurrentRow = itemValue + memoizationTable[currentItemIdx][currentWeightLimit - itemWeight];
                }

                memoizationTable[currentItemIdx][currentWeightLimit] = Math.max(
                    valueIfSkipped,
                    valueIfTakenFromPreviousRow,
                    valueIfTakenFromCurrentRow
                );
            } else {
                memoizationTable[currentItemIdx][currentWeightLimit] = memoizationTable[currentItemIdx - 1][currentWeightLimit];
            }
        }
    }
    return memoizationTable[totalItemsCount][knapsackCapacity];
}

const fileSystem = require('fs');
const rawInputString = fileSystem.readFileSync('/dev/stdin', 'utf8');

initializeKnapsackData(rawInputString);

const resultantMaxValue = computeKnapsackOptimalValue();
console.log(resultantMaxValue);
