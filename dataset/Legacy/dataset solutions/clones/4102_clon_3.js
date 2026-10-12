function processInputData(rawInputString) {
    const inputLines = rawInputString.split(/\n/);

    const firstLineIdentifier = inputLines[0];
    const relevantDataItems = inputLines.slice(1, inputLines.length - 1);

    const uniqueItemsFound = [];
    const totalDataItemsCount = relevantDataItems.length;

    for (let currentItemIndex = 0; currentItemIndex < totalDataItemsCount; currentItemIndex++) {
        const currentDataItem = relevantDataItems[currentItemIndex];
        if (relevantDataItems.indexOf(currentDataItem) === currentItemIndex) {
            uniqueItemsFound.push(currentDataItem);
        }
    }

    const finalUniqueItemsCount = uniqueItemsFound.length;
    console.log(finalUniqueItemsCount);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
