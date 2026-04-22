const convertToLargeInteger = (valueString) => {
    return globalThis.BigInt(valueString);
};

const locatePeak = (dataItems) => {
    if (dataItems.length === 0) {
        return -1;
    }

    const indexedItems = dataItems.map((val, idx) => ({ val: val, originalIndex: idx }));

    const resultAccumulator = indexedItems.reduce(
        (tracker, currentItem) => {
            if (currentItem.val > tracker.extremeValue) {
                return { extremeValue: currentItem.val, extremePosition: currentItem.originalIndex };
            }
            return tracker;
        },
        { extremeValue: -1n, extremePosition: -1 }
    );

    return resultAccumulator.extremePosition;
};

const processRecurrence = (remainingElements, currentSet, totalAccumulation) => {
    if (remainingElements.length === 0) {
        return totalAccumulation;
    }

    const nextElement = remainingElements[0];
    const peakPosition = locatePeak(currentSet);

    const newTotal = totalAccumulation + currentSet[peakPosition];

    const segmentBeforePeak = currentSet.slice(0, peakPosition);
    const segmentAfterPeak = currentSet.slice(peakPosition + 1);
    const elementsToInsert = [nextElement, nextElement];

    const nextSet = segmentBeforePeak.concat(elementsToInsert).concat(segmentAfterPeak);

    return processRecurrence(
        remainingElements.slice(1),
        nextSet,
        newTotal
    );
};

const initiateProcessing = (inputDataContent) => {
    const cleanedInput = inputDataContent.replace(/^\s+|\s+$/g, '');
    const linesOfInput = cleanedInput.split('\n');
    const numberStringsFromSecondLine = linesOfInput[1].split(' ');

    const initialElementsCollection = numberStringsFromSecondLine.map(convertToLargeInteger);

    initialElementsCollection.sort((valA, valB) => {
        if (valA > valB) return -1;
        if (valA < valB) return 1;
        return 0;
    });

    const primaryWorkingElement = initialElementsCollection[0];
    const subsequentInputElements = initialElementsCollection.slice(1);

    const currentWorkingSet = [primaryWorkingElement];
    const startingAccumulation = 0n;

    const finalCalculatedSum = processRecurrence(
        subsequentInputElements,
        currentWorkingSet,
        startingAccumulation
    );

    globalThis.console.log(finalCalculatedSum.toString());
};

(function () {
    const environmentAccess = typeof globalThis.process !== 'undefined' && globalThis.process.env;
    if (environmentAccess && environmentAccess.UTIL_ENV_FLAG) {
        // Test environment placeholder
    } else {
        const fileSystemModule = globalThis.require('fs');
        const standardInputPath = '/dev/stdin';
        const encodingFormat = 'utf8';
        const fileContents = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
        initiateProcessing(fileContents);
    }
})();