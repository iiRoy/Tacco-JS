function calculateMaxKnapsackValue() {
    const dpTable = Array.from({ length: finalItemCount + 1 }, () => Array(knapsackCapacity + 1).fill(0));

    for (let itemIndex = 1; itemIndex <= finalItemCount; itemIndex++) {
        const currentItem = processedItems[itemIndex];
        const itemWeight = currentItem.weight;
        const itemValue = currentItem.value;

        for (let currentCapacity = 1; currentCapacity <= knapsackCapacity; currentCapacity++) {
            let valueIfSkipped = dpTable[itemIndex - 1][currentCapacity];
            let valueIfTaken = 0;

            // This condition checks if the item's weight is within the overall knapsack capacity.
            // This is a direct preservation of the original code's logic (items[i].w <= W).
            if (itemWeight <= knapsackCapacity) {
                // If the item can fit in the current subproblem capacity (j)
                if (itemWeight <= currentCapacity) {
                    valueIfTaken = itemValue + dpTable[itemIndex - 1][currentCapacity - itemWeight];
                    dpTable[itemIndex][currentCapacity] = Math.max(valueIfTaken, valueIfSkipped);
                } else {
                    // Item cannot fit in current subproblem capacity, so only option is to skip it.
                    dpTable[itemIndex][currentCapacity] = valueIfSkipped;
                }
            } else {
                // Item cannot fit in the overall knapsack, so only option is to skip it.
                dpTable[itemIndex][currentCapacity] = valueIfSkipped;
            }
        }
    }
    return dpTable[finalItemCount][knapsackCapacity];
}

const rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputString.trim().split("\n");

const parseNumbers = (str) => str.split(" ").map(Number);

const capacityAndItemCount = parseNumbers(inputLines.shift());
const initialItemCount = capacityAndItemCount[0];
let knapsackCapacity = capacityAndItemCount[1];

const consolidatedItemsMap = {};

for (let i = 0; i < initialItemCount; i++) {
    const currentItemDetails = parseNumbers(inputLines.shift());
    const baseValue = currentItemDetails[0];
    const baseWeight = currentItemDetails[1];

    let itemMultiplier = 1;
    while (baseWeight * itemMultiplier <= knapsackCapacity) {
        const currentCombinedWeight = baseWeight * itemMultiplier;
        const currentCombinedValue = baseValue * itemMultiplier;

        // If an item with this combined weight already exists in the map,
        // and its stored value is greater than the current combined value,
        // then we skip updating and try the next multiplier.
        if (consolidatedItemsMap.hasOwnProperty(currentCombinedWeight)) {
            if (consolidatedItemsMap[currentCombinedWeight] > currentCombinedValue) {
                itemMultiplier++;
                continue;
            }
        }
        // Otherwise, store or update with the current combined value.
        consolidatedItemsMap[currentCombinedWeight] = currentCombinedValue;
        itemMultiplier++;
    }
}

const processedItems = [null];
Object.entries(consolidatedItemsMap).forEach(([weightKey, value]) => {
    processedItems.push({ value: value, weight: parseInt(weightKey, 10) });
});

const finalItemCount = processedItems.length - 1;
const resultantMaxValue = calculateMaxKnapsackValue();

console.log(resultantMaxValue);
