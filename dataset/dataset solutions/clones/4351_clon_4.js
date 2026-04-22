'use strict'

const produceQuantities = (baseUnit1, baseUnit2, maxCapacity) => {
    const quantitySet = new Set([0]); // Include the option of zero quantity

    // Calculate maximum loop iterations for each base unit.
    // If a base unit is 0, its effectiveMax is 0, meaning its loop runs only once (for i=0 or j=0).
    const effectiveMaxI = (baseUnit1 > 0) ? Math.floor(maxCapacity / baseUnit1) : 0;
    const effectiveMaxJ = (baseUnit2 > 0) ? Math.floor(maxCapacity / baseUnit2) : 0;

    for (let i = 0; i <= effectiveMaxI; ++i) {
        const currentAmount1 = baseUnit1 * i;
        if (currentAmount1 > maxCapacity) break;

        for (let j = 0; j <= effectiveMaxJ; ++j) {
            const currentAmount2 = baseUnit2 * j;
            if (currentAmount2 > maxCapacity) break;

            const totalCombinedAmount = currentAmount1 + currentAmount2;
            if (totalCombinedAmount <= maxCapacity) {
                quantitySet.add(totalCombinedAmount);
            } else {
                // Since amounts are non-negative, if current total exceeds cap,
                // further increments of j will also exceed, so break inner loop.
                break;
            }
        }
    }
    return Array.from(quantitySet);
};

const processSolution = (rawInputData) => {
    const [coeffA, coeffB, coeffC, coeffD, concE, totalF] = rawInputData
        .trim()
        .split(/\s+/)
        .map(Number);

    const maxAllowedConcentrationRatio = concE / (100 + concE);

    const waterQuantities = produceQuantities(100 * coeffA, 100 * coeffB, totalF);
    const sugarQuantities = produceQuantities(coeffC, coeffD, totalF);

    let optimalMixture = { volume: totalF, sweet: 0 };
    let highestConcentration = 0;

    for (const currentWater of waterQuantities) {
        for (const currentSugar of sugarQuantities) {
            const currentTotalVolume = currentWater + currentSugar;

            if (currentTotalVolume <= totalF && currentTotalVolume > 0) {
                const currentConcentration = currentSugar / currentTotalVolume;

                if (currentConcentration <= maxAllowedConcentrationRatio) {
                    if (currentConcentration > highestConcentration) {
                        highestConcentration = currentConcentration;
                        optimalMixture = { volume: currentWater, sweet: currentSugar };
                    }
                }
            }
        }
    }

    console.log(`${optimalMixture.volume + optimalMixture.sweet} ${optimalMixture.sweet}`);
};

const systemIO = require('fs');
const readInputFile = systemIO.readFileSync;
const standardIn = '/dev/stdin';
const textEncoding = 'utf8';

processSolution(readInputFile(standardIn, textEncoding));