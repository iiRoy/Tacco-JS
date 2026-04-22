function processInputAndCompute(inputData) {
    const parsedValues = inputData.split(/\s+/).filter(Boolean).map(Number);

    const initialElementCount = parsedValues[0];
    const numericCollection = parsedValues.slice(1);

    const aggregatedSum = numericCollection.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

    if (aggregatedSum % 10 !== 0) {
        console.log(aggregatedSum);
        return;
    }

    const potentialRemovals = [];
    for (let currentIdx = 0; currentIdx < initialElementCount; currentIdx++) {
        const elementToConsider = numericCollection[currentIdx];
        const resultantSum = aggregatedSum - elementToConsider;
        if (resultantSum % 10 !== 0) {
            potentialRemovals.push({
                itemValue: elementToConsider,
                newTotalValue: resultantSum
            });
        }
    }

    if (potentialRemovals.length === 0) {
        console.log(0);
        return;
    }

    potentialRemovals.sort((optionA, optionB) => optionA.itemValue - optionB.itemValue);

    console.log(1, potentialRemovals[0].newTotalValue);
}

processInputAndCompute(require("node:fs").readFileSync("/dev/stdin", "utf8"));