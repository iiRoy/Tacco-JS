(function(sourceData) {
    const dataLines = sourceData.trim().split('\n');
    const elementCount = Number(dataLines[0]);
    const sequenceString = dataLines[1];
    const numericalSequence = sequenceString.split(' ', elementCount).map(Number);

    arrangeElements(numericalSequence);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function swapAdjacent(collection, currentPosition, accumulatedSwaps) {
    if (currentPosition < 1) {
        return accumulatedSwaps;
    }
    if (collection[currentPosition] < collection[currentPosition - 1]) {
        [collection[currentPosition], collection[currentPosition - 1]] = [collection[currentPosition - 1], collection[currentPosition]];
        accumulatedSwaps++;
    }
    return swapAdjacent(collection, currentPosition - 1, accumulatedSwaps);
}

function arrangeElements(targetArray) {
    let totalExchanges = 0;
    let hasChangesOccurred;

    do {
        hasChangesOccurred = false;
        const exchangesInCycle = swapAdjacent(targetArray, targetArray.length - 1, 0);
        if (exchangesInCycle > 0) {
            totalExchanges += exchangesInCycle;
            hasChangesOccurred = true;
        }
    } while (hasChangesOccurred);

    console.log(targetArray.join(' '));
    console.log(totalExchanges);
}
