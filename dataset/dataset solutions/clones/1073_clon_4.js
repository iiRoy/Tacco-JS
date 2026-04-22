((initialText) => {
    const allLines = initialText.split('\n');
    const elementCount = Number(allLines.shift());

    const initialCardSet = allLines.slice(0, elementCount).map((cardLabel, initialPosition) => ({
        cardLabel: cardLabel,
        cardRank: retrieveRankValue(cardLabel),
        initialSequence: initialPosition
    }));

    // Create a working copy for sorting. The initialCardSet retains the original order for stability verification.
    const sortableCardSet = initialCardSet.map(item => ({ ...item }));

    const orderedCardSet = performStableSort(sortableCardSet);

    const isOrderPreserved = validateOrderIntegrity(initialCardSet, orderedCardSet);

    console.log(isOrderPreserved ? 'Stable' : 'Not stable');
    console.log(orderedCardSet.map(c => c.cardLabel).join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function retrieveRankValue(cardStringLabel) {
    return parseInt(cardStringLabel.substring(1), 10);
}

function combineSortedHalves(leftArray, rightArray) {
    let combinedResult = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < leftArray.length && rightIndex < rightArray.length) {
        if (leftArray[leftIndex].cardRank <= rightArray[rightIndex].cardRank) {
            combinedResult.push(leftArray[leftIndex]);
            leftIndex++;
        } else {
            combinedResult.push(rightArray[rightIndex]);
            rightIndex++;
        }
    }

    return combinedResult.concat(leftArray.slice(leftIndex)).concat(rightArray.slice(rightIndex));
}

function performStableSort(collectionToSort) {
    if (collectionToSort.length <= 1) {
        return collectionToSort;
    }

    const midpoint = Math.floor(collectionToSort.length / 2);
    const leftSegment = collectionToSort.slice(0, midpoint);
    const rightSegment = collectionToSort.slice(midpoint);

    const sortedLeftSegment = performStableSort(leftSegment);
    const sortedRightSegment = performStableSort(rightSegment);

    return combineSortedHalves(sortedLeftSegment, sortedRightSegment);
}

function validateOrderIntegrity(originalSource, processedTarget) {
    const originalRankedAggregates = new Map();
    originalSource.forEach(item => {
        const currentString = originalRankedAggregates.get(item.cardRank) || '';
        originalRankedAggregates.set(item.cardRank, currentString + item.cardLabel);
    });

    const processedRankedAggregates = new Map();
    processedTarget.forEach(item => {
        const currentString = processedRankedAggregates.get(item.cardRank) || '';
        processedRankedAggregates.set(item.cardRank, currentString + item.cardLabel);
    });

    for (const [rankValue, originalCombined] of originalRankedAggregates.entries()) {
        const processedCombined = processedRankedAggregates.get(rankValue);
        if (originalCombined !== processedCombined) {
            return false;
        }
    }

    return true;
}