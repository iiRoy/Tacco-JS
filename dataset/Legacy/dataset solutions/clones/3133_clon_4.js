function processPurchase(sourceText) {
    const lines = sourceText.split('\n');
    const [itemTypeCount, desiredQuantity] = lines[0].split(' ').map(Number);

    const availableItems = lines.slice(1, 1 + itemTypeCount).map(itemLine => itemLine.split(' ').map(Number));

    const expandedPrices = availableItems.flatMap(([unitCost, stockCount]) =>
        Array(stockCount).fill(unitCost)
    );

    expandedPrices.sort((a, b) => a - b);

    const purchaseSequence = Array(desiredQuantity).fill(undefined).map((_, index) => expandedPrices[index]);

    const totalCost = purchaseSequence.reduce((accumulator, currentPrice) => accumulator + currentPrice, 0);

    console.log(totalCost);
}

processPurchase(require('fs').readFileSync('/dev/stdin', 'utf8'));
