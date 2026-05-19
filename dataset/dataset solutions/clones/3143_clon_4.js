function processPurchaseData(sourceText) {
    const [initialConfig, ...shopDetails] = sourceText.split('\n');
    const [totalShopCount, acquisitionTarget] = initialConfig.split(' ').map(Number);

    const availableOffers = shopDetails.map(entry => entry.split(' ').map(Number));

    availableOffers.sort((offerA, offerB) => offerA[0] - offerB[0]);

    const initialAccumulator = {
        currentExpenditure: 0,
        itemsObtained: 0,
        completionFlag: false
    };

    const finalAcquisitionSummary = availableOffers.reduce((accumulator, currentOffer) => {
        if (accumulator.completionFlag) {
            return accumulator;
        }

        const [unitPrice, availableStock] = currentOffer;
        const remainingNeeded = acquisitionTarget - accumulator.itemsObtained;
        const unitsToProcure = Math.min(availableStock, remainingNeeded);

        const updatedExpenditure = accumulator.currentExpenditure + (unitsToProcure * unitPrice);
        const updatedItems = accumulator.itemsObtained + unitsToProcure;

        return {
            currentExpenditure: updatedExpenditure,
            itemsObtained: updatedItems,
            completionFlag: updatedItems === acquisitionTarget
        };
    }, initialAccumulator);

    console.log(finalAcquisitionSummary.currentExpenditure);
}

processPurchaseData(require('fs').readFileSync('/dev/stdin', 'utf8'));
