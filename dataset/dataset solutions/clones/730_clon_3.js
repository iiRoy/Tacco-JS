const rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputString.trim().split("\n");

const computeTaxedValue = (originalAmount, taxRatePercentage) => {
    const taxMultiplier = (100 + taxRatePercentage) / 100;
    return Math.floor(originalAmount * taxMultiplier);
};

while (true) {
    const currentLineData = inputLines.shift();
    const parsedNumbers = currentLineData.split(" ").map(Number);

    const [rateX, rateY, targetSumS] = parsedNumbers;

    if (rateX === 0 && rateY === 0 && targetSumS === 0) {
        break;
    }

    let overallMaxValue = 0;
    const searchUpperLimit = targetSumS - 1;

    for (let priceA = 1; priceA <= searchUpperLimit; priceA++) {
        for (let priceB = 1; priceB <= searchUpperLimit; priceB++) {
            const taxedPriceA_X = computeTaxedValue(priceA, rateX);
            const taxedPriceB_X = computeTaxedValue(priceB, rateX);
            const currentSumWithTaxX = taxedPriceA_X + taxedPriceB_X;

            if (currentSumWithTaxX > targetSumS) {
                break;
            }

            if (currentSumWithTaxX === targetSumS) {
                const taxedPriceA_Y = computeTaxedValue(priceA, rateY);
                const taxedPriceB_Y = computeTaxedValue(priceB, rateY);
                const currentSumWithTaxY = taxedPriceA_Y + taxedPriceB_Y;
                
                overallMaxValue = Math.max(overallMaxValue, currentSumWithTaxY);
                break;
            }
        }
    }
    console.log(overallMaxValue);
}
