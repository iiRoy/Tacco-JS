const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = sourceData.trim().split("\n");

const dimensions = dataLines.shift().split(" ").map(Number);
const itemTypeCount = dimensions[0];
const capacityLimit = dimensions[1];

const consolidatedEntities = new Map();

dataLines.forEach(line => {
    const itemDetails = line.split(" ").map(Number);
    const baseValue = itemDetails[0];
    const baseWeight = itemDetails[1];

    let scaleFactor = 1;
    while (baseWeight * scaleFactor <= capacityLimit) {
        const currentWeight = baseWeight * scaleFactor;
        const currentValue = baseValue * scaleFactor;

        if (!consolidatedEntities.has(currentWeight) || consolidatedEntities.get(currentWeight) < currentValue) {
            consolidatedEntities.set(currentWeight, currentValue);
        }
        scaleFactor++;
    }
});

const eligibleItems = [null, ...Array.from(consolidatedEntities.entries())
    .map(([weight, value]) => ({ size: weight, worth: value }))
    .sort((a, b) => a.size - b.size)];

const totalItemEntities = eligibleItems.length - 1;

const valuationCache = Array(totalItemEntities + 1).fill(null).map(() => Array(capacityLimit + 1).fill(undefined));

function calculateMaxWorth(entityIndex, currentVolume) {
    if (entityIndex === 0 || currentVolume === 0) {
        return 0;
    }

    if (valuationCache[entityIndex][currentVolume] !== undefined) {
        return valuationCache[entityIndex][currentVolume];
    }

    const currentEntity = eligibleItems[entityIndex];

    let valueIfSkipped = calculateMaxWorth(entityIndex - 1, currentVolume);
    let valueIfTaken = 0;

    if (currentEntity.size > currentVolume) {
        valuationCache[entityIndex][currentVolume] = valueIfSkipped;
        return valueIfSkipped;
    }

    valueIfTaken = currentEntity.worth + calculateMaxWorth(entityIndex - 1, currentVolume - currentEntity.size);

    const maxVal = Math.max(valueIfSkipped, valueIfTaken);
    valuationCache[entityIndex][currentVolume] = maxVal;
    return maxVal;
}

const result = calculateMaxWorth(totalItemEntities, capacityLimit);

console.log(result);