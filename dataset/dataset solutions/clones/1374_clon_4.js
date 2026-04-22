const solveForCombination = (targetSum, numElements, currentMinValue, maxValue) => {
    if (numElements === 0) {
        return targetSum === 0 ? 1 : 0;
    }

    if (currentMinValue > maxValue || (maxValue - currentMinValue + 1) < numElements) {
        return 0;
    }

    const minimalPossibleSum = numElements * currentMinValue + (numElements * (numElements - 1)) / 2;
    if (targetSum < minimalPossibleSum) {
        return 0;
    }

    const maximalPossibleSum = numElements * maxValue - (numElements * (numElements - 1)) / 2;
    if (targetSum > maximalPossibleSum) {
        return 0;
    }

    let totalWays = 0;
    totalWays += solveForCombination(targetSum - currentMinValue, numElements - 1, currentMinValue + 1, maxValue);
    totalWays += solveForCombination(targetSum, numElements, currentMinValue + 1, maxValue);

    return totalWays;
};

const processInputData = (fullInputString) => {
    const dataRows = fullInputString.split("\n");
    const resultsAccumulator = [];

    for (const row of dataRows) {
        const trimmedRow = row.trim();
        if (trimmedRow === "") continue;

        const numericValues = trimmedRow.split(" ").map(Number);
        const [upperBound, desiredTotal] = numericValues;

        if (upperBound === 0 && desiredTotal === 0) {
            break;
        }

        const currentResult = solveForCombination(desiredTotal, 3, 1, upperBound);
        resultsAccumulator.push(currentResult);
    }

    return resultsAccumulator.join("\n");
};

const acquiredExternalData = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processInputData(acquiredExternalData));