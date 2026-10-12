const minCostMap = {};

const ITEM_A_WEIGHT_PER_UNIT = 200;
const ITEM_A_PRICE_PER_UNIT = 380;
const ITEM_A_BULK_QUANTITY = 5;
const ITEM_A_BULK_DISCOUNT_RATE = 0.8;

const ITEM_B_WEIGHT_PER_UNIT = 300;
const ITEM_B_PRICE_PER_UNIT = 550;
const ITEM_B_BULK_QUANTITY = 4;
const ITEM_B_BULK_DISCOUNT_RATE = 0.85;

const ITEM_C_WEIGHT_PER_UNIT = 500;
const ITEM_C_PRICE_PER_UNIT = 850;
const ITEM_C_BULK_QUANTITY = 3;
const ITEM_C_BULK_DISCOUNT_RATE = 0.88;

const MAXIMUM_TOTAL_WEIGHT_LIMIT = 5000;

function calculateIndividualItemTypeCost(itemCount, unitPrice, bulkQuantity, discountRate) {
    const numberOfBulkPacks = Math.floor(itemCount / bulkQuantity);
    const remainingIndividualUnits = itemCount % bulkQuantity;

    const costOfBulkPacks = unitPrice * bulkQuantity * discountRate * numberOfBulkPacks;
    const costOfIndividualUnits = unitPrice * remainingIndividualUnits;

    return costOfBulkPacks + costOfIndividualUnits;
}

for (let countA = 0; countA <= 25; countA++) {
    for (let countB = 0; countB <= 16; countB++) {
        for (let countC = 0; countC <= 10; countC++) {
            const currentAggregateWeight = (ITEM_A_WEIGHT_PER_UNIT * countA) +
                                           (ITEM_B_WEIGHT_PER_UNIT * countB) +
                                           (ITEM_C_WEIGHT_PER_UNIT * countC);

            if (currentAggregateWeight > MAXIMUM_TOTAL_WEIGHT_LIMIT) {
                continue;
            }

            let currentAggregateCost = 0;
            currentAggregateCost += calculateIndividualItemTypeCost(countA, ITEM_A_PRICE_PER_UNIT, ITEM_A_BULK_QUANTITY, ITEM_A_BULK_DISCOUNT_RATE);
            currentAggregateCost += calculateIndividualItemTypeCost(countB, ITEM_B_PRICE_PER_UNIT, ITEM_B_BULK_QUANTITY, ITEM_B_BULK_DISCOUNT_RATE);
            currentAggregateCost += calculateIndividualItemTypeCost(countC, ITEM_C_PRICE_PER_UNIT, ITEM_C_BULK_QUANTITY, ITEM_C_BULK_DISCOUNT_RATE);

            minCostMap[currentAggregateWeight] = Math.min(minCostMap[currentAggregateWeight] ?? Infinity, currentAggregateCost);
        }
    }
}

const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputQueryLines = rawInputContent.trim().split('\n');

let currentLineIndex = 0;
while (true) {
    const lineContent = inputQueryLines[currentLineIndex++];
    const requestedWeight = parseInt(lineContent, 10);

    if (requestedWeight === 0) {
        break;
    }
    console.log(minCostMap[requestedWeight]);
}
