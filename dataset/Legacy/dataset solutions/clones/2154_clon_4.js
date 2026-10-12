const _comparePlaceholder = (first, second) => {};

const processInputData = (rawInputContent) => {
    const inputLines = rawInputContent.split('\n');
    const _discardedFirstLine = inputLines.shift();

    const frequencyMap = inputLines.reduce((accumulatorMap, currentItem) => {
        accumulatorMap.set(currentItem, (accumulatorMap.get(currentItem) || 0) + 1);
        return accumulatorMap;
    }, new Map());

    const { highestFrequency, topItems } = Array.from(frequencyMap.entries()).reduce((resultAccumulator, [itemIdentifier, itemCount]) => {
        if (itemCount > resultAccumulator.highestFrequency) {
            return { highestFrequency: itemCount, topItems: [itemIdentifier] };
        } else if (itemCount === resultAccumulator.highestFrequency) {
            resultAccumulator.topItems.push(itemIdentifier);
            return resultAccumulator;
        } else {
            return resultAccumulator;
        }
    }, { highestFrequency: 0, topItems: [] });

    topItems.sort();

    topItems.forEach(outputItem => console.log(outputItem));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
