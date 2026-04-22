const acquireRawData = require("fs").readFileSync("/dev/stdin", "utf8");

(function(sourceData) {
    const components = sourceData.trim().split(' ').map(val => Number(val));

    const priceOfFirstKind = components[0];
    const priceOfSecondKind = components[1];
    const priceOfCombinedKind = components[2];
    const neededFirstKind = components[3];
    const neededSecondKind = components[4];

    let overallLowestPrice = Infinity;

    // Iterate through the number of 'units' of combined items we might purchase.
    // Each combined item provides 0.5 units of the first kind and 0.5 units of the second kind.
    // So, 'unitsCombined' represents the quantity of first-kind units (and second-kind units)
    // obtained from buying `2 * unitsCombined` combined items.
    // The loop explores scenarios ranging from buying no combined items to buying enough combined items
    // to satisfy the larger requirement.
    for (let unitsCombined = 0; unitsCombined <= Math.max(neededFirstKind, neededSecondKind); unitsCombined++) {
        // Cost incurred from buying combined items
        const currentCombinedItemCost = unitsCombined * 2 * priceOfCombinedKind;

        // Calculate remaining units of first and second kind needed after using combined items
        const remainingFirstKind = Math.max(0, neededFirstKind - unitsCombined);
        const remainingSecondKind = Math.max(0, neededSecondKind - unitsCombined);

        // Cost incurred from buying individual items for the remaining needs
        const currentIndividualItemCost = remainingFirstKind * priceOfFirstKind + remainingSecondKind * priceOfSecondKind;

        // Total cost for this particular strategy
        const currentStrategyTotal = currentCombinedItemCost + currentIndividualItemCost;

        // Update the overall lowest price if this strategy is cheaper
        if (currentStrategyTotal < overallLowestPrice) {
            overallLowestPrice = currentStrategyTotal;
        }
    }

    console.log(overallLowestPrice);
})(acquireRawData);