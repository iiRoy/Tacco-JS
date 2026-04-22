const processInputAndCompute = (sourceText) => {
    const allLines = sourceText.trim().split('\n');
    const [firstEntry, ...costEntryStrings] = allLines;

    const [ignoredIdentifier, initialResourceString] = firstEntry.split(' ');
    let currentResource = Number.parseInt(initialResourceString, 10);

    const costValues = costEntryStrings.map(Number.parseInt);

    const { remainingResourceAfterInitialBuy, purchasedCount } = costValues.reduce(
        (accumulator, currentItemPrice) => ({
            remainingResourceAfterInitialBuy: accumulator.remainingResourceAfterInitialBuy - currentItemPrice,
            purchasedCount: accumulator.purchasedCount + 1
        }),
        { remainingResourceAfterInitialBuy: currentResource, purchasedCount: 0 }
    );

    currentResource = remainingResourceAfterInitialBuy;
    let totalItemsAcquired = purchasedCount;

    const sortedCosts = [...costValues].sort((a, b) => a - b);
    const minimumUnitPrice = sortedCosts[0];

    totalItemsAcquired += Math.floor(currentResource / minimumUnitPrice);

    console.log(totalItemsAcquired);
};

processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));