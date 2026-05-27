function calculateMaxKnapsackValue(numberOfItems, knapsackCapacity, itemCollection) {
    const dpTable = Array.from({ length: numberOfItems + 1 }, () => Array(knapsackCapacity + 1).fill(0));

    for (let itemIndex = 1; itemIndex <= numberOfItems; itemIndex++) {
        const currentItem = itemCollection[itemIndex];
        const itemWeight = currentItem.weight;
        const itemValue = currentItem.value;

        for (let currentCapacity = 1; currentCapacity <= knapsackCapacity; currentCapacity++) {
            const valueFromPreviousItem = dpTable[itemIndex - 1][currentCapacity];

            if (itemWeight > currentCapacity) {
                dpTable[itemIndex][currentCapacity] = valueFromPreviousItem;
            } else {
                const maxCopiesToConsider = Math.floor(currentCapacity / itemWeight);
                const weightOfConsideredCopies = maxCopiesToConsider * itemWeight;
                const valueOfConsideredCopies = maxCopiesToConsider * itemValue;

                const valueIfTakingCopies = valueOfConsideredCopies + dpTable[itemIndex - 1][currentCapacity - weightOfConsideredCopies];

                if (valueIfTakingCopies > valueFromPreviousItem) {
                    dpTable[itemIndex][currentCapacity] = valueIfTakingCopies;
                } else {
                    dpTable[itemIndex][currentCapacity] = valueFromPreviousItem;
                }
            }
        }
    }
    return dpTable[numberOfItems][knapsackCapacity];
}

const fileSystemModule = require('fs');

const parseSpaceSeparatedNumbers = (lineString) => lineString.split(" ").map(Number);

const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const allInputLines = rawInputData.trim().split("\n");

const [numberOfItems, knapsackCapacity] = parseSpaceSeparatedNumbers(allInputLines.shift());

const itemCollection = [null];

for (let currentItemIndex = 1; currentItemIndex <= numberOfItems; currentItemIndex++) {
    const itemValueWeightPair = parseSpaceSeparatedNumbers(allInputLines.shift());
    itemCollection[currentItemIndex] = { value: itemValueWeightPair[0], weight: itemValueWeightPair[1] };
}

const finalResultValue = calculateMaxKnapsackValue(numberOfItems, knapsackCapacity, itemCollection);

console.log(finalResultValue);
