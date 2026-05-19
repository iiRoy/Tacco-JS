function processPurchaseData(rawInputString) {
    let currentShopIdx;
    let itemsPurchasedCount;
    let shopOfferings;
    let totalCostAccumulator = 0;

    const inputLines = rawInputString.split('\n');
    const initialParametersStr = inputLines[0].split(' ');

    const numberOfShopTypes = Number(initialParametersStr[0]);
    const totalItemsRequired = Number(initialParametersStr[1]);

    shopOfferings = [];
    for (currentShopIdx = 0; currentShopIdx < numberOfShopTypes; currentShopIdx++) {
        const shopDetailsRaw = inputLines[currentShopIdx + 1].split(' ');
        const itemPrice = Number(shopDetailsRaw[0]);
        const availableQuantity = Number(shopDetailsRaw[1]);
        shopOfferings.push([itemPrice, availableQuantity]);
    }

    shopOfferings.sort((shopA, shopB) => shopA[0] - shopB[0]);

    currentShopIdx = 0;
    itemsPurchasedCount = 0;

    while (itemsPurchasedCount < totalItemsRequired) {
        totalCostAccumulator += shopOfferings[currentShopIdx][0];
        shopOfferings[currentShopIdx][1]--;
        itemsPurchasedCount++;

        if (shopOfferings[currentShopIdx][1] <= 0) {
            currentShopIdx++;
        }
    }

    console.log(totalCostAccumulator);
}

processPurchaseData(require('fs').readFileSync('/dev/stdin', 'utf8'));
