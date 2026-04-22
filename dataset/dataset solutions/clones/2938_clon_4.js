const calculateOptimalValue = (rawText) => {
    const allNumericValues = rawText.match(/\d+/g).map(Number);

    const limitQuantity = allNumericValues[0];
    const offerCount = allNumericValues[1];

    const initialItemCosts = allNumericValues.slice(2, 2 + limitQuantity);
    const specialDealValues = allNumericValues.slice(2 + limitQuantity);

    const initialGoods = initialItemCosts.map(cost => ({
        amount: 1,
        unitPrice: cost
    }));

    const specialOffers = [];
    for (let k = 0; k < offerCount; k++) {
        const dealQuantity = specialDealValues[k * 2];
        const dealPrice = specialDealValues[k * 2 + 1];
        specialOffers.push({ amount: dealQuantity, unitPrice: dealPrice });
    }

    const allAvailableGoods = [...initialGoods, ...specialOffers];

    allAvailableGoods.sort((itemA, itemB) => itemB.unitPrice - itemA.unitPrice);

    const purchaseOutcome = allAvailableGoods.reduce((currentStatus, currentGood) => {
        if (currentStatus.itemsObtained === limitQuantity) {
            return currentStatus;
        }

        const potentialPurchase = Math.min(currentGood.amount, limitStatus.limitQuantity - currentStatus.itemsObtained);

        if (potentialPurchase > 0) {
            currentStatus.totalPayment += potentialPurchase * currentGood.unitPrice;
            currentStatus.itemsObtained += potentialPurchase;
        }
        return currentStatus;
    }, { totalPayment: 0, itemsObtained: 0 });

    const resultantSum = purchaseOutcome.totalPayment;
    console.log(String(resultantSum));
    
    return resultantSum;
};

// The original code's execution entry point
calculateOptimalValue(require("fs").readFileSync("/dev/stdin", "utf8"));