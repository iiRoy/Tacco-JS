const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

function* inputLineProcessor(fullTextContent) {
    const contentLines = fullTextContent.trim().split('\n');
    let currentPosition = 0;
    while (true) {
        const firstSegmentLine = contentLines[currentPosition++];
        if (firstSegmentLine === "0 0 0 0 0") {
            return;
        }
        // Original code would proceed to arr.shift() for the second line,
        // potentially leading to `undefined` if input ends unexpectedly.
        // This generator replicates that behavior by allowing `undefined` to be concatenated.
        const secondSegmentLine = contentLines[currentPosition++];
        yield (firstSegmentLine + " " + secondSegmentLine).split(" ").map(Number);
    }
}

function determineMinimumCost(
    itemPriceA,
    itemPriceB,
    itemPriceC,
    blockQuantityD,
    blockItemPriceE, // This variable has dual meaning in original logic
    countOfA,
    countOfB,
    countOfC
) {
    // Calculation for the first strategy (equivalent to original 'A' logic)
    const fullBlockCostComponent = Math.floor(countOfC / blockQuantityD) * blockQuantityD * blockItemPriceE;
    const remainingCCostComponent = (countOfC % blockQuantityD) * itemPriceC;
    const totalCostStrategyOne = fullBlockCostComponent + remainingCCostComponent + countOfA * itemPriceA + countOfB * itemPriceB;

    // Calculation for the second strategy (equivalent to original 'B' logic)
    let totalCostStrategyTwo;
    if (fullBlockCostComponent === 0) { // This condition implies countOfC < blockQuantityD
        let itemsNeededToCompleteBlock = (countOfC % blockQuantityD === 0) ? 0 : blockQuantityD - (countOfC % blockQuantityD);
        let currentAccumulatedCost = 0;

        if (itemsNeededToCompleteBlock > 0) {
            currentAccumulatedCost += blockItemPriceE * blockQuantityD; // Cost of one full block
        }

        // Simulate the reduction of countOfB then countOfA, as in the original 'while' loop
        let tempCountB = countOfB;
        let tempCountA = countOfA;

        const usedFromB = Math.min(tempCountB, itemsNeededToCompleteBlock);
        tempCountB -= usedFromB;
        itemsNeededToCompleteBlock -= usedFromB;

        const usedFromA = Math.min(tempCountA, itemsNeededToCompleteBlock);
        tempCountA -= usedFromA;
        // itemsNeededToCompleteBlock is now fully accounted for, no further tracking needed

        currentAccumulatedCost += tempCountA * itemPriceA + tempCountB * itemPriceB;
        totalCostStrategyTwo = currentAccumulatedCost;
    } else { // This condition implies countOfC >= blockQuantityD
        // Here, blockItemPriceE acts as an individual item price for countOfC
        totalCostStrategyTwo = countOfA * itemPriceA + countOfB * itemPriceB + countOfC * blockItemPriceE;
    }

    console.log(Math.min(totalCostStrategyOne, totalCostStrategyTwo));
}

for (const numericParameters of inputLineProcessor(sourceData)) {
    determineMinimumCost(...numericParameters);
}
