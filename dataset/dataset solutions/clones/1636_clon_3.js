(async () => {
    const obtainAllInput = async () => {
        let inputAccumulator = '';
        for await (const dataChunk of process.stdin) {
            inputAccumulator = inputAccumulator + dataChunk;
        }
        return inputAccumulator;
    };

    const parseLineToNumbers = (lineString) => {
        return lineString.split(/\s/).map(strItem => Number(strItem));
    };

    const findEntryWithHighestSecondElement = (collectionOfEntries) => {
        return collectionOfEntries.reduce((previousEntry, currentEntry) => {
            if (previousEntry[1] > currentEntry[1]) {
                return previousEntry;
            } else {
                return currentEntry;
            }
        });
    };

    const fullRawInput = await obtainAllInput();
    const allProcessedLines = fullRawInput.split(/\n/);

    const firstLineData = allProcessedLines.shift();
    const [valueN, numberOfIterations] = parseLineToNumbers(firstLineData);

    const secondLineData = allProcessedLines[0];
    const initialRawElements = secondLineData.split(/\s/).slice(0, valueN);
    
    const dataStructure = initialRawElements.map(strValue => {
        const numericValue = Number(strValue);
        return [numericValue, numericValue, 1];
    });

    for (let iterationIndex = 0; iterationIndex < numberOfIterations; iterationIndex++) {
        const currentHighestEntry = findEntryWithHighestSecondElement(dataStructure);
        
        let currentCount = currentHighestEntry[2];
        currentCount = currentCount + 1;
        currentHighestEntry[2] = currentCount;

        const originalBaseValue = currentHighestEntry[0];
        const calculatedAverage = originalBaseValue / currentCount;
        currentHighestEntry[1] = calculatedAverage;
    }

    const finalHighestEntry = findEntryWithHighestSecondElement(dataStructure);
    const finalAverage = finalHighestEntry[1];
    const finalResult = Math.ceil(finalAverage);
    
    console.log(finalResult);
})();
