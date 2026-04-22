function processInputData(rawDataContent) {
    const rawDataSections = rawDataContent.split(/\r?\n/);
    const configurationValues = rawDataSections[0].split(' ').map(val => +val);
    const permissibleSumLimit = configurationValues[1];
    const initialItemCounts = rawDataSections[1].split(' ').map(val => +val);

    function computeCumulativeAdjustment(itemsCollection, currentIndex, currentTotalAdjusted) {
        if (currentIndex >= itemsCollection.length - 1) {
            return currentTotalAdjusted;
        }

        let firstItemAmount = itemsCollection[currentIndex];
        let secondItemAmount = itemsCollection[currentIndex + 1];
        let combinedAmount = firstItemAmount + secondItemAmount;
        let immediateAdjustment = 0;

        let subsequentItemsCollection = [...itemsCollection];

        if (combinedAmount > permissibleSumLimit) {
            const surplusAmount = combinedAmount - permissibleSumLimit;
            immediateAdjustment = surplusAmount;

            if (surplusAmount <= secondItemAmount) {
                subsequentItemsCollection[currentIndex + 1] -= surplusAmount;
            } else {
                const remainingSurplus = surplusAmount - secondItemAmount;
                subsequentItemsCollection[currentIndex + 1] = 0;
                subsequentItemsCollection[currentIndex] -= remainingSurplus;
            }
        }

        return computeCumulativeAdjustment(subsequentItemsCollection, currentIndex + 1, currentTotalAdjusted + immediateAdjustment);
    }

    const finalAccumulatedAdjustment = computeCumulativeAdjustment(initialItemCounts, 0, 0);
    console.log(finalAccumulatedAdjustment);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));