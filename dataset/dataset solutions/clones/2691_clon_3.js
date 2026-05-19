function processInput(rawData) {
    const parseInputData = (inputString) => {
        const lines = inputString.split("\n");
        const firstLineValues = lines[0].split(" ").map(val => parseInt(val, 10));
        const secondLineValues = lines[1].split(" ").map(val => parseInt(val, 10));
        return {
            kValue: firstLineValues[1],
            numberSequence: secondLineValues
        };
    };

    const parsedData = parseInputData(rawData);
    const limitK = parsedData.kValue;
    const numSequence = parsedData.numberSequence;

    const findMax = (arr) => {
        let currentMax = -Infinity;
        for (const element of arr) {
            if (element > currentMax) {
                currentMax = element;
            }
        }
        return currentMax;
    };

    const calculateSum = (arr) => {
        let totalSum = 0;
        for (const element of arr) {
            totalSum += element;
        }
        return totalSum;
    };

    const maximumElement = findMax(numSequence);
    const totalSequenceSum = calculateSum(numSequence);

    const maxPossibleG = Math.min(maximumElement + limitK, totalSequenceSum);

    for (let currentG = maxPossibleG; currentG > 1; currentG--) {
        if (checkDivisibilityCondition(currentG, numSequence, limitK)) {
            return console.log(currentG);
        }
    }
    return console.log(1);
}

function checkDivisibilityCondition(divisorCandidate, inputNumbers, limitK) {
    const computeRemainderPairs = (g, numbers, k) => {
        const remainderPairs = [];
        let cumulativeMinCostBudget = 2 * k;

        for (let idx = 0; idx < numbers.length; idx++) {
            const currentNumber = numbers[idx];
            const remainderOne = currentNumber % g;
            if (remainderOne === 0) {
                continue;
            }
            const remainderTwo = g - remainderOne;

            const minRemainderCost = Math.min(remainderOne, remainderTwo);
            if (k < minRemainderCost) {
                return null;
            }
            cumulativeMinCostBudget -= minRemainderCost;
            if (cumulativeMinCostBudget < 0) {
                return null;
            }
            remainderPairs.push([remainderOne, remainderTwo]);
        }
        return remainderPairs;
    };

    const processedPairs = computeRemainderPairs(divisorCandidate, inputNumbers, limitK);
    if (processedPairs === null) {
        return false;
    }

    const explorePaths = (pairsToProcess, currentLevel, currentLeftSum, currentRightSum, maxBudget) => {
        if (currentLeftSum > maxBudget) return false;
        if (currentRightSum > maxBudget) return false;
        if (currentLevel === pairsToProcess.length) return currentLeftSum === currentRightSum;

        const currentPair = pairsToProcess[currentLevel];

        const tryLeftBranch = () => explorePaths(pairsToProcess, currentLevel + 1, currentLeftSum + currentPair[0], currentRightSum, maxBudget);
        const tryRightBranch = () => explorePaths(pairsToProcess, currentLevel + 1, currentLeftSum, currentRightSum + currentPair[1], maxBudget);

        if (currentLeftSum < currentRightSum) {
            return tryLeftBranch() || tryRightBranch();
        } else if (currentLeftSum > currentRightSum) {
            return tryRightBranch() || tryLeftBranch();
        } else if (currentPair[0] > currentPair[1]) {
            return tryRightBranch() || tryLeftBranch();
        } else if (currentPair[0] < currentPair[1]) {
            return tryLeftBranch() || tryRightBranch();
        }
        return false;
    };

    return explorePaths(processedPairs, 0, 0, 0, limitK);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
