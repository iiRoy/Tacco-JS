const extractParameters = (sourceText) => {
    const numericParts = sourceText.trim().split(" ").map(Number);
    return {
        overallCapacity: numericParts[0],
        itemValueX: numericParts[1],
        itemValueY: numericParts[2],
        targetTotal: numericParts[3]
    };
};

const memoizationStore = new Map();
const calculateProductSeries = (limit) => {
    if (limit < 0) return 0;
    if (limit === 0 || limit === 1) return 1;
    if (memoizationStore.has(limit)) return memoizationStore.get(limit);
    const outcome = limit * calculateProductSeries(limit - 1);
    memoizationStore.set(limit, outcome);
    return outcome;
};

const deriveCombinations = (upperBound, lowerBound) => {
    if (lowerBound < 0 || lowerBound > upperBound) return 0;
    if (lowerBound === 0 || lowerBound === upperBound) return 1;
    if (upperBound - lowerBound < lowerBound) lowerBound = upperBound - lowerBound;
    return calculateProductSeries(upperBound) / (calculateProductSeries(lowerBound) * calculateProductSeries(upperBound - lowerBound));
};

function* enumerateItemCounts(goalValue, comboVal, highVal) {
    const maxComboCount = Math.floor(goalValue / comboVal);
    for (let currentComboCount = 0; currentComboCount <= maxComboCount; currentComboCount++) {
        const remainingForHighLow = goalValue - (currentComboCount * comboVal);
        if (remainingForHighLow < 0) continue;

        const maxHighCount = Math.floor(remainingForHighLow / highVal);
        for (let currentHighCount = 0; currentHighCount <= maxHighCount; currentHighCount++) {
            const remainingForLow = remainingForHighLow - (currentHighCount * highVal);
            const currentLowCount = remainingForLow;

            if (currentLowCount >= 0) {
                yield { comboCnt: currentComboCount, highCnt: currentHighCount, lowCnt: currentLowCount };
            }
        }
    }
}

const performCalculation = (sourceData) => {
    const params = extractParameters(sourceData);
    const capacity = params.overallCapacity;
    const valueA = params.itemValueX;
    const valueB = params.itemValueY;
    const target = params.targetTotal;

    const mergedValue = valueA + valueB;
    const higherValue = Math.max(valueA, valueB);

    let finalTotal = 0;

    for (const counts of enumerateItemCounts(target, mergedValue, higherValue)) {
        const { comboCnt, highCnt, lowCnt } = counts;

        const currentCombinedItems = comboCnt + highCnt + lowCnt;

        if (currentCombinedItems <= capacity) {
            const largestIndividualCount = Math.max(comboCnt, highCnt, lowCnt);
            finalTotal += deriveCombinations(capacity, currentCombinedItems) * deriveCombinations(currentCombinedItems, largestIndividualCount);
        }
    }

    console.log(finalTotal);
};

performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));