let totalItemsCount;
let maxWeightCapacity;
let availableItems;

function processRawInput(rawInputString) {
    const processedLines = rawInputString.trim().split("\n");

    const weightAndItemTypeCounts = processedLines.shift().split(" ").map(Number);
    const initialItemTypeCount = weightAndItemTypeCounts[0];
    const capacityLimit = weightAndItemTypeCounts[1];

    maxWeightCapacity = capacityLimit;
    availableItems = [null];
    totalItemsCount = 0;

    for (let typeIndex = 1; typeIndex <= initialItemTypeCount; typeIndex++) {
        const currentRawItemData = processedLines.shift().split(" ").map(Number);
        let currentMultiplier = 1;
        while (currentRawItemData[1] * currentMultiplier <= capacityLimit) {
            availableItems.push({
                v: currentRawItemData[0] * currentMultiplier,
                w: currentRawItemData[1] * currentMultiplier
            });
            totalItemsCount++;
            currentMultiplier++;
        }
    }
}

function calculateMaxKnapsackValue() {
    const valueMatrix = Array.from({ length: totalItemsCount + 1 }, () => Array(maxWeightCapacity + 1).fill(0));

    for (let currentItemIndex = 1; currentItemIndex <= totalItemsCount; currentItemIndex++) {
        for (let currentCapacity = 1; currentCapacity <= maxWeightCapacity; currentCapacity++) {
            const currentItemWeight = availableItems[currentItemIndex].w;
            const currentItemValue = availableItems[currentItemIndex].v;

            if (currentItemWeight <= maxWeightCapacity) {
                if (currentCapacity >= currentItemWeight &&
                    (currentItemValue + valueMatrix[currentItemIndex - 1][currentCapacity - currentItemWeight] > valueMatrix[currentItemIndex - 1][currentCapacity])) {
                    valueMatrix[currentItemIndex][currentCapacity] = currentItemValue + valueMatrix[currentItemIndex - 1][currentCapacity - currentItemWeight];
                } else {
                    valueMatrix[currentItemIndex][currentCapacity] = valueMatrix[currentItemIndex - 1][currentCapacity];
                }
            } else {
                valueMatrix[currentItemIndex][currentCapacity] = valueMatrix[currentItemIndex - 1][currentCapacity];
            }
        }
    }
    return valueMatrix[totalItemsCount][maxWeightCapacity];
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

processRawInput(rawData);

const finalMaxValue = calculateMaxKnapsackValue();

console.log(finalMaxValue);
