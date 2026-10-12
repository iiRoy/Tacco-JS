'use strict';

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const [itemCountStr, targetAStr, targetBStr] = rawData[0].split(' ');
const itemCount = +itemCountStr;
const targetA = +targetAStr;
const targetB = +targetBStr;

const itemDetails = rawData.slice(1).map(line => line.split(' ').map(Number));

const MAX_A_PER_SINGLE_ITEM = 10;
const MAX_B_PER_SINGLE_ITEM = 10;
const MAX_C_PER_SINGLE_ITEM = 100;

const MAX_TOTAL_A_SUM = MAX_A_PER_SINGLE_ITEM * itemCount;
const MAX_TOTAL_B_SUM = MAX_B_PER_SINGLE_ITEM * itemCount;
const UNREACHABLE_COST_SENTINEL = MAX_C_PER_SINGLE_ITEM * itemCount + 1;
const NO_SOLUTION_OUTPUT = -1;

const dpTable = Array.from({ length: itemCount }, () =>
    Array.from({ length: MAX_TOTAL_A_SUM }, () =>
        Array(MAX_TOTAL_B_SUM).fill(UNREACHABLE_COST_SENTINEL)
    )
);

const firstItemData = itemDetails[0];
const firstItemAVal = firstItemData[0];
const firstItemBVal = firstItemData[1];
const firstItemCVal = firstItemData[2];

dpTable[0][firstItemAVal - 1][firstItemBVal - 1] = firstItemCVal;

for (let currentItemIndex = 1; currentItemIndex < itemCount; currentItemIndex++) {
    const currentItemData = itemDetails[currentItemIndex];
    const currentItemAVal = currentItemData[0];
    const currentItemBVal = currentItemData[1];
    const currentItemCVal = currentItemData[2];

    for (let sumA = 1; sumA <= MAX_TOTAL_A_SUM; sumA++) {
        const sumAIndex = sumA - 1;

        if (sumA <= currentItemAVal) {
            for (let sumB = 1; sumB < MAX_TOTAL_B_SUM; sumB++) {
                const sumBIndex = sumB - 1;
                dpTable[currentItemIndex][sumAIndex][sumBIndex] = dpTable[currentItemIndex - 1][sumAIndex][sumBIndex];
            }
            continue;
        }

        for (let sumB = 1; sumB <= MAX_TOTAL_B_SUM; sumB++) {
            const sumBIndex = sumB - 1;

            const costFromPreviousItem = dpTable[currentItemIndex - 1][sumAIndex][sumBIndex];

            let costIncludingCurrentItem = UNREACHABLE_COST_SENTINEL;
            if (sumB > currentItemBVal) {
                const prevAIndexForInclude = sumA - currentItemAVal - 1;
                const prevBIndexForInclude = sumB - currentItemBVal - 1;
                const costFromRequiredPreviousState = dpTable[currentItemIndex - 1][prevAIndexForInclude][prevBIndexForInclude];

                if (costFromRequiredPreviousState !== UNREACHABLE_COST_SENTINEL) {
                    costIncludingCurrentItem = costFromRequiredPreviousState + currentItemCVal;
                }
            }

            dpTable[currentItemIndex][sumAIndex][sumBIndex] = Math.min(
                costFromPreviousItem,
                costIncludingCurrentItem
            );
        }
    }
}

let finalMinimumCost = MAX_C_PER_SINGLE_ITEM * itemCount;
let currentATargetMultiple = targetA;
let currentBTargetMultiple = targetB;

while (currentATargetMultiple <= MAX_TOTAL_A_SUM && currentBTargetMultiple <= MAX_TOTAL_B_SUM) {
    const finalAIndex = currentATargetMultiple - 1;
    const finalBIndex = currentBTargetMultiple - 1;

    finalMinimumCost = Math.min(finalMinimumCost, dpTable[itemCount - 1][finalAIndex][finalBIndex]);

    currentATargetMultiple += targetA;
    currentBTargetMultiple += targetB;
}

console.log(finalMinimumCost === UNREACHABLE_COST_SENTINEL ? NO_SOLUTION_OUTPUT : finalMinimumCost);
