'use strict'

const processMarketData = (marketSnapshot) => {
    const rawDataLines = marketSnapshot.split(/\s*\n\s*/).filter(Boolean);
    
    const firstLineDetails = rawDataLines[0].match(/\d+/g).map(Number);
    const initialUnitsRequired = firstLineDetails[1];

    const availableOfferings = rawDataLines.slice(1).map(line => {
        const itemData = line.match(/\d+/g).map(Number);
        return { valuePerUnit: itemData[0], availableStock: itemData[1] };
    });

    availableOfferings.sort((dealA, dealB) => dealA.valuePerUnit - dealB.valuePerUnit);

    const computeFinalCost = (dealsList, unitsRemaining, accumulatedSum, currentIndex) => {
        if (unitsRemaining <= 0 || currentIndex >= dealsList.length) {
            return accumulatedSum;
        }

        const currentBestDeal = dealsList[currentIndex];

        const quantityToTake = Math.min(unitsRemaining, currentBestDeal.availableStock);
        const updatedSum = accumulatedSum + (currentBestDeal.valuePerUnit * quantityToTake);
        const newUnitsRemaining = unitsRemaining - quantityToTake;

        return computeFinalCost(dealsList, newUnitsRemaining, updatedSum, currentIndex + 1);
    };

    const finalExpenditure = computeFinalCost(availableOfferings, initialUnitsRequired, 0, 0);
    console.log(finalExpenditure);
};

processMarketData(require("fs").readFileSync("/dev/stdin", "utf8"));