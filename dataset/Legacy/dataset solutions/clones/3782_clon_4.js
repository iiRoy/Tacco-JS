'use strict';

function calculateCombinations(upperLimit, lowerCount) {
    if (lowerCount < 0 || lowerCount > upperLimit) {
        return 0;
    }
    if (lowerCount === 0 || lowerCount === upperLimit) {
        return 1;
    }
    if (lowerCount > upperLimit / 2) {
        lowerCount = upperLimit - lowerCount;
    }

    let currentResult = 1;
    for (let iter = 0; iter < lowerCount; iter++) {
        currentResult = currentResult * (upperLimit - iter) / (iter + 1);
    }
    return currentResult;
}

function EntryPoint(inputString) {
    const inputParts = inputString.split(" ");
    const totalSlots = Number(inputParts[0]);
    const firstItemSize = Number(inputParts[1]);
    const secondItemSize = Number(inputParts[2]);
    const targetValue = Number(inputParts[3]);

    const combinedItemValue = firstItemSize + secondItemSize;
    const maxIndividualItemValue = Math.max(firstItemSize, secondItemSize);

    const maxGreenItemCount = Math.floor(targetValue / combinedItemValue);

    function processRecursive(currentGreenIndex) {
        if (currentGreenIndex < 0) {
            return 0;
        }

        let currentIterationSum = 0;
        const remainingValueAfterGreen = targetValue - (currentGreenIndex * combinedItemValue);
        const maxSecondIndexForCurrentGreen = Math.floor(remainingValueAfterGreen / maxIndividualItemValue);

        function innerProcessRecursive(currentSecondIndex) {
            if (currentSecondIndex < 0) {
                return 0;
            }

            let innerIterationSum = 0;
            const remainingValueAfterBoth = targetValue - (currentGreenIndex * combinedItemValue) - (currentSecondIndex * maxIndividualItemValue);

            if (currentGreenIndex + currentSecondIndex + remainingValueAfterBoth <= totalSlots) {
                const totalCountForCombination = currentGreenIndex + currentSecondIndex + remainingValueAfterBoth;
                const maxCountAmongComponents = Math.max(currentGreenIndex, currentSecondIndex, remainingValueAfterBoth);
                innerIterationSum += calculateCombinations(totalSlots, totalCountForCombination) * calculateCombinations(totalCountForCombination, maxCountAmongComponents);
            }

            return innerIterationSum + innerProcessRecursive(currentSecondIndex - 1);
        }

        currentIterationSum += innerProcessRecursive(maxSecondIndexForCurrentGreen);

        return currentIterationSum + processRecursive(currentGreenIndex - 1);
    }

    const finalResult = processRecursive(maxGreenItemCount);

    console.log(finalResult);
}

EntryPoint(require("fs").readFileSync("/dev/stdin", "utf8").trim());
