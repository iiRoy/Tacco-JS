"use strict";

const processKnapsackInput = (inputString) => {
    const inputLines = inputString.trim().split("\n");
    const [totalItemsStr, knapsackCapacityStr] = inputLines[0].split(" ");
    const totalItems = parseInt(totalItemsStr);
    const knapsackCapacity = parseInt(knapsackCapacityStr);

    const itemSpecifications = inputLines.slice(1, totalItems + 1).map(line => line.split(" ").map(Number));

    const valueCache = Array.from({ length: totalItems + 1 }, () =>
        Array(knapsackCapacity + 1).fill(-1)
    );

    const resultValue = computeMaxKnapsackValue(0, knapsackCapacity, itemSpecifications, valueCache);

    console.log(resultValue);
};

const computeMaxKnapsackValue = (
    currentItemIdx,
    currentRemainingCapacity,
    allItemSpecifications,
    memoizationGrid
) => {
    if (currentItemIdx === allItemSpecifications.length) {
        return 0;
    }

    if (memoizationGrid[currentItemIdx][currentRemainingCapacity] !== -1) {
        return memoizationGrid[currentItemIdx][currentRemainingCapacity];
    }

    const itemWeight = allItemSpecifications[currentItemIdx][0];
    const itemWorth = allItemSpecifications[currentItemIdx][1];

    const valueWithoutCurrentItem = computeMaxKnapsackValue(
        currentItemIdx + 1,
        currentRemainingCapacity,
        allItemSpecifications,
        memoizationGrid
    );

    let valueWithCurrentItem = -Infinity;

    if (itemWeight <= currentRemainingCapacity) {
        valueWithCurrentItem = itemWorth + computeMaxKnapsackValue(
            currentItemIdx + 1,
            currentRemainingCapacity - itemWeight,
            allItemSpecifications,
            memoizationGrid
        );
    }

    memoizationGrid[currentItemIdx][currentRemainingCapacity] = Math.max(
        valueWithoutCurrentItem,
        valueWithCurrentItem
    );

    return memoizationGrid[currentItemIdx][currentRemainingCapacity];
};

processKnapsackInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
