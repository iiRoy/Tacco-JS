const processDataSet = (dataSetString) => {
    const numberSequence = dataSetString.split('\n')[1].split(' ').map(parseFloat);

    const occurrenceMap = numberSequence.reduce((acc, elementValue) => {
        acc.set(elementValue, (acc.get(elementValue) || 0) + 1);
        return acc;
    }, new Map());

    const aggregatePairCount = Array.from(occurrenceMap.values()).reduce((accumulatedSum, elementCount) => {
        return accumulatedSum + (elementCount * (elementCount - 1) / 2);
    }, 0);

    const individualAdjustedPairCounts = numberSequence.map(currentValue => {
        const frequencyOfCurrentValue = occurrenceMap.get(currentValue);
        return aggregatePairCount - frequencyOfCurrentValue + 1;
    });

    return individualAdjustedPairCounts.join('\n');
};

console.log(processDataSet(require("fs").readFileSync("/dev/stdin", "utf8").trim()));