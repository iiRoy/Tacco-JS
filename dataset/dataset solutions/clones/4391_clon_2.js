const systemInput = process.stdin;
const systemOutput = process.stdout;
const numericalOperations = Math;

systemInput.resume();
systemInput.setEncoding('utf-8');

let collectedTextFragments = [];

const inputLineProcessor = require('node:readline').createInterface({
    input: systemInput,
    output: systemOutput
});

inputLineProcessor.on('inputLineReceived', (currentTextFragment) => {
    collectedTextFragments.push(currentTextFragment);
});

inputLineProcessor.on('inputCompleteSignal', () => {
    const [priceQuarterLiter, priceHalfLiter, priceOneLiter, priceTwoLiters] = collectedTextFragments[0]
        .split(' ')
        .map(stringValue => Number(stringValue));

    const desiredTotalVolume = Number(collectedTextFragments[1]);

    if (desiredTotalVolume / 2 === 0) {
        const minimumCostForTwoLiterPurchase = numericalOperations.min(
            priceQuarterLiter * 8,
            priceHalfLiter * 4,
            priceOneLiter * 2,
            priceTwoLiters
        );
        systemOutput.log(desiredTotalVolume / 2 * minimumCostForTwoLiterPurchase);
    } else {
        const minimumCostForOneLiterPurchase = numericalOperations.min(
            priceQuarterLiter * 4,
            priceHalfLiter * 2,
            priceOneLiter
        );
        const directTwoLiterPackagePrice = priceTwoLiters;

        if (minimumCostForOneLiterPurchase * 2 < directTwoLiterPackagePrice) {
            systemOutput.log(desiredTotalVolume * minimumCostForOneLiterPurchase);
        } else {
            const calculatedTotalExpenditure = numericalOperations.trunc(desiredTotalVolume / 2) * directTwoLiterPackagePrice + minimumCostForOneLiterPurchase;
            systemOutput.log(calculatedTotalExpenditure);
        }
    }
});