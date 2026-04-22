const inputAdapter = require('readline');

const transformationEngine = (sourceSeries) => {
    // Custom trimming of leading/trailing whitespace
    const cleanedSeries = (() => {
        let startPointer = 0;
        let endPointer = sourceSeries.length - 1;
        while (startPointer <= endPointer && /\s/.test(sourceSeries[startPointer])) {
            startPointer++;
        }
        while (endPointer >= startPointer && /\s/.test(sourceSeries[endPointer])) {
            endPointer--;
        }
        return sourceSeries.substring(startPointer, endPointer + 1);
    })();

    // Custom splitting into components based on whitespace
    const componentStorage = [];
    let currentFragment = '';
    for (let position = 0; position < cleanedSeries.length; ++position) {
        const symbol = cleanedSeries[position];
        if (/\s/.test(symbol)) {
            if (currentFragment.length > 0) {
                componentStorage.push(currentFragment);
                currentFragment = '';
            }
        } else {
            currentFragment += symbol;
        }
    }
    if (currentFragment.length > 0) {
        componentStorage.push(currentFragment);
    }

    // Conversion to numerical representation
    const numericValues = componentStorage.map(elementText => Number(elementText));

    // Custom sorting (Insertion Sort implementation)
    const orderedNumerics = (() => {
        const workingArray = [...numericValues];
        for (let outerIndex = 1; outerIndex < workingArray.length; ++outerIndex) {
            let keyElement = workingArray[outerIndex];
            let innerIndex = outerIndex - 1;
            while (innerIndex >= 0 && workingArray[innerIndex] > keyElement) {
                workingArray[innerIndex + 1] = workingArray[innerIndex];
                innerIndex--;
            }
            workingArray[innerIndex + 1] = keyElement;
        }
        return workingArray;
    })();

    // Custom joining of components with spaces
    const resultantString = orderedNumerics.reduce((accumulator, valueItem, currentIndex) => {
        return accumulator + (currentIndex > 0 ? ' ' : '') + valueItem;
    }, '');

    return resultantString;
};

const streamProcessor = inputAdapter.createInterface({
    input: globalThis.process.stdin,
    output: globalThis.process.stdout, // Required for createInterface, though not used for writing here.
    terminal: false
});

streamProcessor.on('line', (receivedLine) => {
    const processedOutput = transformationEngine(receivedLine);
    globalThis.process.stdout.write(processedOutput + '\n');
});