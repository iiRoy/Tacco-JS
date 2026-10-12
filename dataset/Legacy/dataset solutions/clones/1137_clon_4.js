const inputReader = require('fs');
const rawInputContent = inputReader.readFileSync('/dev/stdin', 'utf8');
const inputLineSegments = rawInputContent.trim().split("\n");

const [initialItemCount, knapsackCapacity] = inputLineSegments.shift().split(" ").map(Number);

const sourceItemDefinitions = Array.from({ length: initialItemCount }, () => {
    const [itemValue, itemWeight] = inputLineSegments.shift().split(" ").map(Number);
    return { itemValue, itemWeight };
});

const generatedItemVariants = sourceItemDefinitions.flatMap(definition => {
    const variants = [];
    for (let currentMultiplier = 1; definition.itemWeight * currentMultiplier <= knapsackCapacity; currentMultiplier++) {
        variants.push({
            variantValue: definition.itemValue * currentMultiplier,
            variantWeight: definition.itemWeight * currentMultiplier
        });
    }
    return variants;
});

const consolidatedItemRegistry = generatedItemVariants.reduce((accumulatorMap, currentVariant) => {
    accumulatorMap.set(currentVariant.variantWeight, Math.max(accumulatorMap.get(currentVariant.variantWeight) || 0, currentVariant.variantValue));
    return accumulatorMap;
}, new Map());

const finalItemSet = Array.from(consolidatedItemRegistry.entries())
    .map(([weightKey, valueEntry]) => ({ itemValue: valueEntry, itemWeight: weightKey }));

function calculateMaximumKnapsackValue(capacityLimit, availableItemsForSelection) {
    const dpValues = Array(capacityLimit + 1).fill(0);

    for (const currentConsideredItem of availableItemsForSelection) {
        for (let currentCapacityIndex = capacityLimit; currentCapacityIndex >= currentConsideredItem.itemWeight; currentCapacityIndex--) {
            dpValues[currentCapacityIndex] = Math.max(
                dpValues[currentCapacityIndex],
                currentConsideredItem.itemValue + dpValues[currentCapacityIndex - currentConsideredItem.itemWeight]
            );
        }
    }
    return dpValues[capacityLimit];
}

const overallMaximumValue = calculateMaximumKnapsackValue(knapsackCapacity, finalItemSet);
console.log(overallMaximumValue);
