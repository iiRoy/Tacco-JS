const ITEM_A_WEIGHT_PER_UNIT = 200;
const ITEM_A_PRICE_PER_UNIT = 380;
const ITEM_A_BULK_THRESHOLD = 5;
const ITEM_A_BULK_DISCOUNT_FACTOR = 0.8;

const ITEM_B_WEIGHT_PER_UNIT = 300;
const ITEM_B_PRICE_PER_UNIT = 550;
const ITEM_B_BULK_THRESHOLD = 4;
const ITEM_B_BULK_DISCOUNT_FACTOR = 0.85;

const ITEM_C_WEIGHT_PER_UNIT = 500;
const ITEM_C_PRICE_PER_UNIT = 850;
const ITEM_C_BULK_THRESHOLD = 3;
const ITEM_C_BULK_DISCOUNT_FACTOR = 0.88;

const MAX_COUNT_A = 25;
const MAX_COUNT_B = 16;
const MAX_COUNT_C = 10;

const MAXIMUM_AGGREGATE_WEIGHT = 5000;

const determineItemCost = (itemCount, unitPrice, bulkThreshold, bulkDiscountFactor) => {
    const bulkPrice = unitPrice * bulkThreshold * bulkDiscountFactor;
    const individualPrice = unitPrice;
    return Math.floor(itemCount / bulkThreshold) * bulkPrice + (itemCount % bulkThreshold) * individualPrice;
};

const computeTotalWeight = (countA, countB, countC) => {
    return countA * ITEM_A_WEIGHT_PER_UNIT +
           countB * ITEM_B_WEIGHT_PER_UNIT +
           countC * ITEM_C_WEIGHT_PER_UNIT;
};

const computeTotalMoney = (countA, countB, countC) => {
    return determineItemCost(countA, ITEM_A_PRICE_PER_UNIT, ITEM_A_BULK_THRESHOLD, ITEM_A_BULK_DISCOUNT_FACTOR) +
           determineItemCost(countB, ITEM_B_PRICE_PER_UNIT, ITEM_B_BULK_THRESHOLD, ITEM_B_BULK_DISCOUNT_FACTOR) +
           determineItemCost(countC, ITEM_C_PRICE_PER_UNIT, ITEM_C_BULK_THRESHOLD, ITEM_C_BULK_DISCOUNT_FACTOR);
};

const allCountCombinations = Array.from({ length: MAX_COUNT_A + 1 }, (_, countA) => countA)
    .flatMap(countA =>
        Array.from({ length: MAX_COUNT_B + 1 }, (_, countB) => countB)
            .flatMap(countB =>
                Array.from({ length: MAX_COUNT_C + 1 }, (_, countC) => ({ countA, countB, countC }))
            )
    );

const weightToMinMoneyMap = allCountCombinations.reduce((accumulatorMap, { countA, countB, countC }) => {
    const currentAggregateWeight = computeTotalWeight(countA, countB, countC);

    if (currentAggregateWeight > MAXIMUM_AGGREGATE_WEIGHT) {
        return accumulatorMap;
    }

    const currentAggregateMoney = computeTotalMoney(countA, countB, countC);

    if (!accumulatorMap.has(currentAggregateWeight) || accumulatorMap.get(currentAggregateWeight) > currentAggregateMoney) {
        accumulatorMap.set(currentAggregateWeight, currentAggregateMoney);
    }
    return accumulatorMap;
}, new Map());

function* queryValueStream(rawInputString) {
    const inputLines = rawInputString.trim().split("\n");
    for (const lineContent of inputLines) {
        const numericValue = Number(lineContent);
        if (numericValue === 0) {
            return;
        }
        yield numericValue;
    }
}

const fileSystem = require('fs');
const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

for (const requestedWeight of queryValueStream(standardInputContent)) {
    console.log(weightToMinMoneyMap.get(requestedWeight));
}
