let rawInputData = '';

process.stdin.on('data', (chunkOfData) => {
    rawInputData += chunkOfData;
});

process.stdin.on('end', () => {
    const parseAndPrepareInput = (fullInputString) => {
        const trimmedString = fullInputString.replace(/\s*$/, '');
        const lines = trimmedString.split('\n');
        const secondLineContent = lines[1];
        const numberStrings = secondLineContent.replace(/\s*$/, '').split(' ');
        return numberStrings.map(str => Number(str));
    };

    const numericArray = parseAndPrepareInput(rawInputData);
    processArray(numericArray);
});

const swapElements = (targetArray, indexA, indexB) => {
    const tempValue = targetArray[indexA];
    targetArray[indexA] = targetArray[indexB];
    targetArray[indexB] = tempValue;
};

const processArray = (dataElements) => {
    const pivotFinalIndex = performPartition(dataElements, 0, dataElements.length - 1);

    const formatOutputElements = (elements, highlightPosition) => {
        return elements.map((currentElement, elementIndex) => {
            if (elementIndex === highlightPosition) {
                return `[${currentElement}]`;
            } else {
                return String(currentElement);
            }
        });
    };

    const formattedParts = formatOutputElements(dataElements, pivotFinalIndex);
    console.log(formattedParts.join(' '));
};

const performPartition = (targetArray, startIndex, endIndex) => {
    const pivotValue = targetArray[endIndex];
    let leftPointer = startIndex - 1;

    for (let rightPointer = startIndex; rightPointer < endIndex; rightPointer++) {
        if (targetArray[rightPointer] <= pivotValue) {
            leftPointer = leftPointer + 1;
            swapElements(targetArray, leftPointer, rightPointer);
        }
    }

    const finalPivotPosition = leftPointer + 1;
    swapElements(targetArray, finalPivotPosition, endIndex);

    return finalPivotPosition;
};
