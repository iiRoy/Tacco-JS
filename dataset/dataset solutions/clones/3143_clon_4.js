function determineTotalExpenditure(dataString) {
    const lines = dataString.trim().split('\n');

    const [shopCountStr, targetQuantityStr] = lines[0].split(' ');
    const shopCount = Number(shopCountStr);
    const targetQuantity = Number(targetQuantityStr);

    const vendorOfferings = lines.slice(1, shopCount + 1).map(line => {
        const [priceStr, quantityStr] = line.split(' ');
        return [Number(priceStr), Number(quantityStr)];
    });

    const sortedOfferings = vendorOfferings.sort((offerA, offerB) => offerA[0] - offerB[0]);

    const finalAcquisitionState = sortedOfferings.reduce(
        (accumulator, currentOffer) => {
            let [currentCost, itemsAcquiredSoFar] = accumulator;
            const [offerPrice, offerQuantity] = currentOffer;

            if (itemsAcquiredSoFar >= targetQuantity) {
                return [currentCost, itemsAcquiredSoFar];
            }

            const remainingNeeded = targetQuantity - itemsAcquiredSoFar;
            const itemsToProcureFromCurrent = Math.min(offerQuantity, remainingNeeded);

            currentCost += (itemsToProcureFromCurrent * offerPrice);
            itemsAcquiredSoFar += itemsToProcureFromCurrent;

            return [currentCost, itemsAcquiredSoFar];
        },
        [0, 0]
    );

    console.log(finalAcquisitionState[0]);
}

determineTotalExpenditure(require('fs').readFileSync('/dev/stdin', 'utf8'));