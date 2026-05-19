let rawDataBuffer = '';

process.stdin.on('data', (chunk) => {
    rawDataBuffer += chunk;
});

process.stdin.on('end', () => {
    const parseAndCleanInput = (fullInputText) => {
        const trimmedInput = fullInputText.replace(/\s*$/, '');
        const lines = trimmedInput.split('\n');
        return lines.map(line => line.replace(/\s*$/, ''));
    };

    const processedLines = parseAndCleanInput(rawDataBuffer);
    const numbersLine = processedLines[1];
    const numericArray = numbersLine.split(' ').map(str => Number(str));

    performSelectionSort(numericArray);
});

const performSelectionSort = (dataArray) => {
    let exchangeCount = 0;
    const arrayLength = dataArray.length;

    if (arrayLength <= 1) {
        console.log(dataArray.join(' '));
        console.log(exchangeCount);
        return;
    }

    const swapElementsInArray = (arr, indexA, indexB) => {
        if (indexA === indexB) {
            return;
        }
        const tempValue = arr[indexA];
        arr[indexA] = arr[indexB];
        arr[indexB] = tempValue;
    };

    for (let outerIndex = 0; outerIndex < arrayLength; outerIndex++) {
        let minIndex = outerIndex;
        for (let innerIndex = outerIndex + 1; innerIndex < arrayLength; innerIndex++) {
            if (dataArray[innerIndex] < dataArray[minIndex]) {
                minIndex = innerIndex;
            }
        }

        if (minIndex !== outerIndex) {
            swapElementsInArray(dataArray, outerIndex, minIndex);
            exchangeCount++;
        }
    }

    console.log(dataArray.join(' '));
    console.log(exchangeCount);
};
