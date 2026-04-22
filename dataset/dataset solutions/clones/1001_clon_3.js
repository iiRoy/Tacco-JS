function performBubbleSortAnalysis(inputContentStream) {
    const { datasetLength, numberArray } = parseInputForSorting(inputContentStream);

    if (datasetLength <= 1) {
        console.log(numberArray.join(' '));
        console.log(0);
        return;
    }

    let totalExchangeCount = 0;
    let rightmostSortedBoundary = 0;
    let didAnySwapOccurInCurrentPass;

    do {
        didAnySwapOccurInCurrentPass = false;

        for (let currentElementIndex = datasetLength - 1; currentElementIndex > rightmostSortedBoundary; currentElementIndex--) {
            const precedingElementIndex = currentElementIndex - 1;

            const valueAtCurrent = numberArray[currentElementIndex];
            const valueAtPreceding = numberArray[precedingElementIndex];

            if (valueAtCurrent < valueAtPreceding) {
                [numberArray[currentElementIndex], numberArray[precedingElementIndex]] = [valueAtPreceding, valueAtCurrent];
                didAnySwapOccurInCurrentPass = true;
                totalExchangeCount++;
            }
        }
        rightmostSortedBoundary++;
    } while (didAnySwapOccurInCurrentPass);

    console.log(numberArray.join(' '));
    console.log(totalExchangeCount);
}

function parseInputForSorting(rawTextPayload) {
    const inputLinesCollection = rawTextPayload.split(/[\r\n]+/);

    const arraySizeDeclared = parseInt(inputLinesCollection.shift(), 10);

    const numericDataElements = inputLinesCollection.shift()
                                                   .split(/\s+/)
                                                   .filter(entry => entry !== '')
                                                   .map(Number);
    
    const actualDatasetLength = numericDataElements.length;

    return {
        datasetLength: actualDatasetLength,
        numberArray: numericDataElements
    };
}

(function executeApplication() {
    try {
        const fileSystem = require('fs');
        const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
        performBubbleSortAnalysis(rawInputData);
    } catch (operationError) {
        console.error("An error occurred during input processing or sorting execution:");
        console.error("Details:", operationError.message);
    }
})();