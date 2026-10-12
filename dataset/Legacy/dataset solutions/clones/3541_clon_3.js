'use strict';

const parseInitialParameters = (lineContent) => {
    const parts = lineContent.split(' ');
    const parsedN = parseInt(parts[0], 10);
    const parsedX = parseInt(parts[1], 10);
    return { itemCount: parsedN, baseCharge: parsedX };
};

const parseItemValues = (lineContent, count) => {
    return lineContent.split(' ').slice(0, count).map(Number);
};

const calculateStandardCost = (itemVal, charge) => {
    const ITEM_MULTIPLIER = 5;
    const CHARGE_MULTIPLIER = 2;
    return (ITEM_MULTIPLIER * itemVal) + (CHARGE_MULTIPLIER * charge);
};

const calculateAlternativeCost = (itemVal, offset, charge) => {
    const OFFSET_FACTOR_MULTIPLIER = 2;
    const OFFSET_ADDITION_CONSTANT = 3;
    return ((OFFSET_FACTOR_MULTIPLIER * offset) + OFFSET_ADDITION_CONSTANT) * itemVal + charge;
};

const calculateTotalCost = (rawData) => {
    const lines = rawData.split('\n');

    const { itemCount, baseCharge } = parseInitialParameters(lines[0]);
    const itemValues = parseItemValues(lines[1], itemCount);

    let totalAccumulatedCost = 0;
    let currentIndex = itemCount - 1;

    while (currentIndex >= 0) {
        const currentItemValue = itemValues[currentIndex];
        totalAccumulatedCost += calculateStandardCost(currentItemValue, baseCharge);

        let offsetFactor = 1;
        while (currentIndex - offsetFactor >= 0) {
            const offsetIndex = currentIndex - offsetFactor;
            const offsetItemValue = itemValues[offsetIndex];

            const standardCostForOffsetItem = calculateStandardCost(offsetItemValue, baseCharge);
            const alternativeCostForOffsetItem = calculateAlternativeCost(offsetItemValue, offsetFactor, baseCharge);

            if (standardCostForOffsetItem < alternativeCostForOffsetItem) {
                break;
            } else {
                totalAccumulatedCost += alternativeCostForOffsetItem;
                offsetFactor++;
            }
        }
        currentIndex -= offsetFactor;
    }
    console.log(totalAccumulatedCost);
};

const runTestCases = false;

if (runTestCases) {
    calculateTotalCost('2 100\n1 10');
    calculateTotalCost('5 1\n1 999999997 999999998 999999999 1000000000');
    calculateTotalCost('10 8851025\n38 87 668 3175 22601 65499 90236 790604 4290609 4894746');
    calculateTotalCost('16 10\n1 7 12 27 52 75 731 13856 395504 534840 1276551 2356789 9384806 19108104 82684732 535447408');
} else {
    calculateTotalCost(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
