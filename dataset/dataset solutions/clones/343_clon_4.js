function determineMinimumExpense(desiredMass) {
    const productCatalog = [
        { itemWeight: 200, itemPrice: 380, discountQuantity: 5, discountRate: 0.8 },
        { itemWeight: 300, itemPrice: 550, discountQuantity: 4, discountRate: 0.85 },
        { itemWeight: 500, itemPrice: 850, discountQuantity: 3, discountRate: 0.88 }
    ];

    let overallLowestCost = Number.POSITIVE_INFINITY;

    const maxCountProduct0 = Math.floor(desiredMass / productCatalog[0].itemWeight);
    const maxCountProduct1 = Math.floor(desiredMass / productCatalog[1].itemWeight);
    const maxCountProduct2 = Math.floor(desiredMass / productCatalog[2].itemWeight);

    for (let quantityAlpha = 0; quantityAlpha <= maxCountProduct0; quantityAlpha++) {
        const currentMassAlpha = quantityAlpha * productCatalog[0].itemWeight;
        if (currentMassAlpha > desiredMass) continue;

        for (let quantityBeta = 0; quantityBeta <= maxCountProduct1; quantityBeta++) {
            const currentMassAlphaBeta = currentMassAlpha + quantityBeta * productCatalog[1].itemWeight;
            if (currentMassAlphaBeta > desiredMass) continue;

            for (let quantityGamma = 0; quantityGamma <= maxCountProduct2; quantityGamma++) {
                const finalAchievedMass = currentMassAlphaBeta + quantityGamma * productCatalog[2].itemWeight;

                if (finalAchievedMass === desiredMass) {
                    let calculatedPurchaseCost = 0;

                    // Compute cost for Product Alpha
                    let individualUnitsAlpha = quantityAlpha % productCatalog[0].discountQuantity;
                    let bulkPacksAlpha = Math.floor(quantityAlpha / productCatalog[0].discountQuantity);
                    calculatedPurchaseCost += (individualUnitsAlpha * productCatalog[0].itemPrice) + (bulkPacksAlpha * productCatalog[0].discountQuantity * productCatalog[0].itemPrice * productCatalog[0].discountRate);

                    // Compute cost for Product Beta
                    let individualUnitsBeta = quantityBeta % productCatalog[1].discountQuantity;
                    let bulkPacksBeta = Math.floor(quantityBeta / productCatalog[1].discountQuantity);
                    calculatedPurchaseCost += (individualUnitsBeta * productCatalog[1].itemPrice) + (bulkPacksBeta * productCatalog[1].discountQuantity * productCatalog[1].itemPrice * productCatalog[1].discountRate);

                    // Compute cost for Product Gamma
                    let individualUnitsGamma = quantityGamma % productCatalog[2].discountQuantity;
                    let bulkPacksGamma = Math.floor(quantityGamma / productCatalog[2].discountQuantity);
                    calculatedPurchaseCost += (individualUnitsGamma * productCatalog[2].itemPrice) + (bulkPacksGamma * productCatalog[2].discountQuantity * productCatalog[2].itemPrice * productCatalog[2].discountRate);

                    if (calculatedPurchaseCost < overallLowestCost) {
                        overallLowestCost = calculatedPurchaseCost;
                    }
                }
            }
        }
    }
    return overallLowestCost;
}

function orchestrateProcessing() {
    const sourceDataLines = accumulatedInput.split('\n');
    let outputCollection = [];

    for (const dataEntry of sourceDataLines) {
        const trimmedEntry = dataEntry.trim();
        if (trimmedEntry === '') continue;
        
        const numericalValue = parseInt(trimmedEntry, 10);

        if (numericalValue === 0) {
            break; 
        }

        outputCollection.push(determineMinimumExpense(numericalValue));
    }

    outputCollection.forEach(result => console.log(result));
}

let accumulatedInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(incomingChunk) {
    accumulatedInput += incomingChunk;
});
process.stdin.on('end', function() {
    orchestrateProcessing();
});