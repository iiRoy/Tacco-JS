const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineFragments = dataSource.trim().split('\n');

const initialParams = lineFragments.shift().split(' ').map(Number);
const numItemCategories = initialParams[0];
const maxCapacity = initialParams[1];

const merchandiseList = [];
let itemCounter = 0;

for (let categoryIndex = 0; categoryIndex < numItemCategories; categoryIndex++) {
    const categoryData = lineFragments.shift().split(' ').map(Number);
    const baseWorth = categoryData[0];
    const baseWeight = categoryData[1];

    let currentMultiplier = 1;
    while (baseWeight * currentMultiplier <= maxCapacity) {
        merchandiseList.push({ worth: baseWorth * currentMultiplier, weight: baseWeight * currentMultiplier });
        itemCounter++;
        currentMultiplier++;
    }
}

const lookupTable = new Map();

function obtainGreatestValue(currentItemIndex, currentAvailableCapacity) {
    const cacheKey = `${currentItemIndex}-${currentAvailableCapacity}`;
    if (lookupTable.has(cacheKey)) {
        return lookupTable.get(cacheKey);
    }

    if (currentItemIndex >= itemCounter || currentAvailableCapacity <= 0) {
        return 0;
    }

    const currentMerchandise = merchandiseList[currentItemIndex];
    
    // Option 1: Exclude the current item
    const valueExcluding = obtainGreatestValue(currentItemIndex + 1, currentAvailableCapacity);

    // Option 2: Include the current item (if possible)
    let valueIncluding = 0;
    if (currentMerchandise.weight <= currentAvailableCapacity) {
        valueIncluding = currentMerchandise.worth + obtainGreatestValue(currentItemIndex + 1, currentAvailableCapacity - currentMerchandise.weight);
    }

    const bestValue = Math.max(valueExcluding, valueIncluding);
    lookupTable.set(cacheKey, bestValue);
    return bestValue;
}

const finalResult = obtainGreatestValue(0, maxCapacity);
console.log(finalResult);