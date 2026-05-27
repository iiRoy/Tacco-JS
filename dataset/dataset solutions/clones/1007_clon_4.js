let collectedInput = '';

process.stdin.on('data', incomingData => {
    collectedInput += incomingData;
});

process.stdin.on('end', () => {
    const processedLines = collectedInput.replace(/\s*$/, '')
        .split('\n')
        .map(s => s.replace(/\s*$/, ''));

    const numericValues = processedLines[1].split(' ').map(Number);
    
    const sortResult = performSelectionSort(numericValues);

    console.log(sortResult.sortedValues.join(' '));
    console.log(sortResult.exchangeCount);
});

const performSelectionSort = (initialValues) => {
    let currentValues = initialValues; 
    let totalExchanges = 0;
    let currentPosition = 0;

    const findMinimumIndex = (startIndex, dataCollection) => {
        return dataCollection.slice(startIndex).reduce((accMinAbsoluteIdx, currentValue, relativeIdx) => {
            const currentAbsoluteIdx = startIndex + relativeIdx;
            if (currentValue < dataCollection[accMinAbsoluteIdx]) {
                return currentAbsoluteIdx;
            }
            return accMinAbsoluteIdx;
        }, startIndex);
    };

    while (currentPosition < currentValues.length - 1) {
        const smallestElementIndex = findMinimumIndex(currentPosition, currentValues);

        if (smallestElementIndex !== currentPosition) {
            [currentValues[currentPosition], currentValues[smallestElementIndex]] = 
            [currentValues[smallestElementIndex], currentValues[currentPosition]];
            totalExchanges++;
        }
        currentPosition++;
    }

    return { sortedValues: currentValues, exchangeCount: totalExchanges };
};
