function calculateMinimumCost(inputData) {
    const dataLines = inputData.split('\n');

    const [storeCountStr, unitsNeededStr] = dataLines[0].split(' ');
    const totalStoreCount = parseInt(storeCountStr, 10);
    const initialUnitsRequired = parseInt(unitsNeededStr, 10);

    const availableOffers = dataLines.slice(1, totalStoreCount + 1).map(offerLine => {
        const [costPerUnitStr, quantityAvailableStr] = offerLine.split(' ');
        return [parseInt(costPerUnitStr, 10), parseInt(quantityAvailableStr, 10)];
    });

    availableOffers.sort((offerOne, offerTwo) => offerOne[0] - offerTwo[0]);

    const acquisitionSummary = availableOffers.reduce((currentStatus, currentOfferDetails) => {
        if (currentStatus.remainingUnitsToAcquire === 0) {
            return currentStatus;
        }

        const [unitPriceOfOffer, unitsInThisOffer] = currentOfferDetails;
        const unitsToTake = Math.min(unitsInThisOffer, currentStatus.remainingUnitsToAcquire);

        return {
            accumulatedCost: currentStatus.accumulatedCost + (unitPriceOfOffer * unitsToTake),
            remainingUnitsToAcquire: currentStatus.remainingUnitsToAcquire - unitsToTake
        };
    }, { accumulatedCost: 0, remainingUnitsToAcquire: initialUnitsRequired });

    return acquisitionSummary.accumulatedCost;
}

((b, c, d) => "undefined" != typeof require ? console.log(calculateMinimumCost(require("fs").readFileSync("/dev/stdin", "utf8"))) : [
    b = b.split("\n").slice(1, -1).join("\n"),
    c = function() {
        try {
            return calculateMinimumCost(b);
        } catch (f) {
            return f.stack || f.message;
        }
    }(),
    d = typeof c,
    "string" == d || (c = JSON.stringify(c)),
    $("<form>").append([[10, b], 0, [1, d], 0, [10, c]].map(f => $(f ? "<textarea>" : "<br>", f && { rows: f[0], cols: 40, text: f[1] }))).appendTo("body")
])(`
4 30
6 18
2 5
3 10
7 9
`);
