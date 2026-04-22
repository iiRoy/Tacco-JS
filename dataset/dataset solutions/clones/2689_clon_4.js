const executeProgram = (rawData) => {
    const processedSegments = rawData.split('\n').map(segment => segment.split(' ').map(Number));

    const budgetAmount = processedSegments[0][1];
    const valueCollection = processedSegments[1];

    const peakValue = locateMaximum(valueCollection);
 
    const upperBound = Math.min(peakValue + budgetAmount, peakValue + determineBalanceIndexMetric(valueCollection));
    
    let currentDivisorCandidate = upperBound;
    while (currentDivisorCandidate > 1) {
        if (testDivisibilityProperty(currentDivisorCandidate, valueCollection, budgetAmount)) {
            return process.stdout.write(currentDivisorCandidate.toString() + '\n');
        }
        currentDivisorCandidate--;
    }
    return process.stdout.write('1\n');
};

const determineBalanceIndexMetric = (inputValues) => {
    const sortedValues = [...inputValues].sort((a, b) => a - b);
    let cumulativeLeftIndexSum = 0;
    let cumulativeRightValueSum = 0;
    let rightPointer = sortedValues.length - 1;
    
    cumulativeRightValueSum = sortedValues[rightPointer];

    let leftPointer = 0;
    while (leftPointer < rightPointer) {
        cumulativeLeftIndexSum += leftPointer;
        if (cumulativeLeftIndexSum > cumulativeRightValueSum) {
            rightPointer--;
            while (cumulativeRightValueSum < cumulativeLeftIndexSum && rightPointer > leftPointer) {
                cumulativeRightValueSum += sortedValues[rightPointer];
                rightPointer--;
            }
        }
        leftPointer++;
    }
    return Math.min(cumulativeLeftIndexSum, cumulativeRightValueSum);
};

const locateMaximum = (sourceArray) => {
    return Math.max(...sourceArray);
};

const testDivisibilityProperty = (candidateDivisor, sourceCollection, maxAllowedSum) => {
    const remainderPairs = [];
    let minimumTotalCostCheck = 2 * maxAllowedSum;

    for (const individualValue of sourceCollection) {
        const currentModulus = individualValue % candidateDivisor;
        if (currentModulus === 0) continue;

        const costToDecrease = currentModulus;
        const costToIncrease = candidateDivisor - currentModulus;
        const minimumElementCost = Math.min(costToDecrease, costToIncrease);

        if (maxAllowedSum < minimumElementCost) return false;
        
        minimumTotalCostCheck -= minimumElementCost;
        if (minimumTotalCostCheck < 0) return false;

        remainderPairs.push([costToDecrease, costToIncrease]);
    }

    return findBalancedPartition(remainderPairs, maxAllowedSum);
};

const findBalancedPartition = (costOptions, maxAllowedSum) => {
    let achievableSums = new Map([[0, 0]]); 

    for (const [decreaseOption, increaseOption] of costOptions) {
        const nextAchievableSums = new Map();

        for (const [currentLeftSum, currentRightSum] of achievableSums.entries()) {
            const newLeftSum1 = currentLeftSum + decreaseOption;
            const newRightSum1 = currentRightSum;

            if (newLeftSum1 <= maxAllowedSum && newRightSum1 <= maxAllowedSum) {
                if (!nextAchievableSums.has(newLeftSum1) || newRightSum1 < nextAchievableSums.get(newLeftSum1)) {
                    nextAchievableSums.set(newLeftSum1, newRightSum1);
                }
            }

            const newLeftSum2 = currentLeftSum;
            const newRightSum2 = currentRightSum + increaseOption;

            if (newLeftSum2 <= maxAllowedSum && newRightSum2 <= maxAllowedSum) {
                if (!nextAchievableSums.has(newLeftSum2) || newRightSum2 < nextAchievableSums.get(newLeftSum2)) {
                    nextAchievableSums.set(newLeftSum2, newRightSum2);
                }
            }
        }
        achievableSums = nextAchievableSums;
    }

    for (const [finalLeftSum, finalRightSum] of achievableSums.entries()) {
        if (finalLeftSum === finalRightSum) {
            return true;
        }
    }

    return false;
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));