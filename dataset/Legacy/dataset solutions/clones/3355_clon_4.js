const parseInputData = (rawInputContent) => {
    const inputLines = rawInputContent.split('\n');
    const totalItemsCount = Number(inputLines[0]);
    const itemHeightValues = inputLines[1].split(' ').map(Number);
    const itemAmountValues = inputLines[2].split(' ').map(Number);
    return { totalItemsCount, itemHeightValues, itemAmountValues };
};

const determineMaxAccumulatedValue = ({ totalItemsCount, itemHeightValues, itemAmountValues }) => {
    // maxAttainableValue[k] stores the highest sum achievable for a path ending at height k.
    const maxAttainableValue = Array(totalItemsCount + 1).fill(0);
    let globalMaximumSum = 0;

    // Process each item to update the dynamic programming state.
    itemHeightValues.forEach((currentHeight, itemIndex) => {
        const currentAmount = itemAmountValues[itemIndex];
        // Calculate the potential new maximum sum if this item is included.
        const candidateSum = currentAmount + maxAttainableValue[currentHeight];

        // Determine the exclusive upper bound for the propagation range.
        // By default, propagate to the end of the array.
        let propagationEndBoundary = totalItemsCount + 1;

        // Find the first index (offset from currentHeight) where the existing value
        // is already greater than or equal to the candidateSum. This marks where
        // the propagation of candidateSum should stop.
        const blockingElementOffset = maxAttainableValue
                                      .slice(currentHeight, totalItemsCount + 1)
                                      .findIndex(val => val >= candidateSum);

        if (blockingElementOffset !== -1) {
            // If a blocking element is found, adjust the propagation boundary.
            propagationEndBoundary = currentHeight + blockingElementOffset;
        }

        // Efficiently update the range of maxAttainableValue using Array.prototype.fill.
        // This replaces the original imperative inner loop for propagation.
        maxAttainableValue.fill(candidateSum, currentHeight, propagationEndBoundary);

        // Update the overall maximum sum found across all items.
        globalMaximumSum = Math.max(globalMaximumSum, maxAttainableValue[currentHeight]);
    });

    return globalMaximumSum;
};

const executeProgram = (inputPayload) => {
    const processedData = parseInputData(inputPayload);
    const finalResultValue = determineMaxAccumulatedValue(processedData);
    console.log(String(finalResultValue));
    return finalResultValue;
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
