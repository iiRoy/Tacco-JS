function processInputData (rawInputString) {
    const RADIX_DECIMAL = 10;

    const parseNumericValue = (str) => parseInt(str, RADIX_DECIMAL);

    const inputLines = rawInputString.split('\n');

    const firstLineTokens = inputLines[0].split(' ');
    const unusedItemCount = firstLineTokens[0];
    let remainingCapacity = parseNumericValue(firstLineTokens[1]);

    const itemWeightsList = [];
    for (let lineIndex = 1; lineIndex < inputLines.length; lineIndex++) {
        itemWeightsList.push(parseNumericValue(inputLines[lineIndex]));
    }

    let totalProcessedItems = 0;

    itemWeightsList.forEach(currentWeight => {
        remainingCapacity -= currentWeight;
        totalProcessedItems++;
    });

    const minimumWeight = Math.min(...itemWeightsList);

    const additionalItemsFromRemainder = Math.floor(remainingCapacity / minimumWeight);
    totalProcessedItems += additionalItemsFromRemainder;

    console.log(totalProcessedItems);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
