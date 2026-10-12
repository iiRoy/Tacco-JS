const parseInputData = (rawData) => {
    const lines = rawData.split("\n");
    const firstLineValues = lines[0].split(" ").map(Number);
    const secondLineValues = lines[1].split(" ").map(Number);
    return {
        limitParam: firstLineValues[1],
        numberSequence: secondLineValues
    };
};

const retrieveMaxElement = (collection) => {
    return Math.max(...collection);
};

const computeSumOfElements = (numericArray) => {
    let totalAccumulator = 0;
    for (const item of numericArray) {
        totalAccumulator += item;
    }
    return totalAccumulator;
};

const deriveBalanceValue = (sourceCollection) => {
    const orderedCopy = [...sourceCollection].sort((a, b) => a - b);
    let rightSideSum = orderedCopy[orderedCopy.length - 1];
    let leftSideSum = 0;
    let rightIndex = orderedCopy.length - 1;

    for (let leftIndex = 0; leftIndex < rightIndex; leftIndex++) {
        leftSideSum = leftIndex * (leftIndex + 1) / 2; // Sum of indices from 0 to leftIndex

        if (leftSideSum > rightSideSum) {
            while (rightSideSum < leftSideSum && rightIndex > leftIndex) {
                rightIndex--;
                rightSideSum += orderedCopy[rightIndex];
            }
        }
    }
    return Math.min(leftSideSum, rightSideSum);
};

const performPartitionSearch = (valuePairs, budgetConstraint) => {
    const searchStack = [{ currentIdx: 0, currentLeftSum: 0, currentRightSum: 0 }];

    while (searchStack.length > 0) {
        const { currentIdx, currentLeftSum, currentRightSum } = searchStack.pop();

        if (currentLeftSum > budgetConstraint || currentRightSum > budgetConstraint) {
            continue;
        }

        if (currentIdx === valuePairs.length) {
            if (currentLeftSum === currentRightSum) {
                return true;
            }
            continue;
        }

        const [firstVal, secondVal] = valuePairs[currentIdx];

        // Replicate original's path exploration order heuristic for stack (LIFO)
        if (currentLeftSum < currentRightSum) {
            // Original tries left path first, then right.
            // Push right path first, then left path.
            searchStack.push({ currentIdx: currentIdx + 1, currentLeftSum: currentLeftSum, currentRightSum: currentRightSum + secondVal });
            searchStack.push({ currentIdx: currentIdx + 1, currentLeftSum: currentLeftSum + firstVal, currentRightSum: currentRightSum });
        } else {
            // Original tries right path first, then left.
            // Push left path first, then right path.
            searchStack.push({ currentIdx: currentIdx + 1, currentLeftSum: currentLeftSum + firstVal, currentRightSum: currentRightSum });
            searchStack.push({ currentIdx: currentIdx + 1, currentLeftSum: currentLeftSum, currentRightSum: currentRightSum + secondVal });
        }
    }
    return false;
};

const validateDivisorProperty = (candidateDivisor, inputNumbers, budgetLimit) => {
    let processedPairs = [];
    let remainingCostAllowance = 2 * budgetLimit;

    const reductionResult = inputNumbers.reduce((accumulator, numberValue) => {
        if (accumulator === false) return false;

        const remainderA = numberValue % candidateDivisor;
        if (remainderA === 0) {
            return accumulator;
        }
        const remainderB = candidateDivisor - remainderA;

        const smallestRemainder = Math.min(remainderA, remainderB);

        if (budgetLimit < smallestRemainder) {
            return false;
        }

        remainingCostAllowance -= smallestRemainder;
        if (remainingCostAllowance < 0) {
            return false;
        }
        accumulator.push([remainderA, remainderB]);
        return accumulator;
    }, []);

    if (reductionResult === false) {
        return false;
    }

    return performPartitionSearch(reductionResult, budgetLimit);
};

const executeMainLogic = (fileContent) => {
    const { limitParam, numberSequence } = parseInputData(fileContent);

    const highestValue = retrieveMaxElement(numberSequence);
    const calculatedBalance = deriveBalanceValue(numberSequence);

    const upperSearchBoundary = Math.min(highestValue + limitParam, highestValue + calculatedBalance);

    const recursiveDivisorSearch = (currentTestValue) => {
        if (currentTestValue < 2) {
            return 1;
        }
        if (validateDivisorProperty(currentTestValue, numberSequence, limitParam)) {
            return currentTestValue;
        }
        return recursiveDivisorSearch(currentTestValue - 1);
    };

    const finalResult = recursiveDivisorSearch(upperSearchBoundary);

    console.log(finalResult);
};

executeMainLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
