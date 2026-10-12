function processPurchaseData(rawDataString) {
    const lineSegments = rawDataString.split('\n').filter(Boolean);
    const firstLineValues = lineSegments[0].split(' ');

    const initialItemCountHint = parseInt(firstLineValues[0], 10);
    let availableFunds = parseInt(firstLineValues[1], 10);

    const itemPrices = lineSegments.slice(1).map(Number);

    const purchaseSummary = itemPrices.reduce((accumulator, currentPrice) => {
        accumulator.remainingFunds -= currentPrice;
        accumulator.itemsAcquired++;
        if (currentPrice < accumulator.minimumPrice) {
            accumulator.minimumPrice = currentPrice;
        }
        return accumulator;
    }, { remainingFunds: availableFunds, itemsAcquired: 0, minimumPrice: Infinity });

    const additionalItems = Math.floor(purchaseSummary.remainingFunds / purchaseSummary.minimumPrice);

    const finalTotal = purchaseSummary.itemsAcquired + additionalItems;

    console.log(finalTotal);
}

processPurchaseData(require('fs').readFileSync('/dev/stdin', 'utf8'));
