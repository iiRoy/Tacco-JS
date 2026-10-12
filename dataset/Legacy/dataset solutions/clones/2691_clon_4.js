function findMaximum(collection) {
    let currentMax = -Infinity;
    for (const element of collection) {
        if (element > currentMax) {
            currentMax = element;
        }
    }
    return currentMax;
}

function calculateTotal(collection) {
    let totalSum = 0;
    for (const element of collection) {
        totalSum += element;
    }
    return totalSum;
}

function exploreBalancePaths(choices, maxAllowedSum) {
    const processingStack = [[0, 0, 0]]; // [currentChoiceIndex, currentLeftSum, currentRightSum]

    while (processingStack.length > 0) {
        const [choiceIndex, currentLeftSum, currentRightSum] = processingStack.pop();

        if (currentLeftSum > maxAllowedSum || currentRightSum > maxAllowedSum) {
            continue;
        }

        if (choiceIndex === choices.length) {
            if (currentLeftSum === currentRightSum) {
                return true;
            }
            continue;
        }

        const [optionA, optionB] = choices[choiceIndex];

        processingStack.push([choiceIndex + 1, currentLeftSum + optionA, currentRightSum]);
        processingStack.push([choiceIndex + 1, currentLeftSum, currentRightSum + optionB]);
    }

    return false;
}

function checkDivisorValidity(candidateDivisor, valueSet, maxBudget) {
    const remainderChoices = [];
    let minCostAccumulator = 2 * maxBudget;

    for (const val of valueSet) {
        const remainderA = val % candidateDivisor;

        if (remainderA === 0) {
            continue;
        }

        const remainderB = candidateDivisor - remainderA;

        if (maxBudget < Math.min(remainderA, remainderB)) {
            return false;
        }

        minCostAccumulator -= Math.min(remainderA, remainderB);
        if (minCostAccumulator < 0) {
            return false;
        }

        remainderChoices.push([remainderA, remainderB]);
    }

    return exploreBalancePaths(remainderChoices, maxBudget);
}

function processInput(rawData) {
    const parsedLines = rawData.split("\n").map(line => line.split(" ").map(val => parseInt(val, 10)));

    const maxBudget = parsedLines[0][1];
    const valueSet = parsedLines[1];

    const largestElement = findMaximum(valueSet);
    const totalSumOfElements = calculateTotal(valueSet);

    const potentialDivisorLimit = Math.min(largestElement + maxBudget, totalSumOfElements);

    for (let currentDivisor = potentialDivisorLimit; currentDivisor > 1; currentDivisor--) {
        if (checkDivisorValidity(currentDivisor, valueSet, maxBudget)) {
            return console.log(currentDivisor);
        }
    }

    return console.log(1);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
