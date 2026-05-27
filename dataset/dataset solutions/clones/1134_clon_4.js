let totalItemsCount;
let maxCapacityWeight;
let itemData = [null];

function computeMaxVal() {
    const memoizationCache = new Map();

    const solveKnapsack = (itemIdx, currentCapacity) => {
        if (itemIdx === 0 || currentCapacity === 0) {
            return 0;
        }

        const cacheKey = `${itemIdx},${currentCapacity}`;
        if (memoizationCache.has(cacheKey)) {
            return memoizationCache.get(cacheKey);
        }

        const currentItem = itemData[itemIdx];

        const valueExcludingCurrent = solveKnapsack(itemIdx - 1, currentCapacity);

        let valueIncludingCurrent = 0;
        if (currentItem.weightVal <= currentCapacity) {
            valueIncludingCurrent = currentItem.profitVal + solveKnapsack(itemIdx - 1, currentCapacity - currentItem.weightVal);
        }

        const result = Math.max(valueExcludingCurrent, valueIncludingCurrent);
        memoizationCache.set(cacheKey, result);
        return result;
    };

    return solveKnapsack(totalItemsCount, maxCapacityWeight);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split('\n');

const [numItems, capacity] = lines.shift().split(' ').map(Number);
totalItemsCount = numItems;
maxCapacityWeight = capacity;

itemData = [null];
lines.forEach((line, idx) => {
    const [val, wt] = line.split(' ').map(Number);
    itemData[idx + 1] = { profitVal: val, weightVal: wt };
});

const finalResult = computeMaxVal();
console.log(finalResult);
