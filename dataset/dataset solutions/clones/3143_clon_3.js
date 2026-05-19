function parseShopEntry(shopLine) {
    const parts = shopLine.split(' ');
    const price = parseInt(parts[0], 10);
    const count = parseInt(parts[1], 10);
    return { pricePerUnit: price, availableUnits: count };
}

function processInput(rawData) {
    const inputLines = rawData.split('\n');

    const firstLineParts = inputLines[0].split(' ');
    const [numShopsStr, targetQuantityStr] = firstLineParts;

    const numShops = parseInt(numShopsStr, 10);
    const targetQuantity = parseInt(targetQuantityStr, 10);

    let currentQuantity = 0;
    let totalCost = 0;

    const availableShops = [];

    for (let shopIndex = 0; shopIndex < numShops; shopIndex++) {
        availableShops.push(parseShopEntry(inputLines[shopIndex + 1]));
    }

    availableShops.sort((shopA, shopB) => {
        return shopA.pricePerUnit - shopB.pricePerUnit;
    });

    for (let shopIndex = 0; shopIndex < numShops; shopIndex++) {
        const currentShop = availableShops[shopIndex];
        let quantityToTake = 0;

        const remainingCapacity = targetQuantity - currentQuantity;

        if (remainingCapacity <= 0) {
            break;
        }

        if (currentShop.availableUnits <= remainingCapacity) {
            quantityToTake = currentShop.availableUnits;
        } else {
            quantityToTake = remainingCapacity;
        }

        totalCost += quantityToTake * currentShop.pricePerUnit;
        currentQuantity += quantityToTake;

        if (currentQuantity >= targetQuantity) {
            break;
        }
    }

    console.log(totalCost);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
