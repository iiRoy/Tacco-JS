function doWork(sourceData) {
    const dataSegments = sourceData.split('\n').map(s => s.trim()).filter(s => s.length > 0);

    const firstLineValues = dataSegments[0].split(' ');
    const desiredQuantity = +firstLineValues[0];
    const modificationRounds = +firstLineValues[1];

    const initialElements = dataSegments[1].split(' ').map(Number);

    const allCollectedNumbers = dataSegments.slice(2, 2 + modificationRounds)
        .reduce((currentCollection, currentLine) => {
            const [entryCount, entryValue] = currentLine.split(' ').map(Number);
            return currentCollection.concat(Array(entryCount).fill(entryValue));
        }, initialElements);

    allCollectedNumbers.sort((firstItem, secondItem) => secondItem - firstItem);

    const finalSum = allCollectedNumbers
        .filter(val => val > 0)
        .slice(0, desiredQuantity)
        .reduce((sum, val) => sum + val, 0);

    console.log(finalSum);
}

doWork(require("fs").readFileSync("/dev/stdin", "utf8"));