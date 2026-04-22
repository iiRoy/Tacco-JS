const acquireSourceData = () => {
    const rawContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    return rawContent.trim().split('\n');
};

function* problemSetIterator(lines) {
    let currentLineIndex = 0;
    while (true) {
        const firstSegment = lines[currentLineIndex++];
        if (firstSegment === "0 0 0 0 0") {
            return;
        }
        const secondSegment = lines[currentLineIndex++];
        const numericValues = (firstSegment + " " + secondSegment).split(" ").map(Number);
        yield {
            costUnitX: numericValues[0],
            costUnitY: numericValues[1],
            costUnitZ: numericValues[2],
            batchSizeZ: numericValues[3],
            batchItemCostZ: numericValues[4],
            quantityX: numericValues[5],
            quantityY: numericValues[6],
            quantityZ: numericValues[7]
        };
    }
}

const computePlanAlphaCost = (parameters) => {
    const { costUnitX, costUnitY, costUnitZ, batchSizeZ, batchItemCostZ, quantityX, quantityY, quantityZ } = parameters;

    const fullBatchesAcquired = Math.floor(quantityZ / batchSizeZ);
    const costFromFullBatches = fullBatchesAcquired * batchSizeZ * batchItemCostZ;
    const remainingZItems = quantityZ % batchSizeZ;
    const costForRemainingZItems = remainingZItems * costUnitZ;

    return costFromFullBatches + costForRemainingZItems + (quantityX * costUnitX) + (quantityY * costUnitY);
};

const computePlanBetaCost = (parameters) => {
    const { costUnitX, costUnitY, batchSizeZ, batchItemCostZ, quantityX, quantityY, quantityZ } = parameters;

    let totalCostForZ = 0;
    let currentQuantityX = quantityX;
    let currentQuantityY = quantityY;

    if (quantityZ < batchSizeZ) {
        if (quantityZ > 0) {
            totalCostForZ = batchSizeZ * batchItemCostZ;
            let surplusFromBatch = batchSizeZ - quantityZ;

            if (surplusFromBatch <= currentQuantityY) {
                currentQuantityY -= surplusFromBatch;
            } else {
                surplusFromBatch -= currentQuantityY;
                currentQuantityY = 0;
                if (surplusFromBatch <= currentQuantityX) {
                    currentQuantityX -= surplusFromBatch;
                } else {
                    currentQuantityX = 0;
                }
            }
        }
    } else {
        totalCostForZ = quantityZ * batchItemCostZ;
    }

    return totalCostForZ + (currentQuantityX * costUnitX) + (currentQuantityY * costUnitY);
};

const determineOptimalExpenditure = (purchaseParameters) => {
    const planAlphaResult = computePlanAlphaCost(purchaseParameters);
    const planBetaResult = computePlanBetaCost(purchaseParameters);
    return Math.min(planAlphaResult, planBetaResult);
};

const allRawLines = acquireSourceData();
const problemDataStream = problemSetIterator(allRawLines);

for (const currentProblemSet of problemDataStream) {
    const finalCalculatedCost = determineOptimalExpenditure(currentProblemSet);
    console.log(finalCalculatedCost);
}