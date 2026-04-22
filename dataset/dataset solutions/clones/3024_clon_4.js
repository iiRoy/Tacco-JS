"use strict";
function parseNumericData(rawData) {
    const contentLines = rawData.trim().split('\n');
    const numericTokens = contentLines.flatMap(lineSegment => lineSegment.split(' ').map(Number));
    const firstElementCount = numericTokens.shift();
    const subsequentElements = numericTokens.slice(0, firstElementCount);
    return { itemCount: firstElementCount, valuesList: subsequentElements };
}

const MOD_VALUE = 998244353;

function computePower(baseVal, exponentVal) {
    let resultVal = 1;
    baseVal %= MOD_VALUE;
    while (exponentVal > 0) {
        if (exponentVal % 2 === 1) resultVal = (resultVal * baseVal) % MOD_VALUE;
        baseVal = (baseVal * baseVal) % MOD_VALUE;
        exponentVal = Math.floor(exponentVal / 2);
    }
    return resultVal;
}

function resolvePartitionChallenge(sourceInput) {
    const processedData = parseNumericData(sourceInput);
    const totalItems = processedData.itemCount;
    const itemValues = processedData.valuesList;

    const overallSum = itemValues.reduce((accumulator, current) => accumulator + current, 0);

    const totalPossibleArrangements = computePower(3, totalItems);

    const memoizationCacheA = new Map();
    function determineWaysForOneSubset(currentIdx, remainingSum) {
        if (remainingSum < 0) return 0;
        if (currentIdx === totalItems) {
            return remainingSum === 0 ? 1 : 0;
        }

        const stateKey = `${currentIdx}-${remainingSum}`;
        if (memoizationCacheA.has(stateKey)) {
            return memoizationCacheA.get(stateKey);
        }

        let waysCount = 0;
        waysCount = (determineWaysForOneSubset(currentIdx + 1, remainingSum) * 2) % MOD_VALUE;
        waysCount = (waysCount + determineWaysForOneSubset(currentIdx + 1, remainingSum - itemValues[currentIdx])) % MOD_VALUE;

        memoizationCacheA.set(stateKey, waysCount);
        return waysCount;
    }

    let firstResultComponent = 0;
    const minimumSumThreshold = Math.ceil(overallSum / 2);
    for (let s = minimumSumThreshold; s <= overallSum; s++) {
        firstResultComponent = (firstResultComponent + determineWaysForOneSubset(0, s)) % MOD_VALUE;
    }

    let secondResultComponent = 0;
    if (overallSum % 2 === 0) {
        const memoizationCacheB = new Map();
        function determineWaysForExactSubset(currentIdx, remainingSum) {
            if (remainingSum < 0) return 0;
            if (currentIdx === totalItems) {
                return remainingSum === 0 ? 1 : 0;
            }

            const stateKey = `${currentIdx}-${remainingSum}`;
            if (memoizationCacheB.has(stateKey)) {
                return memoizationCacheB.get(stateKey);
            }

            let waysCount = 0;
            waysCount = (waysCount + determineWaysForExactSubset(currentIdx + 1, remainingSum)) % MOD_VALUE;
            waysCount = (waysCount + determineWaysForExactSubset(currentIdx + 1, remainingSum - itemValues[currentIdx])) % MOD_VALUE;

            memoizationCacheB.set(stateKey, waysCount);
            return waysCount;
        }
        secondResultComponent = determineWaysForExactSubset(0, overallSum / 2);
    }

    let finalCalculatedValue = (totalPossibleArrangements - firstResultComponent * 3 + secondResultComponent * 3) % MOD_VALUE;
    finalCalculatedValue = (finalCalculatedValue + MOD_VALUE) % MOD_VALUE;

    console.log(finalCalculatedValue);
}

resolvePartitionChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));