function findSatisfyingSets(
    currentCoinTypeIndex,
    currentValueAccumulator,
    maximumCounts,
    denominationValues,
    goalAmount
) {
    if (currentCoinTypeIndex === denominationValues.length) {
        return currentValueAccumulator === goalAmount ? 1 : 0;
    }

    let totalSatisfied = 0;
    const currentDenomination = denominationValues[currentCoinTypeIndex];
    const currentMaxCount = maximumCounts[currentCoinTypeIndex];

    for (let quantity = 0; quantity <= currentMaxCount; quantity++) {
        const valueFromThisDenomination = quantity * currentDenomination;
        const nextValueAccumulator = currentValueAccumulator + valueFromThisDenomination;

        if (nextValueAccumulator > goalAmount) {
            break;
        }

        totalSatisfied += findSatisfyingSets(
            currentCoinTypeIndex + 1,
            nextValueAccumulator,
            maximumCounts,
            denominationValues,
            goalAmount
        );
    }

    return totalSatisfied;
}

function ProcessInputAndCalculate(sourceText) {
    const lineSegments = sourceText.split("\n");

    const firstLimit = parseInt(lineSegments[0], 10);
    const secondLimit = parseInt(lineSegments[1], 10);
    const thirdLimit = parseInt(lineSegments[2], 10);
    const targetSum = parseInt(lineSegments[3], 10);

    const coinDenominations = [500, 100, 50];
    const coinMaximums = [firstLimit, secondLimit, thirdLimit];

    const finalCount = findSatisfyingSets(
        0,
        0,
        coinMaximums,
        coinDenominations,
        targetSum
    );

    console.log(finalCount);
}

ProcessInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));