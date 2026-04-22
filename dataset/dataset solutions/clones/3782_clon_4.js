'use strict'

function ProcessInputAndCalculate(rawData) {
    const numericComponents = rawData.split(" ").map(Number);

    const totalAvailableSlots = numericComponents[0];
    const initialUnitCostA = numericComponents[1];
    const initialUnitCostB = numericComponents[2];
    const overallTargetValue = numericComponents[3];

    const compositeUnitCost = initialUnitCostA + initialUnitCostB;
    const dominantUnitCost = Math.max(initialUnitCostA, initialUnitCostB);
    const elementalUnitCost = Math.min(initialUnitCostA, initialUnitCostB);

    let totalArrangementCount = 0n;

    const memoizedFactorials = new Map();
    function computeFactorial(val) {
        if (val < 0n) return 0n;
        if (val === 0n) return 1n;
        if (memoizedFactorials.has(val)) return memoizedFactorials.get(val);

        let currentProduct = 1n;
        for (let idx = 1n; idx <= val; idx++) {
            currentProduct *= idx;
        }
        memoizedFactorials.set(val, currentProduct);
        return currentProduct;
    }

    function determineDistributionWays(totalItems, numType1, numType2, numType3) {
        const sumOfSelectedItems = numType1 + numType2 + numType3;
        if (sumOfSelectedItems > totalItems) return 0n;

        const primaryGroupSize = Math.max(numType1, numType2, numType3);
        const secondaryGroupSize = sumOfSelectedItems - primaryGroupSize;
        const tertiaryGroupSize = totalItems - sumOfSelectedItems;

        if (primaryGroupSize < 0 || secondaryGroupSize < 0 || tertiaryGroupSize < 0) return 0n;

        const numerator = computeFactorial(BigInt(totalItems));
        const denominator = computeFactorial(BigInt(primaryGroupSize)) *
                            computeFactorial(BigInt(secondaryGroupSize)) *
                            computeFactorial(BigInt(tertiaryGroupSize));
        return numerator / denominator;
    }

    const maxCountComposite = Math.floor(overallTargetValue / compositeUnitCost);

    for (let firstTypeCount = 0; firstTypeCount <= maxCountComposite; firstTypeCount++) {
        const remainingValueAfterFirst = overallTargetValue - (firstTypeCount * compositeUnitCost);
        if (remainingValueAfterFirst < 0) continue;

        const maxCountDominant = Math.floor(remainingValueAfterFirst / dominantUnitCost);

        for (let secondTypeCount = 0; secondTypeCount <= maxCountDominant; secondTypeCount++) {
            const remainingValueAfterBoth = remainingValueAfterFirst - (secondTypeCount * dominantUnitCost);
            
            // The original logic implies that the 'restgb' variable, which is `remainingValueAfterBoth`,
            // is treated as a count. This is only valid if `elementalUnitCost` is 1.
            // If `elementalUnitCost` is not 1, and `remainingValueAfterBoth` is not divisible by it,
            // then a valid integer count for the third type of item isn't possible for this combination.
            if (elementalUnitCost === 0 || remainingValueAfterBoth % elementalUnitCost !== 0) {
                if (remainingValueAfterBoth !== 0) continue; // If remainingValueAfterBoth is 0, then thirdTypeCount is 0, which is valid.
            }

            const thirdTypeCount = remainingValueAfterBoth / elementalUnitCost;

            if (firstTypeCount + secondTypeCount + thirdTypeCount <= totalAvailableSlots) {
                totalArrangementCount += determineDistributionWays(totalAvailableSlots, firstTypeCount, secondTypeCount, thirdTypeCount);
            }
        }
    }

    return String(totalArrangementCount);
}

function InvokeProcessor() {
    const dataStream = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    console.log(ProcessInputAndCalculate(dataStream));
}

InvokeProcessor();