"use strict";

function processInputAndCalculate(rawInput) {
    const lines = rawInput.trim().split('\n');
    const limitFiveHundred = Number(lines[0]);
    const limitOneHundred = Number(lines[1]);
    const limitFifty = Number(lines[2]);
    const desiredTotal = Number(lines[3]);

    const coinDenominations = [500, 100, 50];
    const coinMaximums = [limitFiveHundred, limitOneHundred, limitFifty];

    function countValidCombinations(currentAccumulatedSum, currentCoinTypeIndex) {
        if (currentCoinTypeIndex === coinDenominations.length) {
            return currentAccumulatedSum === desiredTotal ? 1 : 0;
        }

        if (currentAccumulatedSum > desiredTotal) {
            return 0;
        }

        let totalWaysFound = 0;
        const currentDenominationValue = coinDenominations[currentCoinTypeIndex];
        const maxAllowedForThisCoin = coinMaximums[currentCoinTypeIndex];

        for (let countOfCurrentCoin = 0; countOfCurrentCoin <= maxAllowedForThisCoin; countOfCurrentCoin++) {
            const nextAccumulatedSum = currentAccumulatedSum + countOfCurrentCoin * currentDenominationValue;
            totalWaysFound += countValidCombinations(nextAccumulatedSum, currentCoinTypeIndex + 1);
        }

        return totalWaysFound;
    }

    return countValidCombinations(0, 0);
}

function Main(inputString) {
    const finalCount = processInputAndCalculate(inputString);
    console.log(finalCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
