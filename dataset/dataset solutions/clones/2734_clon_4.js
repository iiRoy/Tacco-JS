function processInputData(rawData) {
    const lines = rawData.split('\n');
    const iterationCountStr = lines[0];
    const dataItems = lines.slice(1);

    const numIterations = parseInt(iterationCountStr, 10);

    const findLexicographicalMaximum = (collection) => {
        if (collection.length === 0) {
            throw new TypeError('Reduce of empty array with no initial value');
        }
        if (collection.length === 1) {
            return collection[0];
        }
        const [headElement, ...remainingElements] = collection;
        const maximumOfRemaining = findLexicographicalMaximum(remainingElements);
        return headElement > maximumOfRemaining ? headElement : maximumOfRemaining;
    };

    Array.from({ length: numIterations }, (_, currentRemovalIndex) => {
        const filteredItems = dataItems.filter((_, itemIndex) => itemIndex !== currentRemovalIndex);
        console.log(findLexicographicalMaximum(filteredItems));
    });
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
