'use strict';
const processInputData = (sourceText) => {
    const numberSequence = sourceText.trim().split(/\s+/).map(element => Number(element));
    const overallQuantity = numberSequence[0];
    const categoryTallies = new Map();
    categoryTallies.set(1, 0);
    categoryTallies.set(2, 0);
    categoryTallies.set(3, 0);
    for (let index = 1; index < numberSequence.length; ++index) {
        const itemCategory = numberSequence[index];
        if (itemCategory >= 1 && itemCategory <= 3) {
            categoryTallies.set(itemCategory, categoryTallies.get(itemCategory) + 1);
        }
    }
    return { overallQuantity: overallQuantity, categoryTallies: categoryTallies };
};

const memoizationStorage = new Map();

const calculateExpectedOperations = (firstCategory, secondCategory, thirdCategory, overallQuantity) => {
    if (firstCategory < 0 || secondCategory < 0 || thirdCategory < 0) {
        return 0;
    }
    if (firstCategory === 0 && secondCategory === 0 && thirdCategory === 0) {
        return 0;
    }

    const stateKey = `${firstCategory},${secondCategory},${thirdCategory}`;
    if (memoizationStorage.has(stateKey)) {
        return memoizationStorage.get(stateKey);
    }

    const currentTotalActive = firstCategory + secondCategory + thirdCategory;
    if (currentTotalActive === 0) {
        return 0;
    }

    let expectedOutcome = overallQuantity / currentTotalActive;

    if (firstCategory > 0) {
        expectedOutcome += (firstCategory / currentTotalActive) * calculateExpectedOperations(firstCategory - 1, secondCategory, thirdCategory, overallQuantity);
    }

    if (secondCategory > 0) {
        expectedOutcome += (secondCategory / currentTotalActive) * calculateExpectedOperations(firstCategory + 1, secondCategory - 1, thirdCategory, overallQuantity);
    }

    if (thirdCategory > 0) {
        expectedOutcome += (thirdCategory / currentTotalActive) * calculateExpectedOperations(firstCategory, secondCategory + 1, thirdCategory - 1, overallQuantity);
    }

    memoizationStorage.set(stateKey, expectedOutcome);
    return expectedOutcome;
};

((rawInputContent) => {
    const { overallQuantity: totalCountOfAll, categoryTallies: initialCategoryCounts } = processInputData(rawInputContent);

    const finalValue = calculateExpectedOperations(
        initialCategoryCounts.get(1),
        initialCategoryCounts.get(2),
        initialCategoryCounts.get(3),
        totalCountOfAll
    );

    console.log(finalValue);
})(require('node:fs').readFileSync('/dev/stdin', 'utf8'));