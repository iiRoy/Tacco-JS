const processInputData = (rawText) => {
    const lines = rawText.split('\n');
    const firstLineValues = lines[0].split(' ').map(Number);
    const secondLineValues = lines[1].split(' ').map(Number);
    return {
        keyLimit: firstLineValues[1],
        numberList: secondLineValues,
    };
};

const obtainMaximum = (numericList) => {
    if (numericList.length === 0) return -Infinity;
    let currentMax = numericList[0];
    for (let i = 1; i < numericList.length; i++) {
        if (numericList[i] > currentMax) {
            currentMax = numericList[i];
        }
    }
    return currentMax;
};

const computeTotalSum = (numericList) => {
    let total = 0;
    for (const num of numericList) {
        total += num;
    }
    return total;
};

const checkBalancePossibility = (adjustmentPairs, expenditureCap) => {
    let balanceState = new Map();
    balanceState.set(0, 0);

    for (const [leftAdj, rightAdj] of adjustmentPairs) {
        const nextBalanceState = new Map(balanceState);
        
        for (const [currentDiff, currentLeftSum] of balanceState.entries()) {
            const currentRightSum = currentLeftSum - currentDiff;

            const nextLeftSumA = currentLeftSum + leftAdj;
            const nextRightSumA = currentRightSum;
            const nextDiffA = nextLeftSumA - nextRightSumA;

            if (nextLeftSumA <= expenditureCap && nextRightSumA <= expenditureCap) {
                nextBalanceState.set(nextDiffA, Math.min(nextBalanceState.get(nextDiffA) || Infinity, nextLeftSumA));
            }

            const nextLeftSumB = currentLeftSum;
            const nextRightSumB = currentRightSum + rightAdj;
            const nextDiffB = nextLeftSumB - nextRightSumB;

            if (nextLeftSumB <= expenditureCap && nextRightSumB <= expenditureCap) {
                nextBalanceState.set(nextDiffB, Math.min(nextBalanceState.get(nextDiffB) || Infinity, nextLeftSumB));
            }
        }
        balanceState = nextBalanceState;
    }

    return balanceState.has(0);
};

const validateDivisor = (candidateDivisor, numberList, keyLimit) => {
    const requiredAdjustments = [];
    let initialBudgetCheck = 2 * keyLimit;

    for (const num of numberList) {
        const remainder = num % candidateDivisor;
        if (remainder === 0) {
            continue;
        }

        const adjustment1 = remainder;
        const adjustment2 = candidateDivisor - remainder;

        if (keyLimit < Math.min(adjustment1, adjustment2)) {
            return false;
        }

        initialBudgetCheck -= Math.min(adjustment1, adjustment2);
        if (initialBudgetCheck < 0) {
            return false;
        }

        requiredAdjustments.push([adjustment1, adjustment2]);
    }

    return checkBalancePossibility(requiredAdjustments, keyLimit);
};

const performComputation = (inputString) => {
    const { keyLimit, numberList } = processInputData(inputString);

    const maxValInList = obtainMaximum(numberList);
    const totalListSum = computeTotalSum(numberList);

    const searchCeiling = Math.min(maxValInList + keyLimit, totalListSum);

    for (let currentDivisor = searchCeiling; currentDivisor > 1; currentDivisor--) {
        if (validateDivisor(currentDivisor, numberList, keyLimit)) {
            return currentDivisor;
        }
    }

    return 1;
};

const result = performComputation(require('fs').readFileSync('/dev/stdin', 'utf8'));
console.log(result);