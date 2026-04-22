const processData = (rawData) => {
    const dataLines = rawData.split('\r\n');
    const effectiveElements = dataLines.slice(1);

    const frequencyHolder = effectiveElements.reduce((accumulatorMap, currentItem) => {
        accumulatorMap.set(currentItem, (accumulatorMap.get(currentItem) || 0) + 1);
        return accumulatorMap;
    }, new Map());

    const resultValue = Array.from(frequencyHolder.values()).reduce((currentSum, individualCount) => {
        return currentSum + (individualCount % 2);
    }, 0);

    console.log(resultValue);
};

processData(require("node:fs").readFileSync("/dev/stdin", "utf8"));