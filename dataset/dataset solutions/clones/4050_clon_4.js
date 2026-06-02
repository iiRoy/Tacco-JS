"use strict";

const processInputData = (inputString) => {
    const dataLines = inputString.trim().split("\n");
    const coinLimits = dataLines.slice(0, 3).map(Number);
    const targetValue = Number(dataLines[3]);
    return { coinLimits, targetValue };
};

const currencyDenominations = [500, 100, 50];

const calculateCombinations = (currentCoinIndex, remainingAmount, maximumCounts) => {
    if (currentCoinIndex === currencyDenominations.length) {
        return remainingAmount === 0 ? 1 : 0;
    }

    if (remainingAmount < 0) {
        return 0;
    }

    let totalValidWays = 0;
    const currentDenomination = currencyDenominations[currentCoinIndex];
    const maxCountForCurrent = maximumCounts[currentCoinIndex];

    for (let count = 0; count <= maxCountForCurrent; count++) {
        const amountUsed = count * currentDenomination;
        if (amountUsed > remainingAmount) {
            break;
        }
        totalValidWays += calculateCombinations(currentCoinIndex + 1, remainingAmount - amountUsed, maximumCounts);
    }

    return totalValidWays;
};

const executeCalculation = (rawInputContent) => {
    const { coinLimits, targetValue } = processInputData(rawInputContent);
    const finalResult = calculateCombinations(0, targetValue, coinLimits);
    console.log(finalResult);
};

executeCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));
