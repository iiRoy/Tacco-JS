'use strict';

function processInputAndCalculate(inputData) {
    const numericInputs = inputData.split(' ').map(Number);
    const totalItemsLimit = numericInputs[0];
    const firstColorVal = numericInputs[1];
    const secondColorVal = numericInputs[2];
    const targetSum = numericInputs[3];

    const combinedColorVal = firstColorVal + secondColorVal;
    const maxOfColorsVal = Math.max(firstColorVal, secondColorVal);
    const minOfColorsVal = Math.min(firstColorVal, secondColorVal); // This variable is not directly used in the value calculation, as the third item type implicitly has a value of 1.

    let totalAccumulatedPatterns = 0;

    const factorialMemo = new Map();

    function computeFactorial(num) {
        if (num < 0) return 0;
        if (num === 0 || num === 1) return 1;
        if (factorialMemo.has(num)) return factorialMemo.get(num);

        let currentResult = 1;
        for (let currentVal = 2; currentVal <= num; currentVal++) {
            currentResult *= currentVal;
        }
        factorialMemo.set(num, currentResult);
        return currentResult;
    }

    function computeBinomialCoefficient(nVal, kVal) {
        if (kVal < 0 || kVal > nVal) return 0;
        if (kVal === 0 || kVal === nVal) return 1;
        if (kVal > nVal / 2) kVal = nVal - kVal;

        return computeFactorial(nVal) / (computeFactorial(kVal) * computeFactorial(nVal - kVal));
    }

    // Iterate over all possible total number of items (T) that can be selected, from 0 up to N.
    for (let totalItemsCount = 0; totalItemsCount <= totalItemsLimit; totalItemsCount++) {
        // Iterate over possible counts for items with value 'combinedColorVal' (i)
        for (let combinedItemsCount = 0; combinedItemsCount <= totalItemsCount; combinedItemsCount++) {
            // Iterate over possible counts for items with value 'maxOfColorsVal' (j)
            for (let maxItemsCount = 0; maxItemsCount <= totalItemsCount - combinedItemsCount; maxItemsCount++) {
                // The count for the third type of item (implicitly value 1) is derived from the total items.
                let minItemsCount = totalItemsCount - combinedItemsCount - maxItemsCount;

                // Calculate the total value for this specific combination of item counts.
                // The third item type (minItemsCount) contributes 1 to the total value,
                // as per the original code's interpretation of `restgb`.
                let currentTotalValue = (combinedItemsCount * combinedColorVal) +
                                        (maxItemsCount * maxOfColorsVal) +
                                        (minItemsCount * 1);

                // If the total value matches the target sum K, then this is a valid combination.
                if (currentTotalValue === targetSum) {
                    let firstFactor = computeBinomialCoefficient(totalItemsLimit, totalItemsCount);
                    let secondFactor = computeBinomialCoefficient(totalItemsCount, Math.max(combinedItemsCount, maxItemsCount, minItemsCount));
                    totalAccumulatedPatterns += firstFactor * secondFactor;
                }
            }
        }
    }

    console.log(totalAccumulatedPatterns);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8").trim());
